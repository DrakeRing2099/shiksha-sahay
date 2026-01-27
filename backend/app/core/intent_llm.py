import json
import re
from typing import Any, Dict, List, Optional

from app.core.intent_schema import IntentResult


def _extract_json_block(text: str) -> Optional[str]:
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if not match:
        return None
    return match.group(0)


def classify_intent_with_llm(
    *,
    llm: Any,
    normalized_text: str,
    intents: List[Dict[str, Any]],
    slot_schema: Dict[str, Dict[str, Any]],
) -> Optional[IntentResult]:
    intent_options = [
        {"id": intent["id"], "description": intent.get("description", "")}
        for intent in intents
    ]
    slot_names = list(slot_schema.keys())

    prompt = (
        "You are an intent router. Choose the single best intent for the input.\n"
        "Return JSON only with keys: intent, slots, confidence, needs_clarification, "
        "clarification_questions, normalized_text.\n"
        f"Allowed intents: {json.dumps(intent_options)}\n"
        f"Allowed slots: {json.dumps(slot_names)}\n"
        "Rules:\n"
        "- Use only the allowed intent IDs.\n"
        "- Use only the allowed slot keys.\n"
        "- Do not guess missing required slots; leave them null.\n"
        "- normalized_text must match the input exactly.\n"
        f"Input: {normalized_text}\n"
    )

    raw = llm.generate(prompt)
    json_block = _extract_json_block(raw)
    if not json_block:
        return None

    try:
        payload = json.loads(json_block)
    except json.JSONDecodeError:
        return None

    if not isinstance(payload, dict):
        return None

    intent_id = payload.get("intent")
    if intent_id not in {intent["id"] for intent in intents}:
        return None

    slots_payload = payload.get("slots") or {}
    if not isinstance(slots_payload, dict):
        slots_payload = {}

    cleaned_slots: Dict[str, Any] = {}
    for key in slot_names:
        value = slots_payload.get(key)
        if value in ("", [], {}):
            value = None
        slot_type = slot_schema.get(key, {}).get("type")
        if slot_type == "int" and value is not None:
            try:
                value = int(value)
            except (TypeError, ValueError):
                value = None
        cleaned_slots[key] = value

    confidence = payload.get("confidence")
    if not isinstance(confidence, (int, float)):
        confidence = 0.0
    confidence = max(0.0, min(float(confidence), 1.0))

    needs_clarification = payload.get("needs_clarification")
    needs_clarification = bool(needs_clarification) if needs_clarification is not None else False

    clarification_questions = payload.get("clarification_questions") or []
    if not isinstance(clarification_questions, list):
        clarification_questions = []

    return IntentResult(
        intent=intent_id,
        slots=cleaned_slots,
        confidence=confidence,
        needs_clarification=needs_clarification,
        clarification_questions=[str(q) for q in clarification_questions],
        normalized_text=normalized_text,
    )
