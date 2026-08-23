from fastapi import APIRouter, File, UploadFile

from app.services.speech_service import SpeechService

router = APIRouter(
    prefix="/speech",
    tags=["Speech Emotion Recognition"],
)


@router.post("/analyze")
async def analyze_speech(file: UploadFile = File(...)):
    result = await SpeechService.analyze(file)
    return result