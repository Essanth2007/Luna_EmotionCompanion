import json
import os
from typing import Any

from app.services.ai_provider import ChatMessage, ProviderEmotionResult

OPENAI_SYSTEM_INSTRUCTIONS = (
    "You are Luna, a supportive AI assistant for an emotion companion application. "
    "Be polite, respectful, and concise. Do not claim to be human, conscious, or a real friend. "
    "Do not encourage emotional dependency or exclusivity. Do not diagnose medical conditions. "
    "Do not provide dangerous instructions. Encourage trusted people or qualified professionals "
    "when real-world help is appropriate."
)

EMOTION_OUTPUT_SCHEMA = {
    "type": "object",
    "properties": {
        "emotion": {"type": "string"},
        "confidence": {"type": "number", "minimum": 0, "maximum": 1},
        "sentiment": {"type": "string"},
        "explanation": {"type": "string"},
        "suggested_response": {"type": "string"},
    },
    "required": ["emotion", "confidence", "sentiment", "explanation", "suggested_response"],
    "additionalProperties": False,
}


class OpenAIProviderError(Exception):
    """Safe internal error for OpenAI configuration, request, or parsing failures."""


class OpenAIProvider:
    def __init__(self):
        api_key = os.getenv("OPENAI_API_KEY", "").strip()
        if not api_key:
            raise OpenAIProviderError("OpenAI API key is not configured")

        try:
            from openai import OpenAI
        except ImportError as exc:
            raise OpenAIProviderError("OpenAI SDK is not installed") from exc

        try:
            timeout = float(os.getenv("AI_TIMEOUT", "30"))
            if timeout <= 0:
                raise ValueError
            self.client = OpenAI(api_key=api_key, timeout=timeout, max_retries=0)
        except Exception as exc:
            raise OpenAIProviderError("OpenAI client could not be configured") from exc

        self.model = os.getenv("OPENAI_MODEL", "gpt-4o-mini").strip() or "gpt-4o-mini"

    def analyze_emotion(self, text: str) -> ProviderEmotionResult:
        try:
            response = self.client.responses.create(
                model=self.model,
                instructions=OPENAI_SYSTEM_INSTRUCTIONS,
                input=text,
                text={
                    "format": {
                        "type": "json_schema",
                        "name": "emotion_analysis",
                        "strict": True,
                        "schema": EMOTION_OUTPUT_SCHEMA,
                    }
                },
            )
            payload = self._parse_json(response.output_text)
            return ProviderEmotionResult(
                emotion=self._required_string(payload, "emotion"),
                confidence=self._required_number(payload, "confidence"),
                sentiment=self._required_string(payload, "sentiment"),
                explanation=self._required_string(payload, "explanation"),
                suggested_response=self._required_string(payload, "suggested_response"),
            )
        except OpenAIProviderError:
            raise
        except Exception as exc:
            raise OpenAIProviderError("OpenAI emotion analysis request failed") from exc

    def generate_response(self, messages: list[ChatMessage]) -> str:
        try:
            response = self.client.responses.create(
                model=self.model,
                instructions=OPENAI_SYSTEM_INSTRUCTIONS,
                input=[{"role": message.role, "content": message.content} for message in messages],
            )
            content = response.output_text.strip()
            if not content:
                raise OpenAIProviderError("OpenAI returned an empty chat response")
            return content
        except OpenAIProviderError:
            raise
        except Exception as exc:
            raise OpenAIProviderError("OpenAI chat request failed") from exc

    @staticmethod
    def _parse_json(output: str) -> dict[str, Any]:
        try:
            payload = json.loads(output)
        except (TypeError, json.JSONDecodeError) as exc:
            raise OpenAIProviderError("OpenAI returned malformed emotion output") from exc
        if not isinstance(payload, dict):
            raise OpenAIProviderError("OpenAI returned malformed emotion output")
        return payload

    @staticmethod
    def _required_string(payload: dict[str, Any], field: str) -> str:
        value = payload.get(field)
        if not isinstance(value, str) or not value.strip():
            raise OpenAIProviderError("OpenAI returned malformed emotion output")
        return value

    @staticmethod
    def _required_number(payload: dict[str, Any], field: str) -> float:
        value = payload.get(field)
        if isinstance(value, bool) or not isinstance(value, (int, float)):
            raise OpenAIProviderError("OpenAI returned malformed emotion output")
        return float(value)
