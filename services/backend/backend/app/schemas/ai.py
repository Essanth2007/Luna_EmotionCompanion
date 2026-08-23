from pydantic import BaseModel, ConfigDict, Field, field_validator


class EmotionAnalysisRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    text: str = Field(min_length=1, max_length=5000)

    @field_validator("text")
    @classmethod
    def normalize_text(cls, value: str) -> str:
        normalized = value.strip()
        if not normalized:
            raise ValueError("Text must not be empty")
        return normalized


class EmotionAnalysisResponse(BaseModel):
    emotion: str
    confidence: float = Field(ge=0, le=1)
    sentiment: str
    explanation: str
    suggested_response: str
