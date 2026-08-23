import os

from app.services.ai_provider import ChatAIProvider, EmotionAIProvider
from app.services.mock_emotion_provider import MockEmotionAIProvider
from app.services.openai_provider import OpenAIProvider, OpenAIProviderError


class ProviderConfigurationError(Exception):
    """Raised when the configured AI provider cannot be initialized safely."""


def create_ai_provider() -> EmotionAIProvider | ChatAIProvider:
    provider_name = os.getenv("AI_PROVIDER", "mock").strip().lower()
    if provider_name == "mock":
        return MockEmotionAIProvider()
    if provider_name == "openai":
        try:
            return OpenAIProvider()
        except OpenAIProviderError as exc:
            raise ProviderConfigurationError("Configured AI provider is unavailable") from exc
    raise ProviderConfigurationError("Unsupported AI provider configuration")
