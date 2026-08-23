"""WebRTC call lifecycle management for voice and video sessions."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Dict, List, Optional
from uuid import uuid4


class CallState(str, Enum):
    """Lifecycle states used by active WebRTC calls."""

    INITIATED = "initiated"
    RINGING = "ringing"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    ENDED = "ended"


@dataclass
class CallSession:
    """Represents a single voice or video call session."""

    call_id: str
    caller_id: str
    receiver_id: str
    media_type: str = "audio"
    state: CallState = CallState.INITIATED
    created_at: datetime = field(
        default_factory=lambda: datetime.now(timezone.utc),
    )
    updated_at: datetime = field(
        default_factory=lambda: datetime.now(timezone.utc),
    )
    accepted_by: Optional[str] = None
    rejected_by: Optional[str] = None
    ended_by: Optional[str] = None
    rejection_reason: Optional[str] = None
    metadata: Dict[str, Any] = field(default_factory=dict)

    def mark_updated(self) -> None:
        """Touch the session for change tracking."""
        self.updated_at = datetime.now(timezone.utc)

    def to_dict(self) -> Dict[str, Any]:
        """Return the serialized call state payload."""
        return {
            "call_id": self.call_id,
            "caller_id": self.caller_id,
            "receiver_id": self.receiver_id,
            "media_type": self.media_type,
            "state": self.state.value,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
            "accepted_by": self.accepted_by,
            "rejected_by": self.rejected_by,
            "ended_by": self.ended_by,
            "rejection_reason": self.rejection_reason,
            "metadata": self.metadata,
        }


class CallManager:
    """Tracks live voice and video call sessions in memory."""

    def __init__(self) -> None:
        self._calls: Dict[str, CallSession] = {}

    def create_call(
        self,
        caller_id: str,
        receiver_id: str,
        media_type: str = "audio",
        call_id: Optional[str] = None,
    ) -> CallSession:
        """Create a new call session and register it in the manager."""
        if not caller_id or not caller_id.strip():
            raise ValueError("caller_id must not be empty.")
        if not receiver_id or not receiver_id.strip():
            raise ValueError("receiver_id must not be empty.")

        resolved_call_id = call_id or str(uuid4())
        if resolved_call_id in self._calls:
            raise ValueError(f"Call {resolved_call_id} already exists.")

        session = CallSession(
            call_id=resolved_call_id,
            caller_id=caller_id,
            receiver_id=receiver_id,
            media_type=media_type or "audio",
            state=CallState.INITIATED,
        )
        self._calls[resolved_call_id] = session
        return session

    def accept_call(self, call_id: str, user_id: str) -> CallSession:
        """Transition a call to the accepted state."""
        session = self.get_call(call_id)
        if session is None:
            raise KeyError(f"Call {call_id} does not exist.")
        if user_id not in {session.caller_id, session.receiver_id}:
            raise ValueError("user_id must be either the caller or the receiver.")

        session.state = CallState.ACCEPTED
        session.accepted_by = user_id
        session.mark_updated()
        return session

    def reject_call(
        self,
        call_id: str,
        user_id: str,
        reason: Optional[str] = None,
    ) -> CallSession:
        """Reject an outstanding call with an optional reason."""
        session = self.get_call(call_id)
        if session is None:
            raise KeyError(f"Call {call_id} does not exist.")
        if user_id not in {session.caller_id, session.receiver_id}:
            raise ValueError("user_id must be either the caller or the receiver.")

        session.state = CallState.REJECTED
        session.rejected_by = user_id
        session.rejection_reason = reason
        session.mark_updated()
        return session

    def end_call(self, call_id: str, user_id: str) -> CallSession:
        """End a live or ringing call session."""
        session = self.get_call(call_id)
        if session is None:
            raise KeyError(f"Call {call_id} does not exist.")
        if user_id not in {session.caller_id, session.receiver_id}:
            raise ValueError("user_id must be either the caller or the receiver.")

        session.state = CallState.ENDED
        session.ended_by = user_id
        session.mark_updated()
        return session

    def get_call(self, call_id: str) -> Optional[CallSession]:
        """Return a call by identifier or None if it does not exist."""
        return self._calls.get(call_id)

    def get_active_calls(self) -> List[CallSession]:
        """Return all non-ended, non-rejected calls in the manager."""
        return [
            session
            for session in self._calls.values()
            if session.state not in {CallState.ENDED, CallState.REJECTED}
        ]

    def remove_call(self, call_id: str) -> None:
        """Remove a call from the manager."""
        self._calls.pop(call_id, None)
