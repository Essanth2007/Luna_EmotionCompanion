from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class EmotionCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    emotion: str = Field(min_length=1, max_length=50)
    intensity: int = Field(ge=1, le=10)
    note: str | None = None


class EmotionResponse(BaseModel):
    id: int
    user_id: int
    emotion: str
    intensity: int
    note: str | None
    created_at: datetime

    class Config:
        from_attributes = True
