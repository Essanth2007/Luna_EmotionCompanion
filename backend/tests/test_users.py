from fastapi.testclient import TestClient


def _register_and_login(client: TestClient, email: str = "user@example.com") -> str:
    client.post(
        "/api/v1/auth/register",
        json={"name": "User", "email": email, "password": "oldpass123"},
    )
    response = client.post(
        "/api/v1/auth/login",
        data={"username": email, "password": "oldpass123"},
    )
    return response.json()["access_token"]


def test_user_management_flow(client: TestClient) -> None:
    token = _register_and_login(client)
    headers = {"Authorization": f"Bearer {token}"}

    profile = client.get("/api/v1/users/me", headers=headers)
    assert profile.status_code == 200
    assert "password_hash" not in profile.json()

    updated = client.patch(
        "/api/v1/users/me",
        headers=headers,
        json={"name": "Updated User"},
    )
    assert updated.status_code == 200
    assert updated.json()["name"] == "Updated User"

    changed_password = client.patch(
        "/api/v1/users/me/password",
        headers=headers,
        json={"current_password": "oldpass123", "new_password": "newpass123"},
    )
    assert changed_password.status_code == 200

    wrong_password = client.patch(
        "/api/v1/users/me/password",
        headers=headers,
        json={"current_password": "wrongpass", "new_password": "newpass123"},
    )
    assert wrong_password.status_code == 400


def test_duplicate_email_and_account_deletion(client: TestClient) -> None:
    token = _register_and_login(client, "first@example.com")
    client.post(
        "/api/v1/auth/register",
        json={"name": "Second", "email": "second@example.com", "password": "oldpass123"},
    )
    headers = {"Authorization": f"Bearer {token}"}

    duplicate = client.patch(
        "/api/v1/users/me",
        headers=headers,
        json={"email": "second@example.com"},
    )
    assert duplicate.status_code == 409

    deleted = client.delete("/api/v1/users/me", headers=headers)
    assert deleted.status_code == 204
    assert client.get("/api/v1/users/me", headers=headers).status_code == 401


def test_update_profile_requires_at_least_one_field(client: TestClient) -> None:
    token = _register_and_login(client, "update_test@example.com")
    headers = {"Authorization": f"Bearer {token}"}
    response = client.patch("/api/v1/users/me", headers=headers, json={})
    assert response.status_code == 422


def test_new_password_too_short_rejected(client: TestClient) -> None:
    token = _register_and_login(client, "shortpass@example.com")
    headers = {"Authorization": f"Bearer {token}"}
    response = client.patch(
        "/api/v1/users/me/password",
        headers=headers,
        json={"current_password": "oldpass123", "new_password": "short"},
    )
    assert response.status_code == 422
