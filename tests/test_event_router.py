from communication.chat.events import (
    CHAT_PRIVATE_MESSAGE,
    CHAT_ROOM_MESSAGE,
    PING,
    PONG,
)
from communication.websocket.websocket_router import (
    handle_chat_ack,
    handle_ping,
    handle_private_message,
    handle_room_message,
    handle_presence_update,
    handle_unsupported_event,
    handle_webrtc_answer,
    handle_webrtc_ice_candidate,
    handle_webrtc_offer,
)


def test_ping_returns_pong():
    response = handle_ping({"type": PING})

    assert response == {"type": PONG}


def test_unsupported_event_returns_error():
    response = handle_unsupported_event({"type": "unknown"})

    assert response == {"type": "error", "message": "Unsupported event type"}


def test_private_message_event_dispatches_correctly():
    payload = {
        "type": CHAT_PRIVATE_MESSAGE,
        "sender_id": "alice",
        "recipient_id": "bob",
        "content": "Hello there",
    }

    response = handle_private_message(payload)

    assert response["type"] == CHAT_PRIVATE_MESSAGE
    assert response["sender_id"] == "alice"
    assert response["recipient_id"] == "bob"
    assert response["content"] == "Hello there"


def test_room_message_event_dispatches_correctly():
    payload = {
        "type": CHAT_ROOM_MESSAGE,
        "sender_id": "alice",
        "room_id": "room-1",
        "content": "Room update",
    }

    response = handle_room_message(payload)

    assert response["type"] == CHAT_ROOM_MESSAGE
    assert response["sender_id"] == "alice"
    assert response["room_id"] == "room-1"
    assert response["content"] == "Room update"


def test_presence_update_event_dispatches_correctly():
    payload = {
        "type": "presence_update",
        "user_id": "alice",
        "status": "online",
    }

    response = handle_presence_update(payload)

    assert response["type"] == "presence_update"
    assert response["user_id"] == "alice"
    assert response["status"] == "online"


def test_webrtc_offer_event_dispatches_correctly():
    payload = {
        "type": "webrtc_offer",
        "sender": "alice",
        "receiver": "bob",
        "sdp": "offer-sdp",
    }

    response = handle_webrtc_offer(payload)

    assert response["type"] == "webrtc_offer"
    assert response["sender"] == "alice"
    assert response["receiver"] == "bob"


def test_webrtc_answer_event_dispatches_correctly():
    payload = {
        "type": "webrtc_answer",
        "sender": "bob",
        "receiver": "alice",
        "sdp": "answer-sdp",
    }

    response = handle_webrtc_answer(payload)

    assert response["type"] == "webrtc_answer"
    assert response["sender"] == "bob"
    assert response["receiver"] == "alice"


def test_webrtc_ice_candidate_event_dispatches_correctly():
    payload = {
        "type": "webrtc_ice_candidate",
        "sender": "alice",
        "receiver": "bob",
        "candidate": {"candidate": "candidate-1"},
    }

    response = handle_webrtc_ice_candidate(payload)

    assert response["type"] == "webrtc_ice_candidate"
    assert response["sender"] == "alice"
    assert response["receiver"] == "bob"


def test_chat_ack_event_dispatches_correctly():
    payload = {
        "type": "chat_ack",
        "original_message_id": "m-1",
        "recipient_id": "bob",
        "sender_id": "alice",
        "ack_type": "delivered",
    }

    response = handle_chat_ack(payload)

    assert response["type"] == "chat_ack"
    assert response["original_message_id"] == "m-1"
    assert response["ack_type"] == "delivered"
