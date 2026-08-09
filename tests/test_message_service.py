from communication.chat.message_service import MessageService
from communication.chat.message_models import MessageAck, PrivateMessage, RoomMessage


class FakeConnectionManager:
    def __init__(self):
        self.sent_messages = []
        self.connected_users = {"bob", "charlie"}

    def is_connected(self, user_id: str) -> bool:
        return user_id in self.connected_users

    async def send_personal_message(self, user_id: str, message: dict):
        self.sent_messages.append({"user_id": user_id, "message": message})


class FakePresenceManager:
    def is_online(self, user_id: str) -> bool:
        return user_id in {"bob", "charlie"}


class FakeRoomManager:
    def __init__(self):
        self.rooms = {"room-1": {"alice", "bob", "charlie"}}

    def room_exists(self, room_id: str) -> bool:
        return room_id in self.rooms

    def create_room(self, room_id: str):
        self.rooms.setdefault(room_id, set())

    def get_room_members(self, room_id: str):
        return list(self.rooms.get(room_id, set()))


def test_send_private_message_creates_message_and_ack():
    connection_manager = FakeConnectionManager()
    service = MessageService(
        connection_manager=connection_manager,
        presence_manager=FakePresenceManager(),
    )

    message = service.send_private_message("alice", "bob", "Hello from alice")

    assert isinstance(message, PrivateMessage)
    assert message.sender_id == "alice"
    assert message.recipient_id == "bob"
    assert message.content == "Hello from alice"
    assert len(service.history.get_private_messages("alice", "bob")) == 1
    assert len(connection_manager.sent_messages) == 1


def test_send_room_message_delivers_to_room_members():
    connection_manager = FakeConnectionManager()
    service = MessageService(
        connection_manager=connection_manager,
        room_manager=FakeRoomManager(),
    )

    message = service.send_room_message("alice", "room-1", "Room announcement")

    assert isinstance(message, RoomMessage)
    assert message.room_id == "room-1"
    assert len(connection_manager.sent_messages) == 2


def test_create_ack_generates_ack_payload():
    service = MessageService()

    ack = service.create_ack(
        "msg-42",
        "alice",
        "bob",
        ack_type="delivered",
    )

    assert isinstance(ack, MessageAck)
    assert ack.original_message_id == "msg-42"
    assert ack.recipient_id == "alice"
    assert ack.ack_type == "delivered"
