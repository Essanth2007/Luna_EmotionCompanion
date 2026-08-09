"""WebSocket event type constants for Sprint 3 chat and signaling flows."""

CHAT_PRIVATE_MESSAGE = "chat_private_message"
CHAT_ROOM_MESSAGE = "chat_room_message"
CHAT_ACK = "chat_ack"
CHAT_READ_ACK = "chat_read_ack"
PRESENCE_UPDATE = "presence_update"
WEBRTC_OFFER = "webrtc_offer"
WEBRTC_ANSWER = "webrtc_answer"
WEBRTC_ICE_CANDIDATE = "webrtc_ice_candidate"
PING = "ping"
PONG = "pong"
HEARTBEAT = "heartbeat"
HEARTBEAT_ACK = "heartbeat_ack"

__all__ = [
    "CHAT_PRIVATE_MESSAGE",
    "CHAT_ROOM_MESSAGE",
    "CHAT_ACK",
    "CHAT_READ_ACK",
    "PRESENCE_UPDATE",
    "WEBRTC_OFFER",
    "WEBRTC_ANSWER",
    "WEBRTC_ICE_CANDIDATE",
    "PING",
    "PONG",
    "HEARTBEAT",
    "HEARTBEAT_ACK",
]
