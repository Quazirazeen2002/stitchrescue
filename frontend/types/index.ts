export type RecordData = Record<string, unknown>;
export interface Order {id:string; buyer:string; product:string; quantity:number; accepted_quantity:number; completed:number; rejected:number; hours_left:number; hourly_capacity:number; penalty_bdt:number}
export interface Roll {roll_id:string;supplier:string;fabric_type:string;composition?:string;color:string;length_m:number;status:string;order_id:string}
export interface Batch {batch_id:string;order_id:string;cutting_line:string;sewing_line:string;status:string;planned_quantity:number}
export interface FabricImage {id:number;roll_id:string;url:string;width_px:number;height_px:number;created_at:string}
export interface Observation {id:number;defect_label:string;evidence_source:string;verification_status:string;image_id:number;inspector_notes:string}
export interface RollDetail {roll:Roll;images:FabricImage[];observations:Observation[];verifications:RecordData[];allocations:RecordData[];audit:RecordData[];legacy_audit:RecordData[]}
export interface Scenario {strategy:string;recoverable_quantity:number;unrecovered_quantity:number;estimated_cost_bdt:number;estimated_hours:number;deadline_fits:boolean;deadline_feasibility:string;required_approvals:string[];assumptions:string[];missing_information:string[];potential_penalty_exposure_bdt:number}
export interface Calculation {order_id:string;order_quantity:number;accepted_quantity:number;affected_quantity:number;recovery_target:number;scenarios:Scenario[];inputs:RecordData}
export interface Plan {id:number;order_id:string;recommended_strategy:string;status:string;calculation:Calculation;evidence:{description:string};requested_by:string;created_at:string}
export interface Approval {id:number;recovery_plan_id:number;decision:string;decided_by?:string;decision_notes?:string;requested_by:string;created_at:string}
export interface Report {id:number;report_type:string;order_id:string;batch_id?:string;report:string;evidence_json:string;created_at:string}
export interface Dashboard {counts:Record<string,number>;incidents:RecordData[];activity:RecordData[];defect_distribution:{name:string;value:number}[];production_risks:{order_id:string;risk:string;accepted_units:number;remaining_units:number;required_hours:number;hours_left:number;penalty_exposure_bdt:number}[];recovery_plans:Plan[]}
