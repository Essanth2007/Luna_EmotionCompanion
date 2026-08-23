# Integration QA Report — Luna Emotion Companion

**Role:** Integration QA Engineer
**Date:** 2026-08-23
**Scope:** Verify and fix P0 integration/runtime blockers so the live emotion-tracking + real-time
communication demo works across the 4 services:
- Emotion AI Service — `:8001` (`emotion-ai-service`)
- Backend — `:8000` (`/api/v1`)
- Communication Service — `:8002` (WS `/ws/{user_id}`, REST `/internal/emotion`)
- Frontend — `:3000` (Next.js)
- Postgres — `:5432`

**Rule followed:** No architecture/redesign/tech changes. Only P0 runtime blockers and the explicit
P2 "user mismatch" were fixed. Verification was done by starting all services and exercising the
integration paths end-to-end with live HTTP/WebSocket calls.

---

## Files Modified

1. `C:\protothon\start-all.ps1` (P0 — the only startup script)
   - Replaced hardcoded `C:\protothon` with `$Root = $PSScriptRoot` and made all 4 service paths
     relative to the script location.
   - Fixed Frontend launch: `Start-Process -FilePath 'npm'` fails (npm is `npm.ps1`/`.cmd`) →
     changed to `cmd /c npm run dev`.
   - Exported the shared integration secret so the Communication Service worker process inherits it:
     reads `SECRET_KEY` / `ALGORITHM` from `backend/.env` and exports them into `$env` for all
     spawned children. (Comm's worker `load_dotenv()` did not resolve `comm/.env` in its runtime cwd,
     leaving `SECRET_KEY` empty → it rejected the Backend's JWT, breaking the realtime bus.)

2. `C:\protothon\Luna_EmotionCompanion-feature-backend\backend\app\api\analysis.py` (P2 — user mismatch)
   - `analyze_live` now pushes `current_user.email` (the JWT subject / identity Comm keys WS
     connections by) instead of `str(current_user.id)` (numeric DB id). Without this, targeted
     delivery always missed and silently fell back to broadcast (every connected user got everyone's
     live emotion).

---

## Critical Fixes (P0)

| # | Issue | Symptom | Fix |
|---|-------|---------|-----|
| C1 | `start-all.ps1` hardcoded `C:\protothon` paths | Script unusable on any other machine / checkout | `$PSScriptRoot` relative paths |
| C2 | Frontend launched via `Start-Process 'npm'` | Frontend never started (npm is a script, not an exe) | `cmd /c npm run dev` |
| C3 | Comm worker had empty `SECRET_KEY` (env not inherited) | WS JWT auth failed (`1008`, "Authentication failed"); realtime bus dead | Export shared `SECRET_KEY`/`ALGORITHM` from `backend/.env` to child processes |

---

## Integration Status

| Check | Result | Evidence |
|-------|--------|----------|
| Start all 4 services | **PASS** | All `/health` green; Frontend serves HTML on `:3000` |
| Fix broken startup paths/config | **PASS** | `start-all.ps1` launches AI + Backend + Comm + Frontend from any directory |
| Backend ↔ AI Service | **PASS** | `POST /api/v1/analysis/voice` → AI `/speech/analyze` → emotion persisted (id 4, user 6); `POST /api/v1/analysis/live` → AI `/live/analyze` → full fused emotion returned |
| Backend ↔ Communication Service | **PASS** | Backend pushes `POST /internal/emotion` → Comm `200 OK` (`delivered:true`) |
| Frontend ↔ Backend (REST + CORS) | **PASS** | `GET /api/v1/auth/me` with `Origin: http://localhost:3000` returns `access-control-allow-origin`; login/register/me work |
| Frontend ↔ Communication (WebSocket auth) | **PASS** | WS client connects with Backend JWT, receives `pong`; `/status` shows `connected_users:["qa@example.com"]` |
| Live Emotion Flow (end-to-end) | **PASS** | WS client receives `{"type":"live_emotion_update", ...}` after `POST /api/v1/analysis/live` |
| WebRTC signaling / call lifecycle | **PASS** | Two WS clients: A→B `call_start` delivered, B→A `webrtc_offer` delivered (both directions verified) |
| Database (Postgres) | **PASS** | `docker start luna-postgres`; user register/login + emotion persistence succeed |
| AI model inference at runtime | **PASS** | wav2vec2 loads on startup; `/speech/analyze` returns a valid distribution; `/video/analyze` runs (face.jpg has no face → "No face detected", expected) |

---

## Tests Run

| Suite | Command | Result |
|-------|---------|--------|
| Backend (pytest) | `.venv-backend\Scripts\python -m pytest tests -q` | **36 passed** |
| Communication (pytest) | `.venv-comm\Scripts\python -m pytest tests -q` | **47 passed** (pytest + pytest-asyncio installed into `.venv-comm`) |
| AI | smoke scripts (`test_*.py` import-time inference) | Not auto-collected; runtime inference verified live via API |
| Frontend | `npx tsc --noEmit` | **0 errors** |
| Python syntax | `py_compile` across all 3 service modules | **pass** |

---

## Non-Critical Issues (P2 / informational)

- **User mismatch (fixed):** see Files Modified #2. Targeted `live_emotion_update` delivery now works
  (`POST /internal/emotion` with the email returns `target:"<email>"` instead of `broadcast`).
- `AI_PROVIDER=mock` only affects the text-LLM analysis path (`app/api/ai.py`); it does **not** affect
  the live emotion flow (which calls `AI_SERVICE_URL` directly). Not a blocker for the demo.
- AI test modules are import-time smoke scripts (not pytest-collectable) and require model artifacts
  at import; validated instead via live API calls.

## Deferred (not changed, per scope)

- No architecture / tech / API-contract changes were made.
- `reg2.json`, `emo.json`, `verify_ws.py`, `verify_webrtc.py`, `token.txt`, `ws_out.txt`, `*.err`/`*.out`
  are temporary QA artifacts left in `C:\protothon` for re-running; safe to delete.

---

## How to run the demo

```
cd C:\protothon
docker start luna-postgres        # if not already running
.\start-all.ps1                   # starts AI(:8001) Backend(:8000) Comm(:8002) Frontend(:3000)
```

Open `http://localhost:3000`, register/log in, go to the Live dashboard — the page POSTs
`/api/v1/analysis/live?session_id=…`, the Backend fuses emotion via the AI service, persists it, and
pushes it to the Communication Service, which delivers `live_emotion_update` to the authenticated
WebSocket (real-time).
