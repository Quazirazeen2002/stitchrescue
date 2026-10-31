"""Deterministic recovery estimates. Every scenario is an independent alternative."""
from __future__ import annotations
import json
from decimal import Decimal, ROUND_HALF_UP
from backend.schemas.models import RecoveryInput, PlanCreate, ApprovalRequest, ApprovalDecision
from core.database import connect, get_order
from core.stage3_db import audit

STRATEGIES=('REWORK','REPLACEMENT','STOCK_REALLOCATION','PARTIAL_SHIPMENT')


def _money(quantity: int, unit_cost: float) -> float:
    return float((Decimal(quantity)*Decimal(str(unit_cost))).quantize(Decimal('.01'), rounding=ROUND_HALF_UP))


def calculate_recovery(data: RecoveryInput) -> dict:
    """Calculate mutually exclusive alternatives using supplied costs and capacities."""
    order=get_order(data.order_id)
    if not order:
        raise ValueError('Order does not exist.')
    if data.accepted_quantity + data.affected_quantity > order['quantity']:
        raise ValueError('Accepted plus affected quantity exceeds order quantity.')
    target=order['quantity']-data.accepted_quantity
    base_missing=[]
    if data.material_compatible is not True: base_missing.append('Confirm material compatibility.')
    if data.buyer_spec_compatible is not True: base_missing.append('Confirm buyer specification compatibility.')
    if not data.reinspection_authorized: base_missing.append('Obtain quality reinspection authorization.')
    if not data.capacity_confirmed: base_missing.append('Confirm actual production capacity availability.')
    scenarios=[]
    def scenario(strategy,quantity,cost,hours,missing,approvals,extra=None):
        outstanding=max(0,target-quantity)
        fits=hours <= data.available_hours
        hard_block=(not fits or (outstanding>0 and strategy!='PARTIAL_SHIPMENT'))
        state='NOT_FEASIBLE' if hard_block else ('CONDITIONAL' if missing else 'FEASIBLE')
        scenarios.append({'strategy':strategy,'recoverable_quantity':quantity,
            'unrecovered_quantity':outstanding,'estimated_cost_bdt':cost,'estimated_hours':round(hours,4),
            'deadline_fits':fits,'deadline_feasibility':state,'required_approvals':approvals,
            'assumptions':[data.assumptions,'Standalone alternative; do not add quantities or capacity across scenarios.',
                'Costs are user-supplied estimates; freight, tax and downtime are excluded.'],
            'missing_information':missing, 'potential_penalty_exposure_bdt':order['penalty_bdt'],
            **(extra or {})})
    scenario('REWORK',data.affected_quantity,_money(data.affected_quantity,data.rework_cost_per_unit),
        data.affected_quantity/data.rework_capacity_per_hour,list(base_missing),
        ['Human manager approval','Quality reinspection'],{'quality_requirement':'Reinspect all reworked garments.'})
    replacement=min(target,data.replacement_material_units)
    missing=list(base_missing)
    if replacement<target: missing.append('Insufficient replacement fabric for full recovery.')
    scenario('REPLACEMENT',replacement,_money(replacement,data.replacement_cost_per_unit),
        replacement/data.replacement_capacity_per_hour,missing,['Human manager approval','Quality acceptance'])
    stock=min(target,data.stock_quantity)
    missing=list(base_missing)
    if stock<target: missing.append('Insufficient approved compatible stock for full recovery.')
    scenario('STOCK_REALLOCATION',stock,_money(stock,data.stock_unit_cost),data.stock_handling_hours,
        missing,['Human manager approval','Stock ownership and buyer compatibility','Quality reinspection'])
    missing=['Record revised delivery schedule and buyer penalty terms.']
    if not data.buyer_partial_authorized: missing.append('Buyer has not authorized partial shipment.')
    if not data.accepted_quantity: missing.append('No accepted units are available to ship.')
    scenario('PARTIAL_SHIPMENT',0,0.0,0.0,missing,['Buyer written authorization','Human manager approval'],
        {'accepted_quantity_available':data.accepted_quantity,'remaining_delivery_quantity':target,
         'cost_scope':'No incremental shipment cost supplied; zero excludes freight and penalties.'})
    return {'order_id':data.order_id,'order_quantity':order['quantity'],
        'accepted_quantity':data.accepted_quantity,'affected_quantity':data.affected_quantity,
        'recovery_target':target,'available_hours':data.available_hours,
        'currency':'BDT','scenario_relationship':'MUTUALLY_EXCLUSIVE_ALTERNATIVES',
        'inputs':data.model_dump(mode='json'),'scenarios':scenarios}


def list_plans() -> list[dict]:
    with connect() as con:
        return [_decode(dict(row)) for row in con.execute('SELECT * FROM recovery_plans ORDER BY id DESC')]


def _decode(row: dict) -> dict:
    row['calculation']=json.loads(row.pop('scenarios_json'))
    row['evidence']=json.loads(row.pop('evidence_json','{}'))
    return row


def get_plan(plan_id: int) -> dict:
    with connect() as con:
        row=con.execute('SELECT * FROM recovery_plans WHERE id=?',(plan_id,)).fetchone()
        if not row: raise ValueError('Recovery plan does not exist.')
        return _decode(dict(row))


def save_plan(data: PlanCreate) -> dict:
    calculation=calculate_recovery(data.inputs)
    with connect() as con:
        if data.incident_id:
            incident=con.execute('SELECT * FROM incidents WHERE id=?',(data.incident_id,)).fetchone()
            if not incident or incident['order_id']!=data.inputs.order_id:
                raise ValueError('Incident does not belong to this order.')
        cur=con.execute('''INSERT INTO recovery_plans(order_id,affected_quantity,accepted_quantity,
            scenarios_json,recommended_strategy,requested_by,incident_id,evidence_json) VALUES (?,?,?,?,?,?,?,?)''',
            (data.inputs.order_id,data.inputs.affected_quantity,data.inputs.accepted_quantity,json.dumps(calculation),
             data.selected_strategy,data.requested_by,data.incident_id,json.dumps({'description':data.evidence})))
        plan_id=cur.lastrowid
        audit(con,'PLAN',str(plan_id),'RECOVERY_PROPOSED',data.requested_by,
              {'strategy':data.selected_strategy,'order_id':data.inputs.order_id})
    return get_plan(plan_id)


def request_approval(data: ApprovalRequest) -> dict:
    with connect() as con:
        con.execute('BEGIN IMMEDIATE')
        row=con.execute('SELECT status FROM recovery_plans WHERE id=?',(data.plan_id,)).fetchone()
        if not row: raise ValueError('Recovery plan does not exist.')
        if row['status']!='PROPOSED': raise ValueError('This plan already has an approval request or decision.')
        cur=con.execute('INSERT INTO approval_requests(recovery_plan_id,requested_by) VALUES (?,?)',
                        (data.plan_id,data.requested_by))
        con.execute("UPDATE recovery_plans SET status='PENDING_APPROVAL' WHERE id=?",(data.plan_id,))
        audit(con,'PLAN',str(data.plan_id),'APPROVAL_REQUESTED',data.requested_by,{'approval_id':cur.lastrowid})
        return {'approval_id':cur.lastrowid,'plan_id':data.plan_id,'status':'PENDING_APPROVAL'}


def list_approvals() -> list[dict]:
    with connect() as con:
        return [dict(r) for r in con.execute('SELECT * FROM approval_requests ORDER BY id DESC')]


def decide_approval(approval_id: int, data: ApprovalDecision) -> dict:
    """Record a human decision only. No manufacturing or financial action is executed."""
    with connect() as con:
        con.execute('BEGIN IMMEDIATE')
        row=con.execute('SELECT * FROM approval_requests WHERE id=?',(approval_id,)).fetchone()
        if not row: raise ValueError('Approval request does not exist.')
        if row['decision']!='PENDING': raise ValueError('This request already has a decision.')
        plan=con.execute('SELECT status FROM recovery_plans WHERE id=?',(row['recovery_plan_id'],)).fetchone()
        if not plan or plan['status']!='PENDING_APPROVAL': raise ValueError('Plan is not pending approval.')
        if data.decision=='APPROVED':
            existing=con.execute('''SELECT p.id FROM recovery_plans p JOIN recovery_plans current
                ON current.order_id=p.order_id WHERE current.id=? AND p.status='APPROVED' AND p.id<>?''',
                (row['recovery_plan_id'],row['recovery_plan_id'])).fetchone()
            if existing:
                raise ValueError('An approved recovery plan already covers this order. Do not double count recovery capacity or stock across plans.')
        con.execute('''UPDATE approval_requests SET decision=?,decision_notes=?,decided_by=?,
            decided_at=CURRENT_TIMESTAMP WHERE id=?''',(data.decision,data.notes,data.decided_by,approval_id))
        con.execute('UPDATE recovery_plans SET status=? WHERE id=?',(data.decision,row['recovery_plan_id']))
        audit(con,'PLAN',str(row['recovery_plan_id']),'HUMAN_'+data.decision,data.decided_by,
              {'approval_id':approval_id,'notes':data.notes,'execution':'NONE'})
        return {'approval_id':approval_id,'plan_id':row['recovery_plan_id'],'decision':data.decision,
                'execution':'Decision recorded only. No factory action has been executed.'}
