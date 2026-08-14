from communication.chat.events import (
    CALL_ACCEPT,
    CALL_END,
    CALL_REJECT,
    CALL_START,
    CAMERA_OFF,
    CAMERA_ON,
    MEDIA_MUTE,
    MEDIA_UNMUTE,
)
from communication.websocket.websocket_router import (
    handle_call_accept,
    handle_call_end,
    handle_call_reject,
    handle_call_start,
    handle_media_control,
)


def test_call_start_event_routing():
    payload = handle_call_start({
        "call_id": "call-1",
        "caller_id": "alice",
        "receiver_id": "bob",
        "media_type": "video",
    })

    assert payload["type"] == CALL_START
    assert payload["caller_id"] == "alice"
    assert payload["receiver_id"] == "bob"


def test_call_accept_event_routing():
    payload = handle_call_accept({
        "call_id": "call-1",
        "user_id": "bob",
    })

    assert payload["type"] == CALL_ACCEPT
    assert payload["user_id"] == "bob"


def test_call_reject_event_routing():
    payload = handle_call_reject({
        "call_id": "call-1",
        "user_id": "bob",
        "reason": "busy",
    })

    assert payload["type"] == CALL_REJECT
    assert payload["reason"] == "busy"


def test_call_end_event_routing():
    payload = handle_call_end({
        "call_id": "call-1",
        "user_id": "alice",
    })

    assert payload["type"] == CALL_END
    assert payload["user_id"] == "alice"


def test_media_control_event_routing():
    payload = handle_media_control({
        "call_id": "call-1",
        "user_id": "alice",
        "control": "mute",
    })

    assert payload["type"] in {MEDIA_MUTE, MEDIA_UNMUTE, CAMERA_ON, CAMERA_OFF}
    assert payload["call_id"] == "call-1"
    assert payload["user_id"] == "alice"
