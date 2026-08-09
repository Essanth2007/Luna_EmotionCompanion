# Luna Emotion Companion

# Communication Module

## Overview

The Communication Module provides secure, scalable, and real-time communication services for the Luna Emotion Companion platform.

It enables persistent client-server communication using WebSockets and provides the signaling layer required for future WebRTC voice and video communication.

---

# Responsibilities

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

---

# Folder Structure

```
communication/
│
├── websocket/
│   ├── connection_manager.py
│   └── websocket_router.py
│
├── webrtc/
│
├── notifications/
│
├── manager/
│
└── utils/
```

---

# Technologies

- Python
- FastAPI
- WebSocket
- WebRTC
- JSON
- Redis (Future Integration)
- Docker

---

# Current Features

- WebSocket Connection Manager
- Active Connection Tracking
- Client Registration
- Graceful Disconnect
- Personal Messaging
- Broadcast Messaging

---

# Planned Features

- Room Management
- WebRTC Signaling
- Online Presence
- Notification Service
- Session Management
- Heartbeat (Ping/Pong)
- Connection Recovery
- Authentication
- Rate Limiting
- Redis Pub/Sub Integration

---

# Engineering Principles

- Modular Design
- SOLID Principles
- Scalable Architecture
- Low Latency
- Clean Code
- Production-Ready Implementation

---

# WebSocket Authentication

The WebSocket endpoint accepts a token query parameter for Sprint 3 authentication.

## Token query parameter

Clients connect with a URL in the form:

```text
ws://localhost:8000/ws/alice?token=token-alice
```

The `token` value is validated by the `AuthService` before the connection is accepted.

## Successful connection flow

1. Client opens a WebSocket connection with a valid `token` query parameter.
2. The router validates the token.
3. The user is resolved from the token store.
4. The user is registered in the `ConnectionManager` authentication state.
5. The connection continues with the normal WebSocket signaling flow.

## Failed authentication flow

1. Client opens a WebSocket connection with an invalid or missing token.
2. The router accepts the socket, sends `{ "type": "error", "message": "Authentication failed" }`, and closes it with code `1008`.
3. No authenticated session is created and the connection is rejected.

# Git Branch

feature/communication