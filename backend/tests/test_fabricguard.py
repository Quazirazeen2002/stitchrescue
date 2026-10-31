import hashlib
import sqlite3
from pathlib import Path
import pytest
from pydantic import ValidationError
from backend.schemas.models import RollCreate,ObservationCreate,Verification,RollStatus
from backend.services import fabricguard as fg
from core.database import connect


def observation(image,**changes):
    return ObservationCreate(roll_id=image['roll_id'],image_id=image['id'],defect_label='SIMULATED oil stain',
        evidence_source='HUMAN_REPORTED',actor='SIMULATED inspector',**changes)


def test_register_metadata(roll):
    assert roll['composition']=='100% cotton'
    assert roll['width_cm']==150
    assert fg.roll_history(roll['roll_id'])['audit'][0]['event_type']=='ROLL_REGISTERED'


def test_duplicate_roll(roll):
    with pytest.raises(sqlite3.IntegrityError):
        fg.register_roll(RollCreate(roll_id=roll['roll_id'],supplier='test',fabric_type='Cotton',length_m=1,
            order_id='ORD-1001',actor='test'))


def test_nonexistent_order():
    with pytest.raises(ValueError,match='Order does not exist'):
        fg.register_roll(RollCreate(roll_id='BAD',supplier='test',fabric_type='Cotton',length_m=1,
            order_id='MISSING',actor='test'))

@pytest.mark.parametrize('changes',[{'roll_id':''},{'length_m':-1},{'gsm':0},{'width_cm':float('nan')}])
def test_invalid_roll_fields(changes):
    data=dict(roll_id='R',supplier='test',fabric_type='Cotton',length_m=1,order_id='ORD-1001',actor='test')
    data.update(changes)
    with pytest.raises(ValidationError): RollCreate(**data)


def test_image_preserves_original_bytes(image):
    assert hashlib.sha256(Path(image['path']).read_bytes()).hexdigest()==image['sha256']
    assert image['width_px']==40 and image['height_px']==30

@pytest.mark.parametrize('content',[b'',b'not an image',b'GIF89a'])
def test_invalid_image(roll,content):
    with pytest.raises(ValueError): fg.upload_image(roll['roll_id'],content,'test')


def test_record_pending_observation(image):
    row=fg.record_observation(observation(image))
    assert row['verification_status']=='PENDING'
    assert row['evidence_source']=='HUMAN_REPORTED'


def test_position_exceeds_roll(image):
    with pytest.raises(ValueError,match='position'):
        fg.record_observation(observation(image,position_m=501))


def test_bounding_box_validation(image):
    with pytest.raises(ValueError,match='Bounding box'):
        fg.record_observation(observation(image,bbox=(0,0,100,100)))


def test_model_confidence_provenance(image):
    with pytest.raises(ValueError,match='Model confidence'):
        fg.record_observation(observation(image,model_confidence=.9))


def test_verify_once_and_preserve_identity(image):
    row=fg.record_observation(observation(image))
    data=Verification(decision='VERIFIED',notes='SIMULATED visual check',inspector='Human A')
    fg.verify_observation(row['id'],data)
    history=fg.roll_history(image['roll_id'])
    assert history['verifications'][0]['inspector']=='Human A'
    assert history['observations'][0]['verified_at']
    with pytest.raises(ValueError,match='already'): fg.verify_observation(row['id'],data)


def test_nonexistent_observation():
    with pytest.raises(ValueError,match='not found'):
        fg.verify_observation(999,Verification(decision='REJECTED',notes='test',inspector='Human'))


def test_roll_transitions_and_pending_clearance(image):
    fg.record_observation(observation(image))
    fg.update_status(image['roll_id'],RollStatus(status='UNDER_INSPECTION',actor='Human',notes='Inspect'))
    with pytest.raises(ValueError,match='pending'):
        fg.update_status(image['roll_id'],RollStatus(status='QUALITY_CLEARED',actor='Human',notes='Review'))
    fg.update_status(image['roll_id'],RollStatus(status='ON_HOLD',actor='Human',notes='Hold'))
    with pytest.raises(ValueError,match='Cannot change'):
        fg.update_status(image['roll_id'],RollStatus(status='QUALITY_CLEARED',actor='Human',notes='Invalid shortcut'))
