# Stage 3 implementation

FabricGuard, LineWatch and OrderRescue share the existing order records, immutable images and a common audit stream. The Next.js interface uses the versioned FastAPI service boundary; the existing model and inspection modules remain in Python.

Read the module specifications in `FABRICGUARD.md`, `LINEWATCH.md` and `ORDERRESCUE.md`. See `ARCHITECTURE.md` for the system diagram and `DATABASE_SCHEMA.md` for relationships. `MIGRATION_REPORT.md` records how Stage 1/2 functionality was preserved.

The local prototype is implemented for validation. Seeded orders, the demo SOP and automated test records are simulated. Bounded live Meta checks completed as documented in `LIVE_CHECKS.md`; positive segmentation and factory-specific inference still require validation. No factory deployment, customer adoption, approved buyer policy or automatic execution is claimed.
