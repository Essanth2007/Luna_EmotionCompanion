from __future__ import annotations

import asyncio
from typing import Any, Dict, List, Optional

from communication.chat.message_history import MessageHistory
from communication.chat.message_models import ChatMessage, MessageAck, PrivateMessage, RoomMessage
from communication.manager.presence_manager import PresenceManager
from communication.webrtc.room_manager import RoomManager


class MessageService:
    """Service layer for chat message handling.

    This class keeps the logic centered around in-memory message storage and
    delivery orchestration. It is intentionally independent from a database and
    integrates with the existing Sprint 2 components through dependency
    injection.
    """

    def __init__(
        self,
        connection_manager: Optional[Any] = None,
        presence_manager: Optional[PresenceManager] = None,
        room_manager: Optional[RoomManager] = None,
        history: Optional[MessageHistory] = None,
    ):
        self.connection_manager = connection_manager
        self.presence_manager = presence_manager or PresenceManager()
        self.room_manager = room_manager or RoomManager()
        self.history = history or MessageHistory()

    def send_private_message(
        self,
        sender_id: str,
        recipient_id: str,
        content: str,
        message_id: Optional[str] = None,
    ) -> PrivateMessage:
        """Create and deliver a direct message to one user."""
        private_message = PrivateMessage.model_validate({
            "message_id": message_id or f"private-{sender_id}-{recipient_id}-{len(self.history.get_all_messages()) + 1}",
            "sender_id": sender_id,
            "recipient_id": recipient_id,
            "content": content,
        })

        self.history.add_message(private_message)

        if self.connection_manager is not None:
            asyncio.run(
                self.connection_manager.send_personal_message(
                    recipient_id,
                    private_message.to_dict(),
                )
            )

        self.create_ack(
            private_message.message_id,
            recipient_id,
            sender_id,
            ack_type="delivered",
        )

        return private_message

    def send_room_message(
        self,
        sender_id: str,
        room_id: str,
        content: str,
        message_id: Optional[str] = None,
    ) -> RoomMessage:
        """Create and broadcast a room message to the members of a room."""
        room_message = RoomMessage.model_validate({
            "message_id": message_id or f"room-{room_id}-{sender_id}-{len(self.history.get_all_messages()) + 1}",
            "sender_id": sender_id,
            "room_id": room_id,
            "content": content,
        })

        self.history.add_message(room_message)

        if self.room_manager is not None and not self.room_manager.room_exists(room_id):
            self.room_manager.create_room(room_id)

        if self.connection_manager is not None:
            members = self.room_manager.get_room_members(room_id) if self.room_manager else []
            for member_id in members:
                if member_id == sender_id:
                    continue

                asyncio.run(
                    self.connection_manager.send_personal_message(
                        member_id,
                        room_message.to_dict(),
                    )
                )

        self.create_ack(
            room_message.message_id,
            sender_id,
            sender_id,
            ack_type="delivered",
        )

        return room_message

    def create_ack(
        self,
        original_message_id: str,
        recipient_id: str,
        sender_id: str,
        ack_type: str = "delivered",
    ) -> MessageAck:
        """
        Create an acknowledgement payload.

        recipient_id = user who receives the acknowledgement.
        sender_id = user who originally sent the message.
        """

        return MessageAck.model_validate({
            "original_message_id": original_message_id,
            "recipient_id": recipient_id,
            "sender_id": sender_id,
            "ack_type": ack_type,
        })

    def get_history(self) -> List[ChatMessage]:
        """Return all stored messages."""
        return self.history.get_all_messages()

    def get_recent_messages(self, limit: int = 20) -> List[ChatMessage]:
        """Return the most recent messages in the in-memory store."""
        return self.history.get_recent_messages(limit=limit)

    def get_private_history(self, user_a: str, user_b: str) -> List[PrivateMessage]:
        """Return private message history for a pair of users."""
        return self.history.get_private_messages(user_a, user_b)

    def get_room_history(self, room_id: str) -> List[RoomMessage]:
        """Return message history for a room."""
        return self.history.get_room_messages(room_id)
