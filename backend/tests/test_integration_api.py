import io
import sqlite3
from PIL import Image
from backend.schemas.models import Allocation,Verification,PlanCreate,ApprovalRequest
from backend.services import fabricguard as fg,linewatch as lw
from backend.tests.test_fabricguard import observation
from core import orderrescue as recovery,database as db
from core.stage3_db import init_stage3


def test_ord1001_complete_simulated_chain(client,roll,batch,image,recovery_input):
    defect=fg.record_observation(observation(image))
    fg.verify_observation(defect['id'],Verification(decision='VERIFIED',notes='SIMULATED check',inspector='Human QA'))
    lw.allocate_roll(batch['batch_id'],Allocation(roll_id=roll['roll_id'],allocated_length_m=200,actor='Human planner'))
    trace=lw.investigate_batch(batch['batch_id'],persist=True)
    assert trace['verified_defects'][0]['id']==defect['id']
    calculation=client.post('/api/v1/order-rescue/calculate',json=recovery_input.model_dump()).json()
    assert calculation['order_quantity']==20000
    assert calculation['accepted_quantity']==18000
    assert calculation['scenarios'][0]['potential_penalty_exposure_bdt']==500000
    saved=recovery.save_plan(PlanCreate(inputs=recovery_input,selected_strategy='REWORK',evidence=f'SIMULATED defect #{defect["id"]}',requested_by='Human planner'))
    request=recovery.request_approval(ApprovalRequest(plan_id=saved['id'],requested_by='Human planner'))
    payload={'decision':'APPROVED','decided_by':'SIMULATED manager','notes':'SIMULATED approval; no execution','human_confirmation':True}
    assert client.post(f'/api/v1/approvals/{request["approval_id"]}/decision',json=payload).status_code==403
    response=client.post(f'/api/v1/approvals/{request["approval_id"]}/decision',json=payload,headers={'X-Manager-Token':'test-human-manager'})
    assert response.status_code==200 and response.json()['decision']=='APPROVED'
    assert recovery.get_plan(saved['id'])['status']=='APPROVED'
    assert client.get('/api/v1/dashboard').json()['counts']['verified_defects']==1


def test_api_validation_and_image_access(client,roll,image):
    assert client.get('/health').status_code==200
    assert client.get(f'/api/v1/images/{image["id"]}/file').status_code==200
    assert client.get('/api/v1/assets/../factory.db').status_code in (404,400)
    assert client.post('/api/v1/fabric-rolls',json={'roll_id':''}).status_code==422
    assert client.get('/api/v1/settings').json().get('MODEL_API_KEY') is None


def test_stage1_polygon_preserved(client):
    image=io.BytesIO();Image.new('RGB',(40,40),'white').save(image,'PNG')
    response=client.post('/api/v1/inspections',files={'file':('fabric.png',image.getvalue(),'image/png'),
        'annotation':('truth.txt',b'0 0.1 0.1 0.8 0.1 0.8 0.8','text/plain')})
    assert response.status_code==200
    result=response.json()
    assert result['detections'][0]['type']=='segmentation_polygon'
    assert result['evidence_source']=='BDFD9_GROUND_TRUTH'
    assert client.get(result['overlay_url']).status_code==200


def test_mocked_sam_provenance_and_failure(client,image,monkeypatch):
    import backend.services.inspection as vision
    async def simulated(*args):
        return {'boxes':[],'masks':[],'raw_output':'SIMULATED mocked test output','outcome':'completed','diagnostics':[]}
    monkeypatch.setattr(vision,'segment_fabric',simulated)
    response=client.post(f'/api/v1/images/{image["id"]}/segment',json={'prompt':'fabric'})
    assert response.status_code==200 and response.json()['evidence_source']=='MODEL_PREDICTION'
    with db.connect() as con:
        assert 'SIMULATED mocked test' in con.execute('SELECT result_json FROM segmentation_runs').fetchone()[0]
    async def unavailable(*args): raise RuntimeError('provider unavailable')
    monkeypatch.setattr(vision,'segment_fabric',unavailable)
    assert client.post(f'/api/v1/images/{image["id"]}/segment',json={'prompt':'fabric'}).status_code==503
    assert client.get('/api/v1/fabric-rolls').status_code==200


def test_rag_labels_and_retrieval_audit(client):
    result=client.get('/api/v1/knowledge',params={'query':'oil stain'}).json()['results']
    assert result and all('SIMULATED' in r['status'] for r in result)
    assert result[0]['document_id']=='SOP-DEMO-001'
    assert any(e['event_type']=='EVIDENCE_RETRIEVED' for e in client.get('/api/v1/audit').json()['events'])


def test_migration_idempotent_preserves_rows(roll):
    before=db.get_fabric_rolls()
    init_stage3();init_stage3()
    assert db.get_fabric_rolls()==before
    with db.connect() as con:
        assert con.execute('PRAGMA foreign_keys').fetchone()[0]==1
        assert not con.execute('PRAGMA foreign_key_check').fetchall()


def test_backup_before_legacy_migration(tmp_path,monkeypatch):
    legacy=tmp_path/'legacy.db';monkeypatch.setattr(db,'DB_PATH',legacy)
    db.init_db();db.init_fabricguard();db.init_linewatch()
    init_stage3()
    backups=list((tmp_path/'backups').glob('*.db'))
    assert len(backups)==1
    with sqlite3.connect(backups[0]) as con:
        assert con.execute('SELECT COUNT(*) FROM orders').fetchone()[0]==3
        assert not con.execute("SELECT 1 FROM sqlite_master WHERE name='recovery_plans'").fetchone()


def test_no_agent_decision_tool():
    from ai.stage3_tools import READ_TOOLS,MUTATION_TOOLS
    assert len(READ_TOOLS)+len(MUTATION_TOOLS)==13
    assert all(tool.needs_approval for tool in MUTATION_TOOLS)
    assert not any('decide' in tool.name for tool in READ_TOOLS+MUTATION_TOOLS)
