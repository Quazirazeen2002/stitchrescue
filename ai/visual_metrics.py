import numpy as np


def calculate_iou(ground_truth, prediction):
    gt = np.asarray(ground_truth, dtype=bool)
    pred = np.asarray(prediction, dtype=bool)

    if gt.shape != pred.shape:
        raise ValueError("Mask dimensions must match.")

    intersection = np.logical_and(gt, pred).sum()
    union = np.logical_or(gt, pred).sum()

    if union == 0:
        return 1.0

    return float(intersection / union)


def calculate_dice(ground_truth, prediction):
    gt = np.asarray(ground_truth, dtype=bool)
    pred = np.asarray(prediction, dtype=bool)

    if gt.shape != pred.shape:
        raise ValueError("Mask dimensions must match.")

    intersection = np.logical_and(gt, pred).sum()
    denominator = gt.sum() + pred.sum()

    if denominator == 0:
        return 1.0

    return float(2 * intersection / denominator)


def evaluate_masks(ground_truth, prediction):
    return {
        "iou": round(
            calculate_iou(ground_truth, prediction), 4
        ),
        "dice": round(
            calculate_dice(ground_truth, prediction), 4
        ),
    }
