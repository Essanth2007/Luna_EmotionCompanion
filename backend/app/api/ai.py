from fastapi import APIRouter, Depends, HTTPException, status

from app.api.auth import get_current_user
from app.core.hardening import rate_limit
from app.models.user import User
from app.schemas.ai import EmotionAnalysisRequest, EmotionAnalysisResponse
from app.services.emotion_analysis import (
    AIProviderError,
    EmotionAnalysisService,
    create_emotion_ai_provider,
)

router = APIRouter()


def get_emotion_analysis_service() -> EmotionAnalysisService:
    try:
        return EmotionAnalysisService(create_emotion_ai_provider())
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Emotion analysis provider is currently unavailable",
        ) from exc


@router.post(
    "/emotion-analysis",
    response_model=EmotionAnalysisResponse,
    dependencies=[Depends(rate_limit("emotion-analysis", 60))],
    summary="Analyse emotion in text",
    description=(
        "Submit text for AI-powered emotion analysis. "
        "Returns detected emotion, confidence, sentiment, explanation, and a suggested response. "
        "Returns 502 if the AI provider is unavailable."
    ),
)
def analyze_emotion(
    request: EmotionAnalysisRequest,
    current_user: User = Depends(get_current_user),
    service: EmotionAnalysisService = Depends(get_emotion_analysis_service),
):
    """Analyse the emotional content of the provided text using the configured AI provider."""
    del current_user  # authentication required; user identity not needed in this handler
    try:
        return service.analyze(request.text)
    except AIProviderError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Emotion analysis provider is currently unavailable",
        ) from exc
