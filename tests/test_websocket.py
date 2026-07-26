from communication.websocket.connection_manager import ConnectionManager


def test_connection_manager_creation():
    manager = ConnectionManager()

    assert manager is not None
    assert manager.get_connection_count() == 0


def test_initial_connected_users():
    manager = ConnectionManager()

    assert manager.get_connected_users() == []