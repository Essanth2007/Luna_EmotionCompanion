"""WebSocket event type constants for chat, signaling, and call flows."""

CHAT_PRIVATE_MESSAGE = "chat_private_message"
CHAT_ROOM_MESSAGE = "chat_room_message"
CHAT_ACK = "chat_ack"
CHAT_READ_ACK = "chat_read_ack"
PRESENCE_UPDATE = "presence_update"
WEBRTC_OFFER = "webrtc_offer"
WEBRTC_ANSWER = "webrtc_answer"
WEBRTC_ICE_CANDIDATE = "webrtc_ice_candidate"
CALL_START = "call_start"
CALL_ACCEPT = "call_accept"
CALL_REJECT = "call_reject"
CALL_END = "call_end"
MEDIA_MUTE = "media_mute"
MEDIA_UNMUTE = "media_unmute"
CAMERA_ON = "camera_on"
CAMERA_OFF = "camera_off"
PING = "ping"
PONG = "pong"
HEARTBEAT = "heartbeat"
HEARTBEAT_ACK = "heartbeat_ack"
LIVE_EMOTION_UPDATE = "live_emotion_update"

__all__ = [
    "CHAT_PRIVATE_MESSAGE",
    "CHAT_ROOM_MESSAGE",
    "CHAT_ACK",
    "CHAT_READ_ACK",
    "PRESENCE_UPDATE",
    "WEBRTC_OFFER",
    "WEBRTC_ANSWER",
    "WEBRTC_ICE_CANDIDATE",
    "CALL_START",
    "CALL_ACCEPT",
    "CALL_REJECT",
    "CALL_END",
    "MEDIA_MUTE",
    "MEDIA_UNMUTE",
    "CAMERA_ON",
    "CAMERA_OFF",
    "PING",
    "PONG",
    "HEARTBEAT",
    "HEARTBEAT_ACK",
    "LIVE_EMOTION_UPDATE",
]
