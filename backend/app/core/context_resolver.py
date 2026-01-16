from sqlalchemy.orm import Session

from app.core.context_schema import (
    ResolvedContext, TeacherCtx, TeacherStyleCtx,
    ClassroomCtx, ConstraintsCtx, HistoryCtx
)
from app.models import (
    Teacher, TeacherStyle, TeacherClassSubject,
    TeacherSolutionOutcome, SolutionOutcome
)
from app.core.db_fetchers import first_by_id, first_by_field, all_by_field


def resolve_context(
    db: Session,
    teacher_id: str,
    raw_prompt: str,
    grade: int | None = None,
    subject: str | None = None,
    language: str | None = None,
    time_left_minutes: int | None = None,
) -> ResolvedContext:

    teacher = first_by_id(db, Teacher, teacher_id)
    style = first_by_field(db, TeacherStyle, TeacherStyle.teacher_id, teacher_id)

    teacher_ctx = TeacherCtx(
        years_experience=getattr(teacher, "years_experience", None),
        preferred_language=language or getattr(teacher, "language", None),
        style=TeacherStyleCtx(
            interactive_vs_passive=style.interactive_vs_passive,
            light_vs_strict=style.light_vs_strict,
            conventional_vs_modern=style.conventional_vs_modern,
        ) if style else None
    )

    if grade is None or subject is None:
        tcs = first_by_field(db, TeacherClassSubject, TeacherClassSubject.teacher_id, teacher_id)
        grade = grade or (tcs.grade_id if tcs else None)
        subject = subject or (tcs.subject_id if tcs else None)

    classroom_ctx = ClassroomCtx(
        grade=grade,
        subject=str(subject) if subject else None,
        language=language
    )

    outcomes = all_by_field(db, TeacherSolutionOutcome, TeacherSolutionOutcome.teacher_id, teacher_id)

    worked, failed = [], []
    for o in outcomes:
        if o.outcome == SolutionOutcome.worked:
            worked.append(str(o.solution_id))
        elif o.outcome == SolutionOutcome.failed:
            failed.append(str(o.solution_id))

    history_ctx = HistoryCtx(worked_solutions=worked, failed_solutions=failed)

    constraints_ctx = ConstraintsCtx(
        time_left_minutes=time_left_minutes,
        materials_available=None,
        device=None
    )

    return ResolvedContext(
        teacher=teacher_ctx,
        classroom=classroom_ctx,
        constraints=constraints_ctx,
        history=history_ctx,
        raw_prompt=raw_prompt
    )
