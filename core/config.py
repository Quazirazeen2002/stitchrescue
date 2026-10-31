"""Server configuration. Secrets are read only by Python."""
import os
from pathlib import Path
from dotenv import load_dotenv

PROJECT_ROOT = Path(__file__).resolve().parents[1]
load_dotenv(PROJECT_ROOT / '.env')
STORAGE_PATH = Path(os.getenv('STORAGE_PATH', str(PROJECT_ROOT / 'storage'))).expanduser().resolve()
FRONTEND_ORIGIN = os.getenv('FRONTEND_ORIGIN', 'http://localhost:3000')
MAX_UPLOAD_BYTES = 20 * 1024 * 1024
