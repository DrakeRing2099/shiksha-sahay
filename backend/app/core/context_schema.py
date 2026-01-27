from pydantic import BaseModel
from typing import Optional, List

from app.core.intent_schema import IntentResult

class TeacherStyleCtx(BaseModel):
    interactive_vs_passive: Optional[int]
    light_vs_strict: Optional[int]
    conventional_vs_modern: Optional[int]


class TeacherCtx(BaseModel):
    years_experience: Optional[int]
    preferred_language: Optional[str]
    style: Optional[TeacherStyleCtx]


class ClassroomCtx(BaseModel):
    grade: Optional[int]
    subject: Optional[str]
    language: Optional[str]


class HistoryCtx(BaseModel):
    worked_solutions: List[str] = []
    failed_solutions: List[str] = []


class ConstraintsCtx(BaseModel):
    time_left_minutes: Optional[int]
    materials_available: Optional[str]
    device: Optional[str]


class ResolvedContext(BaseModel):
    teacher: TeacherCtx
    classroom: ClassroomCtx
    constraints: ConstraintsCtx
    history: HistoryCtx
    raw_prompt: str
    intent: Optional[IntentResult] = None
