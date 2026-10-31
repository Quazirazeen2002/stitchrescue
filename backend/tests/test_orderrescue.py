import pytest
from pydantic import ValidationError
from backend.schemas.models import RecoveryInput,PlanCreate,ApprovalRequest,ApprovalDecision
from core import orderrescue as recovery
from core.stage3_db import recent_audit


def plan(recovery_input):
    return recovery.save_plan(PlanCreate(inputs=recovery_input,selected_strategy='REWORK',
        evidence='SIMULATED integration evidence',requested_by='SIMULATED production manager'))


def test_all_calculations(recovery_input):
    result=recovery.calculate_recovery(recovery_input)
    rework,replacement,stock,partial=result['scenarios']
    assert rework['estimated_cost_bdt']==40000 and rework['estimated_hours']==20
    assert replacement['estimated_cost_bdt']==360000
    assert stock['recoverable_quantity']==1000 and stock['unrecovered_quantity']==1000
    assert partial['recoverable_quantity']==0 and partial['remaining_delivery_quantity']==2000
    assert result['scenario_relationship']=='MUTUALLY_EXCLUSIVE_ALTERNATIVES'
    assert rework['deadline_feasibility']=='FEASIBLE'

@pytest.mark.parametrize('field,value',[('rework_cost_per_unit',-1),('stock_unit_cost',-1),
    ('replacement_capacity_per_hour',0),('rework_capacity_per_hour',-1),('stock_quantity',-1),
    ('affected_quantity',0),('available_hours',-1),('rework_cost_per_unit',float('inf'))])
def test_invalid_estimates(recovery_input,field,value):
    data=recovery_input.model_dump();data[field]=value
    with pytest.raises(ValidationError): RecoveryInput(**data)


def test_quantity_conservation(recovery_input):
    data=recovery_input.model_copy(update={'accepted_quantity':19000})
    with pytest.raises(ValueError,match='exceeds'): recovery.calculate_recovery(data)


def test_deadline_and_prerequisites(recovery_input):
    result=recovery.calculate_recovery(recovery_input.model_copy(update={'available_hours':1}))
    assert result['scenarios'][0]['deadline_feasibility']=='NOT_FEASIBLE'
    result=recovery.calculate_recovery(recovery_input.model_copy(update={'capacity_confirmed':False}))
    assert result['scenarios'][0]['deadline_feasibility']=='CONDITIONAL'


def test_material_availability(recovery_input):
    result=recovery.calculate_recovery(recovery_input.model_copy(update={'replacement_material_units':100}))
    assert result['scenarios'][1]['unrecovered_quantity']==1900
    assert result['scenarios'][1]['deadline_feasibility']=='NOT_FEASIBLE'


def test_no_double_counting_stock(recovery_input):
    result=recovery.calculate_recovery(recovery_input.model_copy(update={'stock_quantity':5000}))
    assert result['scenarios'][2]['recoverable_quantity']==2000
    assert result['scenarios'][0]['recoverable_quantity']==2000
    assert result['recovery_target']==2000


def test_save_and_request_approval(recovery_input):
    saved=plan(recovery_input)
    assert saved['status']=='PROPOSED'
    request=recovery.request_approval(ApprovalRequest(plan_id=saved['id'],requested_by='Human'))
    assert request['status']=='PENDING_APPROVAL'
    with pytest.raises(ValueError,match='already'): recovery.request_approval(ApprovalRequest(plan_id=saved['id'],requested_by='Human'))

@pytest.mark.parametrize('decision',['APPROVED','REJECTED'])
def test_human_decisions_once(recovery_input,decision):
    saved=plan(recovery_input)
    request=recovery.request_approval(ApprovalRequest(plan_id=saved['id'],requested_by='Human'))
    data=ApprovalDecision(decision=decision,decided_by='Human manager',notes='SIMULATED decision',human_confirmation=True)
    result=recovery.decide_approval(request['approval_id'],data)
    assert result['decision']==decision
    assert recovery.get_plan(saved['id'])['status']==decision
    with pytest.raises(ValueError,match='already'): recovery.decide_approval(request['approval_id'],data)
    assert any(e['event_type']=='HUMAN_'+decision for e in recent_audit())


def test_nonexistent_approval_and_plan():
    with pytest.raises(ValueError): recovery.request_approval(ApprovalRequest(plan_id=999,requested_by='Human'))
    with pytest.raises(ValueError): recovery.decide_approval(999,ApprovalDecision(decision='APPROVED',decided_by='Human',notes='test',human_confirmation=True))


def test_prevent_two_approved_alternatives_for_same_order(recovery_input):
    first=plan(recovery_input)
    first_request=recovery.request_approval(ApprovalRequest(plan_id=first['id'],requested_by='Human'))
    decision=ApprovalDecision(decision='APPROVED',decided_by='Human',notes='SIMULATED decision',human_confirmation=True)
    recovery.decide_approval(first_request['approval_id'],decision)
    second=plan(recovery_input)
    second_request=recovery.request_approval(ApprovalRequest(plan_id=second['id'],requested_by='Human'))
    with pytest.raises(ValueError,match='double count'):
        recovery.decide_approval(second_request['approval_id'],decision)
    assert recovery.get_plan(second['id'])['status']=='PENDING_APPROVAL'
