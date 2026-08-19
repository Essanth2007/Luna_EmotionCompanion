import json
import logging
import os
import uuid
from contextvars import ContextVar
from threading import Lock

from fastapi import Request

request_id_context: ContextVar[str] = ContextVar("request_id", default="-")
_metrics_lock = Lock()
_metrics = {
    "http_requests_total": 0,
    "http_errors_total": 0,
    "http_request_duration_seconds_total": 0.0,
    "ai_provider_calls_total": 0,
    "ai_provider_failures_total": 0,
}


class JsonFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        payload = {
            "timestamp": self.formatTime(record, "%Y-%m-%dT%H:%M:%S%z"),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "request_id": request_id_context.get(),
        }
        if hasattr(record, "method"):
            payload["method"] = record.method
        if hasattr(record, "path"):
            payload["path"] = record.path
        if hasattr(record, "status_code"):
            payload["status_code"] = record.status_code
        if hasattr(record, "duration_ms"):
            payload["duration_ms"] = record.duration_ms
        if record.exc_info:
            payload["exception"] = self.formatException(record.exc_info)
        return json.dumps(payload, separators=(",", ":"))


def configure_logging() -> None:
    level_name = os.getenv("LOG_LEVEL", "INFO").upper()
    level = getattr(logging, level_name, logging.INFO)
    handler = logging.StreamHandler()
    handler.setFormatter(JsonFormatter())
    root = logging.getLogger()
    root.handlers.clear()
    root.addHandler(handler)
    root.setLevel(level)


def new_request_id(request: Request) -> str:
    candidate = request.headers.get("X-Request-ID", "")
    if len(candidate) <= 80 and candidate.replace("-", "").replace("_", "").isalnum():
        return candidate or uuid.uuid4().hex
    return uuid.uuid4().hex


def increment_metric(name: str, value: float = 1) -> None:
    with _metrics_lock:
        _metrics[name] = _metrics.get(name, 0) + value


def metrics_text() -> str:
    with _metrics_lock:
        snapshot = dict(_metrics)
    lines = [
        "# HELP http_requests_total Total HTTP requests.",
        "# TYPE http_requests_total counter",
        f"http_requests_total {snapshot['http_requests_total']}",
        "# HELP http_errors_total Total HTTP 4xx and 5xx responses.",
        "# TYPE http_errors_total counter",
        f"http_errors_total {snapshot['http_errors_total']}",
        "# HELP http_request_duration_seconds_total Cumulative HTTP duration.",
        "# TYPE http_request_duration_seconds_total counter",
        f"http_request_duration_seconds_total {snapshot['http_request_duration_seconds_total']}",
        "# HELP ai_provider_calls_total Total AI provider calls.",
        "# TYPE ai_provider_calls_total counter",
        f"ai_provider_calls_total {snapshot['ai_provider_calls_total']}",
        "# HELP ai_provider_failures_total Total AI provider failures.",
        "# TYPE ai_provider_failures_total counter",
        f"ai_provider_failures_total {snapshot['ai_provider_failures_total']}",
    ]
    return "\n".join(lines) + "\n"
