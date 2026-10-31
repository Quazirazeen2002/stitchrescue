
# core/linewatch.py

import json

from core.database import (
    get_batch_trace,
    get_machine_events,
)


def investigate_batch(batch_id):
    trace = get_batch_trace(batch_id)

    if not trace:
        raise ValueError("Production batch not found.")

    batch = trace["batch"]

    machine_events = get_machine_events(
        batch["cutting_line"]
    )

    verified = [
        x for x in trace["observations"]
        if x["verification_status"] == "VERIFIED"
    ]

    pending = [
        x for x in trace["observations"]
        if x["verification_status"] == "PENDING"
    ]

    return {
        "batch": batch,
        "linked_rolls": trace["rolls"],
        "verified_defects": verified,
        "pending_observations": pending,
        "machine_events": machine_events,
        "investigation_status": (
            "EVIDENCE_AVAILABLE"
            if verified or machine_events
            else "INSUFFICIENT_EVIDENCE"
        )
    }


def format_linewatch_context(batch_id):
    result = investigate_batch(batch_id)

    return json.dumps(
        result,
        indent=2,
        ensure_ascii=False
    )
