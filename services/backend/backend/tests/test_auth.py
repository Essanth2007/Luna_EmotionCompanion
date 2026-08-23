from fastapi.testclient import TestClient


def test_register_and_login_flow(client: TestClient) -> None:
    response = client.post(
        "/api/v1/auth/register",
        json={"name": "Alice", "email": "alice@example.com", "password": "secret123"},
    )
    assert response.status_code == 201
    payload = response.json()
    assert payload["email"] == "alice@example.com"
    assert "password_hash" not in payload

    login_response = client.post(
        "/api/v1/auth/login",
        data={"username": "alice@example.com", "password": "secret123"},
    )
    assert login_response.status_code == 200
    token_payload = login_response.json()
    assert "access_token" in token_payload
    assert token_payload["token_type"] == "bearer"

    me_response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token_payload['access_token']}"},
    )
    assert me_response.status_code == 200
    assert me_response.json()["email"] == "alice@example.com"


def test_duplicate_email_is_rejected(client: TestClient) -> None:
    first = client.post(
        "/api/v1/auth/register",
        json={"name": "Alice", "email": "dup@example.com", "password": "secret123"},
    )
    assert first.status_code == 201

    second = client.post(
        "/api/v1/auth/register",
        json={"name": "Alice", "email": "dup@example.com", "password": "secret123"},
    )
    assert second.status_code == 400
    assert "already exists" in second.json()["detail"].lower()


def test_register_password_too_short(client: TestClient) -> None:
    """Password minimum length of 8 characters must be enforced."""
    response = client.post(
        "/api/v1/auth/register",
        json={"name": "Bob", "email": "bob@example.com", "password": "short"},
    )
    assert response.status_code == 422


def test_login_wrong_password_returns_401(client: TestClient) -> None:
    client.post(
        "/api/v1/auth/register",
        json={"name": "Carol", "email": "carol@example.com", "password": "correctpass"},
    )
    response = client.post(
        "/api/v1/auth/login",
        data={"username": "carol@example.com", "password": "wrongpass"},
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid email or password"


def test_login_unknown_email_returns_401(client: TestClient) -> None:
    response = client.post(
        "/api/v1/auth/login",
        data={"username": "nobody@example.com", "password": "anypass"},
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid email or password"


def test_test_route_removed(client: TestClient) -> None:
    """/test debug route must no longer exist."""
    response = client.get("/api/v1/auth/test")
    assert response.status_code == 404
