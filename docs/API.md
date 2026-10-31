# REST API

Base path: `/api/v1`. Interactive documentation: `http://127.0.0.1:8000/docs`. The generated contract is in `openapi.json`.

## Endpoints

- `GET /health` — Health
- `GET /api/v1/health` — Health
- `POST /api/v1/auth/manager` — Login
- `GET /api/v1/settings` — Settings
- `GET /api/v1/dashboard` — Dashboard
- `GET /api/v1/orders` — Orders
- `GET /api/v1/incidents` — Incidents
- `POST /api/v1/incidents` — Incident
- `GET /api/v1/fabric-rolls` — Rolls
- `POST /api/v1/fabric-rolls` — Create Roll
- `GET /api/v1/fabric-rolls/{roll_id}` — Roll Detail
- `PATCH /api/v1/fabric-rolls/{roll_id}/status` — Roll Status
- `POST /api/v1/fabric-rolls/{roll_id}/images` — Upload
- `GET /api/v1/images/{image_id}/file` — Image File
- `GET /api/v1/assets/{resource}` — Asset
- `POST /api/v1/defects` — Defect
- `POST /api/v1/defects/{observation_id}/verification` — Verification
- `GET /api/v1/production-batches` — Batches
- `POST /api/v1/production-batches` — Batch
- `POST /api/v1/production-batches/{batch_id}/allocations` — Allocation
- `GET /api/v1/machine-events` — Events
- `POST /api/v1/machine-events` — Event
- `GET /api/v1/linewatch/{batch_id}` — Trace
- `POST /api/v1/linewatch/{batch_id}/investigate` — Investigate Batch
- `POST /api/v1/inspections` — Inspection
- `POST /api/v1/images/{image_id}/segment` — Segment
- `POST /api/v1/segmentations/{run_id}/evaluate` — Evaluate
- `POST /api/v1/order-rescue/calculate` — Calculate
- `GET /api/v1/order-rescue/plans` — Plans
- `POST /api/v1/order-rescue/plans` — Save Plan
- `GET /api/v1/order-rescue/plans/{plan_id}` — Plan
- `POST /api/v1/order-rescue/recommend` — Recommend
- `GET /api/v1/approvals` — Approvals
- `POST /api/v1/approvals` — Approval
- `POST /api/v1/approvals/{approval_id}/decision` — Decision
- `GET /api/v1/audit` — Audit History
- `GET /api/v1/reports` — Reports
- `POST /api/v1/agents/investigate` — Agent Investigate
- `GET /api/v1/knowledge` — Knowledge
- `POST /api/v1/demo-requests` — Demo Request

## Contracts and errors

JSON mutations use Pydantic models with unknown fields rejected. File endpoints use multipart form data. Validation errors return 422; business-rule failures return 400; duplicate IDs or relationship conflicts return 409. Missing or invalid manager credentials return 503 or 403 respectively. External model failure returns 503 with no simulated replacement output.

Manager-authorized endpoints require `X-Manager-Token`: defect verification, fabric status transitions and approval decisions. The credential is checked against the server environment with constant-time comparison. It is never returned in settings or reports. `/auth/manager` verifies a submitted credential for a browser session; this local prototype does not issue individual user accounts.

Image access is limited to existing managed image assets. Uploads are validated by actual image bytes, have generated filenames and preserve original hashes. Public image response models omit filesystem paths. Roll history retains legacy paths as record metadata, while file access remains constrained to storage.

The API uses synchronous service functions for short SQLite transactions and async endpoints for external inference and upload reads. The operations routes do not depend on successful model calls.

The Next.js server proxy provides same-origin browser calls. FastAPI CORS accepts only `FRONTEND_ORIGIN`. Deployment authentication, network policy and rate limiting require a production configuration.
