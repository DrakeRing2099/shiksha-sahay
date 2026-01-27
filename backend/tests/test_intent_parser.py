from app.core.intent_parser import parse_intent


def test_parse_intent_lesson_plan_with_slots():
    result = parse_intent(
        normalized_text="Plan a lesson on fractions for grade 5 math."
    )

    assert result.intent == "lesson_plan"
    assert result.slots.get("grade") == 5
    assert result.slots.get("subject") == "Mathematics"
    assert result.slots.get("topic") == "fractions"
    assert result.needs_clarification is False


def test_parse_intent_missing_required_slots_requests_clarification():
    result = parse_intent(
        normalized_text="I need a quiz."
    )

    assert result.intent == "assessment"
    assert result.needs_clarification is True
    assert any("grade" in q.lower() for q in result.clarification_questions)
    assert any("subject" in q.lower() for q in result.clarification_questions)


def test_parse_intent_ambiguous_intents_are_flagged():
    result = parse_intent(
        normalized_text=(
            "Need an activity game and a quiz test for grade 5 math on fractions."
        )
    )

    assert result.needs_clarification is True
    assert any(
        "activity" in q.lower() or "assessment" in q.lower() or "quiz" in q.lower()
        for q in result.clarification_questions
    )
