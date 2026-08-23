# Emotion AI Module

> Reused from `services/ai/emotion-ai-service/docs/AI_MODULE.md` with additions
> drawn from the live/speech/video routers so this consolidated doc reflects the
> running service.

## Overview

The Emotion AI Service is a FastAPI microservice that performs emotion inference
from audio and video input. It exposes a health endpoint plus analysis routers
for live tracking, speech, and video. It trusts the shared HS256 JWT issued by
the Backend and reads its configuration from `app.core.settings`.

## Implemented Components

- Health API endpoint (`/health`)
- Live emotion tracking router (`/live`)
- Speech analysis router (`/speech`)
- Video analysis router (`/video`)
- JWT authentication (shared `SECRET_KEY` / `ALGORITHM`)
- Logging and exception handling

## Endpoints

### Health

```
GET /health
```

Response:

```json
{
  "service": "Emotion AI Service",
  "status": "running",
  "version": "1.0.0"
}
```

### Live Emotion Tracking

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/live/analyze` | Analyze a live frame/audio chunk (Bearer JWT) |
| GET  | `/live/{session_id}` | Get a live session result |
| DELETE | `/live/{session_id}` | End a live session |
| GET  | `/live/` | List live sessions |

### Speech / Video

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/speech/analyze` | Analyze a speech/audio upload |
| POST | `/video/analyze` | Analyze a video upload |

## Purpose

- Provide real-time emotion analysis for the live tracking pipeline.
- Support asynchronous voice/video emotion analysis from the Backend.
- Verify service availability for backend connectivity checks and health probes.

## Notes

- `AI_PROVIDER=mock` only affects the text-LLM path; the live emotion pipeline
  is real and does not depend on it.
- On first start the service downloads the wav2vec2 model (~once). Set
  `TF_ENABLE_ONEDNN_OPTS=0` and `TF_CPP_MIN_LOG_LEVEL=3` to keep TensorFlow
  quiet on CPU.
