# Environment Setup

This document explains the environment configuration for each service. **All
secrets must come from environment variables (`.env` files) — never hardcode
them in source code.** The four services share a single HS256 `SECRET_KEY`
and `ALGORITHM` so JWTs are trusted across services.

---

## 1. Shared Secret

Every service reads the same `SECRET_KEY` / `ALGORITHM`. Use a long, random
value in production and keep it identical across services:

```
SECRET_KEY=change-me-to-a-long-random-secret
ALGORITHM=HS256
```

The `scripts/start-all.ps1` launcher exports `SECRET_KEY`/`ALGORITHM` from the
Backend `.env` into the environment before starting the Communication worker,
because that worker is spawned from a different directory and would otherwise
fail to load the shared JWT secret.

---

## 2. Emotion AI Service (`services/ai/emotion-ai-service/.env`)

| Variable | Purpose | Example |
|----------|---------|---------|
| `SECRET_KEY` | Shared HS256 signing key (JWT auth) | `change-me-to-a-long-random-secret` |
| `ALGORITHM` | JWT algorithm | `HS256` |
| `AI_SERVICE_PORT` | Port the AI service binds | `8001` |

Python 3.12+. Create a venv and install dependencies:

```bash
cd services/ai/emotion-ai-service
python -m venv .venv-ai
.venv-ai\Scripts\activate
pip install -r requirements.txt
```

---

## 3. Backend (`services/backend/backend/.env`)

| Variable | Purpose | Example |
|----------|---------|---------|
| `DATABASE_URL` | Postgres DSN | `postgresql://luna:luna@localhost:5432/luna` |
| `SECRET_KEY` | Shared HS256 signing key | `change-me-to-a-long-random-secret` |
| `ALGORITHM` | JWT algorithm | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | JWT lifetime | `1440` |
| `AI_PROVIDER` | Text-LLM provider (`mock` or `openai`) | `mock` |
| `OPENAI_API_KEY` | OpenAI key (only if `AI_PROVIDER=openai`) | _(empty in mock)_ |
| `OPENAI_MODEL` | OpenAI model | `gpt-4o-mini` |
| `AI_TIMEOUT` | Timeout for AI calls (s) | `30` |
| `ENVIRONMENT` | `development` / `production` | `development` |
| `DEBUG` | Enable debug logging | `true` |
| `CORS_ORIGINS` | Comma-separated allowed origins | `http://localhost:3000,http://127.0.0.1:3000` |
| `AI_SERVICE_URL` | Emotion AI base URL | `http://localhost:8001` |
| `COMMUNICATION_SERVICE_URL` | Communication base URL | `http://localhost:8002` |

Python 3.12+. Create a venv and install dependencies:

```bash
cd services/backend/backend
python -m venv .venv-backend
.venv-backend\Scripts\activate
pip install -r requirements.txt
```

Database migrations use Alembic (`alembic upgrade head`).

---

## 4. Communication (`services/communication/communication/.env`)

| Variable | Purpose | Example |
|----------|---------|---------|
| `SECRET_KEY` | Shared HS256 signing key (WS token auth) | `change-me-to-a-long-random-secret` |
| `ALGORITHM` | JWT algorithm | `HS256` |
| `CORS_ORIGINS` | Comma-separated allowed origins | `http://localhost:3000,http://127.0.0.1:3000` |
| `COMMUNICATION_PORT` | Port the service binds | `8002` |

Python 3.12+. Create a venv and install dependencies:

```bash
cd services/communication
python -m venv .venv-comm
.venv-comm\Scripts\activate
pip install fastapi "uvicorn[standard]" redis aiortc
```

Run via the namespace package: `communication.main:app`.

---

## 5. Frontend (`frontend/.env.local` — Next.js)

| Variable | Purpose | Example |
|----------|---------|---------|
| `NEXT_PUBLIC_API_URL` | Backend base URL | `http://localhost:8000` |
| `NEXT_PUBLIC_WS_URL` | Communication WebSocket URL | `ws://localhost:8002` |

```bash
cd frontend
npm install
```

---

## 6. PostgreSQL

The Backend expects Postgres on `localhost:5432`. `scripts/start-all.ps1`
starts a Docker container named `luna-postgres` (db `luna`, user `luna`,
password `luna`). Use the matching `DATABASE_URL` in the Backend `.env`.

---

## 7. Reminders

- **Never commit a real `SECRET_KEY` or `OPENAI_API_KEY`.** Use `.env.example`
  with placeholders and keep real values local only.
- Keep `SECRET_KEY`/`ALGORITHM` identical across all three Python services.
- `.env` files are git-ignored; only `.env.example` is committed.
