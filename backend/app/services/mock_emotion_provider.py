from app.services.ai_provider import ChatMessage, ProviderEmotionResult


class MockEmotionAIProvider:
    """Deterministic development provider; it makes no external API calls."""

    def analyze_emotion(self, text: str) -> ProviderEmotionResult:
        lowered_text = text.lower()

        if any(word in lowered_text for word in ("happy", "wonderful", "great", "joy")):
            return ProviderEmotionResult(
                emotion="happy",
                confidence=0.90,
                sentiment="positive",
                explanation="The text contains clear language associated with positive feelings.",
                suggested_response="That sounds wonderful. I am glad you had a positive experience.",
            )

        if any(word in lowered_text for word in ("sad", "unhappy", "lonely")):
            return ProviderEmotionResult(
                emotion="sad",
                confidence=0.85,
                sentiment="negative",
                explanation="The text expresses sadness or emotional difficulty.",
                suggested_response="I am sorry that this feels difficult. Thank you for sharing it.",
            )

        return ProviderEmotionResult(
            emotion="neutral",
            confidence=0.60,
            sentiment="neutral",
            explanation="The text does not contain a strong signal for another supported emotion.",
            suggested_response="Thank you for sharing how you are feeling.",
        )

    def generate_response(self, messages: list[ChatMessage]) -> str:
        latest_message = messages[-1].content.lower() if messages else ""
        if "stress" in latest_message or "stressed" in latest_message:
            return "It sounds like you are dealing with some stress. Would you like to talk about what is making things difficult?"
        if "happy" in latest_message or "great" in latest_message:
            return "That sounds lovely. What part of your day made you feel happiest?"
        return "Thank you for sharing that with me. What feels most important about it right now?"
