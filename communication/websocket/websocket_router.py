import logging
from typing import Any, Dict, Optional

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from communication.chat.auth_service import AuthService
from communication.chat.events import (
    CHAT_ACK,
    CHAT_PRIVATE_MESSAGE,
    CHAT_READ_ACK,
    CHAT_ROOM_MESSAGE,
    HEARTBEAT,
    HEARTBEAT_ACK,
    PING,
    PONG,
    PRESENCE_UPDATE,
    WEBRTC_ANSWER,
    WEBRTC_ICE_CANDIDATE,
    WEBRTC_OFFER,
)
from communication.chat.message_service import MessageService
from communication.websocket.connection_manager import ConnectionManager
from communication.manager.presence_manager import PresenceManager
from communication.webrtc.room_manager import RoomManager
from communication.webrtc.signaling import SignalingManager

# Logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Router
router = APIRouter()

# Managers
manager = ConnectionManager()
signaling = SignalingManager()
auth_service = AuthService()
presence_manager = PresenceManager()
room_manager = RoomManager()
message_service = MessageService(
    connection_manager=manager,
    presence_manager=presence_manager,
    room_manager=room_manager,
)


def handle_private_message(message: Dict[str, Any]) -> Dict[str, Any]:
    """Handle a direct chat message event."""
    return {
        "type": CHAT_PRIVATE_MESSAGE,
        "sender_id": message.get("sender_id"),
        "recipient_id": message.get("recipient_id"),
        "content": message.get("content"),
    }


def handle_room_message(message: Dict[str, Any]) -> Dict[str, Any]:
    """Handle a room chat message event."""
    return {
        "type": CHAT_ROOM_MESSAGE,
        "sender_id": message.get("sender_id"),
        "room_id": message.get("room_id"),
        "content": message.get("content"),
    }


def handle_chat_ack(message: Dict[str, Any]) -> Dict[str, Any]:
    """Handle an acknowledgement event."""
    return {
        "type": CHAT_ACK,
        "original_message_id": message.get("original_message_id"),
        "recipient_id": message.get("recipient_id"),
        "sender_id": message.get("sender_id"),
        "ack_type": message.get("ack_type", "delivered"),
    }


def handle_presence_update(message: Dict[str, Any]) -> Dict[str, Any]:
    """Handle a presence event."""
    return {
        "type": PRESENCE_UPDATE,
        "user_id": message.get("user_id"),
        "status": message.get("status"),
    }


def handle_webrtc_offer(message: Dict[str, Any]) -> Dict[str, Any]:
    """Handle a WebRTC offer event."""
    return {
        "type": WEBRTC_OFFER,
        "sender": message.get("sender"),
        "receiver": message.get("receiver"),
        "sdp": message.get("sdp"),
    }


def handle_webrtc_answer(message: Dict[str, Any]) -> Dict[str, Any]:
    """Handle a WebRTC answer event."""
    return {
        "type": WEBRTC_ANSWER,
        "sender": message.get("sender"),
        "receiver": message.get("receiver"),
        "sdp": message.get("sdp"),
    }


def handle_webrtc_ice_candidate(message: Dict[str, Any]) -> Dict[str, Any]:
    """Handle a WebRTC ICE candidate event."""
    return {
        "type": WEBRTC_ICE_CANDIDATE,
        "sender": message.get("sender"),
        "receiver": message.get("receiver"),
        "candidate": message.get("candidate"),
    }


def handle_ping(message: Dict[str, Any]) -> Dict[str, Any]:
    """Handle a ping event and respond with a pong."""
    return {"type": PONG}


def handle_heartbeat(message: Dict[str, Any]) -> Dict[str, Any]:
    """Handle a heartbeat event and acknowledge it."""
    return {"type": HEARTBEAT_ACK}


def handle_read_ack(message: Dict[str, Any]) -> Dict[str, Any]:
    """Handle a read acknowledgement event."""
    return {
        "type": CHAT_READ_ACK,
        "original_message_id": message.get("original_message_id"),
        "recipient_id": message.get("recipient_id"),
        "sender_id": message.get("sender_id"),
        "ack_type": "read",
    }


def handle_unsupported_event(message: Dict[str, Any]) -> Dict[str, Any]:
    """Return the standard unsupported-event response."""
    return {
        "type": "error",
        "message": "Unsupported event type",
    }


@router.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    """
    Main WebSocket endpoint.

    Supports:
    - Client registration
    - Broadcast messages
    - WebRTC Offer
    - WebRTC Answer
    - ICE Candidate exchange
    - Graceful disconnect
    """
    token = websocket.query_params.get("token")

    if token is None or not auth_service.validate_token(token):
        await websocket.accept()
        await websocket.send_json({
            "type": "error",
            "message": "Authentication failed",
        })
        await websocket.close(code=1008)
        logger.warning(f"Rejected unauthenticated websocket connection for {user_id}")
        return

    resolved_user_id = auth_service.get_user_from_token(token)
    if resolved_user_id is not None:
        manager.register_authenticated_user(resolved_user_id, token)
        user_id = resolved_user_id

    await websocket.accept()
    manager.connect(user_id, websocket)
    message_service.deliver_pending_messages(user_id)

    logger.info(f"{user_id} connected")

    try:
        while True:

            message = await websocket.receive_json()

            logger.info(f"Received from {user_id}: {message}")

            message_type = message.get("type")

            match message_type:
                case "ping":
                    await manager.send_personal_message(user_id, handle_ping(message))
                    continue

                case "heartbeat":
                    manager.update_heartbeat(user_id)
                    await manager.send_personal_message(user_id, handle_heartbeat(message))
                    continue

                case "chat_private_message":
                    payload = handle_private_message(message)
                    message_service.send_private_message(
                        payload["sender_id"],
                        payload["recipient_id"],
                        payload["content"],
                    )
                    await manager.send_personal_message(user_id, payload)
                    continue

                case "chat_room_message":
                    payload = handle_room_message(message)
                    message_service.send_room_message(
                        payload["sender_id"],
                        payload["room_id"],
                        payload["content"],
                    )
                    await manager.send_personal_message(user_id, payload)
                    continue

                case "chat_ack":
                    payload = handle_chat_ack(message)
                    await manager.send_personal_message(user_id, payload)
                    continue

                case "chat_read_ack":
                    payload = handle_read_ack(message)
                    await manager.send_personal_message(user_id, payload)
                    continue

                case "presence_update":
                    payload = handle_presence_update(message)
                    if payload.get("status") == "online":
                        presence_manager.user_connected(payload["user_id"])
                    else:
                        presence_manager.user_disconnected(payload["user_id"])
                    await manager.send_personal_message(user_id, payload)
                    continue

                case "webrtc_offer":
                    payload = handle_webrtc_offer(message)
                    await manager.broadcast_except(user_id, payload)
                    continue

                case "webrtc_answer":
                    payload = handle_webrtc_answer(message)
                    await manager.broadcast_except(user_id, payload)
                    continue

                case "webrtc_ice_candidate":
                    payload = handle_webrtc_ice_candidate(message)
                    await manager.broadcast_except(user_id, payload)
                    continue

                case _:
                    await manager.send_personal_message(
                        user_id,
                        handle_unsupported_event(message),
                    )

    except WebSocketDisconnect:

        manager.disconnect(user_id)

        logger.info(f"{user_id} disconnected")

        await manager.broadcast(
            {
                "type": "status",
                "user_id": user_id,
                "status": "offline",
            }
        )

    except Exception as e:

        logger.exception(f"Unexpected error: {e}")

        manager.disconnect(user_id)