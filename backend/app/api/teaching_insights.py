from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from sqlalchemy.sql import func

from app.db.session import get_db
from app.api.deps import get_current_teacher_id
from app.models.conversations import (
    TeachingInsight,
    TeachingInsightReaction,
)

router = APIRouter(
    prefix="/api/teaching-insights",
    tags=["teaching-insights"],
)

# =========================
# Request Schemas
# =========================

class InsightReactionRequest(BaseModel):
    liked: bool


# =========================
# GET: Teaching Insight Feed
# =========================

@router.get("")
def list_teaching_insights(
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
    teacher_id: str = Depends(get_current_teacher_id),
):
    """
    Random teaching insight feed.
    (Ranking & personalization later)
    """

    insights = (
        db.query(TeachingInsight)
        .order_by(func.random())   # 🔀 RANDOM for now
        .limit(limit)
        .all()
    )

    return [
        {
            "id": str(i.id),
            "title": i.title,
            "problem": i.reframed_problem,
            "solution": i.reframed_solution,
            "context": i.generalized_context,
            "likes_count": i.likes_count,
            "created_at": i.created_at,
        }
        for i in insights
    ]


# =========================
# POST: Like / Dislike
# =========================

@router.post("/{insight_id}/react")
def react_to_insight(
    insight_id: str,
    payload: InsightReactionRequest,
    db: Session = Depends(get_db),
    teacher_id: str = Depends(get_current_teacher_id),
):
    insight = (
        db.query(TeachingInsight)
        .filter(TeachingInsight.id == insight_id)
        .first()
    )

    if not insight:
        raise HTTPException(status_code=404, detail="Teaching Insight not found")

    try:
        reaction = TeachingInsightReaction(
            teaching_insight_id=insight.id,
            teacher_id=teacher_id,
            liked=payload.liked,
        )
        db.add(reaction)

        # Update counter (simple for now)
        if payload.liked:
            insight.likes_count += 1
        else:
            insight.likes_count -= 1

        db.commit()

    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="You already reacted to this insight",
        )

    return {
        "status": "ok",
        "likes_count": insight.likes_count,
    }


# =========================
# GET: Single Insight (optional)
# =========================

@router.get("/{insight_id}")
def get_teaching_insight(
    insight_id: str,
    db: Session = Depends(get_db),
):
    insight = (
        db.query(TeachingInsight)
        .filter(TeachingInsight.id == insight_id)
        .first()
    )

    if not insight:
        raise HTTPException(status_code=404, detail="Teaching Insight not found")

    return {
        "id": str(insight.id),
        "title": insight.title,
        "problem": insight.reframed_problem,
        "solution": insight.reframed_solution,
        "context": insight.generalized_context,
        "likes_count": insight.likes_count,
        "created_at": insight.created_at,
    }
