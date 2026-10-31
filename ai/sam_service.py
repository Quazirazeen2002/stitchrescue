
import os
import base64
from pathlib import Path

from dotenv import load_dotenv
from openai import AsyncOpenAI
from meta_sam_parser import image_segmentation_format, parse_responses_stream

from core.config import PROJECT_ROOT
load_dotenv(PROJECT_ROOT / ".env")

BASE_URL = os.getenv("META_BASE_URL", os.getenv("META_API_BASE_URL", "https://api.meta.ai/v1"))
MODEL = os.getenv("SAM_MODEL", "sam-3.1")


def get_sam_client():
    key = os.getenv("MODEL_API_KEY")

    if not key:
        raise RuntimeError("MODEL_API_KEY is missing.")

    return AsyncOpenAI(
        api_key=key,
        base_url=BASE_URL,
        timeout=120.0,
        max_retries=1,
    )


def image_to_data_url(image_path):
    path = Path(image_path)

    mime_types = {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".webp": "image/webp",
    }

    mime = mime_types.get(path.suffix.lower())

    if not mime:
        raise ValueError("Unsupported image format.")

    encoded = base64.b64encode(
        path.read_bytes()
    ).decode("utf-8")

    return f"data:{mime};base64,{encoded}"


async def segment_fabric(image_path, prompt="fabric defect"):
    """
    Run SAM 3.1 segmentation.

    SAM segments the prompted visual concept.
    It does not independently classify defect types.
    """

    client = get_sam_client()
    image_url = image_to_data_url(image_path)

    async with client.responses.stream(
        model=MODEL,
        input=[
            {
                "type": "message",
                "role": "user",
                "content": [
                    {
                        "type": "input_text",
                        "text": prompt,
                    },
                    {
                        "type": "input_image",
                        "image_url": image_url,
                    },
                ],
            }
        ],
        metadata={
            "mask_encoding": "one_bit"
        },
    ) as stream:

        parsed = parse_responses_stream(stream, image_segmentation_format())
        result = await parsed.final_result()

    if result.outcome.status != "completed":
        raise RuntimeError(
            f"SAM response incomplete: {result.outcome}"
        )

    boxes = [record for record in result.records if record.kind == "box"]
    masks = [record for record in result.records if record.kind == "mask"]

    return {
        "boxes": boxes,
        "masks": masks,
        "raw_output": result.raw_output,
        "outcome": result.outcome.status,
        "diagnostics": result.diagnostics,
    }
