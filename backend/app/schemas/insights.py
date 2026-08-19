from datetime import date, datetime

from pydantic import BaseModel, Field


class EmotionDistributionItem(BaseModel):
    emotion: str
    count: int
    percentage: float


class EmotionDistributionResponse(BaseModel):
    total_records: int
    emotions: list[EmotionDistributionItem]


class MoodSummaryResponse(BaseModel):
    total_records: int
    average_intensity: float | None
    highest_intensity: int | None
    lowest_intensity: int | None
    most_common_emotion: str | None
    latest_emotion: str | None
    latest_intensity: int | None
    latest_recorded_at: datetime | None


class MoodTrendItem(BaseModel):
    date: date
    average_intensity: float
    record_count: int
    dominant_emotion: str


class MoodTrendResponse(BaseModel):
    period_days: int = Field(ge=1, le=90)
    trends: list[MoodTrendItem]
