from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator


class ConversationCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    title: str | None = Field(default=None, max_length=200)

    @field_validator("title")
    @classmethod
    def normalize_title(cls, value: str | None) -> str | None:
        if value is None:
            return value
        normalized = value.strip()
        if not normalized:
            raise ValueError("Title must not be empty")
        return normalized


class MessageCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    content: str = Field(min_length=1, max_length=5000)

    @field_validator("content")
    @classmethod
    def normalize_content(cls, value: str) -> str:
        normalized = value.strip()
        if not normalized:
            raise ValueError("Message content must not be empty")
        return normalized


class MessageResponse(BaseModel):
    id: int
    role: Literal["user", "assistant"]
    content: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ConversationResponse(BaseModel):
    id: int
    user_id: int
    title: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ConversationDetailResponse(ConversationResponse):
    messages: list[MessageResponse]


class ChatResponse(BaseModel):
    conversation_id: int
    user_message: MessageResponse
    assistant_message: MessageResponse
