import json
from functools import lru_cache
from pathlib import Path


INTENT_CONFIG_PATH = Path(__file__).with_name("intent_config.json")


@lru_cache
def get_intent_config() -> dict:
    with INTENT_CONFIG_PATH.open("r", encoding="utf-8") as handle:
        return json.load(handle)
