import os

LLM_PROVIDER = os.getenv("LLM_PROVIDER", "pollinations")
INTENT_LLM_FALLBACK = os.getenv("INTENT_LLM_FALLBACK", "false").lower() in {
    "1",
    "true",
    "yes",
}
