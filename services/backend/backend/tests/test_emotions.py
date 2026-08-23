from fastapi.testclient import TestClient


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


def test_emotion_crud_and_validation(client: TestClient) -> None:
    token = _register_and_login(client, "emotion@example.com", "Emotion User")
    headers = {"Authorization": f"Bearer {token}"}

    created = client.post(
        "/api/v1/emotions",
        headers=headers,
        json={"emotion": "happy", "intensity": 8, "note": "Had a great day"},
    )
    assert created.status_code == 201
    record = created.json()
    assert record["emotion"] == "happy"
    assert record["intensity"] == 8
    assert record["user_id"] > 0
    assert record["created_at"]

    listed = client.get("/api/v1/emotions", headers=headers)
    assert listed.status_code == 200
    assert listed.json()[0]["id"] == record["id"]

    retrieved = client.get(f"/api/v1/emotions/{record['id']}", headers=headers)
    assert retrieved.status_code == 200

    too_high = client.post(
        "/api/v1/emotions",
        headers=headers,
        json={"emotion": "excited", "intensity": 11},
    )
    assert too_high.status_code == 422

    deleted = client.delete(f"/api/v1/emotions/{record['id']}", headers=headers)
    assert deleted.status_code == 204
    assert client.get(f"/api/v1/emotions/{record['id']}", headers=headers).status_code == 404


def test_emotion_ownership_and_authentication(client: TestClient) -> None:
    owner_token = _register_and_login(client, "owner@example.com", "Owner")
    other_token = _register_and_login(client, "other@example.com", "Other")
    owner_headers = {"Authorization": f"Bearer {owner_token}"}
    other_headers = {"Authorization": f"Bearer {other_token}"}

    created = client.post(
        "/api/v1/emotions",
        headers=owner_headers,
        json={"emotion": "calm", "intensity": 6},
    )
    emotion_id = created.json()["id"]

    assert client.get(f"/api/v1/emotions/{emotion_id}", headers=other_headers).status_code == 404
    assert (
        client.delete(f"/api/v1/emotions/{emotion_id}", headers=other_headers).status_code == 404
    )
    assert client.get("/api/v1/emotions", headers=other_headers).json() == []

    for method, path in [
        ("get", "/api/v1/emotions"),
        ("post", "/api/v1/emotions"),
    ]:
        response = (
            getattr(client, method)(path, json={"emotion": "sad", "intensity": 2})
            if method == "post"
            else getattr(client, method)(path)
        )
        assert response.status_code == 401

    invalid_headers = {"Authorization": "Bearer invalid.jwt.token"}
    assert client.get("/api/v1/emotions", headers=invalid_headers).status_code == 401
