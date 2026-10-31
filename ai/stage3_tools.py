"""Bounded typed agent tools. Human mutations require SDK approval and are not
attached to the autonomous report agents. Approval decisions are never tools.
"""
from agents import function_tool
from backend.schemas.models import (RollCreate, ObservationCreate, Verification, RollStatus,
    BatchCreate, Allocation, MachineEvent, RecoveryInput, PlanCreate, ApprovalRequest)
from backend.services import fabricguard as fg, linewatch as lw
from core import orderrescue as recovery

@function_tool(needs_approval=True)
def register_fabric_roll(data: RollCreate) -> dict:
    """Register a uniquely identified fabric roll after human approval."""
    return fg.register_roll(data)

@function_tool
def get_fabric_roll(roll_id: str) -> dict:
    """Retrieve an existing roll with its recorded evidence and provenance."""
    return fg.roll_history(roll_id)

@function_tool(needs_approval=True)
def record_defect_observation(data: ObservationCreate) -> dict:
    """Record pending defect evidence on an already uploaded roll photograph."""
    return fg.record_observation(data)

@function_tool(needs_approval=True)
def verify_defect_observation(observation_id: int, data: Verification) -> dict:
    """Record a human inspector decision only after explicit SDK approval."""
    return fg.verify_observation(observation_id,data)

@function_tool(needs_approval=True)
def update_fabric_roll_status(roll_id: str, data: RollStatus) -> dict:
    """Record an authorized roll status transition after human review."""
    return fg.update_status(roll_id,data)

@function_tool
def get_fabric_roll_history(roll_id: str) -> dict:
    """Retrieve registration, photographs, observations, verifications and allocations."""
    return fg.roll_history(roll_id)

@function_tool(needs_approval=True)
def register_production_batch(data: BatchCreate) -> dict:
    """Register an order-linked production batch after human approval."""
    return lw.register_batch(data)

@function_tool(needs_approval=True)
def link_roll_to_batch(batch_id: str, data: Allocation) -> dict:
    """Allocate available fabric to a same-order batch after human approval."""
    return lw.allocate_roll(batch_id,data)

@function_tool(needs_approval=True)
def record_machine_event(data: MachineEvent) -> dict:
    """Record a named person's machine event after human approval."""
    return lw.record_event(data)

@function_tool
def investigate_production_batch(batch_id: str) -> dict:
    """Trace both production lines and separate verified, pending and correlated evidence."""
    return lw.investigate_batch(batch_id)

@function_tool
def calculate_order_recovery(data: RecoveryInput) -> dict:
    """Calculate independent recovery alternatives using supplied estimates only."""
    return recovery.calculate_recovery(data)

@function_tool(needs_approval=True)
def save_recovery_plan(data: PlanCreate) -> dict:
    """Save a proposed plan after approval to persist; does not authorize execution."""
    return recovery.save_plan(data)

@function_tool(needs_approval=True)
def request_recovery_approval(data: ApprovalRequest) -> dict:
    """Create a pending human decision request, never an approval decision."""
    return recovery.request_approval(data)

READ_TOOLS=[get_fabric_roll,get_fabric_roll_history,investigate_production_batch,calculate_order_recovery]
MUTATION_TOOLS=[register_fabric_roll,record_defect_observation,verify_defect_observation,
    update_fabric_roll_status,register_production_batch,link_roll_to_batch,record_machine_event,
    save_recovery_plan,request_recovery_approval]
