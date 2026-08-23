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


def _create_emotion(client: TestClient, headers: dict, emotion: str, intensity: int):
    return client.post(
        "/api/v1/emotions",
        headers=headers,
        json={"emotion": emotion, "intensity": intensity},
    )


def test_insights_and_user_isolation(client: TestClient) -> None:
    owner_token = _register_and_login(client, "insights.owner@example.com", "Owner")
    other_token = _register_and_login(client, "insights.other@example.com", "Other")
    owner_headers = {"Authorization": f"Bearer {owner_token}"}
    other_headers = {"Authorization": f"Bearer {other_token}"}

    for emotion, intensity in [
        ("happy", 8),
        ("happy", 6),
        ("calm", 7),
        ("stressed", 4),
        ("happy", 10),
    ]:
        assert _create_emotion(client, owner_headers, emotion, intensity).status_code == 201
    assert _create_emotion(client, other_headers, "sad", 1).status_code == 201

    distribution = client.get("/api/v1/insights/emotions", headers=owner_headers)
    assert distribution.status_code == 200
    assert distribution.json()["total_records"] == 5
    assert distribution.json()["emotions"][0] == {
        "emotion": "happy",
        "count": 3,
        "percentage": 60.0,
    }

    summary = client.get("/api/v1/insights/mood-summary", headers=owner_headers)
    assert summary.status_code == 200
    assert summary.json()["average_intensity"] == 7.0
    assert summary.json()["highest_intensity"] == 10
    assert summary.json()["lowest_intensity"] == 4
    assert summary.json()["most_common_emotion"] == "happy"

    trends = client.get("/api/v1/insights/trends", headers=owner_headers)
    assert trends.status_code == 200
    assert trends.json()["period_days"] == 7
    assert len(trends.json()["trends"]) == 1
    assert trends.json()["trends"][0]["record_count"] == 5

    assert (
        client.get("/api/v1/insights/emotions", headers=other_headers).json()["total_records"] == 1
    )
    assert client.get("/api/v1/insights/emotions").status_code == 401
    assert (
        client.get(
            "/api/v1/insights/emotions", headers={"Authorization": "Bearer invalid.jwt.token"}
        ).status_code
        == 401
    )


def test_empty_insights_and_invalid_days(client: TestClient) -> None:
    token = _register_and_login(client, "empty.insights@example.com", "Empty")
    headers = {"Authorization": f"Bearer {token}"}

    distribution = client.get("/api/v1/insights/emotions", headers=headers).json()
    assert distribution == {"total_records": 0, "emotions": []}
    summary = client.get("/api/v1/insights/mood-summary", headers=headers).json()
    assert summary["total_records"] == 0
    assert summary["average_intensity"] is None
    assert summary["most_common_emotion"] is None
    assert client.get("/api/v1/insights/trends", headers=headers).json()["trends"] == []

    for days in (0, -1, 91, "invalid"):
        assert (
            client.get(f"/api/v1/insights/trends?days={days}", headers=headers).status_code == 422
        )
