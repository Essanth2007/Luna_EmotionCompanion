from communication.chat.recovery_service import RecoveryService


def test_queue_and_retrieve_pending_messages():
    service = RecoveryService()
    message = {"type": "chat_private_message", "content": "Hello"}

    service.queue_message("alice", message)

    assert service.has_pending_messages("alice") is True
    assert service.get_pending_count("alice") == 1
    assert service.get_pending_messages("alice") == [message]


def test_clear_pending_messages():
    service = RecoveryService()
    service.queue_message("bob", {"type": "chat_private_message", "content": "Hi"})

    service.clear_pending_messages("bob")

    assert service.has_pending_messages("bob") is False
    assert service.get_pending_count("bob") == 0
    assert service.get_pending_messages("bob") == []
