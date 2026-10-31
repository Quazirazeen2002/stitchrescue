# STITCHRESCUE

**Save the fabric. Protect the order.**

A connected garment quality, production traceability and recovery planning prototype. The primary interface is **Next.js + React + TypeScript**, backed by **FastAPI**, the existing Python services, SQLite, OpenAI Agents SDK and configurable Meta model connectors.

## Run locally

Python 3.12 and Node 20.9+ are required. From the `Business_Marketer` directory:

```bash
source .venv/bin/activate
cd stitchrescue
python -m pip install -r requirements-dev.txt
# Create .env only if it does not already exist; preserve your current Meta credential.
# Copy missing variable names from .env.example into your existing .env.
python -m uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
```

In a second terminal:

```bash
cd /Users/quazirazeenjubair/Desktop/Business_Marketer/stitchrescue/frontend
npm ci
npm run dev
```

Open **http://localhost:3000** for the public site, **http://localhost:3000/app** for the factory workspace, and **http://127.0.0.1:8000/docs** for interactive REST documentation. The Next.js server proxies `/api/v1/*` to FastAPI. There are no secrets in browser environment variables.

Production build: `npm run build && npm start` inside `frontend`. If the backend target changes, set `BACKEND_URL` in the shell or `frontend/.env.local` before building; `frontend/.env.example` shows the only frontend setting. `docker compose up --build` is provided for local packaging; Docker deployment has not been exercised in this session.

## Manager access and credentials

Keep your existing `MODEL_API_KEY`, `META_BASE_URL` and `META_MODEL`. `SAM_MODEL` defaults to `sam-3.1`. Alternate `META_API_BASE_URL` and `MUSE_WONDER_MODEL` names are supported. Meta inference requires actual model access and is never silently simulated.

A local `MANAGER_APPROVAL_TOKEN` has been initialized in this installation’s server `.env` without displaying it in chat. For a new installation, set a strong value there. Visit `/login` and enter that local manager credential. It is verified by FastAPI and held in browser session storage. This protects verification, roll disposition and recovery approval endpoints. The prototype uses a shared credential; individual accounts, identity proof, role management, TLS and deployment security remain required before production use. General operational record endpoints are intended for a trusted local installation.

A human approval records a decision. It does not execute factory actions. An agent has no approval-decision tool and never receives the manager credential.

## Connected workflow

1. **FabricGuard:** register a roll against an existing order; preserve photographs; record evidence as human reported, dataset ground truth or model prediction. A named inspector verifies or rejects each pending observation.
2. **LineWatch:** register a batch; allocate same-order fabric within the roll's available length; record cutting and sewing line events. Review verified and pending evidence, repeated defects, possible correlations and unknowns.
3. **OrderRescue:** supply accepted and affected units, costs, capacities, material and stock availability. Python calculates four independent alternatives. A model may explain these results when requested.
4. **Approval Center:** save a proposal, request review, inspect its snapshot and record a single human decision with identity, notes and timestamp.
5. **Audit History:** follow the linked actions and preserved legacy fabric events.

The Command Center reads real database counts. Visual Inspection preserves Stage 1 YOLO polygons and boxes, and exposes SAM masks, boxes, raw output and provenance when live inference succeeds. IoU and Dice are calculated only from a submitted annotation for the same source image and the stored model mask union.

## Test

```bash
# From stitchrescue, with the project virtual environment active
python -m pytest -q
# From stitchrescue/frontend
npm run typecheck
npm run build
npx playwright install chromium
npm run test:e2e
```

Backend tests use temporary SQLite databases and mock external inference. Browser tests start an isolated API on port 8001 and Next.js on 3001, with a temporary database and no live AI access. They do not write simulated records into your operational database. Screenshots are saved under `output/playwright/`.

## Architecture and files

```text
stitchrescue/
├── frontend/                 Next.js App Router, components, typed API client, Playwright
├── backend/
│   ├── main.py               Versioned REST API and human authorization boundary
│   ├── schemas/models.py     Validated inputs
│   ├── services/             FabricGuard, LineWatch and visual service transactions
│   └── tests/                Isolated pytest and browser-test server
├── core/                     Existing services, migrations and deterministic recovery engine
├── ai/                       Meta adapters, RAG, SDK tools and orchestration
├── data/BDFD9/               Existing dataset, unchanged
├── knowledge/                Source documents with explicit provenance
├── storage/                  Existing SQLite, originals, overlays and migration backups
├── docs/                     Architecture, API, migration, workflow and testing documentation
├── output/playwright/        Desktop and mobile screenshots
├── app.py                    Preserved legacy Gradio entry point
├── .env.example
└── docker-compose.yml
```

The implementation uses four agent roles (orchestrator, quality investigator, knowledge investigator, recovery planner), 16 unique domain function tools (13 Stage 3 plus three existing read tools) and three specialist delegation tools. Nine mutation tools are explicitly gated with `needs_approval=True` and excluded from unattended report agents. Human UI/API actions call validated services directly. The autonomous runtime is read only.

## Preservation and migration

The original database is backed up with SQLite's backup API before the first Stage 3 schema upgrade. Migrations add columns and tables in place, retain old image paths and rows, create indexes and enforce new batch/order relationships with triggers. Stage 1 renderer, production risk calculations, Meta adapters and existing RAG/investigator functionality remain available. `app.py` is retained for reference; optionally install `requirements-legacy.txt` to run it. Gradio is not part of the new frontend or REST request path.

See [architecture](docs/ARCHITECTURE.md), [API](docs/API.md), [schema](docs/DATABASE_SCHEMA.md), [testing](docs/TESTING.md), [migration](docs/MIGRATION_REPORT.md) and the [simulated ORD-1001 demonstration](docs/ORD_1001_DEMO.md).

## Implementation status and limits

- Implemented: local record workflows, image provenance, traceability, deterministic recovery, approval records, audits, Next.js pages and REST integration.
- Automated tests: backend rules, REST boundaries, mocked model provenance, original polygon rendering, and connected browser workflow. Current results are recorded in `docs/TESTING.md`.
- Simulated: seeded orders/buyers, demo SOP, test records, and the public site's generated illustrative factory image. No customer adoption or partnership is claimed.
- Bounded live API checks completed: Muse Wonder returned a nonempty response; SAM completed on a simulated image with zero boxes/masks. Positive segmentation quality and real factory accuracy remain unvalidated. See `docs/LIVE_CHECKS.md`.
- Factory validation needed: buyer requirements, quality disposition, actual capacity, cost estimates, shipment schedules and penalties. Partial shipment remains conditional while revised delivery terms are absent.
- No automatic execution, stock reservation, ERP integration, individual login accounts or production authorization. Recovery alternatives do not reserve stock/capacity and must never be summed as a combined plan.
