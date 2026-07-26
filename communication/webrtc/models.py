from pydantic import BaseModel
from typing import Any, Optional


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