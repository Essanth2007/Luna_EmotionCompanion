import os
import time
from collections import defaultdict, deque
from threading import Lock

from dotenv import load_dotenv
from fastapi import HTTPException, Request, status

load_dotenv()

INSECURE_SECRETS = {"", "secret", "changeme", "change-me", "password", "test"}
_rate_limit_events: dict[tuple[str, str], deque[float]] = defaultdict(deque)
_rate_limit_lock = Lock()


def validate_security_config() -> None:
    environment = os.getenv("ENVIRONMENT", "development").strip().lower()
    if environment != "production":
        return

    secret_key = os.getenv("SECRET_KEY", "").strip().lower()
    if secret_key in INSECURE_SECRETS or len(secret_key) < 32:
        raise RuntimeError("Production SECRET_KEY must be a strong environment value")

    if os.getenv("DEBUG", "false").strip().lower() in {"1", "true", "yes"}:
        raise RuntimeError("DEBUG must be disabled in production")

    if not os.getenv("CORS_ORIGINS", "").strip():
        raise RuntimeError("Production CORS_ORIGINS must be configured")


def cors_origins() -> list[str]:
    configured = os.getenv("CORS_ORIGINS", "").strip()
    if configured:
        return [origin.strip() for origin in configured.split(",") if origin.strip()]
    return ["http://localhost:3000", "http://127.0.0.1:3000"]


def rate_limit(name: str, limit: int, window_seconds: int = 60):
    async def dependency(request: Request) -> None:
        if os.getenv("TESTING", "false").strip().lower() == "true":
            return

        client_host = request.client.host if request.client else "unknown"
        now = time.monotonic()
        key = (name, client_host)
        with _rate_limit_lock:
            events = _rate_limit_events[key]
            while events and now - events[0] >= window_seconds:
                events.popleft()
            if len(events) >= limit:
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Too many requests",
                    headers={"Retry-After": str(window_seconds)},
                )
            events.append(now)

    return dependency
