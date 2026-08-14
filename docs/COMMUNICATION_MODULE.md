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

# WebSocket Event Types

Sprint 3 supports a structured event-based WebSocket router. Incoming messages are routed by the `type` field.

## Supported events

- `chat_private_message`
- `chat_room_message`
- `chat_ack`
- `chat_read_ack`
- `presence_update`
- `webrtc_offer`
- `webrtc_answer`
- `webrtc_ice_candidate`
- `ping`
- `pong`
- `heartbeat`
- `heartbeat_ack`

## Example payloads

### Private chat

```json
{
  "type": "chat_private_message",
  "sender_id": "alice",
  "recipient_id": "bob",
  "content": "Hello from alice"
}
```

### Room chat

```json
{
  "type": "chat_room_message",
  "sender_id": "alice",
  "room_id": "room-1",
  "content": "Room update"
}
```

### Delivery acknowledgement

```json
{
  "type": "chat_ack",
  "original_message_id": "m-1",
  "recipient_id": "bob",
  "sender_id": "alice",
  "ack_type": "delivered"
}
```

### Read acknowledgement

```json
{
  "type": "chat_read_ack",
  "original_message_id": "m-1",
  "recipient_id": "bob",
  "sender_id": "alice",
  "ack_type": "read"
}
```

### Presence update

```json
{
  "type": "presence_update",
  "user_id": "alice",
  "status": "online"
}
```

### WebRTC offer

```json
{
  "type": "webrtc_offer",
  "sender": "alice",
  "receiver": "bob",
  "sdp": "offer-sdp"
}
```

### Ping / pong

```json
{
  "type": "ping"
}
```

Response:

```json
{
  "type": "pong"
}
```

### Heartbeat / heartbeat acknowledgement

```json
{
  "type": "heartbeat"
}
```

Response:

```json
{
  "type": "heartbeat_ack"
}
```

# Delivery acknowledgements

Delivery acknowledgements are generated when a message is accepted for delivery. If the recipient is offline, the message is queued in the recovery service until the user reconnects.

```json
{
  "type": "chat_ack",
  "original_message_id": "m-12",
  "recipient_id": "bob",
  "sender_id": "alice",
  "ack_type": "delivered"
}
```

# Read acknowledgements

# Voice Calling

The Sprint 4 call layer introduces in-memory call-session management for voice communication. A caller can initiate a call with a unique `call_id`, a target user, and a `media_type` such as `audio` or `video`.

## Call session lifecycle

The `CallManager` tracks live calls using the `CallState` enum:

- `initiated`
- `ringing`
- `accepted`
- `rejected`
- `ended`

A call is created and immediately registered in the active session list until the caller or recipient transitions it to a terminal state.

# Video Calling

Video calls share the same lifecycle as voice calls. The only difference is the `media_type` value, which is sent as `video` when the client is asking for a camera-enabled session. The router accepts the same call events and normalizes them so either audio or video traffic enters the same call-control flow.

## Call flow

1. Client emits `call_start` with `call_id`, `caller_id`, `receiver_id`, and `media_type`.
2. The router validates the message and creates a `CallSession` in the in-memory manager.
3. The receiver receives a `call_start` event and can respond with `call_accept` or `call_reject`.
4. A connected pair can send `call_end` or `media_mute` / `media_unmute` / `camera_on` / `camera_off` updates.

# Call Event Types

The event constants introduced in Sprint 4 are:

- `call_start`
- `call_accept`
- `call_reject`
- `call_end`
- `media_mute`
- `media_unmute`
- `camera_on`
- `camera_off`

These constants are defined in the chat event registry so the client and server can use a consistent message vocabulary.

# Call State Diagram

```text
initiated --> ringing --> accepted
    \--> rejected
    \--> ended

accepted --> ended
rejected --> ended
```

The call manager stores state transitions in the `CallSession` object and exposes them via `get_call()` and `get_active_calls()`.

# Demo WebSocket Payloads

## Start a call

```json
{
  "type": "call_start",
  "call_id": "call-123",
  "caller_id": "alice",
  "receiver_id": "bob",
  "media_type": "video"
}
```

## Accept a call

```json
{
  "type": "call_accept",
  "call_id": "call-123",
  "user_id": "bob"
}
```

## Reject a call

```json
{
  "type": "call_reject",
  "call_id": "call-123",
  "user_id": "bob",
  "reason": "busy"
}
```

## End a call

```json
{
  "type": "call_end",
  "call_id": "call-123",
  "user_id": "alice",
  "reason": "ended_by_user"
}
```

## Media control

```json
{
  "type": "media_mute",
  "call_id": "call-123",
  "user_id": "alice",
  "control": "mute"
}
```

This pattern also supports `media_unmute`, `camera_on`, and `camera_off`.

Read acknowledgements indicate that a client has consumed a message. These are emitted with the `chat_read_ack` event.

```json
{
  "type": "chat_read_ack",
  "original_message_id": "m-12",
  "recipient_id": "bob",
  "sender_id": "alice",
  "ack_type": "read"
}
```

# Heartbeat protocol

Clients may send a heartbeat to keep the connection alive and refresh the last-seen timestamp. The server responds with a heartbeat acknowledgement.

```json
{
  "type": "heartbeat"
}
```

Response:

```json
{
  "type": "heartbeat_ack"
}
```

# Connection recovery flow

If a target user is offline when a message arrives, the message is placed in a recovery queue. On reconnect, any queued messages are delivered automatically to the user before the socket continues processing new traffic.

```text
message sent -> recipient offline -> queue message -> reconnect -> deliver queued messages
```

# Git Branch

feature/communication