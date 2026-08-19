from fastapi.testclient import TestClient
from sqlalchemy.orm import sessionmaker

from app.api.conversations import get_chat_service
from app.db.database import engine as app_engine
from app.main import app
from app.models.message import Message
from app.services.chat import ChatService


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


def test_conversation_chat_and_cascade(client: TestClient) -> None:
    token = _register_and_login(client, "chat@example.com", "Chat User")
    headers = {"Authorization": f"Bearer {token}"}

    created = client.post(
        "/api/v1/conversations",
        headers=headers,
        json={"title": "My first conversation"},
    )
    assert created.status_code == 201
    conversation = created.json()

    sent = client.post(
        f"/api/v1/conversations/{conversation['id']}/messages",
        headers=headers,
        json={"content": "I have been feeling stressed about my project."},
    )
    assert sent.status_code == 201
    assert sent.json()["user_message"]["role"] == "user"
    assert sent.json()["assistant_message"]["role"] == "assistant"

    detail = client.get(f"/api/v1/conversations/{conversation['id']}", headers=headers)
    assert detail.status_code == 200
    assert len(detail.json()["messages"]) == 2

    empty_message = client.post(
        f"/api/v1/conversations/{conversation['id']}/messages",
        headers=headers,
        json={"content": "   "},
    )
    assert empty_message.status_code == 422

    deleted = client.delete(f"/api/v1/conversations/{conversation['id']}", headers=headers)
    assert deleted.status_code == 204
    assert (
        client.get(f"/api/v1/conversations/{conversation['id']}", headers=headers).status_code
        == 404
    )

    db = sessionmaker(autocommit=False, autoflush=False, bind=app_engine)()
    try:
        assert db.query(Message).filter(Message.conversation_id == conversation["id"]).count() == 0
    finally:
        db.close()


def test_conversation_ownership_and_authentication(client: TestClient) -> None:
    owner_token = _register_and_login(client, "owner.chat@example.com", "Owner")
    other_token = _register_and_login(client, "other.chat@example.com", "Other")
    owner_headers = {"Authorization": f"Bearer {owner_token}"}
    other_headers = {"Authorization": f"Bearer {other_token}"}

    # Injecting extra fields must be rejected (extra="forbid" on schema)
    created = client.post(
        "/api/v1/conversations",
        headers=owner_headers,
        json={"title": "Private conversation", "user_id": 999},
    )
    assert created.status_code == 422

    created = client.post(
        "/api/v1/conversations",
        headers=owner_headers,
        json={"title": "Private conversation"},
    )
    conversation_id = created.json()["id"]

    assert (
        client.get(f"/api/v1/conversations/{conversation_id}", headers=other_headers).status_code
        == 404
    )
    assert (
        client.post(
            f"/api/v1/conversations/{conversation_id}/messages",
            headers=other_headers,
            json={"content": "Not allowed"},
        ).status_code
        == 404
    )
    assert (
        client.delete(f"/api/v1/conversations/{conversation_id}", headers=other_headers).status_code
        == 404
    )

    assert client.get("/api/v1/conversations").status_code == 401
    assert (
        client.get(
            "/api/v1/conversations",
            headers={"Authorization": "Bearer invalid.jwt.token"},
        ).status_code
        == 401
    )


def test_chat_provider_failure_is_sanitized(client: TestClient) -> None:
    token = _register_and_login(client, "failure.chat@example.com", "Failure User")
    headers = {"Authorization": f"Bearer {token}"}
    created = client.post("/api/v1/conversations", headers=headers, json={})
    conversation_id = created.json()["id"]

    class FailingProvider:
        def generate_response(self, messages):
            raise RuntimeError("provider internals must not leak")

    app.dependency_overrides[get_chat_service] = lambda: ChatService(FailingProvider())
    try:
        response = client.post(
            f"/api/v1/conversations/{conversation_id}/messages",
            headers=headers,
            json={"content": "Hello"},
        )
        assert response.status_code == 502
        assert response.json()["detail"] == "Chat provider is currently unavailable"
        assert "provider internals" not in response.text
    finally:
        app.dependency_overrides.pop(get_chat_service, None)
