"""Public response contracts; SQLite rows and credentials stay behind the API."""
from __future__ import annotations
from pydantic import BaseModel,ConfigDict
from typing import Any

class RollResponse(BaseModel):
    model_config=ConfigDict(extra='ignore')
    roll_id:str
    supplier:str
    fabric_type:str
    color:str|None=None
    length_m:float
    order_id:str
    status:str
    composition:str|None=None
    width_cm:float|None=None
    gsm:float|None=None
    purchase_order:str|None=None
    received_date:str|None=None
    created_at:str|None=None

class ImageResponse(BaseModel):
    id:int
    roll_id:str
    sha256:str
    width_px:int
    height_px:int
    media_type:str
    uploaded_by:str
    created_at:str

class ScenarioResponse(BaseModel):
    model_config=ConfigDict(extra='allow')
    strategy:str
    recoverable_quantity:int
    unrecovered_quantity:int
    estimated_cost_bdt:float
    estimated_hours:float
    deadline_fits:bool
    deadline_feasibility:str
    required_approvals:list[str]
    assumptions:list[str]
    missing_information:list[str]
    potential_penalty_exposure_bdt:float

class RecoveryResponse(BaseModel):
    order_id:str
    order_quantity:int
    accepted_quantity:int
    affected_quantity:int
    recovery_target:int
    available_hours:float
    currency:str
    scenario_relationship:str
    inputs:dict[str,Any]
    scenarios:list[ScenarioResponse]

class ApprovalResponse(BaseModel):
    id:int
    recovery_plan_id:int
    requested_by:str
    decision:str
    decision_notes:str|None=None
    decided_by:str|None=None
    created_at:str
    decided_at:str|None=None
