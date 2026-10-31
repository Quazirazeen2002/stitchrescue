"""FastAPI boundary for the existing and Stage 3 StitchRescue services."""
from __future__ import annotations
import hmac
import json
import logging
import os
import sqlite3
import time
import uuid
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Any
from fastapi import FastAPI, APIRouter, UploadFile, File, Form, Header, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel, Field
from backend.schemas.models import (RollCreate,ObservationCreate,Verification,RollStatus,BatchCreate,
    Allocation,MachineEvent,RecoveryInput,PlanCreate,ApprovalRequest,ApprovalDecision,InvestigationRequest,IncidentCreate)
from backend.schemas.responses import RollResponse,ImageResponse,RecoveryResponse,ApprovalResponse
from backend.services import fabricguard as fg, linewatch as lw, inspection as vision
from core.config import STORAGE_PATH, FRONTEND_ORIGIN, MAX_UPLOAD_BYTES
from core.database import connect,get_fabric_rolls,get_orders,get_order,get_incidents
from core.stage3_db import init_stage3,dashboard_counts,recent_audit,audit
from core import orderrescue
from core.risk_engine import calculate_risk

logging.basicConfig(level=logging.INFO,format='%(message)s')
logger=logging.getLogger('stitchrescue.api')

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_stage3()
    yield

app=FastAPI(title='StitchRescue API',version='0.3.0',lifespan=lifespan)
app.add_middleware(CORSMiddleware,allow_origins=[FRONTEND_ORIGIN],allow_credentials=False,
    allow_methods=['GET','POST','PATCH'],allow_headers=['Content-Type','X-Manager-Token'])
api=APIRouter(prefix='/api/v1')

class HealthResponse(BaseModel):
    status: str
    version: str

class SegmentInput(BaseModel):
    prompt: str = Field(min_length=1,max_length=300)

class DemoRequest(BaseModel):
    name: str = Field(min_length=1,max_length=200)
    email: str = Field(min_length=3,max_length=300,pattern=r"^[^\s@]+@[^\s@]+\.[^\s@]+$")
    company: str = Field(min_length=1,max_length=200)
    message: str = Field(min_length=1,max_length=5000)

class LoginInput(BaseModel):
    token: str = Field(min_length=1)


def manager(x_manager_token: str | None = Header(default=None)) -> None:
    expected=os.getenv('MANAGER_APPROVAL_TOKEN','')
    if not expected:
        raise HTTPException(503,'Manager approval is not configured. Set MANAGER_APPROVAL_TOKEN on the server.')
    if not x_manager_token or not hmac.compare_digest(x_manager_token,expected):
        raise HTTPException(403,'Manager authorization required. Sign in with the configured manager credential.')

@app.exception_handler(ValueError)
async def value_error(request,exc):
    return JSONResponse(status_code=400,content={'detail':str(exc)})

@app.exception_handler(sqlite3.IntegrityError)
async def integrity_error(request,exc):
    return JSONResponse(status_code=409,content={'detail':'Record already exists or a required relationship is invalid.'})

@app.middleware('http')
async def request_log(request,call_next):
    start=time.monotonic()
    response=await call_next(request)
    logger.info(json.dumps({'request_id':uuid.uuid4().hex,'method':request.method,'path':request.url.path,
        'status':response.status_code,'duration_ms':round((time.monotonic()-start)*1000)}))
    return response

@app.get('/health',response_model=HealthResponse)
@api.get('/health',response_model=HealthResponse)
def health(): return {'status':'ok','version':'0.3.0'}

@api.post('/auth/manager')
def login(data: LoginInput):
    manager(data.token)
    return {'authorized':True,'scope':'Human verification, quality clearance and recovery decisions. Prototype shared credential.'}

@api.get('/settings')
def settings():
    return {'ai_configured':bool(os.getenv('MODEL_API_KEY')),'manager_approval_configured':bool(os.getenv('MANAGER_APPROVAL_TOKEN')),
        'reasoning_model':os.getenv('META_MODEL',os.getenv('MUSE_WONDER_MODEL','muse-wonder-1.0')),
        'segmentation_model':os.getenv('SAM_MODEL','sam-3.1'),'database':'SQLite prototype',
        'approval_mode':'Human decision recording only; factory execution is manual.',
        'knowledge_status':'Demo SOP is simulated. Approved buyer and factory documents must be supplied.'}

@api.get('/dashboard')
def dashboard() -> dict[str,Any]:
    with connect() as con:
        distribution=[dict(r) for r in con.execute('SELECT defect_label AS name,COUNT(*) AS value FROM defect_observations GROUP BY defect_label')]
    return {'counts':dashboard_counts(),'incidents':get_incidents()[:10],'activity':recent_audit(10),
        'defect_distribution':distribution,'production_risks':[calculate_risk(o) for o in get_orders()],
        'recovery_plans':orderrescue.list_plans()[:5]}

@api.get('/orders')
def orders() -> list[dict[str,Any]]:
    return [{**order,'accepted_quantity':calculate_risk(order)['accepted_units']} for order in get_orders()]

@api.get('/incidents')
def incidents() -> list[dict[str,Any]]: return get_incidents()

@api.post('/incidents',status_code=201)
def incident(data: IncidentCreate):
    order=get_order(data.order_id)
    if not order or data.affected_quantity>order['quantity']: raise ValueError('Invalid order or affected quantity.')
    with connect() as con:
        cur=con.execute('INSERT INTO incidents(order_id,defect_label,affected_quantity) VALUES (?,?,?)',
            (data.order_id,data.defect_label,data.affected_quantity))
        audit(con,'INCIDENT',str(cur.lastrowid),'INCIDENT_REPORTED',data.actor,data.model_dump())
        return {'id':cur.lastrowid,**data.model_dump()}

@api.get('/fabric-rolls',response_model=list[RollResponse])
def rolls() -> list[dict[str,Any]]: return [r for r in get_fabric_rolls() if r['roll_id']]

@api.post('/fabric-rolls',status_code=201,response_model=RollResponse)
def create_roll(data: RollCreate): return fg.register_roll(data)

@api.get('/fabric-rolls/{roll_id}')
def roll_detail(roll_id: str):
    result=fg.roll_history(roll_id)
    for image in result['images']: image['url']=f"/api/v1/images/{image['id']}/file"
    return result

@api.patch('/fabric-rolls/{roll_id}/status',dependencies=[Depends(manager)])
def roll_status(roll_id: str,data: RollStatus): return fg.update_status(roll_id,data)

@api.post('/fabric-rolls/{roll_id}/images',status_code=201,response_model=ImageResponse)
async def upload(roll_id: str, file: UploadFile = File(), actor: str = Form()):
    content=await file.read(MAX_UPLOAD_BYTES+1)
    return fg.upload_image(roll_id,content,actor)

@api.get('/images/{image_id}/file')
def image_file(image_id: int):
    image=fg.get_image(image_id)
    path=Path(image['path']).resolve()
    if not path.is_relative_to(STORAGE_PATH) or not path.is_file(): raise HTTPException(404,'Original image is unavailable.')
    return FileResponse(path,media_type=image['media_type'])

@api.get('/assets/{resource:path}')
def asset(resource: str):
    path=(STORAGE_PATH/resource).resolve()
    if not path.is_relative_to(STORAGE_PATH) or path.suffix.lower() not in {'.jpg','.jpeg','.png','.webp'} or not path.is_file():
        raise HTTPException(404,'Image is unavailable.')
    return FileResponse(path)

@api.post('/defects',status_code=201)
def defect(data: ObservationCreate): return fg.record_observation(data)

@api.post('/defects/{observation_id}/verification',dependencies=[Depends(manager)])
def verification(observation_id: int,data: Verification): return fg.verify_observation(observation_id,data)

@api.get('/production-batches')
def batches(): return lw.list_batches()

@api.post('/production-batches',status_code=201)
def batch(data: BatchCreate): return lw.register_batch(data)

@api.post('/production-batches/{batch_id}/allocations',status_code=201)
def allocation(batch_id: str,data: Allocation): return lw.allocate_roll(batch_id,data)

@api.post('/machine-events',status_code=201)
def event(data: MachineEvent): return lw.record_event(data)

@api.get('/machine-events')
def events() -> list[dict[str,Any]]:
    with connect() as con: return [dict(r) for r in con.execute('SELECT * FROM machine_events ORDER BY event_time DESC LIMIT 200')]

@api.get('/linewatch/{batch_id}')
def trace(batch_id: str): return lw.investigate_batch(batch_id)

@api.post('/linewatch/{batch_id}/investigate')
def investigate_batch(batch_id: str): return lw.investigate_batch(batch_id,persist=True)

@api.post('/inspections')
async def inspection(file: UploadFile=File(),annotation: UploadFile | None=File(default=None)):
    return vision.inspect_upload(await file.read(MAX_UPLOAD_BYTES+1),await annotation.read(1024*1024+1) if annotation else None)

@api.post('/images/{image_id}/segment')
async def segment(image_id: int,data: SegmentInput):
    try: return await vision.segment_image(image_id,data.prompt)
    except ValueError: raise
    except Exception as exc:
        logger.warning('SAM inference failed: %s',type(exc).__name__)
        raise HTTPException(503,f'Meta SAM inference unavailable ({type(exc).__name__}). Factory workflows remain available.') from exc

@api.post('/segmentations/{run_id}/evaluate')
async def evaluate(run_id: int,annotation: UploadFile=File()):
    content=await annotation.read(1024*1024+1)
    if len(content)>1024*1024: raise ValueError('Annotation exceeds 1 MB.')
    return vision.evaluate_segmentation(run_id,content)

@api.post('/order-rescue/calculate',response_model=RecoveryResponse)
def calculate(data: RecoveryInput): return orderrescue.calculate_recovery(data)

@api.get('/order-rescue/plans')
def plans(): return orderrescue.list_plans()

@api.post('/order-rescue/plans',status_code=201)
def save_plan(data: PlanCreate): return orderrescue.save_plan(data)

@api.get('/order-rescue/plans/{plan_id}')
def plan(plan_id: int): return orderrescue.get_plan(plan_id)

@api.post('/order-rescue/recommend')
async def recommend(data: RecoveryInput):
    from ai.orchestrator import recommend_recovery
    calculation=orderrescue.calculate_recovery(data)
    try: report=await recommend_recovery(calculation)
    except Exception as exc:
        raise HTTPException(503,f'Meta reasoning unavailable ({type(exc).__name__}). Deterministic calculations remain available.') from exc
    with connect() as con:
        cur=con.execute("INSERT INTO investigation_reports(order_id,report_type,report,evidence_json) VALUES (?,'RECOVERY',?,?)",
                        (data.order_id,report,json.dumps(calculation)))
        audit(con,'REPORT',str(cur.lastrowid),'RECOVERY_RECOMMENDATION','model',{'order_id':data.order_id})
    return {'report':report,'calculation':calculation}

@api.get('/approvals',response_model=list[ApprovalResponse])
def approvals(): return orderrescue.list_approvals()

@api.post('/approvals',status_code=201)
def approval(data: ApprovalRequest): return orderrescue.request_approval(data)

@api.post('/approvals/{approval_id}/decision',dependencies=[Depends(manager)])
def decision(approval_id: int,data: ApprovalDecision): return orderrescue.decide_approval(approval_id,data)

@api.get('/audit')
def audit_history():
    with connect() as con:
        legacy=[dict(r) for r in con.execute('SELECT * FROM fabric_audit_events ORDER BY id DESC LIMIT 100')]
    return {'events':recent_audit(200),'legacy_fabric_events':legacy}

@api.get('/reports')
def reports() -> list[dict[str,Any]]:
    with connect() as con: return [dict(r) for r in con.execute('SELECT * FROM investigation_reports ORDER BY id DESC LIMIT 100')]

@api.post('/agents/investigate')
async def agent_investigate(data: InvestigationRequest):
    from ai.orchestrator import run_investigation
    if not get_order(data.order_id): raise ValueError('Order does not exist.')
    evidence=lw.investigate_batch(data.batch_id) if data.batch_id else {'order':get_order(data.order_id)}
    if data.batch_id and evidence['batch']['order_id']!=data.order_id:
        raise ValueError('Production batch belongs to a different order.')
    try: report=await run_investigation(data.order_id,data.question,data.batch_id)
    except Exception as exc:
        raise HTTPException(503,f'Meta reasoning unavailable ({type(exc).__name__}). Recorded evidence remains available.') from exc
    with connect() as con:
        cur=con.execute('INSERT INTO investigation_reports(order_id,batch_id,report_type,report,evidence_json) VALUES (?,?,?,?,?)',
             (data.order_id,data.batch_id,'QUALITY',report,json.dumps(evidence)))
        audit(con,'REPORT',str(cur.lastrowid),'INVESTIGATION_RECORDED','model',{'order_id':data.order_id})
    return {'report':report,'evidence':evidence}

@api.get('/knowledge')
def knowledge(query: str):
    from ai.knowledge import search_knowledge
    return {'results':search_knowledge(query),'notice':'SIMULATED SOP is not an approved factory policy.'}

@api.post('/demo-requests',status_code=201)
def demo_request(data: DemoRequest):
    with connect() as con:
        cur=con.execute('INSERT INTO demo_requests(name,email,company,message) VALUES (?,?,?,?)',
            (data.name,data.email,data.company,data.message))
        return {'id':cur.lastrowid,'status':'Request stored in this installation. No email was sent.'}

app.include_router(api)
