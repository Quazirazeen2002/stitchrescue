import json

from agents import function_tool

from ai.knowledge import search_knowledge
from core.database import (
    get_order,
    get_incidents,
)
from core.risk_engine import calculate_risk
from core.linewatch import format_linewatch_context

@function_tool
def retrieve_factory_knowledge(query: str) -> str:
    """Search demo factory SOP and quality documents."""
    results = search_knowledge(query)

    return json.dumps(
        results,
        ensure_ascii=False
    )


@function_tool
def get_production_risk(order_id: str) -> str:
    """Retrieve order and calculate production risk"""

    order = get_order(order_id)

    if order is None:

        return json.dumps({
            "error": "Order not found"
        })

    return json.dumps(
        calculate_risk(order),
        ensure_ascii=False
    )



@function_tool
def get_quality_incidents(order_id: str) -> str:
    """Retrieve recorded incidents for an order."""
    incidents = [
        item
        for item in get_incidents()
        if item["order_id"] == order_id
    ]

    return json.dumps(
        incidents,
        ensure_ascii=False
    )


@function_tool
def investigate_production_batch(batch_id: str) -> str:
    """
    Trace a production batch to fabric rolls,
    verified defect observations and machine events
    """
    try:
        return format_linewatch_context(batch_id)
    except ValueError as exc:
        return json.dumps({"error": str(exc)})

    
