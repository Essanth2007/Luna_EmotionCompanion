from __future__ import annotations

from typing import Any, Literal, Optional

from pydantic import BaseModel, Field


class OfferMessage(BaseModel):
    type: str = "offer"
    room_id: str
    sender: str
    receiver: str
    sdp: Any


class AnswerMessage(BaseModel):
    type: str = "answer"
    room_id: str
    sender: str
    receiver: str
    sdp: Any


class IceCandidateMessage(BaseModel):
    type: str = "ice_candidate"
    room_id: str
    sender: str
    receiver: str
    candidate: Any


class CallRequestMessage(BaseModel):
    """Payload sent when a user initiates a voice or video call."""

    type: Literal["call_start"] = "call_start"
    call_id: str = Field(..., min_length=1)
    caller_id: str = Field(..., min_length=1)
    receiver_id: str = Field(..., min_length=1)
    media_type: str = Field(default="audio")
    room_id: Optional[str] = None


class CallResponseMessage(BaseModel):
    """Payload sent when a call is accepted or rejected."""

    type: Literal["call_accept", "call_reject"]
    call_id: str = Field(..., min_length=1)
    user_id: str = Field(..., min_length=1)
    reason: Optional[str] = None


class CallEndMessage(BaseModel):
    """Payload used to end an active call."""

    type: Literal["call_end"] = "call_end"
    call_id: str = Field(..., min_length=1)
    user_id: str = Field(..., min_length=1)
    reason: Optional[str] = None


class MediaControlMessage(BaseModel):
    """Controls for muting or toggling the camera during a call."""

    type: Literal["media_mute", "media_unmute", "camera_on", "camera_off"]
    call_id: str = Field(..., min_length=1)
    user_id: str = Field(..., min_length=1)
    control: str = Field(..., min_length=1)


class JoinRoomMessage(BaseModel):
    room_id: str
    user_id: str


class LeaveRoomMessage(BaseModel):
    room_id: str
    user_id: str


class NotificationMessage(BaseModel):
    type: str = "notification"
    title: str
    message: str
    user_id: Optional[str] = None