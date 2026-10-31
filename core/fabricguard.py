from pathlib import Path
from PIL import Image
import shutil
import uuid

from core.database import (
    get_fabric_roll,
    save_defect_observation,
)

IMAGE_DIR = Path(__file__).resolve().parents[1] / "storage/fabricguard/images"
IMAGE_DIR.mkdir(parents=True, exist_ok=True)


def record_fabric_observation(
    roll_id,
    image_path,
    defect_label,
    position_m,
    width_position,
    evidence_source,
    notes
):
    if not roll_id:
        raise ValueError("Select or register a fabric roll first.")

    roll = get_fabric_roll(roll_id)

    if not roll:
        raise ValueError("Fabric roll does not exist.")

    source = Path(image_path)

    if not source.exists():
        raise ValueError("Image file not found.")

    if source.suffix.lower() not in {
        ".jpg", ".jpeg", ".png", ".webp"
    }:
        raise ValueError("Unsupported image format.")

    with Image.open(source) as image:
        image.verify()

    if position_m is not None:
        if not 0 <= position_m <= roll["length_m"]:
            raise ValueError(
                "Defect position exceeds roll length."
            )

    if width_position is not None:
        if not 0 <= width_position <= 100:
            raise ValueError(
                "Width position must be between 0 and 100%."
            )

    if evidence_source not in {
        "HUMAN_REPORTED",
        "BDFD9_GROUND_TRUTH",
        "MODEL_PREDICTION"
    }:
        raise ValueError("Invalid evidence source.")

    if not defect_label.strip():
        raise ValueError("Defect label is required.")

    destination = IMAGE_DIR / (
        f"{uuid.uuid4().hex}{source.suffix.lower()}"
    )

    shutil.copy2(source, destination)

    try:
        observation_id = save_defect_observation(
            roll_id=roll_id,
            image_path=str(destination),
            defect_label=defect_label.strip(),
            position_m=position_m,
            width_position=width_position,
            evidence_source=evidence_source,
            inspector_notes=notes
        )
    except Exception:
        destination.unlink(missing_ok=True)
        raise

    return observation_id, str(destination)
