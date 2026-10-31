import os

from dotenv import load_dotenv
from openai import AsyncOpenAI
from agents import (
    OpenAIChatCompletionsModel,
    set_tracing_disabled
)

from core.config import PROJECT_ROOT
load_dotenv(PROJECT_ROOT / ".env")

set_tracing_disabled(True)


def get_meta_model():
    key = os.getenv("MODEL_API_KEY")
    base_url = os.getenv("META_BASE_URL", os.getenv("META_API_BASE_URL", "https://api.meta.ai/v1"))

    model_name = os.getenv("META_MODEL", os.getenv("MUSE_WONDER_MODEL", "muse-wonder-1.0"))

    if not key:
        raise RuntimeError(
            "MODEL_API_KEY is missing from .env"
        )

    client = AsyncOpenAI(
        api_key=key,
        base_url=base_url,
        timeout=60.0,
        max_retries=1
    )

    return OpenAIChatCompletionsModel(
        model=model_name,
        openai_client=client
    )

