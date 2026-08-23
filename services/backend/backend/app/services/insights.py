from collections import defaultdict
from datetime import date, datetime, time, timedelta, timezone
from typing import cast

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.emotion import Emotion
from app.schemas.insights import (
    EmotionDistributionItem,
    EmotionDistributionResponse,
    MoodSummaryResponse,
    MoodTrendItem,
    MoodTrendResponse,
)


class InsightsService:
    def __init__(self, db: Session):
        self.db = db

    def emotion_distribution(self, user_id: int) -> EmotionDistributionResponse:
        rows = (
            self.db.query(
                Emotion.emotion,
                func.count(Emotion.id).label("record_count"),
            )
            .filter(
                Emotion.user_id == user_id,
            )
            .group_by(
                Emotion.emotion,
            )
            .order_by(
                func.count(Emotion.id).desc(),
                Emotion.emotion.asc(),
            )
            .all()
        )

        total_records = sum(row.record_count for row in rows)
        if total_records == 0:
            return EmotionDistributionResponse(total_records=0, emotions=[])

        return EmotionDistributionResponse(
            total_records=total_records,
            emotions=[
                EmotionDistributionItem(
                    emotion=row.emotion,
                    count=row.record_count,
                    percentage=round(row.record_count * 100 / total_records, 2),
                )
                for row in rows
            ],
        )

    def mood_summary(self, user_id: int) -> MoodSummaryResponse:
        aggregate = (
            self.db.query(
                func.count(Emotion.id).label("total_records"),
                func.avg(Emotion.intensity).label("average_intensity"),
                func.max(Emotion.intensity).label("highest_intensity"),
                func.min(Emotion.intensity).label("lowest_intensity"),
            )
            .filter(
                Emotion.user_id == user_id,
            )
            .one()
        )

        latest = (
            self.db.query(Emotion)
            .filter(
                Emotion.user_id == user_id,
            )
            .order_by(
                Emotion.created_at.desc(),
                Emotion.id.desc(),
            )
            .first()
        )

        most_common = (
            self.db.query(
                Emotion.emotion,
            )
            .filter(
                Emotion.user_id == user_id,
            )
            .group_by(
                Emotion.emotion,
            )
            .order_by(
                func.count(Emotion.id).desc(),
                Emotion.emotion.asc(),
            )
            .first()
        )

        return MoodSummaryResponse(
            total_records=int(aggregate.total_records),
            average_intensity=(
                round(float(aggregate.average_intensity), 2)
                if aggregate.average_intensity is not None
                else None
            ),
            highest_intensity=int(aggregate.highest_intensity)
            if aggregate.highest_intensity is not None
            else None,
            lowest_intensity=int(aggregate.lowest_intensity)
            if aggregate.lowest_intensity is not None
            else None,
            most_common_emotion=str(most_common.emotion) if most_common else None,
            latest_emotion=str(latest.emotion) if latest else None,
            latest_intensity=int(latest.intensity) if latest else None,
            latest_recorded_at=cast(datetime, latest.created_at) if latest else None,
        )

    def trends(self, user_id: int, days: int) -> MoodTrendResponse:
        today = datetime.now(timezone.utc).date()
        start_date = today - timedelta(days=days - 1)
        start_datetime = datetime.combine(start_date, time.min, tzinfo=timezone.utc)

        rows = (
            self.db.query(
                func.date(Emotion.created_at).label("record_date"),
                Emotion.emotion,
                func.avg(Emotion.intensity).label("average_intensity"),
                func.count(Emotion.id).label("record_count"),
            )
            .filter(
                Emotion.user_id == user_id,
                Emotion.created_at >= start_datetime,
            )
            .group_by(
                func.date(Emotion.created_at),
                Emotion.emotion,
            )
            .order_by(
                func.date(Emotion.created_at).asc(),
            )
            .all()
        )

        daily_rows: dict[date, list] = defaultdict(list)
        for row in rows:
            row_date = row.record_date
            if isinstance(row_date, datetime):
                row_date = row_date.date()
            elif isinstance(row_date, str):
                row_date = date.fromisoformat(row_date)
            daily_rows[row_date].append(row)

        trends = []
        for row_date in sorted(daily_rows):
            emotion_rows = daily_rows[row_date]
            total_count = sum(row.record_count for row in emotion_rows)
            weighted_intensity = sum(
                float(row.average_intensity) * row.record_count for row in emotion_rows
            )
            dominant = sorted(
                emotion_rows,
                key=lambda row: (-row.record_count, row.emotion),
            )[0]
            trends.append(
                MoodTrendItem(
                    date=row_date,
                    average_intensity=round(weighted_intensity / total_count, 2),
                    record_count=total_count,
                    dominant_emotion=dominant.emotion,
                )
            )

        return MoodTrendResponse(period_days=days, trends=trends)
