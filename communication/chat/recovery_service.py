from __future__ import annotations

from collections import defaultdict, deque
from typing import Any, Deque, DefaultDict, Dict, List


class RecoveryService:
    """Tracks pending messages that could not be delivered while a user was offline."""

    def __init__(self):
        self._pending_messages: DefaultDict[str, Deque[Dict[str, Any]]] = defaultdict(deque)

    def queue_message(self, user_id: str, message: Dict[str, Any]) -> None:
        """Queue a message for later delivery to a user after reconnect."""
        if not user_id or not user_id.strip():
            raise ValueError("user_id must not be empty.")

        self._pending_messages[user_id].append(message)

    def get_pending_messages(self, user_id: str) -> List[Dict[str, Any]]:
        """Return queued messages for a user in FIFO order."""
        return list(self._pending_messages.get(user_id, ()))

    def clear_pending_messages(self, user_id: str) -> None:
        """Remove all pending messages for a user."""
        self._pending_messages.pop(user_id, None)

    def has_pending_messages(self, user_id: str) -> bool:
        """Return whether a user has queued messages waiting to be delivered."""
        return bool(self._pending_messages.get(user_id))

    def get_pending_count(self, user_id: str) -> int:
        """Return the number of queued messages waiting for a user."""
        return len(self._pending_messages.get(user_id, ()))
