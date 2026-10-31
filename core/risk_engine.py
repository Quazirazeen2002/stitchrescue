
from math import ceil


def calculate_risk(order):
    quantity = order["quantity"]
    completed = order["completed"]
    rejected = order["rejected"]
    hours_left = order["hours_left"]
    hourly_capacity = order["hourly_capacity"]

    if not (0 <= rejected <= completed <= quantity):
        raise ValueError("Invalid production quantities")

    accepted = completed - rejected
    remaining = quantity - accepted

    if hourly_capacity <= 0:
        required_hours = float("inf")
    else:
        required_hours = remaining / hourly_capacity

    buffer_hours = hours_left - required_hours

    if buffer_hours < 0:
        risk = "CRITICAL"
    elif buffer_hours < 12:
        risk = "HIGH"
    else:
        risk = "LOW"

    return {
        "order_id": order["id"],
        "accepted_units": accepted,
        "remaining_units": remaining,
        "required_hours": round(required_hours, 2),
        "hours_left": hours_left,
        "buffer_hours": round(buffer_hours, 2),
        "risk": risk,
        "penalty_exposure_bdt": order["penalty_bdt"]
    }
