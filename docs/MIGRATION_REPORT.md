# Gradio migration and preservation

The primary entry points are now `frontend/app/` and `backend/main.py`. The new application does not import Gradio, use Gradio components or route user interactions through Gradio callbacks.

Preserved services:

- `core/inspection.py`: existing BDFD9 class loading, YOLO box/polygon parsing and visualization; paths now resolve relative to the project instead of the shell directory.
- `core/risk_engine.py`: existing accepted-unit and nominal capacity risk calculations.
- `ai/meta_adapter.py`: existing Meta model integration, key name and SDK model adapter; additional config aliases are supported.
- `ai/sam_service.py`: existing async response parser integration; model/base URL are configurable.
- `ai/knowledge.py`: existing local TF-IDF retrieval, extended with status, document ID and retrieval auditing.
- `ai/investigator.py`, `ai/tools.py`: existing quality investigator and legacy tools, reused by the new orchestrator.
- Existing SQLite records, BDFD9 files, knowledge text, original upload paths and legacy audit history.

The legacy `app.py` remains on disk as a reference and optional local prototype. `requirements-legacy.txt` supplies its Gradio dependency. Its older mutation callbacks do not implement every new service validation, so new operations should use the Next.js interface and FastAPI services.

The repository uses the existing `core/` and `ai/` boundaries rather than duplicating them under `backend/`. REST schemas and service transactions live under `backend/`. SQLite-specific persistence is isolated from React and external model clients, but a future PostgreSQL migration will still require explicit SQL/repository changes.
