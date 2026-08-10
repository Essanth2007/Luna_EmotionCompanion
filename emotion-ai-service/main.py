from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.api.health import router as health_router
from app.api.speech import router as speech_router
from app.speech.model_loader import SpeechEmotionModel
from app.api.video import router as video_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Loading AI models...")
    SpeechEmotionModel.load()
    print("AI models loaded.")
    yield


app = FastAPI(
    title="Emotion AI Service",
    version="1.0.0",
    lifespan=lifespan,
)

app.include_router(health_router)
app.include_router(speech_router)
app.include_router(video_router)