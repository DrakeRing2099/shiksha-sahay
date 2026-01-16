from types import SimpleNamespace
from unittest.mock import patch

from app.core.context_resolver import resolve_context
from app.models import SolutionOutcome


class DummyDB:
    """Just a placeholder object; fetchers are mocked so db is never used."""
    pass


def test_resolve_context_fills_from_db_when_missing_grade_subject():
    db = DummyDB()
    teacher_id = "t1"

    fake_teacher = SimpleNamespace(years_experience=7, language="Hindi")
    fake_style = SimpleNamespace(interactive_vs_passive=7, light_vs_strict=3, conventional_vs_modern=6)
    fake_tcs = SimpleNamespace(grade_id=4, subject_id="Mathematics")

    fake_outcomes = [
        SimpleNamespace(solution_id="sol1", outcome=SolutionOutcome.worked),
        SimpleNamespace(solution_id="sol2", outcome=SolutionOutcome.failed),
    ]

    with patch("app.core.context_resolver.first_by_id", return_value=fake_teacher), \
         patch("app.core.context_resolver.first_by_field") as mock_first_by_field, \
         patch("app.core.context_resolver.all_by_field", return_value=fake_outcomes):

        # first_by_field is used twice: TeacherStyle then TeacherClassSubject
        def side_effect(db_arg, model, field, value):
            name = getattr(model, "__name__", str(model))
            if "TeacherStyle" in name:
                return fake_style
            if "TeacherClassSubject" in name:
                return fake_tcs
            return None

        mock_first_by_field.side_effect = side_effect

        ctx = resolve_context(
            db=db,
            teacher_id=teacher_id,
            raw_prompt="Help now",
            grade=None,
            subject=None,
            language=None,
            time_left_minutes=10,
        )

    assert ctx.teacher.years_experience == 7
    assert ctx.teacher.preferred_language == "Hindi"
    assert ctx.teacher.style.interactive_vs_passive == 7

    assert ctx.classroom.grade == 4
    assert ctx.classroom.subject == "Mathematics"

    assert ctx.constraints.time_left_minutes == 10
    assert ctx.history.worked_solutions == ["sol1"]
    assert ctx.history.failed_solutions == ["sol2"]


def test_resolve_context_does_not_override_teacher_provided_grade_subject():
    db = DummyDB()
    teacher_id = "t1"

    fake_teacher = SimpleNamespace(years_experience=None, language="Hindi")

    with patch("app.core.context_resolver.first_by_id", return_value=fake_teacher), \
         patch("app.core.context_resolver.first_by_field", return_value=None), \
         patch("app.core.context_resolver.all_by_field", return_value=[]):

        ctx = resolve_context(
            db=db,
            teacher_id=teacher_id,
            raw_prompt="Help now",
            grade=5,
            subject="EVS",
            language="English",
            time_left_minutes=None,
        )

    assert ctx.classroom.grade == 5
    assert ctx.classroom.subject == "EVS"
    assert ctx.classroom.language == "English"
    # preferred_language comes from request language first
    assert ctx.teacher.preferred_language == "English"
