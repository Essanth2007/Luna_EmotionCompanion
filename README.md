# Luna Emotion Companion — Backend

FastAPI backend for Luna, an AI-powered emotion companion. Python 3.13, SQLAlchemy 2.0, Alembic, PostgreSQL 16.

---

## Quick start

### Prerequisites

- Python 3.13
- PostgreSQL 16 (or Docker Desktop with Compose v2)

### Local setup

```powershell
# Clone and enter the backend directory
cd backend

# Create and activate a virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Copy and configure the environment file
Copy-Item .env.example .env
# Edit .env — set DATABASE_URL, SECRET_KEY, CORS_ORIGINS at minimum
```

### Run with Docker Compose (recommended)

```powershell
Copy-Item backend\.env.example backend\.env
# Edit backend\.env — set the required variables (see Environment variables section)
docker compose -f backend/docker-compose.yml up --build
```

The API is available at `http://127.0.0.1:8000`. PostgreSQL data persists in the `postgres_data` named volume.

---

## Environment variables

All variables are set in `backend/.env`. The file is excluded from the image and from Git.

| Variable | Required | Default | Description |
|---|---|---|---|
| `DATABASE_URL` | Yes | — | PostgreSQL DSN, e.g. `postgresql://user:pass@host:5432/dbname` |
| `POSTGRES_DB` | Yes (Compose) | — | Database name for the Compose `db` service |
| `POSTGRES_USER` | Yes (Compose) | — | Database user for the Compose `db` service |
| `POSTGRES_PASSWORD` | Yes (Compose) | — | Database password for the Compose `db` service |
| `SECRET_KEY` | Yes | — | JWT signing key — minimum 32 characters in production |
| `ALGORITHM` | No | `HS256` | JWT algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | No | `1440` | JWT lifetime in minutes |
| `AI_PROVIDER` | No | `mock` | `mock` or `openai` |
| `OPENAI_API_KEY` | If `openai` | — | OpenAI API key |
| `OPENAI_MODEL` | No | `gpt-4o-mini` | OpenAI model name |
| `AI_TIMEOUT` | No | `30` | AI request timeout in seconds |
| `ENVIRONMENT` | No | `development` | Set to `production` to enable hardening checks |
| `DEBUG` | No | `false` | Must be `false` in production |
| `CORS_ORIGINS` | Yes (production) | `http://localhost:3000` | Comma-separated allowed origins |
| `LOG_LEVEL` | No | `INFO` | Application log level |

Copy `backend/.env.example` to `backend/.env` and fill in the required values. Never commit `.env`.

---

## Database migrations

Migrations are managed with Alembic. Three migrations are currently in the chain:

| Revision | Description |
|---|---|
| `0fc99ea2f1fd` | Baseline — users table |
| `3a7b8c9d0e1f` | Emotions table |
| `4b8c9d0e1f2a` | Conversations and messages tables |

### Local migration commands

```powershell
# Apply all pending migrations
alembic upgrade head

# Check current revision
alembic current

# Show migration history
alembic history --verbose

# Roll back one revision
alembic downgrade -1

# Roll back to baseline (removes all application tables)
alembic downgrade base
```

Run these from the `backend` directory with `DATABASE_URL` set in the environment or `.env`.

### Migration in Docker Compose

The app container runs `alembic upgrade head` before starting Uvicorn. To inspect or rerun:

```powershell
docker compose exec app alembic current
docker compose exec app alembic upgrade head
docker compose exec app alembic history --verbose
```

---

## Running the application

### Development server

```powershell
# From backend/ with venv active and .env configured
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Production (Docker Compose)

```powershell
docker compose -f backend/docker-compose.yml up --build -d
docker compose -f backend/docker-compose.yml logs -f app
```

---

## API endpoints

### Health and observability

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Process liveness — always returns 200 if running |
| `GET` | `/ready` | Readiness — checks PostgreSQL connectivity, returns 503 if unavailable |
| `GET` | `/metrics` | Prometheus-compatible counters (requests, errors, duration, AI calls) |

### Authentication

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/v1/auth/register` | Register a new user |
| `POST` | `/api/v1/auth/login` | Obtain a JWT access token |
| `GET` | `/api/v1/auth/me` | Return the authenticated user's profile |

### Users, emotions, conversations, insights

| Method | Path | Description |
|---|---|---|
| `GET/PATCH/DELETE` | `/api/v1/users/me` | Manage the authenticated user |
| `GET/POST` | `/api/v1/emotions` | List or log emotion entries |
| `GET/DELETE` | `/api/v1/emotions/{id}` | Retrieve or delete a single entry |
| `GET/POST` | `/api/v1/conversations` | List or create conversations |
| `POST` | `/api/v1/conversations/{id}/messages` | Add a message and get an AI reply |
| `DELETE` | `/api/v1/conversations/{id}` | Delete a conversation and its messages |
| `GET` | `/api/v1/insights/summary` | Mood summary for a date range |
| `GET` | `/api/v1/insights/trends` | Daily mood trend data |
| `POST` | `/api/v1/ai/analyze` | Direct emotion analysis via the AI provider |

---

## Local verification commands

Run all checks from the `backend` directory with the virtual environment active.

### Linting and formatting

```powershell
# Lint check (must be clean before commit)
ruff check .

# Format check
ruff format --check .

# Apply formatting
ruff format .
```

### Static type checking

```powershell
mypy app
```

### Test suite

```powershell
# Run all tests (uses SQLite in-memory — no PostgreSQL required)
pytest -v

# Run a specific test file
pytest tests/test_auth.py -v
```

Tests use an isolated temporary SQLite database by default. To run against PostgreSQL, set `TEST_DATABASE_URL` to a separate database URL (must differ from `DATABASE_URL`).

### Dependency vulnerability scan

```powershell
pip-audit --progress-spinner off -r requirements.txt --ignore-vuln PYSEC-2026-1325
```

`PYSEC-2026-1325` (CVE-2026-33936) is ignored because `ecdsa 0.19.2` is the patched version — the pip-audit database currently lags behind the fix. Re-evaluate when a new pip-audit database release resolves the false positive.

### Secret scan

```powershell
# Verify no credentials appear in tracked files
git ls-files | ForEach-Object { Select-String -Path $_ -Pattern "sk-[a-zA-Z0-9]{20,}|ghp_[a-zA-Z0-9]{20,}|BEGIN.*PRIVATE KEY" -Quiet }
```

---

## CI/CD pipeline

The pipeline runs on every push and pull request via GitHub Actions (`.github/workflows/ci.yml`). All four jobs run in parallel after checkout.

### Jobs and stages

| Job | What it does |
|---|---|
| `lint-and-quality` | ruff lint, ruff format check, mypy type analysis |
| `test-and-migration` | Starts PostgreSQL 16, waits for health check, runs Alembic `upgrade head` + `current`, runs the full pytest suite |
| `security-scan` | pip-audit dependency vulnerability scan, secret scan of tracked files |
| `docker-build` | Builds the production Docker image, verifies `.env` exclusion, non-root user, and module import |

### Required checks (block merge)

All four jobs must pass on a pull request before merging:

- `Code Quality & Static Analysis`
- `PostgreSQL, Alembic & Automated Tests`
- `Security & Vulnerability Scanning`
- `Docker Build & Container Verification`

### CI credentials

The `test-and-migration` job uses isolated CI-only credentials (`luna_test_user` / `luna_test_password`) for a throwaway PostgreSQL 16 service container. These are not production credentials. Production credentials are never present in the repository or CI configuration.

---

## Docker build verification

### Build the production image locally

```powershell
docker build -t luna-emotion-companion-backend:local -f backend/Dockerfile backend
```

### Verify security properties

```powershell
# .env must not be embedded in the image
docker run --rm luna-emotion-companion-backend:local test -f /app/.env
# Expected: exit code 1 (file does not exist)

# Container must not run as root
docker run --rm luna-emotion-companion-backend:local id -u
# Expected: non-zero UID

# Application modules must import cleanly
docker run --rm luna-emotion-companion-backend:local python -c "import app.main; print('OK')"
```

### Verify Docker Compose configuration

```powershell
docker compose -f backend/docker-compose.yml config
docker compose -f backend/docker-compose.yml up --build
Invoke-WebRequest http://127.0.0.1:8000/health
Invoke-WebRequest http://127.0.0.1:8000/ready
```

---

## HTTPS and CORS

**HTTPS** is terminated at the reverse proxy or load balancer layer (nginx, Caddy, AWS ALB, etc.). The application itself listens on HTTP internally. Do not expose port 8000 directly to the public internet.

**CORS** is controlled by the `CORS_ORIGINS` environment variable. Set it to the exact origin(s) of your frontend:

```
CORS_ORIGINS=https://app.example.com,https://www.example.com
```

When `ENVIRONMENT=production`, the application will refuse to start if `CORS_ORIGINS` is empty.

Allowed methods: `GET`, `POST`, `PATCH`, `DELETE`, `OPTIONS`.
Allowed headers: `Authorization`, `Content-Type`.

---

## Security hardening

- Non-root container user (`appuser`)
- Security response headers: `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`
- Rate limiting on authentication endpoints
- JWT tokens — configurable expiry, strong key enforced in production
- `ENVIRONMENT=production` enforces: strong `SECRET_KEY`, `DEBUG=false`, non-empty `CORS_ORIGINS`
- All error responses return generic messages — diagnostic details remain server-side only
- Structured JSON logs to stdout — no secrets, tokens, or passwords logged
- Request correlation via `X-Request-ID`

---

## Observability

```powershell
# Liveness
Invoke-WebRequest http://127.0.0.1:8000/health

# Readiness (checks PostgreSQL)
Invoke-WebRequest http://127.0.0.1:8000/ready

# Prometheus-compatible metrics
Invoke-WebRequest http://127.0.0.1:8000/metrics

# Docker Compose logs
docker compose logs app
docker compose logs --tail=100 app db
```

---

## Rollback procedure

### Application rollback (Docker Compose)

```powershell
# Roll back to a previous image tag
docker compose -f backend/docker-compose.yml down
# Edit docker-compose.yml or .env to reference the previous image/build
docker compose -f backend/docker-compose.yml up -d

# Verify health after rollback
Invoke-WebRequest http://127.0.0.1:8000/health
Invoke-WebRequest http://127.0.0.1:8000/ready
```

### Database migration rollback

```powershell
# Roll back one migration
docker compose exec app alembic downgrade -1

# Confirm current revision
docker compose exec app alembic current
```

Roll back migrations before rolling back the application image when the new migration added schema that the old code cannot handle. Always take a database backup before applying or reverting migrations in production.

### Database backup before migration

```powershell
# Dump the database before applying migrations
docker compose exec db pg_dump -U $env:POSTGRES_USER $env:POSTGRES_DB > backup_$(Get-Date -Format 'yyyyMMdd_HHmmss').sql
```

---

## Stopping and cleanup

```powershell
# Stop containers, keep data volume
docker compose -f backend/docker-compose.yml down

# Stop containers and remove data volume (destructive — removes all PostgreSQL data)
docker compose -f backend/docker-compose.yml down -v
```

Use `-v` only when intentionally resetting the local database.

---

## Troubleshooting

**Missing environment variable on `docker compose up`**
Set the required value in `backend/.env` and rerun `docker compose up --build`.

**App waits for database / connection refused**
Inspect `docker compose logs db`. The app starts only after `pg_isready` succeeds. If the database container is unhealthy, check its logs for configuration errors.

**Migrations fail**
Run `docker compose exec app alembic current` after the database is healthy. If the revision is behind `head`, run `docker compose exec app alembic upgrade head` and check `docker compose logs app` for errors.

**Tests fail with database errors**
By default, tests use an isolated temporary SQLite database and do not require PostgreSQL. If `TEST_DATABASE_URL` is set, it must point to a separate, writable database that is not `DATABASE_URL`.

---

## Staging deployment

The project is currently classified **READY FOR STAGING**. All sections below apply to the staging environment. Do not use these instructions for production until the production readiness checklist is complete.

### File layout

```
Luna_EmotionCompanion/
├── backend/
│   ├── .env.staging          ← staging env template (fill in, never commit)
│   ├── docker-compose.staging.yml
│   └── Dockerfile
└── nginx/
    ├── staging.conf          ← nginx reverse proxy config
    └── certs/
        ├── fullchain.pem     ← TLS certificate chain (not in Git)
        └── privkey.pem       ← TLS private key (not in Git)
```

### Prerequisites

- Docker Engine 25+ and Compose v2 on the staging host
- A domain name with DNS pointing to the staging server
- A TLS certificate (Let's Encrypt recommended)
- `.env.staging` populated with real values (see below)

---

### 2. Production environment configuration

#### Required variables and how to provide them

Never place real secrets in source control. Provide secrets either by:
- Filling in `backend/.env.staging` on the staging server directly (file must be `chmod 600`)
- Using a secrets manager (AWS Secrets Manager, HashiCorp Vault, GitHub Actions secrets)

#### Generating a strong SECRET_KEY

The application enforces a minimum 32-character key when `ENVIRONMENT=production`. The placeholder value `change-this-to-a-secure-random-string` is explicitly blocked by `validate_security_config()` and will cause the container to crash at startup.

Generate a suitable key:

```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

This produces a 64-character hexadecimal string. Set it in `.env.staging`:

```
SECRET_KEY=<output of the command above>
```

Do not store the generated value anywhere except the secrets store and the server's `.env.staging`.

#### Generating a strong POSTGRES_PASSWORD

```bash
python -c "import secrets; print(secrets.token_hex(24))"
```

Use a different password for staging than for production. Never reuse passwords across environments.

#### Full list of required staging variables

| Variable | Required | Staging value guidance |
|---|---|---|
| `DATABASE_URL` | Yes | `postgresql://luna_staging_app:<password>@db:5432/luna_staging_db` |
| `POSTGRES_DB` | Yes | `luna_staging_db` |
| `POSTGRES_USER` | Yes | `luna_staging_app` |
| `POSTGRES_PASSWORD` | Yes | Strong random — see above |
| `SECRET_KEY` | Yes | Strong random ≥ 32 chars — see above |
| `ALGORITHM` | No | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | No | `1440` |
| `AI_PROVIDER` | No | `mock` (use `openai` only after mock staging is verified) |
| `OPENAI_API_KEY` | If openai | Staging-specific key — never the production key |
| `ENVIRONMENT` | Yes | `production` — enables all hardening checks |
| `DEBUG` | Yes | `false` |
| `CORS_ORIGINS` | Yes | Exact staging frontend origin — see section 3 |
| `LOG_LEVEL` | No | `INFO` |
| `TESTING` | Yes | `false` |

---

### 3. CORS configuration

#### Rules

- Set `CORS_ORIGINS` to the exact origin(s) your staging frontend is served from.
- Do not use a wildcard (`*`) — it disables credential isolation and is explicitly against the production hardening policy.
- When `ENVIRONMENT=production`, the application refuses to start if `CORS_ORIGINS` is empty.
- The value is comma-separated with no trailing spaces.

#### Format

```
# Single origin
CORS_ORIGINS=https://staging.example.com

# Multiple origins
CORS_ORIGINS=https://staging.example.com,https://app-staging.example.com
```

#### What the application allows

- Methods: `GET`, `POST`, `PATCH`, `DELETE`, `OPTIONS`
- Headers: `Authorization`, `Content-Type`
- Credentials: `true` (cookies and Authorization headers are forwarded)

The frontend must send `credentials: 'include'` (fetch) or `withCredentials: true` (axios) when using cookie-based sessions, or `Authorization: Bearer <token>` for JWT.

---

### 4. HTTPS and reverse proxy

#### Architecture

```
Internet (port 443/80)
        ↓
   nginx container
   (TLS termination, HTTP→HTTPS redirect, security headers)
        ↓
   app container (port 8000, HTTP only, internal network)
        ↓
   db container (port 5432, internal network only)
```

PostgreSQL is never exposed to the host or internet. Port 5432 is only reachable within `luna_staging_net`.

#### TLS certificate setup (Let's Encrypt)

```bash
# Install certbot on the host (Ubuntu/Debian)
apt install certbot

# Obtain a certificate (standalone mode — stop nginx first if running)
certbot certonly --standalone -d staging.example.com

# Copy certificates to the nginx/certs/ directory
cp /etc/letsencrypt/live/staging.example.com/fullchain.pem nginx/certs/
cp /etc/letsencrypt/live/staging.example.com/privkey.pem nginx/certs/
chmod 600 nginx/certs/privkey.pem

# Renew (run periodically via cron or systemd timer)
certbot renew --quiet
# After renewal, reload nginx:
docker compose -f backend/docker-compose.staging.yml exec nginx nginx -s reload
```

#### nginx configuration

The provided `nginx/staging.conf` handles:
- HTTP → HTTPS permanent redirect (301)
- TLS 1.2 and 1.3 only (SSLv3, TLS 1.0, TLS 1.1 disabled)
- HSTS with `includeSubDomains` (1 year)
- OCSP stapling
- Strong cipher suite (forward secrecy + AEAD)
- `proxy_read_timeout 60s` — covers AI provider calls up to 30s + margin
- `X-Forwarded-For`, `X-Real-IP`, `X-Forwarded-Proto` headers
- `/metrics` restricted to private CIDRs (not publicly accessible)
- Let's Encrypt ACME challenge passthrough

Before deploying, replace every occurrence of `staging.REPLACE_WITH_YOUR_DOMAIN.com` in `nginx/staging.conf` with the actual staging hostname.

#### Forwarded headers — important note

The current application reads `request.client.host` for rate limiting. Behind nginx, this will be the nginx container's IP, not the real client IP. The in-process rate limiter will effectively apply per-worker rather than per-client IP in a proxied setup.

For production, add Starlette's `ProxyHeadersMiddleware` and configure uvicorn's `--forwarded-allow-ips` to restore per-client rate limiting. This is a known item — not blocking for staging, but must be resolved before production.

---

### 5. Staging deployment sequence

```
1. Fill in backend/.env.staging on the server
2. Replace domain placeholder in nginx/staging.conf
3. Place TLS certificates in nginx/certs/
4. Build and start the stack
5. Verify database health
6. Verify Alembic migration
7. Verify application readiness
8. Run smoke tests
```

#### Step-by-step commands

```bash
# On the staging server, from the repository root

# 1. Edit env file — do not skip this step
nano backend/.env.staging   # or vim, or copy from secrets manager

# 2. Replace domain in nginx config
sed -i 's/staging.REPLACE_WITH_YOUR_DOMAIN.com/staging.example.com/g' nginx/staging.conf

# 3. Place certificates (see section 4 above)

# 4. Build and start the stack
docker compose -f backend/docker-compose.staging.yml --env-file backend/.env.staging up --build -d

# 5. Watch startup logs
docker compose -f backend/docker-compose.staging.yml logs -f

# 6. Verify database health (wait for "healthy" status)
docker compose -f backend/docker-compose.staging.yml ps

# 7. Verify Alembic migration head
docker compose -f backend/docker-compose.staging.yml exec app alembic current
# Expected output includes: 4b8c9d0e1f2a (head)

# 8. Verify application readiness
curl -sf https://staging.example.com/health
curl -sf https://staging.example.com/ready
# Both must return 200
```

#### Alembic migration sequence

The app container runs `alembic upgrade head` automatically before Uvicorn starts (see `Dockerfile CMD`). To verify or rerun manually:

```bash
# Check current revision
docker compose -f backend/docker-compose.staging.yml exec app alembic current

# Force re-run (idempotent — safe to run if already at head)
docker compose -f backend/docker-compose.staging.yml exec app alembic upgrade head

# Show full history
docker compose -f backend/docker-compose.staging.yml exec app alembic history --verbose
```

Expected revision chain after a clean deployment:

```
0fc99ea2f1fd → 3a7b8c9d0e1f → 4b8c9d0e1f2a (head)
```

---

### 6. Staging smoke tests

Run these immediately after deployment. All commands use `https://staging.example.com` — replace with your actual staging domain.

#### Infrastructure checks

```bash
# Liveness
curl -sf https://staging.example.com/health
# Expected: {"status":"healthy"}

# Readiness (verifies PostgreSQL is reachable)
curl -sf https://staging.example.com/ready
# Expected: {"status":"ready"}

# TLS — verify certificate and redirect
curl -I http://staging.example.com/health
# Expected: HTTP/1.1 301 (redirect to HTTPS)

curl -sv https://staging.example.com/health 2>&1 | grep "SSL connection"
# Expected: SSL connection using TLSv1.3 (or TLSv1.2)
```

#### Critical user flow

```bash
# 1. Register a staging test account
curl -sf -X POST https://staging.example.com/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Staging Test","email":"staging-test@example.com","password":"StagingTest1234!"}' | python3 -m json.tool
# Expected: {"id":..., "name":"Staging Test", "email":"staging-test@example.com"}

# 2. Login and capture the token
TOKEN=$(curl -sf -X POST https://staging.example.com/api/v1/auth/login \
  -F "username=staging-test@example.com" \
  -F "password=StagingTest1234!" | python3 -c "import sys,json; print(json.load(sys.stdin)['access_token'])")
echo "Token acquired: ${TOKEN:0:20}..."

# 3. Verify authenticated profile
curl -sf https://staging.example.com/api/v1/auth/me \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
# Expected: {"id":..., "name":"Staging Test", "email":"staging-test@example.com"}

# 4. Log an emotion
curl -sf -X POST https://staging.example.com/api/v1/emotions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"emotion":"happy","intensity":7,"note":"Staging smoke test"}' | python3 -m json.tool
# Expected: {"id":..., "emotion":"happy", "intensity":7, ...}

# 5. AI emotion analysis
curl -sf -X POST https://staging.example.com/api/v1/ai/emotion-analysis \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"text":"I feel really good today, things are going well"}' | python3 -m json.tool
# Expected (mock provider): {"emotion":"happy", "confidence":..., "sentiment":"positive", ...}

# 6. Create a conversation
CONV_ID=$(curl -sf -X POST https://staging.example.com/api/v1/conversations \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Staging test conversation"}' | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
echo "Conversation ID: $CONV_ID"

# 7. Send a chat message
curl -sf -X POST "https://staging.example.com/api/v1/conversations/$CONV_ID/messages" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content":"Hello, I am testing the staging environment"}' | python3 -m json.tool
# Expected: {"conversation_id":..., "user_message":{...}, "assistant_message":{...}}

# 8. Mood analytics
curl -sf "https://staging.example.com/api/v1/insights/mood-summary" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
# Expected: summary with total_records >= 1

curl -sf "https://staging.example.com/api/v1/insights/trends?days=7" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
# Expected: {"period_days":7, "trends":[...]}
```

#### Security checks

```bash
# Unauthenticated request must return 401
curl -sf https://staging.example.com/api/v1/auth/me
# Expected: HTTP 401

# Invalid JWT must return 401
curl -sf https://staging.example.com/api/v1/auth/me \
  -H "Authorization: Bearer this.is.not.valid"
# Expected: HTTP 401

# /metrics must not be publicly accessible
curl -sf https://staging.example.com/metrics
# Expected: HTTP 403 (blocked by nginx allow/deny rules)

# Response headers — verify security headers are present
curl -sI https://staging.example.com/health | grep -i "strict-transport\|x-content-type\|x-frame\|referrer"
# Expected: all four headers present
```

---

### 7. Security verification checklist

Complete this checklist before promoting to production. Items marked `[staging]` are verified during staging; items marked `[pre-prod]` must be verified before the production classification changes.

```
[staging]  SECRET_KEY is ≥ 32 chars and not a known weak value
[staging]  POSTGRES_PASSWORD is strong and not reused from development
[staging]  ENVIRONMENT=production — hardening checks active at startup
[staging]  DEBUG=false
[staging]  CORS_ORIGINS set to exact staging frontend origin (no wildcard)
[staging]  HTTPS terminates at nginx — port 8000 not exposed to internet
[staging]  PostgreSQL port 5432 not exposed to host or internet
[staging]  TLS 1.2 minimum, strong cipher suite
[staging]  HSTS header present on all HTTPS responses
[staging]  /metrics restricted — not publicly accessible
[staging]  .env files not committed to Git (verify: git ls-files | grep .env)
[staging]  .env not inside Docker image (verify: docker run --rm <image> test -f /app/.env)
[staging]  Container runs as non-root user (verify: docker run --rm <image> id -u)
[staging]  Authentication returns 401 on invalid/missing token
[staging]  Rate limiting active (20 req/60s register, 30 req/60s login)
[staging]  Security response headers present (X-Content-Type-Options, X-Frame-Options, etc.)
[staging]  No secrets logged — inspect docker compose logs for tokens/passwords
[staging]  Error responses are generic — no stack traces in API responses
[staging]  Ownership enforced — user A cannot access user B's data

[pre-prod] ProxyHeadersMiddleware or uvicorn --forwarded-allow-ips configured
           (required for accurate per-client rate limiting behind nginx)
[pre-prod] Production SECRET_KEY generated fresh — not copied from staging
[pre-prod] Production POSTGRES_PASSWORD generated fresh — not copied from staging
[pre-prod] Production OPENAI_API_KEY is the production key — not the staging key
[pre-prod] Production CORS_ORIGINS set to the real production frontend domain
[pre-prod] GitHub Actions pipeline passed (all 4 jobs green) on the production branch
[pre-prod] Database backup taken before first production migration
[pre-prod] Rollback procedure tested on staging
[pre-prod] TLS certificate auto-renewal verified (certbot renew --dry-run)
[pre-prod] Log retention and alerting configured
```

---

### 8. Frontend integration reference

#### Base URL

```
https://staging.example.com   ← replace with actual staging domain
```

All API routes are under `/api/v1/`.

#### Authentication flow

The login endpoint uses **form-data**, not JSON. This is an OAuth2 password flow requirement.

```javascript
// 1. Register
const res = await fetch('/api/v1/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name, email, password })
});
const user = await res.json();  // { id, name, email }

// 2. Login — NOTE: form-data, not JSON
const form = new FormData();
form.append('username', email);   // field name is "username" (OAuth2 spec)
form.append('password', password);
const res = await fetch('/api/v1/auth/login', { method: 'POST', body: form });
const { access_token, token_type } = await res.json();
// Store access_token securely (httpOnly cookie or memory — avoid localStorage)

// 3. Authenticated requests
const res = await fetch('/api/v1/auth/me', {
  headers: { 'Authorization': `Bearer ${access_token}` }
});
```

#### JWT handling

| Property | Value |
|---|---|
| Header name | `Authorization` |
| Header format | `Bearer <token>` |
| Token lifetime | 1440 minutes (24 hours) by default |
| Expiry behaviour | Expired token returns `401` — redirect to login |
| Refresh tokens | Not implemented — re-authenticate after expiry |

#### Complete endpoint reference

**Authentication**

| Method | Path | Content-Type | Auth | Body | Response |
|---|---|---|---|---|---|
| `POST` | `/api/v1/auth/register` | `application/json` | No | `{name, email, password}` | `{id, name, email}` |
| `POST` | `/api/v1/auth/login` | `multipart/form-data` | No | `username=<email>&password=<pass>` | `{access_token, token_type}` |
| `GET` | `/api/v1/auth/me` | — | Yes | — | `{id, name, email}` |

**Users**

| Method | Path | Auth | Body | Response |
|---|---|---|---|---|
| `GET` | `/api/v1/users/me` | Yes | — | `{id, name, email}` |
| `PATCH` | `/api/v1/users/me` | Yes | `{name?, email?}` (at least one) | `{id, name, email}` |
| `PATCH` | `/api/v1/users/me/password` | Yes | `{current_password, new_password}` | `{message}` |
| `DELETE` | `/api/v1/users/me` | Yes | — | `204 No Content` |

**Emotions**

| Method | Path | Auth | Body / Params | Response |
|---|---|---|---|---|
| `POST` | `/api/v1/emotions` | Yes | `{emotion, intensity (1–10), note?}` | `{id, user_id, emotion, intensity, note, created_at}` `201` |
| `GET` | `/api/v1/emotions` | Yes | — | `[{id, user_id, emotion, intensity, note, created_at}]` ordered desc |
| `GET` | `/api/v1/emotions/{id}` | Yes | — | `{id, ...}` or `404` |
| `DELETE` | `/api/v1/emotions/{id}` | Yes | — | `204` or `404` |

Valid `emotion` values (normalized to lowercase): `happy`, `sad`, `angry`, `anxious`, `stressed`, `excited`, `calm`, `lonely`, `confused`, `neutral`. Values outside this set are normalised to `neutral` by the AI analysis service.

**AI Analysis**

| Method | Path | Auth | Body | Response |
|---|---|---|---|---|
| `POST` | `/api/v1/ai/emotion-analysis` | Yes | `{text}` (1–5000 chars) | `{emotion, confidence, sentiment, explanation, suggested_response}` or `502` |

**Conversations and Chat**

| Method | Path | Auth | Body | Response |
|---|---|---|---|---|
| `POST` | `/api/v1/conversations` | Yes | `{title?}` | `{id, user_id, title, created_at, updated_at}` `201` |
| `GET` | `/api/v1/conversations` | Yes | — | `[{id, user_id, title, created_at, updated_at}]` ordered by `updated_at` desc |
| `GET` | `/api/v1/conversations/{id}` | Yes | — | `{...conversation, messages:[{id, role, content, created_at}]}` or `404` |
| `DELETE` | `/api/v1/conversations/{id}` | Yes | — | `204` or `404` |
| `POST` | `/api/v1/conversations/{id}/messages` | Yes | `{content}` (1–5000 chars) | `{conversation_id, user_message, assistant_message}` or `502` |

`role` in messages is always `"user"` or `"assistant"`.

**Insights and Analytics**

| Method | Path | Auth | Params | Response |
|---|---|---|---|---|
| `GET` | `/api/v1/insights/emotions` | Yes | — | `{total_records, emotions:[{emotion, count, percentage}]}` |
| `GET` | `/api/v1/insights/mood-summary` | Yes | — | `{total_records, average_intensity, highest_intensity, lowest_intensity, most_common_emotion, latest_emotion, latest_intensity, latest_recorded_at}` |
| `GET` | `/api/v1/insights/trends` | Yes | `days=7` (1–90) | `{period_days, trends:[{date, average_intensity, record_count, dominant_emotion}]}` |

**System**

| Method | Path | Auth | Response |
|---|---|---|---|
| `GET` | `/health` | No | `{"status":"healthy"}` `200` |
| `GET` | `/ready` | No | `{"status":"ready"}` `200` or `{"status":"not_ready"}` `503` |
| `GET` | `/metrics` | No (nginx-restricted) | Prometheus text |

#### Standard error response shapes

```typescript
// 400 / 401 / 404 / 409 / 429 / 502
{ "detail": string }

// 422 Validation error
{
  "detail": [
    { "type": string, "loc": string[], "msg": string, "input": any }
  ]
}

// 500
{ "detail": "Internal server error" }
```

#### Request tracing

Every response includes `X-Request-ID`. Log this value on the frontend — it correlates to the server-side log entry for that exact request and is useful for support investigations.

---

### 9. Staging E2E test plan

The following test cases define the minimum verification required before a staging deployment is considered stable. Run them manually on first staging deploy; automate in a separate integration test suite once staging is stable.

#### Authentication

| Test | Input | Expected |
|---|---|---|
| Register with valid data | `POST /auth/register` valid JSON | `201`, `{id, name, email}` |
| Register duplicate email | Same email twice | Second request: `400 {"detail":"Email already exists"}` |
| Register missing field | Body without `password` | `422` |
| Login with valid credentials | Correct email + password (form-data) | `200 {access_token, token_type:"bearer"}` |
| Login with wrong password | Correct email, wrong password | `401 {"detail":"Invalid email or password"}` |
| Login with unknown email | Non-existent email | `401` |
| Access protected endpoint | Valid `Authorization: Bearer <token>` | `200` |
| Access protected endpoint — no token | No `Authorization` header | `401` |
| Access protected endpoint — invalid token | `Authorization: Bearer garbage` | `401` |
| Access protected endpoint — expired token | Token with past `exp` | `401` |

#### Emotion

| Test | Input | Expected |
|---|---|---|
| Log emotion — valid | `{emotion:"happy", intensity:5}` | `201`, response includes all fields |
| Log emotion — intensity out of range | `{emotion:"happy", intensity:11}` | `422` |
| Log emotion — empty string | `{emotion:"", intensity:5}` | `422` |
| Retrieve emotion list | `GET /emotions` authenticated | `200`, list ordered by `created_at` desc |
| Retrieve single emotion | `GET /emotions/{own_id}` | `200` |
| Retrieve another user's emotion | `GET /emotions/{other_user_id}` | `404` (ownership enforced) |
| Delete own emotion | `DELETE /emotions/{own_id}` | `204` |
| Delete non-existent emotion | `DELETE /emotions/99999` | `404` |

#### Chat

| Test | Input | Expected |
|---|---|---|
| Create conversation | `POST /conversations {title:"test"}` | `201`, includes `id` |
| Send message | `POST /conversations/{id}/messages {content:"hello"}` | `200`, `user_message` + `assistant_message` |
| Send empty message | `content:""` | `422` |
| Send message > 5000 chars | `content` exceeding limit | `422` |
| Get conversation with messages | `GET /conversations/{id}` | `200`, includes `messages` array |
| Access other user's conversation | `GET /conversations/{other_id}` | `404` |
| Delete conversation | `DELETE /conversations/{id}` | `204`, cascade deletes messages |

#### Analytics

| Test | Input | Expected |
|---|---|---|
| Mood summary — with data | `GET /insights/mood-summary` after logging emotions | `200`, numeric fields populated |
| Mood summary — empty | Fresh account, no emotions | `200`, `total_records:0`, null fields |
| Trends — default 7 days | `GET /insights/trends` | `200`, `period_days:7` |
| Trends — custom days | `GET /insights/trends?days=30` | `200`, `period_days:30` |
| Trends — invalid days | `GET /insights/trends?days=0` | `422` |
| Trends — days > 90 | `GET /insights/trends?days=91` | `422` |
| Emotion distribution | `GET /insights/emotions` | `200`, percentages sum to ~100 |

#### Security

| Test | Input | Expected |
|---|---|---|
| Rate limit — register | > 20 requests/60s from same IP | `429`, `Retry-After: 60` header |
| Rate limit — login | > 30 requests/60s from same IP | `429` |
| Security headers | Any response | `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY` |
| HSTS header | HTTPS response via nginx | `Strict-Transport-Security: max-age=31536000` |
| CORS — allowed origin | Request from `CORS_ORIGINS` value | `200`, correct `Access-Control-Allow-Origin` |
| CORS — disallowed origin | Request from unlisted origin | No `Access-Control-Allow-Origin` header |
| Error responses | Trigger 500 (force DB disconnect) | `{"detail":"Internal server error"}` — no stack trace |
| /metrics access | Public request | `403` (nginx blocks) |

#### Infrastructure

| Test | Expected |
|---|---|
| `GET /health` | `200 {"status":"healthy"}` |
| `GET /ready` (DB up) | `200 {"status":"ready"}` |
| `GET /ready` (DB down) | `503 {"status":"not_ready"}` |
| Alembic current | Revision `4b8c9d0e1f2a (head)` |
| HTTP→HTTPS redirect | `301` redirect on port 80 |
| TLS certificate | Valid, not self-signed, matches domain |

---

### 10. Production promotion checklist

The project advances from **READY FOR STAGING** to **READY FOR PRODUCTION DEPLOYMENT** only after every item below is checked off:

```
CI/CD
[ ] GitHub Actions pipeline passed (all 4 jobs green) on the target branch
[ ] No failing tests, no suppressed quality checks

Staging verification
[ ] Staging deployment completed successfully
[ ] alembic current shows 4b8c9d0e1f2a (head)
[ ] GET /health returns 200
[ ] GET /ready returns 200
[ ] Full smoke test completed (section 6 above)
[ ] Full E2E test plan completed (section 9 above)

Security
[ ] Production SECRET_KEY generated fresh (not copied from staging)
[ ] Production POSTGRES_PASSWORD generated fresh (not copied from staging)
[ ] Production CORS_ORIGINS set to the real production frontend origin
[ ] HTTPS verified end-to-end
[ ] TLS certificate auto-renewal verified (certbot renew --dry-run)
[ ] /metrics not publicly accessible
[ ] No secrets in Git (git ls-files | grep -i "secret\|password\|api.key")
[ ] .env not in Docker image
[ ] Container runs as non-root user
[ ] ProxyHeadersMiddleware configured for accurate per-client rate limiting

Operations
[ ] Database backup procedure documented and tested
[ ] Rollback procedure tested on staging
[ ] Log aggregation or retention configured
[ ] Alerting configured for /ready probe failures
[ ] Monitoring for HTTP 5xx rate
```
