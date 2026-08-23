"""Luna Communication Service entry point.

Runs the WebSocket server plus a small REST surface used by the rest of
the Luna platform. The WebSocket router lives in
``communication.websocket.websocket_router`` and already implements
authentication, presence, chat routing, WebRTC signalling and call
lifecycle management.

This module wires that router into a FastAPI application and adds:

* ``GET  /``                 service banner
* ``GET  /health``           liveness probe
* ``GET  /token/{user_id}``  issue a demo token (test/demo convenience)
* ``GET  /presence``         list connected users
* ``GET  /status``           full module status
* ``POST /internal/emotion`` push a live-emotion update onto the bus so
                             connected clients receive it in real time
"""
from __future__ import annotations

import logging
import os

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware

from communication.chat.auth_service import AuthService
from communication.chat.events import LIVE_EMOTION_UPDATE
from communication.websocket.connection_manager import ConnectionManager
from communication.websocket.websocket_router import manager, router

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("luna.communication")

auth_service = AuthService()

app = FastAPI(
    title="Luna Communication Service",
    version="1.0.0",
    description=(
        "Real-time communication for Luna: WebSocket presence, chat, "
        "WebRTC signalling, call lifecycle, and live-emotion broadcasting."
    ),
)

allowed_origins = [
    o.strip()
    for o in os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
    if o.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.get("/")
def root():
    return {"message": "Luna Communication Service", "live": True}


@app.get("/health")
def health():
    return {"status": "healthy"}


@app.get("/token/{user_id}")
def issue_token(user_id: str):
    """Issue a demo token for quick manual testing."""
    return {"token": auth_service.issue_demo_token(user_id)}


@app.get("/presence")
def presence():
    return {"connected_users": manager.get_connected_users()}


@app.get("/status")
def status():
    return {
        "connected_users": manager.get_connected_users(),
        "connection_count": manager.get_connection_count(),
    }


@app.post("/internal/emotion")
async def push_emotion(request: Request):
    """Push a live-emotion update to connected clients in real time.

    Body (JSON):
        {
          "user_id": "<id>",
          "session_id": "<id>",
          "primary_emotion": "happy",
          "confidence": 0.91,
          "emotion_distribution": {...},
          "spike": false
        }

    The payload is forwarded to the targeted user (and broadcast when no
    specific user is given) as a ``live_emotion_update`` event.
    """
    try:
        payload = await request.json()
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=400, detail="Invalid JSON body") from exc

    user_id = payload.get("user_id")
    message = {
        "type": LIVE_EMOTION_UPDATE,
        "session_id": payload.get("session_id"),
        "primary_emotion": payload.get("primary_emotion"),
        "confidence": payload.get("confidence"),
        "emotion_distribution": payload.get("emotion_distribution"),
        "spike": payload.get("spike", False),
        "spike_reason": payload.get("spike_reason"),
        "timestamp": payload.get("timestamp"),
    }

    if user_id and manager.is_connected(user_id):
        await manager.send_personal_message(user_id, message)
        return {"delivered": True, "target": user_id}

    await manager.broadcast(message)
    return {"delivered": True, "target": "broadcast"}
