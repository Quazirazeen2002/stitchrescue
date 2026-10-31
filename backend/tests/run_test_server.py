"""Isolated browser-test API: temporary database, files and no live AI access."""
import os
import tempfile
from pathlib import Path
import uvicorn

if __name__=='__main__':
    with tempfile.TemporaryDirectory(prefix='stitchrescue-browser-test-') as directory:
        os.environ.update(DATABASE_PATH=str(Path(directory)/'test.db'),STORAGE_PATH=directory,
            MANAGER_APPROVAL_TOKEN='test-human-manager',MODEL_API_KEY='',FRONTEND_ORIGIN='http://localhost:3001')
        uvicorn.run('backend.main:app',host='127.0.0.1',port=8001)
