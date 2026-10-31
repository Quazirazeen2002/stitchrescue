import io
from pathlib import Path
import pytest
from PIL import Image
from fastapi.testclient import TestClient
from core import database as database
from core.stage3_db import init_stage3
from backend.services import fabricguard as fg, inspection as vision
from backend.schemas.models import RollCreate, BatchCreate, RecoveryInput
from backend.services.linewatch import register_batch

@pytest.fixture(autouse=True)
def isolated_database(tmp_path,monkeypatch):
    monkeypatch.setattr(database,'DB_PATH',tmp_path/'factory.db')
    monkeypatch.setattr(fg,'STORAGE_PATH',tmp_path)
    monkeypatch.setattr(vision,'STORAGE_PATH',tmp_path)
    import core.inspection as original
    directory=tmp_path/'inspections'
    directory.mkdir()
    monkeypatch.setattr(original,'IMAGE_DIR',directory)
    monkeypatch.setenv('MANAGER_APPROVAL_TOKEN','test-human-manager')
    init_stage3()
    yield

@pytest.fixture
def roll():
    return fg.register_roll(RollCreate(roll_id='TEST-ROLL',supplier='SIMULATED supplier',fabric_type='Cotton',
        length_m=500,order_id='ORD-1001',actor='SIMULATED inspector',composition='100% cotton',width_cm=150,gsm=160))

@pytest.fixture
def batch():
    return register_batch(BatchCreate(batch_id='TEST-BATCH',order_id='ORD-1001',cutting_line='CUT-1',
        sewing_line='SEW-1',planned_quantity=2000,actor='SIMULATED production manager'))

@pytest.fixture
def image(roll):
    data=io.BytesIO()
    Image.new('RGB',(40,30),'white').save(data,'PNG')
    return fg.upload_image(roll['roll_id'],data.getvalue(),'SIMULATED inspector')

@pytest.fixture
def recovery_input():
    return RecoveryInput(order_id='ORD-1001',accepted_quantity=18000,affected_quantity=2000,available_hours=48,
        rework_cost_per_unit=20,rework_capacity_per_hour=100,replacement_cost_per_unit=180,
        replacement_capacity_per_hour=120,replacement_material_units=2000,stock_quantity=1000,
        stock_unit_cost=150,stock_handling_hours=3,material_compatible=True,buyer_spec_compatible=True,
        reinspection_authorized=True,capacity_confirmed=True,assumptions='SIMULATED test assumptions, not factory estimates.')

@pytest.fixture
def client(monkeypatch,tmp_path):
    import backend.main as main
    monkeypatch.setattr(main,'STORAGE_PATH',tmp_path)
    with TestClient(main.app) as test_client:
        yield test_client
