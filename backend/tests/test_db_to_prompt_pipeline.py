from types import SimpleNamespace
from unittest.mock import patch

from app.core.context_resolver import resolve_context
from app.core.prompt_builder import build_prompt
from app.models import SolutionOutcome


class DummyDB:
    pass


def test_missing_input_context_is_filled_from_db_and_injected_into_prompt():
    db = DummyDB()
    teacher_id = "t1"

    fake_teacher = SimpleNamespace(years_experience=10, language="Hindi")
    fake_style = SimpleNamespace(interactive_vs_passive=6, light_vs_strict=4, conventional_vs_modern=5)
    fake_tcs = SimpleNamespace(grade_id=4, subject_id="Mathematics")
    fake_outcomes = []

    with patch("app.core.context_resolver.first_by_id", return_value=fake_teacher), \
         patch("app.core.context_resolver.first_by_field") as mock_first, \
         patch("app.core.context_resolver.all_by_field", return_value=fake_outcomes):

        def side_effect(db_arg, model, field, value):
            if "TeacherStyle" in model.__name__:
                return fake_style
            if "TeacherClassSubject" in model.__name__:
                return fake_tcs
            return None

        mock_first.side_effect = side_effect

        # Teacher provides ONLY raw prompt — no grade/subject
        ctx = resolve_context(
            db=db,
            teacher_id=teacher_id,
            raw_prompt="Class is noisy and subtraction with zero is confusing",
            grade=None,
            subject=None,
            language=None,
            time_left_minutes=None
        )

        prompt = build_prompt(ctx)

    # Assert DB-derived context made it into final prompt
    assert "Grade: 4" in prompt
    assert "Subject: Mathematics" in prompt
    assert "Class is noisy" in prompt
