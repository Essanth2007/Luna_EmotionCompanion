"""Chat foundation package for Sprint 3.

This package provides the in-memory message models, history store, and
message service used for private and room-based real-time chat.
"""

from communication.chat.message_models import (
    ChatMessage,
    MessageAck,
    PrivateMessage,
    RoomMessage,
)
from communication.chat.message_history import MessageHistory
from communication.chat.message_service import MessageService

__all__ = [
    "ChatMessage",
    "PrivateMessage",
    "RoomMessage",
    "MessageAck",
    "MessageHistory",
    "MessageService",
]
