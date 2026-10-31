"""Production traceability with conservative evidence interpretation."""
from __future__ import annotations
import json
from backend.schemas.models import BatchCreate, Allocation, MachineEvent
from core.database import connect, get_order, get_batch_trace, get_machine_events
from core.stage3_db import audit


def list_batches() -> list[dict]:
    with connect() as con:
        return [dict(r) for r in con.execute('SELECT * FROM production_batches ORDER BY rowid DESC')]


def register_batch(data: BatchCreate) -> dict:
    order=get_order(data.order_id)
    if not order:
        raise ValueError('Order does not exist.')
    if data.planned_quantity > order['quantity']:
        raise ValueError('Batch quantity exceeds order quantity.')
    with connect() as con:
        for line,kind in ((data.cutting_line,'CUTTING'),(data.sewing_line,'SEWING')):
            con.execute('INSERT OR IGNORE INTO production_lines(line_id,line_type) VALUES (?,?)',(line,kind))
        con.execute('''INSERT INTO production_batches
            (batch_id,order_id,cutting_line,sewing_line,planned_quantity,produced_quantity,started_at,completed_at,status)
            VALUES (?,?,?,?,?,?,?,?,?)''', (data.batch_id,data.order_id,data.cutting_line,data.sewing_line,
             data.planned_quantity,data.produced_quantity,
             data.started_at.isoformat() if data.started_at else None,
             data.completed_at.isoformat() if data.completed_at else None,data.status))
        audit(con,'BATCH',data.batch_id,'BATCH_REGISTERED',data.actor,data.model_dump(mode='json'))
    return get_batch_trace(data.batch_id)['batch']


def allocate_roll(batch_id: str, data: Allocation) -> dict:
    with connect() as con:
        con.execute('BEGIN IMMEDIATE')
        batch=con.execute('SELECT * FROM production_batches WHERE batch_id=?',(batch_id,)).fetchone()
        roll=con.execute('SELECT * FROM fabric_rolls WHERE roll_id=?',(data.roll_id,)).fetchone()
        if not batch or not roll:
            raise ValueError('Batch or roll not found.')
        if batch['status'] == 'COMPLETED':
            raise ValueError('Completed batches cannot receive new allocations.')
        if roll['order_id'] != batch['order_id']:
            raise ValueError('Roll and batch must belong to the same order.')
        if roll['status'] in {'ON_HOLD','CONSUMED'}:
            raise ValueError('Cannot allocate ON_HOLD or CONSUMED fabric.')
        allocated=con.execute('SELECT COALESCE(SUM(allocated_length_m),0) FROM batch_roll_links WHERE roll_id=?',(data.roll_id,)).fetchone()[0]
        if allocated + data.allocated_length_m > roll['length_m'] + 1e-9:
            raise ValueError('Allocation exceeds available roll length.')
        con.execute('INSERT INTO batch_roll_links(batch_id,roll_id,allocated_length_m) VALUES (?,?,?)',
                    (batch_id,data.roll_id,data.allocated_length_m))
        details={'batch_id':batch_id,'roll_id':data.roll_id,'allocated_length_m':data.allocated_length_m}
        audit(con,'BATCH',batch_id,'ROLL_ALLOCATED',data.actor,details)
        audit(con,'ROLL',data.roll_id,'PRODUCTION_ALLOCATION',data.actor,details)
    return details


def record_event(data: MachineEvent) -> dict:
    with connect() as con:
        con.execute("INSERT OR IGNORE INTO production_lines(line_id,line_type) VALUES (?,'OTHER')",(data.production_line,))
        cur=con.execute('''INSERT INTO machine_events
            (machine_id,production_line,event_type,description,event_time,recorded_by) VALUES (?,?,?,?,?,?)''',
            (data.machine_id,data.production_line,data.event_type,data.description,data.event_time.isoformat(),data.recorded_by))
        audit(con,'LINE',data.production_line,'MACHINE_EVENT',data.recorded_by,{'id':cur.lastrowid,**data.model_dump(mode='json')})
        return {'id':cur.lastrowid,**data.model_dump(mode='json')}


def investigate_batch(batch_id: str, persist: bool = False) -> dict:
    trace=get_batch_trace(batch_id)
    if not trace:
        raise ValueError('Production batch not found.')
    batch=trace['batch']
    events=[]
    for line in {batch['cutting_line'],batch['sewing_line']} - {None,''}:
        events.extend(get_machine_events(line))
    verified=[r for r in trace['observations'] if r['verification_status']=='VERIFIED']
    pending=[r for r in trace['observations'] if r['verification_status']=='PENDING']
    unknowns=[]
    if not trace['rolls']: unknowns.append('No fabric rolls have been allocated.')
    if not verified: unknowns.append('No human-verified defect observations are linked.')
    if pending: unknowns.append('Pending observations require human verification.')
    if not events: unknowns.append('No machine events are recorded for the cutting or sewing line.')
    if not batch['started_at']: unknowns.append('Batch start time is missing; time correlation is unavailable.')
    if any(r['status']!='QUALITY_CLEARED' for r in trace['rolls']):
        unknowns.append('Linked fabric is not currently quality cleared; review disposition and allocation history.')
    with connect() as con:
        repeated=[dict(r) for r in con.execute('''SELECT d.defect_label,COUNT(DISTINCT l.batch_id) AS batch_count
            FROM defect_observations d JOIN batch_roll_links l ON l.roll_id=d.roll_id
            WHERE d.verification_status='VERIFIED' AND d.defect_label IN
            (SELECT d2.defect_label FROM defect_observations d2 JOIN batch_roll_links l2
             ON l2.roll_id=d2.roll_id WHERE l2.batch_id=?)
            GROUP BY d.defect_label HAVING COUNT(DISTINCT l.batch_id)>1''',(batch_id,))]
        report={'batch':batch,'linked_rolls':trace['rolls'],'verified_defects':verified,
            'pending_observations':pending,'machine_events':events,'repeated_defects':repeated,
            'confirmed_facts':[f"Batch {batch_id} links to {len(trace['rolls'])} recorded fabric roll(s)."],
            'potential_correlations':[{'event_id':e['id'],'line':e['production_line'],
                'interpretation':'Shared production line only; timing and causation require investigation.'} for e in events],
            'hypotheses':[], 'unknowns':unknowns,
            'investigation_status':'EVIDENCE_AVAILABLE' if verified or events else 'INSUFFICIENT_EVIDENCE',
            'causation':'No machine or operator cause is established by this report.'}
        if persist:
            cur=con.execute('''INSERT INTO linewatch_findings(batch_id,finding_type,finding_summary,evidence_json)
                VALUES (?,'EVIDENCE_REVIEW',?,?)''',(batch_id,report['causation'],json.dumps(report)))
            con.execute('''INSERT INTO investigation_reports(order_id,batch_id,report_type,report,evidence_json)
                VALUES (?,?,'LINEWATCH',?,?)''',(batch['order_id'],batch_id,report['causation'],json.dumps(report)))
            audit(con,'BATCH',batch_id,'INVESTIGATION_RECORDED','system',{'finding_id':cur.lastrowid})
        return report
