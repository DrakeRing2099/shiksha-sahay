from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.deps import get_current_teacher_id
from pydantic import BaseModel
from uuid import uuid4
from app.models.conversations import Conversation, TeachingInsight
from app.schemas.conversations import ConversationFeedbackRequest
from app.core.teaching_insight_generator import generate_teaching_insight
from typing import Optional, Dict, Any
router = APIRouter(prefix="/api/conversations", tags=["conversations"])

@router.get("")
def list_conversations(
    db: Session = Depends(get_db),
    teacher_id: str = Depends(get_current_teacher_id),
):
    conversations = (
        db.query(Conversation)
        .filter(Conversation.teacher_id == teacher_id)
        .order_by(Conversation.updated_at.desc())
        .all()
    )

    return [
        {
            "id": str(c.id),
            "title": c.title,
            "last_message_preview": (
                c.ai_response[:120] + "..."
                if len(c.ai_response) > 120
                else c.ai_response
            ),
            "updated_at": c.updated_at.isoformat(),
            "worked": c.worked,
        }
        for c in conversations
    ]

@router.get("/{conversation_id}")
def get_conversation(
    conversation_id: str,
    db: Session = Depends(get_db),
    teacher_id: str = Depends(get_current_teacher_id),
):
    conv = (
        db.query(Conversation)
        .filter(
            Conversation.id == conversation_id,
            Conversation.teacher_id == teacher_id,
        )
        .first()
    )

    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    return {
        "id": str(conv.id),
        "title": conv.title,
        "raw_query": conv.raw_query,
        "ai_response": conv.ai_response,
        "resolved_context": conv.resolved_context,
        "worked": conv.worked,
        "created_at": conv.created_at.isoformat(),
        "updated_at": conv.updated_at.isoformat(),
    }

@router.delete("/{conversation_id}")
def delete_conversation(
    conversation_id: str,
    db: Session = Depends(get_db),
    teacher_id: str = Depends(get_current_teacher_id),
):
    conv = (
        db.query(Conversation)
        .filter(
            Conversation.id == conversation_id,
            Conversation.teacher_id == teacher_id,
        )
        .first()
    )

    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    db.delete(conv)
    db.commit()

    return {"status": "deleted"}

class ConversationFeedbackRequest(BaseModel):
    worked: bool
@router.post("/{conversation_id}/feedback")
def submit_feedback(
    conversation_id: str,
    payload: ConversationFeedbackRequest,
    db: Session = Depends(get_db),
    teacher_id: str = Depends(get_current_teacher_id),
):
    convo = (
        db.query(Conversation)
        .filter(
            Conversation.id == conversation_id,
            Conversation.teacher_id == teacher_id,
        )
        .first()
    )

    if not convo:
        raise HTTPException(status_code=404, detail="Conversation not found")

    convo.worked = payload.worked
    db.add(convo)
    db.commit()

    # 🔥 If solution worked → generate Teaching Insight
    if payload.worked:
        try:
            insight_data = generate_teaching_insight(
                raw_query=convo.raw_query,
                ai_response=convo.ai_response,
                resolved_context=convo.resolved_context,
            )
            

            # Normalize LLM output → DB schema
            insight = TeachingInsight(
                title=insight_data["title"],
                generalized_context=insight_data["generalized_context"],
                reframed_problem=insight_data["problem"],
                reframed_solution="\n".join(insight_data["solution"]),
            )
            db.add(insight)
            db.commit()

        except Exception as e:
            # ❗ Never fail user flow due to AI
            print("❌ Teaching Insight generation failed:", e)
            raise

    return {"status": "ok"}

class CreateConversationRequest(BaseModel):
    title: str
    resolved_context: Optional[Dict[str, Any]] = None
@router.post("")
def create_conversation(
    payload: CreateConversationRequest,
    db: Session = Depends(get_db),
    teacher_id: str = Depends(get_current_teacher_id),
):
    convo = Conversation(
        id=uuid4(),
        teacher_id=teacher_id,
        title=payload.title,
        raw_query="",
        ai_response="",
        resolved_context=payload.resolved_context or {},  # ✅ NEVER NULL
    )

    db.add(convo)
    db.commit()
    db.refresh(convo)

    return {
        "id": str(convo.id),
        "title": convo.title,
        "created_at": convo.created_at.isoformat(),
    }
