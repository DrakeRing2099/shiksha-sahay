from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.llm import get_llm, LLMError
from app.core.context_resolver import resolve_context
from app.core.prompt_builder import build_prompt
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
        ctx = resolve_context(
            db=db,
            teacher_id=teacher_id,
            raw_prompt=req.prompt,
            grade=req.grade,
            subject=req.subject,
            language=req.language,
            time_left_minutes=req.time_left_minutes
        )

        final_prompt = build_prompt(ctx)

        llm = get_llm()
        output = llm.generate(final_prompt)

        return {
            "context_used": ctx.model_dump(),
            "output": output
        }

    except LLMError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
