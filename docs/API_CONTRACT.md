# Luna Emotion Companion — API Contract

**Version:** 1.0.0

This document consolidates the REST endpoints, WebSocket events, and WebRTC
signaling events across the Backend, Emotion AI, and Communication services.
All messages use **JSON**.

---

## 1. REST Endpoints

### 1.1 Backend (`http://localhost:8000`)

Base path: `/api/v1`. All routes except login/register require a Bearer JWT.

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/v1/auth/login` | Authenticate and receive a JWT access token |
| POST | `/api/v1/auth/register` | Register a new user |
| GET  | `/api/v1/auth/me` | Return the current authenticated user |
| GET  | `/api/v1/users/me` | Current user profile |
| DELETE | `/api/v1/users/{id}` | Delete a user |
| POST | `/api/v1/emotions` | Create an emotion record |
| GET  | `/api/v1/emotions` | List emotion records |
| GET  | `/api/v1/emotions/{id}` | Get an emotion record |
| DELETE | `/api/v1/emotions/{id}` | Delete an emotion record |
| POST | `/api/v1/ai` | AI-assisted analysis |
| POST | `/api/v1/analysis/voice` | Analyze a voice sample |
| POST | `/api/v1/analysis/video` | Analyze a video sample |
| POST | `/api/v1/analysis/live` | Start / feed a live emotion session |
| GET  | `/api/v1/analysis/live/{session_id}` | Get a live session result |
| DELETE | `/api/v1/analysis/live/{session_id}` | End a live session |
| POST | `/api/v1/conversations` | Create a conversation |
| GET  | `/api/v1/conversations` | List conversations |
| GET  | `/api/v1/conversations/{id}` | Get a conversation |
| DELETE | `/api/v1/conversations/{id}` | Delete a conversation |
| POST | `/api/v1/conversations/{id}/messages` | Append a message |
| GET  | `/api/v1/insights` | Mood insights (list) |
| GET  | `/api/v1/insights/summary` | Insights summary |
| GET  | `/api/v1/insights/{id}` | Single insight |
| GET  | `/health` | Backend health check |

#### Auth example

```http
POST /api/v1/auth/login
Content-Type: application/json

{ "email": "qa@example.com", "password": "secret123" }
```

```json
{ "access_token": "<jwt>", "token_type": "bearer" }
```

---

### 1.2 Emotion AI Service (`http://localhost:8001`)

| Method | Path | Purpose |
|--------|------|---------|
| GET  | `/health` | AI service health check |
| POST | `/live/analyze` | Analyze a live frame/audio chunk (Bearer JWT) |
| GET  | `/live/{session_id}` | Get a live session result |
| DELETE | `/live/{session_id}` | End a live session |
| GET  | `/live/` | List live sessions |
| POST | `/speech/analyze` | Analyze a speech/audio upload |
| POST | `/video/analyze` | Analyze a video upload |

#### Health response

```json
{
  "service": "Emotion AI Service",
  "status": "running",
  "version": "1.0.0"
}
```

---

### 1.3 Communication Service (`http://localhost:8002`)

| Method | Path | Purpose |
|--------|------|---------|
| GET  | `/health` | Communication HTTP health check |
| POST | `/internal/emotion` | Internal: receive an emotion push from Backend and relay it to the target user's socket |

> `POST /internal/emotion` is a trusted, internal-only endpoint called by the
> Backend. It targets the user by email (JWT `sub`) so the `live_emotion_update`
> event is delivered to the correct WebSocket.

---

## 2. WebSocket Events (Communication)

Endpoint:

```
ws://localhost:8002/ws/{user_id}?token=<jwt>
```

The `token` query parameter is validated by the AuthService before the
connection is accepted. On failure the socket receives
`{ "type": "error", "message": "Authentication failed" }` and is closed with
code `1008`.

### 2.1 Messaging / presence events

| Event | Direction | Payload |
|-------|-----------|---------|
| `connect` / `disconnect` | client→server | `{}` |
| `chat_private_message` | either | `{ sender_id, recipient_id, content }` |
| `chat_room_message` | either | `{ sender_id, room_id, content }` |
| `chat_ack` | server→client | `{ original_message_id, recipient_id, sender_id, ack_type }` |
| `chat_read_ack` | either | `{ original_message_id, recipient_id, sender_id, ack_type }` |
| `presence_update` | either | `{ user_id, status }` |
| `broadcast` | either | `{ sender, data }` |
| `notification` | server→client | `{ title, message }` |
| `status` | either | `{ user_id, status }` |
| `ping` / `pong` | either | `{}` |
| `heartbeat` / `heartbeat_ack` | either | `{}` |
| `error` | server→client | `{ message }` |

Offline messages are queued in a recovery service and delivered automatically on
reconnect.

---

## 3. WebRTC Signaling Events

These events are relayed between two participants (User A and User B) over the
Communication WebSocket. Media itself is peer-to-peer.

| Event | Payload |
|-------|---------|
| `call_start` | `{ call_id, caller_id, receiver_id, media_type }` |
| `call_accept` | `{ call_id, user_id }` |
| `call_reject` | `{ call_id, user_id, reason }` |
| `call_end` | `{ call_id, user_id, reason }` |
| `media_mute` / `media_unmute` | `{ call_id, user_id, control }` |
| `camera_on` / `camera_off` | `{ call_id, user_id }` |
| `webrtc_offer` | `{ type, sender, receiver, sdp }` |
| `webrtc_answer` | `{ type, sender, receiver, sdp }` |
| `webrtc_ice_candidate` | `{ type, sender, receiver, candidate }` |

### Example: start a call

```json
{
  "type": "call_start",
  "call_id": "call-123",
  "caller_id": "alice",
  "receiver_id": "bob",
  "media_type": "video"
}
```

### Example: WebRTC offer

```json
{
  "type": "webrtc_offer",
  "sender": "alice",
  "receiver": "bob",
  "sdp": "<sdp-offer>"
}
```

Call lifecycle states: `initiated → ringing → accepted`, with terminal states
`rejected` and `ended`.
