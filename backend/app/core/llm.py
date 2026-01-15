from __future__ import annotations

from functools import lru_cache
from dataclasses import dataclass

from app.core.config import LLM_PROVIDER

# ---------- Errors ----------

class LLMError(RuntimeError):
    pass


# ---------- Interface ----------

class LLMClient:
    def generate(self, prompt: str) -> str:
        raise NotImplementedError


# ---------- Pollinations Provider ----------

class PollinationsClient(LLMClient):
    def __init__(self):
        from langchain_openai import ChatOpenAI

        self.model = ChatOpenAI(
            base_url="https://text.pollinations.ai/openai/v1",
            api_key="free-testing",     # not validated
            model="openai",
            temperature=0.6,
        )

    def generate(self, prompt: str) -> str:
        full_prompt = (
            "You are a classroom coaching assistant.\n"
            "Give practical, immediate, in-class advice.\n"
            "Limit to bullet points. No generic pedagogy talk.\n\n"
            f"Teacher problem:\n{prompt}"
        )

        try:
            response = self.model.invoke(full_prompt)
            return response.content.strip()
        except Exception as e:
            raise LLMError(f"Pollinations failed: {e}") from e


# ---------- Provider Switch ----------

@lru_cache(maxsize=1)
def get_llm() -> LLMClient:
    if LLM_PROVIDER == "pollinations":
        return PollinationsClient()

    raise LLMError(f"Unknown LLM_PROVIDER={LLM_PROVIDER}")
