from communication.chat.auth_service import AuthService
from communication.websocket.connection_manager import ConnectionManager


def test_valid_token_returns_true():
    service = AuthService()

    assert service.validate_token("token-alice") is True


def test_invalid_token_returns_false():
    service = AuthService()

    assert service.validate_token("invalid-token") is False


def test_get_user_from_token_returns_correct_user():
    service = AuthService()

    assert service.get_user_from_token("token-bob") == "bob"


def test_issue_demo_token_creates_a_usable_token():
    service = AuthService()

    token = service.issue_demo_token("charlie")

    assert token == "token-charlie"
    assert service.validate_token(token) is True
    assert service.get_user_from_token(token) == "charlie"


def test_connection_manager_auth_helpers():
    manager = ConnectionManager()

    manager.register_authenticated_user("alice", "token-alice")

    assert manager.is_authenticated("alice") is True
    assert manager.get_user_token("alice") == "token-alice"

    manager.disconnect("alice")

    assert manager.is_authenticated("alice") is False
    assert manager.get_user_token("alice") is None
