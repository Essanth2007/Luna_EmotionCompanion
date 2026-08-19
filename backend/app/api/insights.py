from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.auth import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.insights import (
    EmotionDistributionResponse,
    MoodSummaryResponse,
    MoodTrendResponse,
)
from app.services.insights import InsightsService

router = APIRouter()


def get_insights_service(db: Session = Depends(get_db)) -> InsightsService:
    return InsightsService(db)


@router.get(
    "/emotions",
    response_model=EmotionDistributionResponse,
    summary="Emotion distribution",
    description=(
        "Return the distribution of emotion types logged by the authenticated user, "
        "with counts and percentages."
    ),
)
def emotion_distribution(
    current_user: User = Depends(get_current_user),
    service: InsightsService = Depends(get_insights_service),
):
    """Return emotion distribution stats for the current user."""
    return service.emotion_distribution(int(current_user.id))


@router.get(
    "/mood-summary",
    response_model=MoodSummaryResponse,
    summary="Mood summary",
    description=(
        "Return an aggregate mood summary for the authenticated user: "
        "total records, average/highest/lowest intensity, most common emotion, and latest entry."
    ),
)
def mood_summary(
    current_user: User = Depends(get_current_user),
    service: InsightsService = Depends(get_insights_service),
):
    """Return aggregate mood statistics for the current user."""
    return service.mood_summary(int(current_user.id))


@router.get(
    "/trends",
    response_model=MoodTrendResponse,
    summary="Mood trends",
    description=(
        "Return daily mood trend data for the authenticated user over the specified number of days "
        "(1–90). Days with no entries are omitted."
    ),
)
def mood_trends(
    days: int = Query(default=7, ge=1, le=90, description="Number of days to include (1–90)"),
    current_user: User = Depends(get_current_user),
    service: InsightsService = Depends(get_insights_service),
):
    """Return daily mood trends for the current user over the given number of days."""
    return service.trends(int(current_user.id), days)
