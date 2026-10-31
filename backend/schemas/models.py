"""Typed REST and agent inputs shared with deterministic services."""
from __future__ import annotations
from datetime import date, datetime
from typing import Literal
from pydantic import BaseModel, ConfigDict, Field, model_validator

class InputModel(BaseModel):
    model_config = ConfigDict(extra='forbid', str_strip_whitespace=True, allow_inf_nan=False)

class RollCreate(InputModel):
    roll_id: str = Field(min_length=1, max_length=100)
    supplier: str = Field(min_length=1)
    fabric_type: str = Field(min_length=1)
    composition: str = ''
    color: str = ''
    length_m: float = Field(gt=0)
    width_cm: float | None = Field(default=None, gt=0)
    gsm: float | None = Field(default=None, gt=0)
    purchase_order: str = ''
    order_id: str = Field(min_length=1)
    received_date: date | None = None
    actor: str = Field(min_length=1)

class ObservationCreate(InputModel):
    roll_id: str = Field(min_length=1)
    image_id: int = Field(gt=0)
    defect_label: str = Field(min_length=1)
    evidence_source: Literal['HUMAN_REPORTED','BDFD9_GROUND_TRUTH','MODEL_PREDICTION']
    position_m: float | None = Field(default=None, ge=0)
    width_position: float | None = Field(default=None, ge=0, le=100)
    bbox: tuple[float, float, float, float] | None = None
    segmentation_run_id: int | None = Field(default=None, gt=0)
    model_confidence: float | None = Field(default=None, ge=0, le=1)
    inspector_notes: str = ''
    actor: str = Field(min_length=1)

class Verification(InputModel):
    decision: Literal['VERIFIED','REJECTED']
    notes: str = Field(min_length=1)
    inspector: str = Field(min_length=1)

class RollStatus(InputModel):
    status: Literal['RECEIVED','UNDER_INSPECTION','ON_HOLD','QUALITY_CLEARED','CONSUMED']
    actor: str = Field(min_length=1)
    notes: str = Field(min_length=1)

class BatchCreate(InputModel):
    batch_id: str = Field(min_length=1)
    order_id: str = Field(min_length=1)
    cutting_line: str = Field(min_length=1)
    sewing_line: str = Field(min_length=1)
    planned_quantity: int = Field(gt=0)
    produced_quantity: int = Field(default=0, ge=0)
    started_at: datetime | None = None
    completed_at: datetime | None = None
    status: Literal['PLANNED','IN_PROGRESS','COMPLETED','ON_HOLD'] = 'PLANNED'
    actor: str = Field(min_length=1)

    @model_validator(mode='after')
    def quantities(self):
        if self.produced_quantity > self.planned_quantity:
            raise ValueError('Produced quantity exceeds planned quantity.')
        if self.completed_at and self.started_at and self.completed_at < self.started_at:
            raise ValueError('Completion precedes start.')
        return self

class Allocation(InputModel):
    roll_id: str = Field(min_length=1)
    allocated_length_m: float = Field(gt=0)
    actor: str = Field(min_length=1)

class MachineEvent(InputModel):
    machine_id: str = Field(min_length=1)
    production_line: str = Field(min_length=1)
    event_type: Literal['MAINTENANCE','BREAKDOWN','CLEANING','LUBRICATION','INSPECTION']
    description: str = Field(min_length=1)
    event_time: datetime
    recorded_by: str = Field(min_length=1)

class RecoveryInput(InputModel):
    order_id: str = Field(min_length=1)
    accepted_quantity: int = Field(ge=0)
    affected_quantity: int = Field(gt=0)
    available_hours: float = Field(ge=0)
    rework_cost_per_unit: float = Field(ge=0)
    rework_capacity_per_hour: float = Field(gt=0)
    replacement_cost_per_unit: float = Field(ge=0)
    replacement_capacity_per_hour: float = Field(gt=0)
    replacement_material_units: int = Field(ge=0)
    stock_quantity: int = Field(ge=0)
    stock_unit_cost: float = Field(ge=0)
    stock_handling_hours: float = Field(ge=0)
    material_compatible: bool | None = None
    buyer_spec_compatible: bool | None = None
    reinspection_authorized: bool = False
    capacity_confirmed: bool = False
    buyer_partial_authorized: bool = False
    assumptions: str = Field(min_length=1)

class PlanCreate(InputModel):
    inputs: RecoveryInput
    selected_strategy: Literal['REWORK','REPLACEMENT','STOCK_REALLOCATION','PARTIAL_SHIPMENT']
    incident_id: int | None = Field(default=None, gt=0)
    evidence: str = Field(min_length=1)
    requested_by: str = Field(min_length=1)

class ApprovalRequest(InputModel):
    plan_id: int = Field(gt=0)
    requested_by: str = Field(min_length=1)

class ApprovalDecision(InputModel):
    decision: Literal['APPROVED','REJECTED']
    decided_by: str = Field(min_length=1)
    notes: str = Field(min_length=1)
    human_confirmation: Literal[True]

class InvestigationRequest(InputModel):
    order_id: str = Field(min_length=1)
    question: str = Field(min_length=1, max_length=8000)
    batch_id: str | None = None

class IncidentCreate(InputModel):
    order_id: str = Field(min_length=1)
    defect_label: str = Field(min_length=1)
    affected_quantity: int = Field(gt=0)
    actor: str = Field(min_length=1)
