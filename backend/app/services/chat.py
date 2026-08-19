import logging
import time
from datetime import datetime, timezone
from typing import cast

from sqlalchemy.orm import Session

from app.core.observability import increment_metric
from app.models.conversation import Conversation
from app.models.message import Message
from app.services.ai_provider import ChatAIProvider, ChatMessage
from app.services.provider_factory import ProviderConfigurationError, create_ai_provider

CHAT_HISTORY_LIMIT = 20


class ChatProviderError(Exception):
    """Raised when the configured chat provider cannot respond."""


def create_chat_provider() -> ChatAIProvider:
    try:
        return cast(ChatAIProvider, create_ai_provider())
    except ProviderConfigurationError as exc:
        raise ChatProviderError("Configured AI provider is unavailable") from exc


class ChatService:
    def __init__(self, provider: ChatAIProvider, history_limit: int = CHAT_HISTORY_LIMIT):
        self.provider = provider
        self.history_limit = history_limit

    def generate_and_store(
        self,
        conversation: Conversation,
        content: str,
        db: Session,
    ) -> tuple[Message, Message]:
        user_message = Message(
            conversation_id=conversation.id,
            role="user",
            content=content,
        )
        db.add(user_message)
        db.flush()

        history = (
            db.query(Message)
            .filter(
                Message.conversation_id == conversation.id,
            )
            .order_by(Message.created_at.desc(), Message.id.desc())
            .limit(self.history_limit)
            .all()
        )
        provider_messages = [
            ChatMessage(role=str(message.role), content=str(message.content))
            for message in reversed(history)
        ]

        started = time.perf_counter()
        increment_metric("ai_provider_calls_total")
        try:
            assistant_content = self.provider.generate_response(provider_messages).strip()
        except Exception as exc:
            increment_metric("ai_provider_failures_total")
            logging.getLogger("luna.ai").warning(
                "ai.provider_failed",
                extra={
                    "provider": type(self.provider).__name__,
                    "duration_ms": round((time.perf_counter() - started) * 1000, 2),
                },
            )
            db.rollback()
            raise ChatProviderError("Chat provider failed") from exc

        logging.getLogger("luna.ai").info(
            "ai.provider_succeeded",
            extra={
                "provider": type(self.provider).__name__,
                "duration_ms": round((time.perf_counter() - started) * 1000, 2),
            },
        )

        if not assistant_content:
            db.rollback()
            raise ChatProviderError("Chat provider returned an empty response")

        assistant_message = Message(
            conversation_id=conversation.id,
            role="assistant",
            content=assistant_content,
        )
        db.add(assistant_message)
        conversation.updated_at = datetime.now(timezone.utc)  # type: ignore[assignment]
        db.commit()
        db.refresh(user_message)
        db.refresh(assistant_message)
        db.refresh(conversation)
        return user_message, assistant_message
