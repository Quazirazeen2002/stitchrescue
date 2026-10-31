# Stage 3 implementation plan

## Existing system and schema conflicts

- `orders.id` is the primary key. ORD-1001 is seeded with 20,000 total, 20,000 completed and 2,000 rejected, so the existing risk engine derives 18,000 accepted. These seed rows are simulated examples.
- Stage 1 image inspection and YOLO annotation rendering work and remain in `core/inspection.py`.
- Stage 2 agent, knowledge search, SAM service and Gradio callbacks already exist; preserve their contracts.
- FabricGuard tables already hold live prototype rows. `fabric_rolls` lacks composition, width, GSM and received date. `defect_observations` lacks separate image metadata, mask provenance, bounding box, confidence and verification identity. Add columns and tables in place; never drop rows.
- LineWatch tables exist but `production_batches.order_id` has no foreign key. Existing service validates it; migration cannot add a SQLite FK without rebuilding the table, so retain validation and document the limit. A production lines catalogue and useful indexes are absent.
- Recovery proposals and approval records do not exist. Add new tables and keep calculations in deterministic Python.
- The Gradio app captures roll choices at startup; batch choices are free text. Refresh selector choices after creation.
- Existing `storage/stitchrescue.db` contains user data, including a blank legacy roll ID. Preserve it and filter it from new selectors.

## Build order

1. Add idempotent schema migrations, indexes, validation and shared audit records.
2. Complete FabricGuard metadata, image provenance, verification identity, roll transitions and history.
3. Complete LineWatch registration, allocation checks, machine events, trace evidence and investigation reports.
4. Build deterministic OrderRescue scenarios and durable plans; add human approval requests and decisions.
5. Expose bounded read-only agent tools and a recovery planner. Keep approval actions in human UI callbacks.
6. Extend Gradio with Command Center, Visual Inspection, OrderRescue, Approval Center and Audit History, preserving existing tabs until integrated equivalents work.
7. Build a Next.js App Router public website and factory application with typed REST calls to FastAPI. Retain the Gradio source as a legacy reference; the default run commands launch Next.js and FastAPI.
8. Add pytest tests, documentation and run import, workflow and UI checks.

## Design direction

Palette: navy `#101B2B`, gold `#F3B73F`, coral `#E85D4A`, warm white `#F4F3EF`, slate `#77808D`. Headings use a bold geometric sans; body text a neutral sans; numbers a tabular mono. The signature image is an original textile grid with inspection marks, connecting the material to the workflow. The marketing site uses large type and broad color blocks; the operations UI uses restrained cards and status colors.

## Updated migration contract

The latest specification requires Next.js, TypeScript and FastAPI. Python business services remain in `core/` and `ai/`; `backend/` provides validated REST boundaries and `frontend/` provides the primary UI. A SQLite backup is created before the first Stage 3 migration. API calls use server-side Meta configuration. Human decisions require a separately configured manager token; agent tools never receive that token or a decision tool.
