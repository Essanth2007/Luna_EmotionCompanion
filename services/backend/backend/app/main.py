import logging
import os
import time

from dotenv import load_dotenv
from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, PlainTextResponse
from sqlalchemy import text
from starlette.exceptions import HTTPException as StarletteHTTPException
from starlette.middleware.base import BaseHTTPMiddleware
from uvicorn.middleware.proxy_headers import ProxyHeadersMiddleware

from app.api.ai import router as ai_router
from app.api.auth import router as auth_router
from app.api.analysis import router as analysis_router
from app.api.conversations import router as conversations_router
from app.api.emotions import router as emotions_router
from app.api.insights import router as insights_router
from app.api.users import router as users_router
from app.core.hardening import cors_origins, validate_security_config
from app.core.observability import (
    configure_logging,
    increment_metric,
    metrics_text,
    new_request_id,
    request_id_context,
)
from app.db.database import engine

load_dotenv()

configure_logging()
validate_security_config()

# Trusted proxy — accepts X-Forwarded-For from the nginx sidecar.
# In Docker Compose the nginx container is the only upstream, so "127.0.0.1"
# plus the private RFC-1918 ranges covers all valid deployment topologies.
# Override via TRUSTED_PROXY_IPS env var if needed (comma-separated CIDRs/IPs).
_trusted_proxy_ips = os.getenv(
    "TRUSTED_PROXY_IPS", "127.0.0.1,10.0.0.0/8,172.16.0.0/12,192.168.0.0/16"
)

app = FastAPI(
    title="Luna Emotion Companion API",
    version="1.0.0",
    description=(
        "Backend API for Luna, an AI-powered emotional companion. "
        "Provides emotion tracking, AI-assisted analysis, conversation management, "
        "and mood analytics. All endpoints except /health, /ready, and /metrics "
        "require a valid JWT Bearer token."
    ),
    license_info={"name": "Private"},
    contact={"name": "Luna Backend"},
)

# ProxyHeadersMiddleware must be added first so that all subsequent middleware
# and route handlers see the real client IP in request.client.host.
# This is required for correct per-client rate limiting behind nginx.
app.add_middleware(ProxyHeadersMiddleware, trusted_hosts=_trusted_proxy_ips)

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins(),
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
        return response


app.add_middleware(SecurityHeadersMiddleware)


class RequestObservabilityMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        request_id = new_request_id(request)
        token = request_id_context.set(request_id)
        started = time.perf_counter()
        logger = logging.getLogger("luna.http")
        try:
            response = await call_next(request)
            duration_ms = round((time.perf_counter() - started) * 1000, 2)
            increment_metric("http_requests_total")
            increment_metric("http_request_duration_seconds_total", duration_ms / 1000)
            if response.status_code >= 400:
                increment_metric("http_errors_total")
            logger.info(
                "request.completed",
                extra={
                    "method": request.method,
                    "path": request.url.path,
                    "status_code": response.status_code,
                    "duration_ms": duration_ms,
                },
            )
            response.headers["X-Request-ID"] = request_id
            return response
        finally:
            request_id_context.reset(token)


app.add_middleware(RequestObservabilityMiddleware)

app.include_router(auth_router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(users_router, prefix="/api/v1/users", tags=["Users"])
app.include_router(emotions_router, prefix="/api/v1/emotions", tags=["Emotions"])
app.include_router(ai_router, prefix="/api/v1/ai", tags=["AI Analysis"])
app.include_router(analysis_router, prefix="/api/v1/analysis", tags=["Emotion Analysis (AI)"])
app.include_router(conversations_router, prefix="/api/v1/conversations", tags=["Conversations"])
app.include_router(insights_router, prefix="/api/v1/insights", tags=["Mood Insights"])


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException) -> JSONResponse:
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    validation_errors = []
    for error in exc.errors():
        sanitized_error = dict(error)
        sanitized_error.pop("ctx", None)
        validation_errors.append(sanitized_error)
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": validation_errors},
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logging.getLogger("luna.security").exception("Unhandled application error")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Internal server error"},
    )


@app.get("/", include_in_schema=False)
def root():
    return {"message": "Luna Backend Running Successfully"}


@app.get(
    "/health",
    tags=["Observability"],
    summary="Liveness check",
    description="Returns 200 if the process is running. Does not check external dependencies.",
)
def health_check():
    """Process liveness probe."""
    return {"status": "healthy"}


@app.get(
    "/ready",
    tags=["Observability"],
    summary="Readiness check",
    description="Returns 200 if the application can serve requests (PostgreSQL reachable). Returns 503 otherwise.",
)
def readiness_check():
    """Readiness probe — verifies PostgreSQL connectivity."""
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
    except Exception:
        logging.getLogger("luna.database").exception("readiness.database_unavailable")
        return JSONResponse(status_code=503, content={"status": "not_ready"})
    return {"status": "ready"}


@app.get(
    "/metrics",
    response_class=PlainTextResponse,
    tags=["Observability"],
    summary="Prometheus metrics",
    description="Exposes lightweight Prometheus-compatible counters. Restrict access at the proxy layer.",
    include_in_schema=True,
)
def metrics():
    """Return in-process Prometheus-format metrics."""
    return metrics_text()
