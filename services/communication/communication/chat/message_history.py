from __future__ import annotations

from collections import defaultdict, deque
from datetime import datetime
from typing import Deque, Dict, List, Optional

from communication.chat.message_models import ChatMessage, PrivateMessage, RoomMessage


class MessageHistory:
    """In-memory chat history manager.

    This class records message objects in a lightweight in-process storage to
    support private history lookups, room history, and recent message retrieval
    without introducing a database dependency.
    """

    def __init__(self, max_messages: int = 500):
        self.max_messages = max_messages
        self._messages: Deque[ChatMessage] = deque(maxlen=max_messages)
        self._private_index: Dict[str, List[PrivateMessage]] = defaultdict(list)
        self._room_index: Dict[str, List[RoomMessage]] = defaultdict(list)
        self._user_index: Dict[str, List[ChatMessage]] = defaultdict(list)

    def add_message(self, message: ChatMessage) -> ChatMessage:
        """Store a message and index it by its relevant grouping keys."""
        self._messages.append(message)

        if isinstance(message, PrivateMessage):
            key = self._private_key(message.sender_id, message.recipient_id)
            self._private_index[key].append(message)
            self._user_index[message.sender_id].append(message)
            self._user_index[message.recipient_id].append(message)

        elif isinstance(message, RoomMessage):
            self._room_index[message.room_id].append(message)
            self._user_index[message.sender_id].append(message)

        else:
            self._user_index[message.sender_id].append(message)

        return message

    def get_all_messages(self) -> List[ChatMessage]:
        """Return all messages in insertion order."""
        return list(self._messages)

    def get_recent_messages(self, limit: int = 10):
        """
        Return the most recent messages in newest-first order.
        """
        messages = list(self._messages)
        return list(reversed(messages[-limit:]))

    def get_private_messages(self, sender_id: str, recipient_id: str) -> List[PrivateMessage]:
        """Return all private messages exchanged between two users."""
        key = self._private_key(sender_id, recipient_id)
        reverse_key = self._private_key(recipient_id, sender_id)

        messages = list(self._private_index.get(key, []))
        messages.extend(self._private_index.get(reverse_key, []))
        return sorted(messages, key=lambda item: item.timestamp)

    def get_room_messages(self, room_id: str) -> List[RoomMessage]:
        """Return the message history for a room."""
        return sorted(self._room_index.get(room_id, []), key=lambda item: item.timestamp)

    def get_user_messages(self, user_id: str) -> List[ChatMessage]:
        """Return all messages involving a user."""
        return sorted(self._user_index.get(user_id, []), key=lambda item: item.timestamp)

    def clear(self) -> None:
        """Remove all stored messages."""
        self._messages.clear()
        self._private_index.clear()
        self._room_index.clear()
        self._user_index.clear()

    @staticmethod
    def _private_key(sender_id: str, recipient_id: str) -> str:
        """Create a deterministic key for two-user message indexing."""
        return f"{sender_id}:{recipient_id}"
