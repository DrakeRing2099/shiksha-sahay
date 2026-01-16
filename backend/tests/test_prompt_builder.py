from app.core.context_schema import ResolvedContext, TeacherCtx, ClassroomCtx, ConstraintsCtx, HistoryCtx, TeacherStyleCtx
from app.core.prompt_builder import build_prompt


def test_build_prompt_contains_known_unknown_and_raw_prompt():
    ctx = ResolvedContext(
        teacher=TeacherCtx(
            years_experience=8,
            preferred_language="Hindi",
            style=TeacherStyleCtx(interactive_vs_passive=7, light_vs_strict=3, conventional_vs_modern=5),
        ),
        classroom=ClassroomCtx(grade=4, subject="Math", language="Hindi"),
        constraints=ConstraintsCtx(time_left_minutes=10, materials_available=None, device=None),
        history=HistoryCtx(worked_solutions=["peer explanation"], failed_solutions=[]),
        raw_prompt="Class is chaotic"
    )

    p = build_prompt(ctx)

    assert "Grade: 4" in p
    assert "Subject: Math" in p
    assert "Class is chaotic" in p
    assert "Do NOT assume" in p
