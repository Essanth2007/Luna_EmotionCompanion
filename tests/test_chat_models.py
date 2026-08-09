from datetime import datetime

import pytest
from pydantic import ValidationError

from communication.chat.message_models import ChatMessage, MessageAck, PrivateMessage, RoomMessage


def test_chat_message_model_accepts_basic_payload():
    message = ChatMessage.model_validate({
        "message_id": "msg-1",
        "sender_id": "alice",
        "content": "Hello there",
    })

    assert message.message_id == "msg-1"
    assert message.sender_id == "alice"
    assert message.content == "Hello there"
    assert isinstance(message.timestamp, datetime)


def test_private_message_requires_recipient_id():
    with pytest.raises(ValidationError):
        PrivateMessage.model_validate({
            "message_id": "msg-2",
            "sender_id": "alice",
            "content": "private message",
        })


def test_room_message_requires_room_id():
    with pytest.raises(ValidationError):
        RoomMessage.model_validate({
            "message_id": "msg-3",
            "sender_id": "alice",
            "content": "room message",
        })


def test_message_ack_model_builds_ack_payload():
    ack = MessageAck.model_validate({
        "message_id": "ack-1",
        "sender_id": "bob",
        "content": "delivered",
        "original_message_id": "msg-9",
        "ack_type": "delivered",
        "recipient_id": "alice",
    })

    assert ack.ack_type == "delivered"
    assert ack.original_message_id == "msg-9"
    assert ack.recipient_id == "alice"


def test_chat_message_validator_rejects_missing_content():
    with pytest.raises(ValueError):
        ChatMessage.validate_message({
            "message_id": "bad-message",
            "sender_id": "alice",
        })
