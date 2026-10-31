from datetime import datetime,timezone
import pytest
from backend.schemas.models import BatchCreate,Allocation,MachineEvent,RollStatus,Verification
from backend.services import linewatch as lw,fabricguard as fg
from backend.tests.test_fabricguard import observation


def allocate(batch,roll,length):
    return lw.allocate_roll(batch['batch_id'],Allocation(roll_id=roll['roll_id'],allocated_length_m=length,actor='SIMULATED planner'))


def test_register_batch(batch):
    assert batch['order_id']=='ORD-1001'


def test_missing_order():
    with pytest.raises(ValueError,match='Order'):
        lw.register_batch(BatchCreate(batch_id='BAD',order_id='MISSING',cutting_line='C',sewing_line='S',planned_quantity=1,actor='Human'))


def test_link_roll(batch,roll):
    allocate(batch,roll,100)
    assert lw.investigate_batch(batch['batch_id'])['linked_rolls'][0]['allocated_length_m']==100


def test_missing_roll(batch):
    with pytest.raises(ValueError,match='not found'):
        lw.allocate_roll(batch['batch_id'],Allocation(roll_id='MISSING',allocated_length_m=10,actor='Human'))


def test_held_roll_preserves_existing_allocations(batch,roll):
    allocate(batch,roll,100)
    fg.update_status(roll['roll_id'],RollStatus(status='ON_HOLD',actor='Human',notes='Quarantine'))
    assert len(lw.investigate_batch(batch['batch_id'])['linked_rolls'])==1
    other=lw.register_batch(BatchCreate(batch_id='OTHER',order_id='ORD-1001',cutting_line='C',sewing_line='S',planned_quantity=1,actor='Human'))
    with pytest.raises(ValueError,match='ON_HOLD'): allocate(other,roll,10)


def test_prevent_total_overallocation(batch,roll):
    allocate(batch,roll,400)
    other=lw.register_batch(BatchCreate(batch_id='OTHER',order_id='ORD-1001',cutting_line='C',sewing_line='S',planned_quantity=1,actor='Human'))
    with pytest.raises(ValueError,match='exceeds'): allocate(other,roll,101)
    assert len(lw.investigate_batch('OTHER')['linked_rolls'])==0


def test_cross_order_allocation(batch,roll):
    other=lw.register_batch(BatchCreate(batch_id='OTHER',order_id='ORD-1002',cutting_line='C',sewing_line='S',planned_quantity=1,actor='Human'))
    with pytest.raises(ValueError,match='same order'): allocate(other,roll,10)


def test_trace_verified_pending_and_both_lines(batch,image,roll):
    allocate(batch,roll,100)
    verified=fg.record_observation(observation(image))
    fg.verify_observation(verified['id'],Verification(decision='VERIFIED',notes='test',inspector='Human'))
    fg.record_observation(observation(image))
    for line in ('CUT-1','SEW-1'):
        lw.record_event(MachineEvent(machine_id='M-'+line,production_line=line,event_type='CLEANING',
            description='SIMULATED cleaning event',event_time=datetime.now(timezone.utc),recorded_by='Human'))
    trace=lw.investigate_batch(batch['batch_id'],persist=True)
    assert len(trace['verified_defects'])==1 and len(trace['pending_observations'])==1
    assert len(trace['machine_events'])==2
    assert 'No machine or operator cause' in trace['causation']
    assert trace['hypotheses']==[]


def test_missing_evidence(batch):
    trace=lw.investigate_batch(batch['batch_id'])
    assert trace['unknowns'] and trace['investigation_status']=='INSUFFICIENT_EVIDENCE'
