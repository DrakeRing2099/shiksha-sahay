from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.models.conversations import Conversation
import uuid
from app.core.llm import get_llm, LLMError
from app.core.config import INTENT_LLM_FALLBACK
from app.core.context_resolver import resolve_context
from app.core.prompt_builder import build_prompt
from app.core.intent_parser import parse_intent
from app.db.session import get_db
from app.api.deps import get_current_teacher_id

router = APIRouter(prefix="/api", tags=["coach"])


class CoachRequest(BaseModel):
    prompt: str
    grade: int | None = None
    subject: str | None = None
    language: str | None = None
    time_left_minutes: int | None = None


@router.post("/coach")
def coach(
    req: CoachRequest,
    db: Session = Depends(get_db),
    teacher_id: str = Depends(get_current_teacher_id),
):
    try:
        llm = get_llm() if INTENT_LLM_FALLBACK else None
        intent_result = parse_intent(
            normalized_text=req.prompt,
            metadata={
                "grade": req.grade,
                "subject": req.subject,
                "time_left_minutes": req.time_left_minutes,
            },
            llm=llm,
        )

        resolved_grade = req.grade or intent_result.slots.get("grade")
        resolved_subject = req.subject or intent_result.slots.get("subject")
        resolved_time_left = req.time_left_minutes or intent_result.slots.get("time_left_minutes")

        ctx = resolve_context(
            db=db,
            teacher_id=teacher_id,
            raw_prompt=req.prompt,
            grade=resolved_grade,
            subject=resolved_subject,
            language=req.language,
            time_left_minutes=resolved_time_left,
            intent=intent_result,
        )

        if intent_result.needs_clarification:
            questions = intent_result.clarification_questions or [
                "Can you share a bit more detail?"
            ]
            output = "I can help, but I need a bit more detail:\n- " + "\n- ".join(questions)
        else:
            final_prompt = build_prompt(ctx)
            llm = llm or get_llm()
            output = llm.generate(final_prompt)

        title = req.prompt.strip()
        if len(title) > 60:
            title = title[:57] + "..."

        conversation = Conversation(
            id=uuid.uuid4(),
            teacher_id=teacher_id,
            title=title,
            raw_query=req.prompt,
            resolved_context=ctx.model_dump(),
            ai_response=output,
        )

        db.add(conversation)
        db.commit()
        return {
            "conversation_id": str(conversation.id),
            "title": conversation.title,
            "output": output,
            "intent": intent_result.model_dump(),
        }

    except LLMError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
