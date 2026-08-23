# Communication Module

> Reused from `services/communication/communication/docs/COMMUNICATION_MODULE.md`.

## Overview

The Communication Module provides secure, scalable, and real-time communication
services for the Luna Emotion Companion platform. It enables persistent
client-server communication using WebSockets and provides the signaling layer
required for WebRTC voice and video communication.

## Responsibilities

- WebSocket Server
- Connection Management
- Client Registration
- Broadcast Messaging
- Private Messaging
- User Presence Tracking
- Notification Delivery
- WebRTC Signaling
- Session Management
- Connection Recovery

## Folder Structure

```
communication/
│
├── websocket/
│   ├── connection_manager.py
│   └── websocket_router.py
│
├── webrtc/
├── notifications/
├── manager/
└── utils/
```

## Technologies

- Python
- FastAPI
- WebSocket
- WebRTC
- JSON
- Redis (Future Integration)
- Docker

## Current Features

- WebSocket Connection Manager
- Active Connection Tracking
- Client Registration
- Graceful Disconnect
- Personal Messaging
- Broadcast Messaging

## WebSocket Authentication

The WebSocket endpoint accepts a token query parameter for authentication.

```
ws://localhost:8002/ws/{user_id}?token=<jwt>
```

1. Client opens a connection with a valid `token` query parameter.
2. The router validates the token via the AuthService.
3. The user is resolved and registered in the ConnectionManager.
4. On an invalid/missing token the socket receives
   `{ "type": "error", "message": "Authentication failed" }` and is closed with
   code `1008`.

## WebSocket Event Types

Supported events (routed by the `type` field):

- `chat_private_message`
- `chat_room_message`
- `chat_ack`
- `chat_read_ack`
- `presence_update`
- `webrtc_offer`
- `webrtc_answer`
- `webrtc_ice_candidate`
- `ping` / `pong`
- `heartbeat` / `heartbeat_ack`
- `call_start`, `call_accept`, `call_reject`, `call_end`
- `media_mute`, `media_unmute`, `camera_on`, `camera_off`

## Voice & Video Calling

The call layer introduces in-memory call-session management. A caller initiates
a call with a unique `call_id`, a target user, and a `media_type` of `audio` or
`video`. Call state transitions: `initiated → ringing → accepted`, with terminal
states `rejected` and `ended`.

## Connection Recovery

If a target user is offline when a message arrives, the message is queued. On
reconnect, queued messages are delivered automatically before new traffic is
processed.

## Engineering Principles

- Modular Design
- SOLID Principles
- Scalable Architecture
- Low Latency
- Clean Code
- Production-Ready Implementation
