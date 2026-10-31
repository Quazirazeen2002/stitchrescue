"""FabricGuard transactions and immutable photographic evidence."""
from __future__ import annotations
import hashlib
import io
import json
import uuid
from pathlib import Path
from PIL import Image, UnidentifiedImageError
from backend.schemas.models import RollCreate, ObservationCreate, Verification, RollStatus
from core.database import connect, get_fabric_roll, get_roll_observations, get_fabric_audit
from core.config import STORAGE_PATH, MAX_UPLOAD_BYTES
from core.stage3_db import audit


def register_roll(data: RollCreate) -> dict:
    with connect() as con:
        if not con.execute('SELECT 1 FROM orders WHERE id=?', (data.order_id,)).fetchone():
            raise ValueError('Order does not exist.')
        con.execute('''INSERT INTO fabric_rolls (roll_id,supplier,fabric_type,composition,color,
            length_m,width_cm,gsm,purchase_order,order_id,received_date)
            VALUES (?,?,?,?,?,?,?,?,?,?,?)''',
            (data.roll_id,data.supplier,data.fabric_type,data.composition,data.color,data.length_m,
             data.width_cm,data.gsm,data.purchase_order,data.order_id,
             data.received_date.isoformat() if data.received_date else None))
        audit(con,'ROLL',data.roll_id,'ROLL_REGISTERED',data.actor,data.model_dump(mode='json'))
    return get_fabric_roll(data.roll_id)


def get_image(image_id: int) -> dict:
    with connect() as con:
        row = con.execute('SELECT * FROM fabric_images WHERE id=?',(image_id,)).fetchone()
        if not row:
            raise ValueError('Fabric image not found.')
        return dict(row)


def upload_image(roll_id: str, content: bytes, actor: str) -> dict:
    if not get_fabric_roll(roll_id):
        raise ValueError('Fabric roll does not exist.')
    if not actor.strip():
        raise ValueError('Uploader identity is required.')
    if not content or len(content) > MAX_UPLOAD_BYTES:
        raise ValueError('Upload a nonempty image smaller than 20 MB.')
    try:
        with Image.open(io.BytesIO(content)) as image:
            image.verify()
        with Image.open(io.BytesIO(content)) as image:
            width,height = image.size
            fmt = image.format
            if width * height > 50_000_000:
                raise ValueError('Image exceeds 50 megapixels.')
        suffix = {'JPEG':'.jpg','PNG':'.png','WEBP':'.webp'}.get(fmt)
        if not suffix:
            raise ValueError('Only JPEG, PNG and WebP images are supported.')
    except (UnidentifiedImageError, OSError, Image.DecompressionBombError) as exc:
        raise ValueError('Invalid or corrupted image.') from exc
    directory = STORAGE_PATH / 'fabricguard' / 'images'
    directory.mkdir(parents=True,exist_ok=True)
    path = directory / f'{uuid.uuid4().hex}{suffix}'
    path.write_bytes(content)
    try:
        with connect() as con:
            cur = con.execute('''INSERT INTO fabric_images
                (roll_id,path,sha256,width_px,height_px,media_type,uploaded_by) VALUES (?,?,?,?,?,?,?)''',
                (roll_id,str(path),hashlib.sha256(content).hexdigest(),width,height,
                 Image.MIME[fmt],actor))
            image_id = cur.lastrowid
            audit(con,'ROLL',roll_id,'IMAGE_UPLOADED',actor,{'image_id':image_id,'sha256':hashlib.sha256(content).hexdigest()})
    except Exception:
        path.unlink(missing_ok=True)
        raise
    return get_image(image_id)


def record_observation(data: ObservationCreate) -> dict:
    roll = get_fabric_roll(data.roll_id)
    if not roll:
        raise ValueError('Fabric roll does not exist.')
    image = get_image(data.image_id)
    if image['roll_id'] != data.roll_id:
        raise ValueError('Image belongs to a different fabric roll.')
    if not Path(image['path']).is_file():
        raise ValueError('Original image is missing; upload the evidence again.')
    if data.position_m is not None and data.position_m > roll['length_m']:
        raise ValueError('Defect position exceeds roll length.')
    if data.bbox:
        x1,y1,x2,y2 = data.bbox
        if not (0 <= x1 < x2 <= image['width_px'] and 0 <= y1 < y2 <= image['height_px']):
            raise ValueError('Bounding box is outside the image.')
    if data.model_confidence is not None and data.evidence_source != 'MODEL_PREDICTION':
        raise ValueError('Model confidence belongs only to model prediction evidence.')
    if data.model_confidence is not None and not data.segmentation_run_id:
        raise ValueError('Model confidence requires a preserved segmentation result.')
    with connect() as con:
        if data.segmentation_run_id:
            run = con.execute('SELECT * FROM segmentation_runs WHERE id=?',(data.segmentation_run_id,)).fetchone()
            if not run or run['image_id'] != data.image_id:
                raise ValueError('Segmentation result does not belong to this image.')
        mask_reference = f'segmentation:{data.segmentation_run_id}' if data.segmentation_run_id else None
        cur=con.execute('''INSERT INTO defect_observations
            (roll_id,image_path,image_id,defect_label,position_m,width_position,evidence_source,
             inspector_notes,mask_path,bbox_json,model_confidence) VALUES (?,?,?,?,?,?,?,?,?,?,?)''',
            (data.roll_id,image['path'],data.image_id,data.defect_label,data.position_m,data.width_position,
             data.evidence_source,data.inspector_notes,mask_reference,
             json.dumps(data.bbox) if data.bbox else None,data.model_confidence))
        observation_id=cur.lastrowid
        audit(con,'ROLL',data.roll_id,'DEFECT_RECORDED',data.actor,{'observation_id':observation_id,'evidence_source':data.evidence_source})
        row=con.execute('SELECT * FROM defect_observations WHERE id=?',(observation_id,)).fetchone()
        return dict(row)


def verify_observation(observation_id: int, data: Verification) -> dict:
    with connect() as con:
        con.execute('BEGIN IMMEDIATE')
        row=con.execute('SELECT * FROM defect_observations WHERE id=?',(observation_id,)).fetchone()
        if not row:
            raise ValueError('Observation not found.')
        if row['verification_status'] != 'PENDING':
            raise ValueError('This observation already has a human decision.')
        con.execute('''UPDATE defect_observations SET verification_status=?,verified_by=?,
            verified_at=CURRENT_TIMESTAMP WHERE id=?''',(data.decision,data.inspector,observation_id))
        con.execute('''INSERT INTO inspection_verifications (observation_id,inspector,decision,notes)
            VALUES (?,?,?,?)''',(observation_id,data.inspector,data.decision,data.notes))
        audit(con,'ROLL',row['roll_id'],'OBSERVATION_'+data.decision,data.inspector,
              {'observation_id':observation_id,'notes':data.notes})
    return {'id':observation_id,'decision':data.decision,'inspector':data.inspector}


def update_status(roll_id: str, data: RollStatus) -> dict:
    transitions={
        'RECEIVED':{'UNDER_INSPECTION','ON_HOLD'},
        'UNDER_INSPECTION':{'ON_HOLD','QUALITY_CLEARED'},
        'ON_HOLD':{'UNDER_INSPECTION'},
        'QUALITY_CLEARED':{'ON_HOLD','CONSUMED'}, 'CONSUMED':set(),
    }
    with connect() as con:
        con.execute('BEGIN IMMEDIATE')
        row=con.execute('SELECT * FROM fabric_rolls WHERE roll_id=?',(roll_id,)).fetchone()
        if not row:
            raise ValueError('Fabric roll does not exist.')
        if data.status not in transitions.get(row['status'],set()):
            raise ValueError(f"Cannot change {row['status']} to {data.status}. Reopen held rolls for inspection first.")
        if data.status == 'QUALITY_CLEARED':
            pending=con.execute("SELECT COUNT(*) FROM defect_observations WHERE roll_id=? AND verification_status='PENDING'",(roll_id,)).fetchone()[0]
            if pending:
                raise ValueError('Resolve pending observations before quality clearance.')
        con.execute('UPDATE fabric_rolls SET status=? WHERE roll_id=?',(data.status,roll_id))
        audit(con,'ROLL',roll_id,'STATUS_CHANGED',data.actor,{'from':row['status'],'to':data.status,'notes':data.notes})
    return get_fabric_roll(roll_id)


def roll_history(roll_id: str) -> dict:
    roll=get_fabric_roll(roll_id)
    if not roll:
        raise ValueError('Fabric roll does not exist.')
    with connect() as con:
        def rows(sql,args=(roll_id,)):
            return [dict(r) for r in con.execute(sql,args).fetchall()]
        return {'roll':roll,'images':rows('SELECT * FROM fabric_images WHERE roll_id=? ORDER BY id DESC'),
            'observations':get_roll_observations(roll_id),
            'verifications':rows('''SELECT v.* FROM inspection_verifications v JOIN defect_observations d
                ON v.observation_id=d.id WHERE d.roll_id=?'''),
            'allocations':rows('SELECT * FROM batch_roll_links WHERE roll_id=?'),
            'audit':rows("SELECT * FROM operation_audit WHERE entity_type='ROLL' AND entity_id=? ORDER BY id DESC"),
            'legacy_audit':get_fabric_audit(roll_id)}
