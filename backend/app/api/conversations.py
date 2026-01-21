from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.api.deps import get_current_teacher_id
from app.models.conversations import Conversation

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
