# Deployment

This document covers deploying Luna Emotion Companion with Docker Compose,
environment configuration, service ports, and scaling.

---

## 1. Components & Ports

| Service | Image / Process | Port | Notes |
|---------|----------------|------|-------|
| Frontend | Next.js | 3000 | `npm run dev` or `next build && next start` |
| Backend | FastAPI (uvicorn) | 8000 | `app.main:app` |
| Emotion AI | FastAPI (uvicorn) | 8001 | `main:app` |
| Communication | FastAPI (uvicorn) | 8002 | `communication.main:app` |
| PostgreSQL | postgres:16-alpine | 5432 | db `luna`, user `luna` |

---

## 2. Environment Variables

All services are configured via `.env` files (see `docs/ENVIRONMENT_SETUP.md`).
The **most important** requirement is that `SECRET_KEY` and `ALGORITHM` are
**identical** across Backend, AI, and Communication so JWTs are trusted
cross-service. Never hardcode a real secret — supply it through the
environment.

### Backend (minimum)

```
DATABASE_URL=postgresql://luna:luna@postgres:5432/luna
SECRET_KEY=change-me-to-a-long-random-secret
ALGORITHM=HS256
AI_SERVICE_URL=http://ai:8001
COMMUNICATION_SERVICE_URL=http://communication:8002
CORS_ORIGINS=http://localhost:3000
```

### AI

```
SECRET_KEY=change-me-to-a-long-random-secret
ALGORITHM=HS256
AI_SERVICE_PORT=8001
```

### Communication

```
SECRET_KEY=change-me-to-a-long-random-secret
ALGORITHM=HS256
COMMUNICATION_PORT=8002
CORS_ORIGINS=http://localhost:3000
```

---

## 3. Docker Compose

A `docker-compose.yml` at the repo root (and/or the per-service compose files
already present under `services/*`) can orchestrate all containers. The local
development launcher (`scripts/start-all.ps1`) instead starts Postgres via
Docker and the three Python services + Frontend as native processes, exporting
`SECRET_KEY`/`ALGORITHM` into the environment for the Communication worker.

Example root `docker-compose.yml` shape:

```yaml
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: luna
      POSTGRES_USER: luna
      POSTGRES_PASSWORD: luna
    ports: ["5432:5432"]
    volumes: ["luna_pgdata:/var/lib/postgresql/data"]

  backend:
    build: ./services/backend/backend
    environment:
      DATABASE_URL: postgresql://luna:luna@postgres:5432/luna
      SECRET_KEY: ${SECRET_KEY}
      ALGORITHM: HS256
      AI_SERVICE_URL: http://ai:8001
      COMMUNICATION_SERVICE_URL: http://communication:8002
    ports: ["8000:8000"]
    depends_on: [postgres, ai, communication]

  ai:
    build: ./services/ai/emotion-ai-service
    environment:
      SECRET_KEY: ${SECRET_KEY}
      ALGORITHM: HS256
    ports: ["8001:8001"]

  communication:
    build: ./services/communication
    environment:
      SECRET_KEY: ${SECRET_KEY}
      ALGORITHM: HS256
    ports: ["8002:8002"]

  frontend:
    build: ./frontend
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:8000
      NEXT_PUBLIC_WS_URL: ws://localhost:8002
    ports: ["3000:3000"]

volumes:
  luna_pgdata:
```

Run with:

```bash
docker compose up --build
```

---

## 4. Database Migrations

The Backend uses Alembic. On a fresh database run:

```bash
cd services/backend/backend
alembic upgrade head
```

---

## 5. Scaling

- **AI / Backend / Communication** are stateless and can be scaled horizontally
  behind a load balancer. The Communication WebSocket layer is currently
  in-memory; for multi-replica WebSocket fan-out, add **Redis Pub/Sub**
  (planned) so events reach sockets on any replica.
- **PostgreSQL** should be a managed/standalone instance (not bundled per
  replica).
- The live emotion pipeline and WebRTC signaling add per-connection state; keep
  sticky sessions or adopt Redis-backed connection tracking before scaling the
  Communication service beyond one replica.
