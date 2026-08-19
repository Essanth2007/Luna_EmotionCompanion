import logging

from fastapi.testclient import TestClient


def test_request_id_is_returned_and_metrics_are_exposed(client: TestClient) -> None:
    response = client.get("/health", headers={"X-Request-ID": "observability-test-1"})
    assert response.status_code == 200
    assert response.headers["X-Request-ID"] == "observability-test-1"

    metrics = client.get("/metrics")
    assert metrics.status_code == 200
    assert "http_requests_total" in metrics.text
    assert "http_request_duration_seconds_total" in metrics.text


def test_readiness_checks_database(client: TestClient) -> None:
    response = client.get("/ready")
    assert response.status_code == 200
    assert response.json() == {"status": "ready"}


def test_request_logs_exclude_sensitive_headers(client: TestClient, caplog) -> None:
    caplog.set_level(logging.INFO)
    secret_token = "Bearer never-log-this-token"
    response = client.get(
        "/health",
        headers={"Authorization": secret_token, "X-Request-ID": "safe-log-id"},
    )
    assert response.status_code == 200
    logs = "\n".join(record.getMessage() for record in caplog.records)
    assert "never-log-this-token" not in logs
    assert "Authorization" not in logs
    assert "safe-log-id" in logs or response.headers["X-Request-ID"] == "safe-log-id"
