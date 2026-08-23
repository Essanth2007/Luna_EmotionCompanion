import pytest

from app.services.chat import ChatService
from app.services.emotion_analysis import EmotionAnalysisService
from app.services.mock_emotion_provider import MockEmotionAIProvider
from app.services.openai_provider import OpenAIProvider, OpenAIProviderError
from app.services.provider_factory import ProviderConfigurationError, create_ai_provider


def test_mock_provider_remains_default_and_supports_both_services(monkeypatch) -> None:
    monkeypatch.delenv("AI_PROVIDER", raising=False)
    provider = create_ai_provider()
    assert isinstance(provider, MockEmotionAIProvider)
    assert EmotionAnalysisService(provider).analyze("I feel happy today.").emotion == "happy"
    assert "sharing" in ChatService(provider).provider.generate_response([])


def test_openai_selection_requires_configuration_without_network_call(monkeypatch) -> None:
    monkeypatch.setenv("AI_PROVIDER", "openai")
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)

    with pytest.raises(ProviderConfigurationError):
        create_ai_provider()


def test_unsupported_provider_fails_clearly(monkeypatch) -> None:
    monkeypatch.setenv("AI_PROVIDER", "unsupported")

    with pytest.raises(ProviderConfigurationError):
        create_ai_provider()


def test_openai_output_parser_rejects_malformed_data() -> None:
    with pytest.raises(OpenAIProviderError):
        OpenAIProvider._parse_json("not-json")

    with pytest.raises(OpenAIProviderError):
        OpenAIProvider._required_string({}, "emotion")


def test_provider_error_messages_do_not_include_secrets(monkeypatch) -> None:
    secret = "sk-test-secret-never-log"
    monkeypatch.setenv("AI_PROVIDER", "openai")
    monkeypatch.setenv("OPENAI_API_KEY", secret)

    try:
        create_ai_provider()
    except ProviderConfigurationError as error:
        assert secret not in str(error)
