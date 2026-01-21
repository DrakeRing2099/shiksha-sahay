def build_teaching_insight_prompt(
    raw_query: str,
    ai_response: str,
    resolved_context: dict,
) -> str:
    return f"""
You are converting a successful classroom solution into a reusable teaching insight.

INPUT:
Teacher Problem:
{raw_query}

AI Solution:
{ai_response}

Context:
{resolved_context}

TASK:
Convert this into a GENERAL teaching insight that can help OTHER teachers.

RULES:
- Remove any personal references
- Generalize the situation
- Keep it practical and short
- Do NOT mention the original teacher
- Do NOT include teacher identifiers
- Output MUST be valid JSON ONLY
- No markdown
- No explanation text

OUTPUT FORMAT (STRICT JSON):
{{
  "title": "...",
  "generalized_context": {{
    "grade": "...",
    "subject": "...",
    "language": "...",
    "constraints": "..."
  }},
  "reframed_problem": "...",
  "reframed_solution": "..."
}}
"""
