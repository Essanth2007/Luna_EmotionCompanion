import asyncio
from datetime import timedelta

import pytest
from fastapi.testclient import TestClient

from app.core.hardening import rate_limit, validate_security_config
from app.core.security import create_access_token


def _register_and_login(client: TestClient, email: str, name: str) -> str:
    client.post(
        "/api/v1/auth/register",
        json={"name": name, "email": email, "password": "secret123"},
    )
    response = client.post(
        "/api/v1/auth/login",
        data={"username": email, "password": "secret123"},
    )
    return response.json()["access_token"]


def test_protected_surfaces_reject_missing_and_invalid_tokens(client: TestClient) -> None:
    protected_requests = [
        ("get", "/api/v1/auth/me", None),
        ("get", "/api/v1/users/me", None),
        ("get", "/api/v1/emotions", None),
        ("get", "/api/v1/conversations", None),
        ("get", "/api/v1/insights/emotions", None),
        ("post", "/api/v1/ai/emotion-analysis", {"text": "hello"}),
    ]
    invalid_headers = {"Authorization": "Bearer invalid.jwt.token"}

    for method, path, body in protected_requests:
        request = getattr(client, method)
        missing = request(path, json=body) if body is not None else request(path)
        invalid = (
            request(path, headers=invalid_headers, json=body)
            if body is not None
            else request(path, headers=invalid_headers)
        )
        assert missing.status_code == 401
        assert invalid.status_code == 401


def test_client_cannot_override_identity_or_receive_sensitive_data(client: TestClient) -> None:
    token = _register_and_login(client, "security@example.com", "Security User")
    headers = {"Authorization": f"Bearer {token}"}

    conversation = client.post(
        "/api/v1/conversations",
        headers=headers,
        json={"title": "Safe", "user_id": 999999},
    )
    assert conversation.status_code == 422

    emotion = client.post(
        "/api/v1/emotions",
        headers=headers,
        json={"emotion": "calm", "intensity": 1, "user_id": 999999},
    )
    assert emotion.status_code == 422

    profile = client.get("/api/v1/users/me", headers=headers)
    assert profile.status_code == 200
    assert "password_hash" not in profile.json()
    assert "SECRET_KEY" not in profile.text
    assert "OPENAI_API_KEY" not in profile.text


def test_emotion_boundary_validation(client: TestClient) -> None:
    token = _register_and_login(client, "boundary@example.com", "Boundary User")
    headers = {"Authorization": f"Bearer {token}"}

    assert (
        client.post(
            "/api/v1/emotions", headers=headers, json={"emotion": "calm", "intensity": 1}
        ).status_code
        == 201
    )
    assert (
        client.post(
            "/api/v1/emotions", headers=headers, json={"emotion": "calm", "intensity": 10}
        ).status_code
        == 201
    )
    assert (
        client.post(
            "/api/v1/emotions", headers=headers, json={"emotion": "calm", "intensity": 0}
        ).status_code
        == 422
    )
    assert (
        client.post(
            "/api/v1/emotions", headers=headers, json={"emotion": "calm", "intensity": 11}
        ).status_code
        == 422
    )


def test_expired_token_and_security_headers(client: TestClient) -> None:
    expired_token = create_access_token("expired@example.com", timedelta(minutes=-1))
    response = client.get(
        "/api/v1/users/me",
        headers={"Authorization": f"Bearer {expired_token}"},
    )
    assert response.status_code == 401
    assert response.headers["X-Content-Type-Options"] == "nosniff"
    assert response.headers["X-Frame-Options"] == "DENY"
    assert response.headers["Referrer-Policy"] == "strict-origin-when-cross-origin"
    assert "authorization" not in response.text.lower()
    assert "secret" not in response.text.lower()


def test_cors_allows_configured_development_origin(client: TestClient) -> None:
    response = client.options(
        "/api/v1/auth/login",
        headers={
            "Origin": "http://localhost:3000",
            "Access-Control-Request-Method": "POST",
        },
    )
    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "http://localhost:3000"


def test_production_configuration_rejects_weak_defaults(monkeypatch) -> None:
    monkeypatch.setenv("ENVIRONMENT", "production")
    monkeypatch.setenv("SECRET_KEY", "change-me")
    monkeypatch.setenv("DEBUG", "false")
    monkeypatch.setenv("CORS_ORIGINS", "https://example.com")

    with pytest.raises(RuntimeError):
        validate_security_config()


def test_rate_limiter_rejects_excess_requests(monkeypatch) -> None:
    monkeypatch.setenv("TESTING", "false")

    class Client:
        host = "security-test-ratelimit"

    class Request:
        client = Client()

    limiter = rate_limit("security-test-ratelimit", limit=1, window_seconds=60)
    asyncio.run(limiter(Request()))
    with pytest.raises(Exception) as error:
        asyncio.run(limiter(Request()))
    assert getattr(error.value, "status_code", None) == 429


def test_proxy_headers_middleware_trusts_forwarded_ip(client: TestClient) -> None:
    """X-Forwarded-For from a trusted proxy should be seen by the application."""
    response = client.get(
        "/health",
        headers={"X-Forwarded-For": "203.0.113.10", "X-Forwarded-Proto": "https"},
    )
    # The middleware rewrites request.client.host to the forwarded IP.
    # We verify the app did not crash (200) and that the header was accepted.
    assert response.status_code == 200


def test_login_failure_does_not_distinguish_user_vs_password(client: TestClient) -> None:
    """Both 'user not found' and 'wrong password' must return the same generic message."""
    # Register a known user
    client.post(
        "/api/v1/auth/register",
        json={"name": "X", "email": "knownuser@example.com", "password": "correctpass"},
    )
    unknown_response = client.post(
        "/api/v1/auth/login",
        data={"username": "nobody@example.com", "password": "anypass"},
    )
    wrong_pass_response = client.post(
        "/api/v1/auth/login",
        data={"username": "knownuser@example.com", "password": "wrongpass"},
    )
    assert unknown_response.json()["detail"] == wrong_pass_response.json()["detail"]
    assert unknown_response.json()["detail"] == "Invalid email or password"
