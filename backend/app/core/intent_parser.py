import re
from typing import Any, Dict, List, Optional, Tuple

from app.core.intent_config import get_intent_config
from app.core.intent_llm import classify_intent_with_llm
from app.core.intent_schema import IntentResult


_STOPWORDS = {
    "a", "an", "the", "my", "your", "this", "that", "these", "those",
    "class", "lesson", "chapter", "topic", "about", "on", "for", "to",
}


def parse_intent(
    *,
    normalized_text: str,
    metadata: Optional[Dict[str, Any]] = None,
    llm: Optional[Any] = None,
) -> IntentResult:
    config = get_intent_config()
    metadata = metadata or {}

    text = _normalize_text(normalized_text)

    slots = _extract_slots(text, metadata, config)
    scored = _score_intents(text, config)
    top_intent, confidence, ambiguous, top_two = _select_intent(scored, config)

    needs_clarification, questions = _clarification_for_slots(
        top_intent, slots, ambiguous, top_two, config
    )

    required_slots = _required_slots_for_intent(top_intent, config)
    if required_slots and all(slots.get(slot) is not None for slot in required_slots):
        confidence = min(1.0, confidence + 0.25)

    if llm and (ambiguous or confidence < config["min_confidence"]):
        llm_result = classify_intent_with_llm(
            llm=llm,
            normalized_text=normalized_text,
            intents=config["intents"],
            slot_schema=config["slots"],
        )
        if llm_result:
            top_intent = llm_result.intent
            confidence = llm_result.confidence
            slots = llm_result.slots
            needs_clarification, questions = _clarification_for_slots(
                top_intent, slots, False, top_two, config
            )

    if not top_intent:
        top_intent = config["fallback_intent"]
        confidence = 0.0
        needs_clarification = True
        questions = _default_clarification_questions(config)

    if top_intent == config["fallback_intent"] and confidence == 0.0:
        needs_clarification = True
        questions = questions or _default_clarification_questions(config)

    final_required_slots = _required_slots_for_intent(top_intent, config)
    if confidence < config["min_confidence"] and not needs_clarification and final_required_slots:
        needs_clarification = True
        questions = questions or _default_clarification_questions(config)

    confidence = max(0.0, min(confidence, 1.0))

    return IntentResult(
        intent=top_intent,
        slots=slots,
        confidence=confidence,
        needs_clarification=needs_clarification,
        clarification_questions=questions,
        normalized_text=normalized_text,
    )


def _normalize_text(text: str) -> str:
    return re.sub(r"\s+", " ", text.strip().lower())


def _score_intents(text: str, config: Dict[str, Any]) -> List[Tuple[str, float]]:
    results: List[Tuple[str, float]] = []
    for intent in config["intents"]:
        intent_id = intent["id"]
        triggers = intent.get("triggers", [])
        if not triggers:
            results.append((intent_id, 0.0))
            continue

        matched = 0.0
        for trigger in triggers:
            trigger = trigger.lower()
            weight = 2.0 if " " in trigger else 1.0
            if _matches_trigger(text, trigger):
                matched += weight
        score = min(1.0, matched / 3.0) if matched else 0.0
        results.append((intent_id, score))
    return results


def _matches_trigger(text: str, trigger: str) -> bool:
    if " " in trigger:
        return trigger in text
    return re.search(rf"\b{re.escape(trigger)}\b", text) is not None


def _select_intent(
    scored: List[Tuple[str, float]],
    config: Dict[str, Any],
) -> Tuple[str, float, bool, List[Tuple[str, float]]]:
    if not scored:
        return config["fallback_intent"], 0.0, True, []
    ranked = sorted(scored, key=lambda item: item[1], reverse=True)
    top_intent, top_score = ranked[0]
    second_score = ranked[1][1] if len(ranked) > 1 else 0.0
    ambiguous = (
        top_score > 0.0
        and second_score > 0.0
        and abs(top_score - second_score) < config["ambiguous_delta"]
    )
    if top_score == 0.0:
        top_intent = config["fallback_intent"]
    return top_intent, top_score, ambiguous, ranked[:2]


def _extract_slots(
    text: str,
    metadata: Dict[str, Any],
    config: Dict[str, Any],
) -> Dict[str, Any]:
    slot_schema = config.get("slots", {})
    slots: Dict[str, Any] = {key: None for key in slot_schema.keys()}

    if "grade" in slots:
        slots["grade"] = _extract_grade(text, metadata.get("grade"))
    if "subject" in slots:
        slots["subject"] = _extract_subject(text, metadata.get("subject"), config)
    if "topic" in slots:
        slots["topic"] = _extract_topic(text)
    if "time_left_minutes" in slots:
        slots["time_left_minutes"] = _extract_time_left(
            text, metadata.get("time_left_minutes")
        )

    return slots


def _extract_grade(text: str, provided: Any) -> Optional[int]:
    if isinstance(provided, int) and 1 <= provided <= 12:
        return provided

    patterns = [
        r"\bgrade\s*(\d{1,2})\b",
        r"\bclass\s*(\d{1,2})\b",
        r"\b(\d{1,2})(?:st|nd|rd|th)\s*grade\b",
    ]
    for pattern in patterns:
        match = re.search(pattern, text)
        if match:
            value = int(match.group(1))
            if 1 <= value <= 12:
                return value
    return None


def _extract_subject(
    text: str,
    provided: Any,
    config: Dict[str, Any],
) -> Optional[str]:
    subject_map = config.get("subjects", {})

    if isinstance(provided, str) and provided.strip():
        candidate = provided.strip().lower()
        for canonical, synonyms in subject_map.items():
            if candidate == canonical.lower() or candidate in synonyms:
                return canonical
        return provided.strip()

    for canonical, synonyms in subject_map.items():
        for synonym in synonyms:
            if _matches_trigger(text, synonym.lower()):
                return canonical
    return None


def _extract_topic(text: str) -> Optional[str]:
    patterns = [
        r"\b(?:topic|chapter|lesson|concept)\s*(?:on|about)?\s+(?P<topic>[a-z0-9][a-z0-9\-\s]{2,60})",
        r"\b(?:on|about)\s+(?P<topic>[a-z0-9][a-z0-9\-\s]{2,60})",
    ]
    for pattern in patterns:
        match = re.search(pattern, text)
        if not match:
            continue
        topic = match.group("topic")
        topic = re.split(r"[?.!,;:]", topic)[0]
        topic = re.split(r"\b(for|in|with|grade|class|subject)\b", topic)[0]
        words = topic.split()
        cleaned: List[str] = []
        for word in words:
            if word in _STOPWORDS:
                continue
            cleaned.append(word)
            if len(cleaned) >= 6:
                break
        if cleaned:
            return " ".join(cleaned)
    return None


def _extract_time_left(text: str, provided: Any) -> Optional[int]:
    if isinstance(provided, int) and provided > 0:
        return provided

    match = re.search(r"\b(\d{1,3})\s*(?:minutes|minute|mins|min)\b", text)
    if match:
        return int(match.group(1))
    return None


def _clarification_for_slots(
    intent_id: str,
    slots: Dict[str, Any],
    ambiguous: bool,
    top_two: List[Tuple[str, float]],
    config: Dict[str, Any],
) -> Tuple[bool, List[str]]:
    required_slots = _required_slots_for_intent(intent_id, config)
    missing = [slot for slot in required_slots if slots.get(slot) is None]

    questions: List[str] = []
    for slot in missing:
        question = config.get("slot_questions", {}).get(slot)
        if question:
            questions.append(question)

    if ambiguous and len(top_two) >= 2:
        labels = _intent_labels(top_two, config)
        if labels:
            questions.append(
                f"Do you want help with {labels[0]} or {labels[1]}?"
            )

    needs_clarification = bool(missing) or ambiguous
    if needs_clarification and not questions:
        questions = _default_clarification_questions(config)

    return needs_clarification, questions


def _required_slots_for_intent(intent_id: str, config: Dict[str, Any]) -> List[str]:
    for intent in config["intents"]:
        if intent["id"] == intent_id:
            return intent.get("required_slots", [])
    return []


def _intent_labels(
    ranked: List[Tuple[str, float]],
    config: Dict[str, Any],
) -> List[str]:
    label_map = {
        intent["id"]: intent.get("label") or intent["id"].replace("_", " ")
        for intent in config["intents"]
    }
    labels = []
    for intent_id, _score in ranked[:2]:
        label = label_map.get(intent_id)
        if label:
            labels.append(label)
    return labels


def _default_clarification_questions(config: Dict[str, Any]) -> List[str]:
    return [
        "Can you share a bit more detail about what you need?",
        "If this is for a lesson, which grade and subject is it for?",
    ]
