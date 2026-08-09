"""WebSocket event type constants for Sprint 3 chat and signaling flows."""

CHAT_PRIVATE_MESSAGE = "chat_private_message"
CHAT_ROOM_MESSAGE = "chat_room_message"
CHAT_ACK = "chat_ack"
PRESENCE_UPDATE = "presence_update"
WEBRTC_OFFER = "webrtc_offer"
WEBRTC_ANSWER = "webrtc_answer"
WEBRTC_ICE_CANDIDATE = "webrtc_ice_candidate"
PING = "ping"
PONG = "pong"

__all__ = [
    "CHAT_PRIVATE_MESSAGE",
    "CHAT_ROOM_MESSAGE",
    "CHAT_ACK",
    "PRESENCE_UPDATE",
    "WEBRTC_OFFER",
    "WEBRTC_ANSWER",
    "WEBRTC_ICE_CANDIDATE",
    "PING",
    "PONG",
]
