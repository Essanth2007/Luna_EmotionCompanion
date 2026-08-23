from communication.webrtc.signaling import SignalingManager


def test_offer_creation():
    offer = SignalingManager.create_offer(
        room_id="room1",
        sender="alice",
        receiver="bob",
        sdp="sample_offer",
    )

    assert offer["type"] == "offer"
    assert offer["sender"] == "alice"
    assert offer["receiver"] == "bob"


def test_answer_creation():
    answer = SignalingManager.create_answer(
        room_id="room1",
        sender="bob",
        receiver="alice",
        sdp="sample_answer",
    )

    assert answer["type"] == "answer"
    assert answer["sender"] == "bob"


def test_ice_candidate_creation():
    candidate = SignalingManager.create_ice_candidate(
        room_id="room1",
        sender="alice",
        receiver="bob",
        candidate="candidate_data",
    )

    assert candidate["type"] == "ice_candidate"


def test_message_validation():
    message = {
        "type": "offer",
        "room_id": "room1",
        "sender": "alice",
        "receiver": "bob",
    }

    assert SignalingManager.validate_message(message)