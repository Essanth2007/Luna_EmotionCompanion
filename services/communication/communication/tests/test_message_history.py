from communication.chat.message_history import MessageHistory
from communication.chat.message_models import ChatMessage, PrivateMessage, RoomMessage


def test_message_history_stores_messages():
    history = MessageHistory()

    message = ChatMessage.model_validate({
        "message_id": "msg-1",
        "sender_id": "alice",
        "content": "Initial message",
    })

    history.add_message(message)

    assert len(history.get_all_messages()) == 1
    assert history.get_all_messages()[0].message_id == "msg-1"


def test_message_history_filters_private_and_room_messages():
    history = MessageHistory()

    private_message = PrivateMessage.model_validate({
        "message_id": "p-1",
        "sender_id": "alice",
        "recipient_id": "bob",
        "content": "Hi bob",
    })

    room_message = RoomMessage.model_validate({
        "message_id": "r-1",
        "sender_id": "alice",
        "room_id": "room-1",
        "content": "Room update",
    })

    history.add_message(private_message)
    history.add_message(room_message)

    assert len(history.get_private_messages("alice", "bob")) == 1
    assert len(history.get_room_messages("room-1")) == 1
    assert len(history.get_user_messages("alice")) == 2


def test_message_history_returns_recent_messages():
    history = MessageHistory()

    for index in range(5):
        history.add_message(
            ChatMessage.model_validate({
                "message_id": f"m-{index}",
                "sender_id": "alice",
                "content": f"Message {index}",
            })
        )

    recent = history.get_recent_messages(limit=3)

    assert len(recent) == 3
    assert recent[0].message_id == "m-4"
