import logging
import time
from typing import cast

from app.core.observability import increment_metric
from app.schemas.ai import EmotionAnalysisResponse
from app.services.ai_provider import EmotionAIProvider, ProviderEmotionResult
from app.services.provider_factory import ProviderConfigurationError, create_ai_provider

SUPPORTED_EMOTIONS = {
    "happy",
    "sad",
    "angry",
    "anxious",
    "stressed",
    "excited",
    "calm",
    "lonely",
    "confused",
    "neutral",
}
SUPPORTED_SENTIMENTS = {"positive", "negative", "neutral"}


class AIProviderError(Exception):
    """Raised when the configured provider cannot return an analysis."""


def create_emotion_ai_provider() -> EmotionAIProvider:
    try:
        return cast(EmotionAIProvider, create_ai_provider())
    except ProviderConfigurationError as exc:
        raise AIProviderError("Configured AI provider is unavailable") from exc


class EmotionAnalysisService:
    def __init__(self, provider: EmotionAIProvider):
        self.provider = provider

    def analyze(self, text: str) -> EmotionAnalysisResponse:
        started = time.perf_counter()
        provider_name = type(self.provider).__name__
        increment_metric("ai_provider_calls_total")
        try:
            result = self.provider.analyze_emotion(text)
        except Exception as exc:
            increment_metric("ai_provider_failures_total")
            logging.getLogger("luna.ai").warning(
                "ai.provider_failed",
                extra={
                    "provider": provider_name,
                    "duration_ms": round((time.perf_counter() - started) * 1000, 2),
                },
            )
            raise AIProviderError("Emotion analysis provider failed") from exc

        logging.getLogger("luna.ai").info(
            "ai.provider_succeeded",
            extra={
                "provider": provider_name,
                "duration_ms": round((time.perf_counter() - started) * 1000, 2),
            },
        )

        return self._normalize_result(result)

    @staticmethod
    def _normalize_result(result: ProviderEmotionResult) -> EmotionAnalysisResponse:
        emotion = result.emotion.strip().lower()
        if emotion not in SUPPORTED_EMOTIONS:
            emotion = "neutral"

        sentiment = result.sentiment.strip().lower()
        if sentiment not in SUPPORTED_SENTIMENTS:
            sentiment = "neutral"

        if not 0 <= result.confidence <= 1:
            raise AIProviderError("Emotion analysis provider returned invalid confidence")

        return EmotionAnalysisResponse(
            emotion=emotion,
            confidence=result.confidence,
            sentiment=sentiment,
            explanation=result.explanation.strip(),
            suggested_response=result.suggested_response.strip(),
        )
