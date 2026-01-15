from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.core.llm import get_llm, LLMError

router = APIRouter(prefix="/api", tags=["coach"])


class CoachRequest(BaseModel):
    prompt: str = Field(..., min_length=3)


@router.post("/coach")
def coach(req: CoachRequest):
    try:
        llm = get_llm()
        output = llm.generate(req.prompt)
        return {"output": output}
    except LLMError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
