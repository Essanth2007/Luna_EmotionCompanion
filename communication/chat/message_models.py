from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Dict, Optional

from pydantic import BaseModel, Field, field_validator, model_validator


class ChatMessage(BaseModel):
    """Base message model shared by private and room chat messages.

    The current Sprint 2 foundation is connection- and signaling-oriented.
    This model defines the shared structure for chat payloads used by the next
    sprint layer while keeping all storage in memory.
    """

    message_id: str = Field(..., description="Unique chat message identifier.")
    sender_id: str = Field(..., description="The user sending the message.")
    content: str = Field(..., min_length=1, description="Message body content.")
    timestamp: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="Message creation time in UTC.",
    )

    @field_validator("message_id", "sender_id")
    @classmethod
    def validate_non_empty(cls, value: str) -> str:
        """Ensure important identifiers are not blank strings."""
        if not value or not value.strip():
            raise ValueError("Value must not be empty.")
        return value

    @field_validator("content")
    @classmethod
    def validate_content(cls, value: str) -> str:
        """Strip spaces but keep content meaningful."""
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("Message content must not be empty.")
        return cleaned

    @classmethod
    def validate_message(cls, payload: Dict[str, Any]) -> "ChatMessage":
        """Validate and return a ChatMessage instance from a dictionary."""
        try:
            return cls.model_validate(payload)
        except Exception as exc:  # pragma: no cover - pydantic handles validation
            raise ValueError(f"Invalid chat message payload: {exc}") from exc

    def to_dict(self) -> Dict[str, Any]:
        """Return a serialized version of the message."""
        return self.model_dump(mode="python")


class PrivateMessage(ChatMessage):
    """Message intended for exactly one recipient."""

    recipient_id: str = Field(..., description="The destination user for the message.")

    @field_validator("recipient_id")
    @classmethod
    def validate_recipient(cls, value: str) -> str:
        """Ensure a recipient is specified."""
        if not value or not value.strip():
            raise ValueError("recipient_id must not be empty.")
        return value

    def to_dict(self) -> Dict[str, Any]:
        """Return a dictionary representation for direct messaging."""
        payload = super().to_dict()
        payload["type"] = "private_message"
        return payload


class RoomMessage(ChatMessage):
    """Message broadcast to all members of a room."""

    room_id: str = Field(..., description="The room receiving the message.")

    @field_validator("room_id")
    @classmethod
    def validate_room(cls, value: str) -> str:
        """Ensure the room identifier is not empty."""
        if not value or not value.strip():
            raise ValueError("room_id must not be empty.")
        return value

    def to_dict(self) -> Dict[str, Any]:
        """Return a dictionary representation for room messaging."""
        payload = super().to_dict()
        payload["type"] = "room_message"
        return payload


class MessageAck(BaseModel):
    """
    Acknowledgement payload sent back to clients.
    """

    original_message_id: str = Field(..., min_length=1)
    recipient_id: str = Field(..., min_length=1)
    sender_id: str = Field(..., min_length=1)
    ack_type: str = Field(default="delivered", min_length=1)
    timestamp: datetime = Field(default_factory=datetime.utcnow)

    def to_dict(self) -> dict:
        return self.model_dump(mode="json")
