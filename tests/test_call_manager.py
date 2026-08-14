from communication.webrtc.call_manager import CallManager, CallState


def test_create_call():
    manager = CallManager()
    session = manager.create_call("alice", "bob", media_type="video")

    assert session.call_id
    assert session.caller_id == "alice"
    assert session.receiver_id == "bob"
    assert session.media_type == "video"
    assert session.state == CallState.INITIATED
    assert session in manager.get_active_calls()
    assert manager.get_call(session.call_id) == session


def test_accept_call():
    manager = CallManager()
    session = manager.create_call("alice", "bob", media_type="audio")

    accepted = manager.accept_call(session.call_id, "bob")

    assert accepted.state == CallState.ACCEPTED
    assert accepted.accepted_by == "bob"
    assert accepted in manager.get_active_calls()


def test_reject_call():
    manager = CallManager()
    session = manager.create_call("alice", "bob")

    rejected = manager.reject_call(session.call_id, "bob", reason="busy")

    assert rejected.state == CallState.REJECTED
    assert rejected.rejection_reason == "busy"
    assert rejected.call_id == session.call_id
    assert manager.get_call(session.call_id).state == CallState.REJECTED


def test_end_call():
    manager = CallManager()
    session = manager.create_call("alice", "bob")
    manager.accept_call(session.call_id, "bob")

    ended = manager.end_call(session.call_id, "alice")

    assert ended.state == CallState.ENDED
    assert ended.ended_by == "alice"


def test_remove_call():
    manager = CallManager()
    session = manager.create_call("alice", "bob")

    manager.remove_call(session.call_id)

    assert manager.get_call(session.call_id) is None
    assert session.call_id not in [item.call_id for item in manager.get_active_calls()]


def test_active_call_listing():
    manager = CallManager()
    first = manager.create_call("alice", "bob")
    second = manager.create_call("carol", "dave")

    active = manager.get_active_calls()

    assert len(active) == 2
    assert {item.call_id for item in active} == {first.call_id, second.call_id}
