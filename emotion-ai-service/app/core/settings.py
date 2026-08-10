# Audio Configuration
TARGET_SAMPLE_RATE = 16000

MAX_AUDIO_DURATION_SECONDS = 30

MAX_AUDIO_SIZE_MB = 25

SUPPORTED_AUDIO_EXTENSIONS = {
    ".wav",
    ".mp3",
    ".flac",
    ".ogg",
    ".m4a",
}

# Speech Emotion Model
MODEL_NAME = "Dpngtm/wav2vec2-emotion-recognition"
MODEL_CACHE_DIR = "./app/models/checkpoints"

# Image Configuration

MAX_IMAGE_SIZE_MB = 10

SUPPORTED_IMAGE_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
}

SUPPORTED_IMAGE_CONTENT_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
}