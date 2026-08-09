import logging
from typing import Optional

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from communication.chat.auth_service import AuthService
from communication.websocket.connection_manager import ConnectionManager
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

    await manager.connect(user_id, websocket)

    logger.info(f"{user_id} connected")

    try:
        while True:

            message = await websocket.receive_json()

            logger.info(f"Received from {user_id}: {message}")

            if not signaling.validate_message(message):

                await manager.send_personal_message(
                    user_id,
                    {
                        "type": "error",
                        "message": "Invalid signaling message.",
                    },
                )

                continue

            message_type = message["type"]

            if message_type == "offer":

                await manager.broadcast_except(user_id, message)

            elif message_type == "answer":

                await manager.broadcast_except(user_id, message)

            elif message_type == "ice_candidate":

                await manager.broadcast_except(user_id, message)

            else:

                await manager.broadcast(
                    {
                        "type": "broadcast",
                        "sender": user_id,
                        "data": message,
                    }
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