import json
from app.core.llm import get_llm, LLMError
from app.core.teaching_insight_prompt import build_teaching_insight_prompt
import re

class TeachingInsightGenerationError(RuntimeError):
    pass


def generate_teaching_insight(
    raw_query: str,
    ai_response: str,
    resolved_context: dict,
) -> dict:
    llm = get_llm()

    prompt = build_teaching_insight_prompt(
        raw_query=raw_query,
        ai_response=ai_response,
        resolved_context=resolved_context,
    )

    try:
        output = llm.generate(prompt)
        # print("🧠 RAW LLM OUTPUT:\n", output)

        # 🛡️ Extract JSON defensively (LLMs often add text)
        match = re.search(r"\{.*\}", output, re.DOTALL)
        if not match:
            raise TeachingInsightGenerationError(
                f"No JSON found in LLM output:\n{output}"
            )

        data = json.loads(match.group(0))

    except json.JSONDecodeError as e:
        raise TeachingInsightGenerationError(
            f"Invalid JSON from LLM: {e}"
        )
    except LLMError as e:
        raise TeachingInsightGenerationError(str(e))

    # =========================
    # 🔁 Normalize LLM output
    # =========================

    problem = (
        data.get("problem")
        or data.get("reframed_problem")
        or data.get("problem_statement")
    )

    solution = (
        data.get("solution")
        or data.get("reframed_solution")
        or data.get("solution_steps")
    )

    if not problem or not solution:
        raise TeachingInsightGenerationError(
            f"Missing problem/solution in insight JSON. "
            f"Keys present: {list(data.keys())}"
        )

    # Ensure solution is List[str]
    if isinstance(solution, str):
        solution = [solution]
    elif not isinstance(solution, list):
        raise TeachingInsightGenerationError(
            "`solution` must be a string or list of strings"
        )

    # =========================
    # ✅ Final normalized output
    # =========================

    return {
        "title": data.get("title", "Untitled Teaching Insight"),
        "generalized_context": data.get("generalized_context", {}),
        "problem": problem,
        "solution": solution,
    }
