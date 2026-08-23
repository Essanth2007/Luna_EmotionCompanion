# Runbook — Luna Emotion Companion

Onboarding / operations guide for running the full integrated stack (AI +
Backend + Communication + Frontend + Postgres) and demoing the live
emotion-tracking and WebRTC call features.

## 1. What this is

A multi-module emotion companion app:

| Module | Path | Stack | Port |
|--------|------|-------|------|
| Emotion AI | `services/ai/emotion-ai-service` | FastAPI (Python 3.12) | 8001 |
| Backend | `services/backend/backend` | FastAPI + Postgres (SQLAlchemy/Alembic) | 8000 |
| Communication | `services/communication` | FastAPI + WebSockets + WebRTC signaling | 8002 |
| Frontend | `frontend` | Next.js (React) | 3000 |
| Postgres | Docker (`luna-postgres`) | PostgreSQL 16 | 5432 |

Live flow: Frontend → `POST /api/v1/analysis/live` (Backend) →
`/live/analyze` (AI) → Backend persists + pushes `POST /internal/emotion` to
Communication → WS `live_emotion_update` → Frontend UI.

## 2. Prerequisites

- **Windows** with PowerShell 5.1+.
- **Python 3.12** on the system PATH (each service spawns a venv python worker).
- **Node.js 18+** and npm (for the Frontend).
- **Docker** for PostgreSQL (`luna-postgres` container).
- The four module `.env` files must share the **same** `SECRET_KEY` /
  `ALGORITHM` (HS256). The launcher exports them from `backend/.env` into the
  environment for the Communication worker.

## 3. Start everything

From the repo root:

```powershell
cd C:\Luna_EmotionCompanion
.\scripts\start-all.ps1
```

This launches detached processes and logs to `*.log` files:

1. `Postgres` via Docker (`luna-postgres`, db `luna`/user `luna`/pw `luna`).
2. `AI :8001` — emotion-ai-service (venv `.venv-ai`, module `main:app`).
3. `Backend :8000` — backend (venv `.venv-backend`, module `app.main:app`).
4. `Comm :8002` — communication (venv `.venv-comm`, module
   `communication.main:app` from `services/communication`).
5. `Frontend :3000` — `npm run dev`.

> The launcher exports `SECRET_KEY`/`ALGORITHM` from `backend/.env` into the
> environment before starting Communication, because the Communication worker
> is spawned from a different working directory and would otherwise fail to load
> the shared JWT secret.

To stop:

```powershell
.\scripts\stop-all.ps1
```

This kills the uvicorn workers and the Next.js dev server. PostgreSQL is left
running to preserve data.

## 4. Health checks

```powershell
.\scripts\health-check.ps1
```

It verifies each endpoint:

- Backend:    `http://localhost:8000/health`
- AI:         `http://localhost:8001/health`
- Communication: `http://localhost:8002/health` (HTTP) — WS at `ws://localhost:8002/ws`
- Frontend:   `http://localhost:3000/`

## 5. Auth / demo users

Login via the Frontend or `POST /api/v1/auth/login` (Backend). Seeded users:

| Email | Password |
|-------|----------|
| `qa@example.com` | `secret123` |
| `e2e@example.com` | `secret123` |
| `e2e2@example.com` | `secret123` |

## 6. Run the demos

### 6.1 Live emotion tracking

1. Open `http://localhost:3000`, log in.
2. Go to **Dashboard → Live**.
3. Allow camera/mic, then click **Start Analysis**.
4. Real-time emotion (`current`) and **spikes** update live via the
   `live_emotion_update` WebSocket event; the AI service analyzes frames/audio
   and the Backend persists results.

### 6.2 WebRTC call (two-party)

1. Open two browsers (or one normal + one incognito). Log in as
   `e2e@example.com` in one and `e2e2@example.com` in the other.
2. In **Calls**, User A initiates a call to User B.
3. Signaling flows over the Communication WebSocket: `call_start` (A→B) →
   `webrtc_offer` (B→A) → `webrtc_answer` (A→B) → `webrtc_ice_candidate` (both
   ways). Media connects peer-to-peer.

## 7. Architecture notes

- Each Python service runs as a uvicorn worker that binds the port. Stop it with
  `scripts/stop-all.ps1` (which frees the ports) rather than killing a single
  process.
- `AI_PROVIDER=mock` (in the AI/Backend `.env`) only affects the text-LLM path;
  the **live emotion pipeline is real** and does not depend on it.
- Modules communicate over HTTP (Backend↔AI, Backend↔Communication) using the
  shared HS256 JWT for the `Authorization: Bearer` / internal calls.
- The Backend targets `current_user.email` (the JWT `sub` / WebSocket identity)
  when pushing `live_emotion_update` to Communication, so the event reaches the
  correct socket instead of a broadcast fallback.
