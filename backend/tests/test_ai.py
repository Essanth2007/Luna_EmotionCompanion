from fastapi.testclient import TestClient

from app.api.ai import get_emotion_analysis_service
from app.main import app
from app.services.emotion_analysis import EmotionAnalysisService


def _register_and_login(client: TestClient) -> str:
    client.post(
        "/api/v1/auth/register",
        json={"name": "AI Test User", "email": "ai@example.com", "password": "secret123"},
    )
    response = client.post(
        "/api/v1/auth/login",
        data={"username": "ai@example.com", "password": "secret123"},
    )
    return response.json()["access_token"]


def test_authenticated_mock_analysis_and_validation(client: TestClient) -> None:
    token = _register_and_login(client)
    headers = {"Authorization": f"Bearer {token}"}

    response = client.post(
        "/api/v1/ai/emotion-analysis",
        headers=headers,
        json={"text": "I am very happy today."},
    )
    assert response.status_code == 200
    assert response.json()["emotion"] == "happy"
    assert response.json()["confidence"] == 0.9
    assert set(response.json()) == {
        "emotion",
        "confidence",
        "sentiment",
        "explanation",
        "suggested_response",
    }

    assert (
        client.post("/api/v1/ai/emotion-analysis", headers=headers, json={"text": ""}).status_code
        == 422
    )
    assert (
        client.post(
            "/api/v1/ai/emotion-analysis", headers=headers, json={"text": "   "}
        ).status_code
        == 422
    )
    assert (
        client.post(
            "/api/v1/ai/emotion-analysis", headers=headers, json={"text": "x" * 5001}
        ).status_code
        == 422
    )
    assert (
        client.post(
            "/api/v1/ai/emotion-analysis", headers=headers, json={"text": "ok", "user_id": 1}
        ).status_code
        == 422
    )


def test_ai_authentication_and_provider_failure(client: TestClient) -> None:
    token = _register_and_login(client)
    headers = {"Authorization": f"Bearer {token}"}
    request_body = {"text": "I feel calm."}

    assert client.post("/api/v1/ai/emotion-analysis", json=request_body).status_code == 401
    assert (
        client.post(
            "/api/v1/ai/emotion-analysis",
            headers={"Authorization": "Bearer invalid.jwt.token"},
            json=request_body,
        ).status_code
        == 401
    )

    class FailingProvider:
        def analyze_emotion(self, text):
            raise RuntimeError("provider internals must not leak")

    app.dependency_overrides[get_emotion_analysis_service] = lambda: EmotionAnalysisService(
        FailingProvider()
    )
    try:
        failure = client.post("/api/v1/ai/emotion-analysis", headers=headers, json=request_body)
        assert failure.status_code == 502
        assert failure.json()["detail"] == "Emotion analysis provider is currently unavailable"
        assert "provider internals" not in failure.text
    finally:
        app.dependency_overrides.pop(get_emotion_analysis_service, None)
