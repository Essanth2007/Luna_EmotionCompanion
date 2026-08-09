from communication.websocket.connection_manager import ConnectionManager


class FakeWebSocket:
    def __init__(self):
        self.accepted = False
        self.closed = False
        self.payloads = []

    async def accept(self):
        self.accepted = True

    async def send_json(self, payload):
        self.payloads.append(payload)

    async def close(self, code=None):
        self.closed = True


def test_heartbeat_updates_timestamp():
    manager = ConnectionManager()
    websocket = FakeWebSocket()
    manager.connect("alice", websocket)

    before = manager.last_seen["alice"]
    manager.update_heartbeat("alice")

    assert manager.last_seen["alice"] >= before


def test_stale_connection_detection_and_cleanup():
    manager = ConnectionManager()
    websocket = FakeWebSocket()
    manager.connect("bob", websocket)

    manager.last_seen["bob"] = manager.last_seen["bob"] - manager.heartbeat_tolerance

    stale = manager.get_stale_connections(0)
    assert "bob" in stale

    manager.cleanup_stale_connections(0)
    assert "bob" not in manager.active_connections


def test_reconnect_delivers_pending_messages():
    manager = ConnectionManager()
    messages = [{"type": "chat_private_message", "content": "Queued message"}]
    manager.pending_messages["charlie"] = messages[:]

    websocket = FakeWebSocket()
    manager.reconnect_user("charlie", websocket)

    assert manager.active_connections["charlie"] is websocket
    assert manager.pending_messages["charlie"] == []
    assert websocket.payloads[0]["content"] == "Queued message"
