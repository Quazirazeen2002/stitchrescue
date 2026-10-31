from pathlib import Path
from PIL import Image, ImageDraw
import uuid
from core.config import PROJECT_ROOT, STORAGE_PATH

IMAGE_DIR = STORAGE_PATH / "inspections"
IMAGE_DIR.mkdir(parents=True, exist_ok=True)

CLASS_FILE = PROJECT_ROOT / "data/BDFD9/classes.txt"


def load_classes():
    if not CLASS_FILE.exists():
        return {}

    names = [
        line.strip()
        for line in CLASS_FILE.read_text(
            encoding="utf-8-sig"
        ).splitlines()
        if line.strip()
    ]

    return {
        index: name
        for index, name in enumerate(names)
    }


def inspect_image(image, annotation_file=None):
    if image is None:
        raise ValueError("Please upload a fabric image.")

    original = image.convert("RGB")
    result = original.copy()

    width, height = result.size
    overlay = Image.new("RGBA", result.size, (0, 0, 0, 0))
    overlay_draw = ImageDraw.Draw(overlay)

    detections = []
    classes = load_classes()

    if annotation_file:
        text = Path(annotation_file).read_text(
            encoding="utf-8-sig"
        )

        for line_number, line in enumerate(
            text.splitlines(), start=1
        ):
            if not line.strip():
                continue

            values = line.split()
            class_id = int(values[0])
            coords = list(map(float, values[1:]))

            if not all(0 <= value <= 1 for value in coords):
                raise ValueError(
                    f"Invalid coordinates on line {line_number}"
                )

            class_name = classes.get(
                class_id, f"Class {class_id}"
            )

            if len(coords) == 4:
                # Standard YOLO bounding box:
                # center_x, center_y, width, height
                x, y, w, h = coords

                x1 = max(0, (x - w / 2) * width)
                y1 = max(0, (y - h / 2) * height)
                x2 = min(width, (x + w / 2) * width)
                y2 = min(height, (y + h / 2) * height)

                if x2 <= x1 or y2 <= y1:
                    raise ValueError(
                        f"Invalid box on line {line_number}"
                    )

                overlay_draw.rectangle(
                    [x1, y1, x2, y2],
                    outline=(255, 85, 75, 255),
                    width=3,
                    fill=(255, 85, 75, 45)
                )

                detections.append({
                    "class_id": class_id,
                    "class_name": class_name,
                    "type": "bounding_box",
                    "bbox": [x1, y1, x2, y2]
                })

            elif len(coords) >= 6 and len(coords) % 2 == 0:
                # YOLO segmentation polygon:
                # x1,y1,x2,y2,x3,y3,...
                points = [
                    (
                        coords[i] * width,
                        coords[i + 1] * height
                    )
                    for i in range(0, len(coords), 2)
                ]

                overlay_draw.polygon(
                    points,
                    fill=(255, 85, 75, 65)
                )

                overlay_draw.line(
                    points + [points[0]],
                    fill=(255, 65, 55, 255),
                    width=3,
                    joint="curve"
                )

                detections.append({
                    "class_id": class_id,
                    "class_name": class_name,
                    "type": "segmentation_polygon",
                    "points_count": len(points)
                })

            else:
                raise ValueError(
                    f"Unsupported YOLO annotation "
                    f"on line {line_number}"
                )

    result = Image.alpha_composite(
        original.convert("RGBA"),
        overlay
    ).convert("RGB")

    # Draw labels on top of the segmentation overlay
    draw = ImageDraw.Draw(result)

    for detection in detections:
        if detection["type"] == "bounding_box":
            x, y = detection["bbox"][:2]
        else:
            # Position near first polygon point is not stored,
            # so label in the top-left for this simple viewer.
            x, y = 10, 10 + detections.index(detection) * 20

        draw.text(
            (int(x), int(y)),
            detection["class_name"],
            fill=(180, 20, 20)
        )

    filename = f"{uuid.uuid4().hex}.png"
    saved_path = IMAGE_DIR / filename
    original.save(saved_path)

    return result, detections, str(saved_path)
