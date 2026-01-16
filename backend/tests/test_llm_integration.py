import os
import re
import pytest
from types import SimpleNamespace
from unittest.mock import patch

from fastapi.testclient import TestClient

from app.main import app
from app.models import SolutionOutcome

client = TestClient(app)

RUN = os.getenv("RUN_LLM_TESTS") == "1"


@pytest.mark.skipif(not RUN, reason="Set RUN_LLM_TESTS=1 to run live LLM integration tests")
def test_pipeline_prompt_is_reflected_in_llm_output():
    """
    Non-deterministic integration test:
    - Mock DB fetchers to inject context (grade/subject/language/experience/style)
    - Call /api/coach
    - Assert output follows required structure and references some injected context.
    """

    # ---- Mock DB layer (inject context without a real DB) ----
    fake_teacher = SimpleNamespace(years_experience=9, language="Hindi")
    fake_style = SimpleNamespace(interactive_vs_passive=7, light_vs_strict=4, conventional_vs_modern=5)
    fake_tcs = SimpleNamespace(grade_id=4, subject_id="Mathematics")

    fake_outcomes = [
        SimpleNamespace(solution_id="peer_explanation", outcome=SolutionOutcome.worked),
    ]

    def first_by_field_side_effect(db_arg, model, field, value):
        name = getattr(model, "__name__", str(model))
        if "TeacherStyle" in name:
            return fake_style
        if "TeacherClassSubject" in name:
            return fake_tcs
        return None

    with patch("app.core.context_resolver.first_by_id", return_value=fake_teacher), \
         patch("app.core.context_resolver.first_by_field") as mock_first, \
         patch("app.core.context_resolver.all_by_field", return_value=fake_outcomes):

        mock_first.side_effect = first_by_field_side_effect

        # ---- Half-ass input (missing grade/subject/language) ----
        payload = {
            "teacher_id": "t1",
            "prompt": "Group subtraction got noisy. Kids stuck when tens digit is 0. Need quick fix.",
            "grade": None,
            "subject": None,
            "language": None,
            "time_left_minutes": 10
        }

        r = client.post("/api/coach", json=payload)
        assert r.status_code == 200, r.text

        data = r.json()
        output = data["output"]
        context_used = data["context_used"]

    # ---- Assert context actually got filled (pipeline sanity) ----
    assert context_used["classroom"]["grade"] == 4
    assert context_used["classroom"]["subject"] in ["Mathematics", "Mathematics"]  # stringified
    assert context_used["teacher"]["years_experience"] == 9

    # ---- Non-deterministic output checks (structure + reflection) ----
    assert isinstance(output, str)
    assert len(output.strip()) > 40  # not empty / not trivial

    # Required sections (weak matching)
    # We told the model to output these 4 bullets/sections in prompt_builder.
    must_have = [
        "Control",
        "Concept",
        "Extension",
        "Quick"
    ]
    hits = sum(1 for k in must_have if re.search(k, output, re.IGNORECASE))
    assert hits >= 2, f"Output missing expected structure keywords. Output:\n{output}"

    # Reflection of injected context (weak, not perfect)
    # At least mention Grade 4 or subtraction/place value context.
    reflective_hits = 0
    if re.search(r"\bgrade\s*4\b|\bclass\s*4\b", output, re.IGNORECASE):
        reflective_hits += 1
    if re.search(r"subtraction|borrow|place\s*value|tens", output, re.IGNORECASE):
        reflective_hits += 1

    assert reflective_hits >= 1, f"Output didn't reflect context/problem enough. Output:\n{output}"
