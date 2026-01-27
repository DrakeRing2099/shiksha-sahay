from pydantic import BaseModel, Field
from typing import Any, Dict, List


class IntentResult(BaseModel):
    intent: str
    slots: Dict[str, Any] = Field(default_factory=dict)
    confidence: float = Field(ge=0.0, le=1.0)
    needs_clarification: bool
    clarification_questions: List[str] = Field(default_factory=list)
    normalized_text: str
