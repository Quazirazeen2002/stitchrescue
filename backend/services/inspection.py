"""Expose original YOLO inspection and real SAM evidence with durable provenance."""
from __future__ import annotations
from dataclasses import asdict
import io
import json
import math
import tempfile
import uuid
from pathlib import Path
from PIL import Image, ImageDraw
from meta_sam_parser import SegmentationMask, decode_mask_to_raster
from core.config import STORAGE_PATH, MAX_UPLOAD_BYTES
from core.database import connect
from core.inspection import inspect_image
from core.stage3_db import audit
from backend.services.fabricguard import get_image
from ai.sam_service import segment_fabric, MODEL
from ai.visual_metrics import evaluate_masks


def asset_url(path: str | Path) -> str:
    path=Path(path).resolve()
    try: relative=path.relative_to(STORAGE_PATH)
    except ValueError: raise ValueError('Evidence path is outside managed storage.')
    return '/api/v1/assets/'+relative.as_posix()


def inspect_upload(content: bytes, annotation: bytes | None = None) -> dict:
    if not content or len(content)>MAX_UPLOAD_BYTES: raise ValueError('Upload an image smaller than 20 MB.')
    try:
        with Image.open(io.BytesIO(content)) as im: im.verify()
        original=Image.open(io.BytesIO(content)).convert('RGB')
    except (OSError,Image.DecompressionBombError) as exc:
        raise ValueError('Invalid image.') from exc
    with tempfile.TemporaryDirectory() as temp:
        annotation_path=None
        if annotation:
            if len(annotation)>1024*1024: raise ValueError('Annotation exceeds 1 MB.')
            annotation_path=Path(temp)/'annotation.txt'
            annotation_path.write_bytes(annotation)
        preview,detections,saved_path=inspect_image(original,str(annotation_path) if annotation_path else None)
    overlay_path=Path(saved_path).with_name(Path(saved_path).stem+'-overlay.png')
    preview.save(overlay_path)
    with connect() as con:
        audit(con,'INSPECTION',Path(saved_path).stem,'VISUAL_INSPECTION','inspector',
              {'evidence_source':'BDFD9_GROUND_TRUTH' if annotation else 'HUMAN_REPORTED','detections':len(detections)})
    return {'original_url':asset_url(saved_path),'overlay_url':asset_url(overlay_path),'detections':detections,
        'evidence_source':'BDFD9_GROUND_TRUTH' if annotation else 'HUMAN_REPORTED',
        'status':'Annotations visualized. No defect classification was performed.'}


def rasterize_prediction(result: dict, size: tuple[int,int]) -> Image.Image:
    union=Image.new('L',size,0)
    for record in result['masks']:
        mask=SegmentationMask(**record['mask'])
        if mask.width*mask.height>50_000_000: raise ValueError('Model mask is too large.')
        raster=decode_mask_to_raster(mask)
        local=Image.frombytes('L',(mask.width,mask.height),bytes(255 if v else 0 for v in raster))
        bounds=record['bounds']
        left,top,right,bottom=(round(bounds[k]) for k in ('left','top','right','bottom'))
        if not (0<=left<right<=size[0] and 0<=top<bottom<=size[1]):
            raise ValueError('Model mask bounds do not fit the source image.')
        if local.size!=(right-left,bottom-top):
            local=local.resize((right-left,bottom-top),Image.Resampling.NEAREST)
        layer=Image.new('L',size,0)
        layer.paste(local,(left,top))
        import PIL.ImageChops
        union=PIL.ImageChops.lighter(union,layer)
    return union


async def segment_image(image_id: int, prompt: str) -> dict:
    image=get_image(image_id)
    result=await segment_fabric(image['path'],prompt)
    serial={'boxes':[asdict(b) for b in result['boxes']], 'masks':[asdict(m) for m in result['masks']],
        'raw_output':result['raw_output'],'outcome':result['outcome'],
        'diagnostics':[asdict(d) for d in result['diagnostics']], 'prompt':prompt,'model':MODEL,
        'evidence_source':'MODEL_PREDICTION','source_sha256':image['sha256']}
    # Persist the provider output before attempting optional preview decoding.
    with connect() as con:
        cur=con.execute('INSERT INTO segmentation_runs(image_id,image_path,prompt,model,result_json) VALUES (?,?,?,?,?)',
             (image_id,image['path'],prompt,MODEL,json.dumps(serial)))
        serial['id']=cur.lastrowid
        audit(con,'ROLL',image['roll_id'],'SAM_EVIDENCE_RECORDED','model',
              {'segmentation_run_id':cur.lastrowid,'image_id':image_id,'model':MODEL})
    try:
        original=Image.open(image['path']).convert('RGBA')
        prediction=rasterize_prediction(serial,original.size)
        overlay=Image.new('RGBA',original.size,(243,183,63,0))
        overlay.putalpha(prediction.point(lambda x:90 if x else 0))
        preview=Image.alpha_composite(original,overlay)
        draw=ImageDraw.Draw(preview)
        for box in serial['boxes']:
            draw.rectangle((box['left'],box['top'],box['right'],box['bottom']),outline='#F3B73F',width=3)
        directory=STORAGE_PATH/'inspections'
        directory.mkdir(parents=True,exist_ok=True)
        path=directory/(uuid.uuid4().hex+'-sam.png')
        preview.save(path)
        serial['overlay_url']=asset_url(path)
        serial['overlay_status']='AVAILABLE'
    except (ValueError,OSError) as exc:
        serial['overlay_status']='UNAVAILABLE'
        serial['preview_warning']=str(exc)
    with connect() as con:
        con.execute('UPDATE segmentation_runs SET result_json=? WHERE id=?',(json.dumps(serial),serial['id']))

    return serial


def evaluate_segmentation(run_id: int, annotation: bytes) -> dict:
    with connect() as con:
        row=con.execute('SELECT * FROM segmentation_runs WHERE id=?',(run_id,)).fetchone()
    if not row: raise ValueError('Segmentation run not found.')
    result=json.loads(row['result_json'])
    image=Image.open(row['image_path'])
    width,height=image.size
    truth=Image.new('L',image.size,0)
    draw=ImageDraw.Draw(truth)
    for line in annotation.decode('utf-8-sig').splitlines():
        if not line.strip(): continue
        parts=line.split()
        int(parts[0])
        coords=[float(v) for v in parts[1:]]
        if not all(math.isfinite(v) and 0<=v<=1 for v in coords): raise ValueError('Invalid ground truth coordinates.')
        if len(coords)==4:
            x,y,w,h=coords
            draw.rectangle(((x-w/2)*width,(y-h/2)*height,(x+w/2)*width,(y+h/2)*height),fill=255)
        elif len(coords)>=6 and len(coords)%2==0:
            draw.polygon([(coords[i]*width,coords[i+1]*height) for i in range(0,len(coords),2)],fill=255)
        else: raise ValueError('Unsupported YOLO annotation.')
    prediction=rasterize_prediction(result,image.size)
    return {**evaluate_masks(truth,prediction),'scope':'Union of all supplied ground truth regions versus model masks on the same source image. Not classification accuracy.',
            'segmentation_run_id':run_id,'evidence_source':'BDFD9_GROUND_TRUTH'}
