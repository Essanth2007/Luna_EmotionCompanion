from dataclasses import dataclass
from typing import Protocol


@dataclass(frozen=True)
class ProviderEmotionResult:
    emotion: str
    confidence: float
    sentiment: str
    explanation: str
    suggested_response: str


class EmotionAIProvider(Protocol):
    def analyze_emotion(self, text: str) -> ProviderEmotionResult:
        """Analyze text and return provider-independent raw result fields."""


@dataclass(frozen=True)
class ChatMessage:
    role: str
    content: str


class ChatAIProvider(Protocol):
    def generate_response(self, messages: list[ChatMessage]) -> str:
        """Generate a provider-independent assistant response."""
