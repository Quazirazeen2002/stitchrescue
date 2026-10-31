"""Idempotent Stage 3 schema upgrades and bounded persistence helpers."""
from __future__ import annotations

import json
import sqlite3
from datetime import datetime, timezone
from core import database as db
from typing import Any
from core.database import connect, init_db, init_fabricguard, init_linewatch


def _add_columns(con: sqlite3.Connection, table: str, columns: dict[str, str]) -> None:
    existing = {row['name'] for row in con.execute(f'PRAGMA table_info({table})')}
    for name, definition in columns.items():
        if name not in existing:
            con.execute(f'ALTER TABLE {table} ADD COLUMN {name} {definition}')


def init_stage3() -> None:
    """Upgrade existing SQLite data in place; safe to run at every startup."""
    backup_database()
    init_db()
    init_fabricguard()
    init_linewatch()
    with connect() as con:
        _add_columns(con, 'fabric_rolls', {
            'composition': 'TEXT', 'width_cm': 'REAL', 'gsm': 'REAL',
            'received_date': 'TEXT', 'purchase_order': 'TEXT',
        })
        _add_columns(con, 'defect_observations', {
            'image_id': 'INTEGER REFERENCES fabric_images(id)',
            'mask_path': 'TEXT', 'bbox_json': 'TEXT', 'model_confidence': 'REAL',
            'verified_by': 'TEXT', 'verified_at': 'TEXT',
        })
        con.executescript('''
        CREATE TABLE IF NOT EXISTS schema_migrations (
            version INTEGER PRIMARY KEY, applied_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS fabric_images (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            roll_id TEXT NOT NULL REFERENCES fabric_rolls(roll_id),
            path TEXT NOT NULL UNIQUE,
            sha256 TEXT NOT NULL,
            width_px INTEGER NOT NULL,
            height_px INTEGER NOT NULL,
            media_type TEXT NOT NULL,
            uploaded_by TEXT NOT NULL,
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS production_lines (
            line_id TEXT PRIMARY KEY,
            line_type TEXT NOT NULL CHECK(line_type IN ('CUTTING','SEWING','OTHER')),
            description TEXT
        );
        CREATE TABLE IF NOT EXISTS recovery_plans (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id TEXT NOT NULL REFERENCES orders(id),
            affected_quantity INTEGER NOT NULL CHECK(affected_quantity > 0),
            accepted_quantity INTEGER NOT NULL CHECK(accepted_quantity >= 0),
            scenarios_json TEXT NOT NULL,
            recommended_strategy TEXT,
            status TEXT NOT NULL DEFAULT 'PROPOSED'
                CHECK(status IN ('PROPOSED','PENDING_APPROVAL','APPROVED','REJECTED')),
            requested_by TEXT NOT NULL,
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS approval_requests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            recovery_plan_id INTEGER NOT NULL REFERENCES recovery_plans(id),
            requested_by TEXT NOT NULL,
            decision TEXT NOT NULL DEFAULT 'PENDING'
                CHECK(decision IN ('PENDING','APPROVED','REJECTED')),
            decision_notes TEXT,
            decided_by TEXT,
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            decided_at TEXT,
            UNIQUE(recovery_plan_id)
        );
        CREATE TABLE IF NOT EXISTS operation_audit (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            entity_type TEXT NOT NULL,
            entity_id TEXT NOT NULL,
            event_type TEXT NOT NULL,
            details_json TEXT NOT NULL DEFAULT '{}',
            actor TEXT NOT NULL,
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS demo_requests (
            id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, email TEXT NOT NULL,
            company TEXT NOT NULL, message TEXT NOT NULL, created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS inspection_verifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            observation_id INTEGER NOT NULL REFERENCES defect_observations(id),
            inspector TEXT NOT NULL, decision TEXT NOT NULL, notes TEXT NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS segmentation_runs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            image_id INTEGER REFERENCES fabric_images(id),
            image_path TEXT NOT NULL, prompt TEXT NOT NULL, model TEXT NOT NULL,
            result_json TEXT NOT NULL, created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS investigation_reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT, order_id TEXT REFERENCES orders(id),
            batch_id TEXT REFERENCES production_batches(batch_id),
            report_type TEXT NOT NULL, report TEXT NOT NULL,
            evidence_json TEXT NOT NULL DEFAULT '{}',
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TRIGGER IF NOT EXISTS validate_batch_order_insert
        BEFORE INSERT ON production_batches
        WHEN NOT EXISTS (SELECT 1 FROM orders WHERE id=NEW.order_id)
        BEGIN SELECT RAISE(ABORT, 'Order does not exist'); END;
        CREATE TRIGGER IF NOT EXISTS validate_batch_order_update
        BEFORE UPDATE OF order_id ON production_batches
        WHEN NOT EXISTS (SELECT 1 FROM orders WHERE id=NEW.order_id)
        BEGIN SELECT RAISE(ABORT, 'Order does not exist'); END;
        INSERT OR IGNORE INTO schema_migrations(version) VALUES (3);
        CREATE INDEX IF NOT EXISTS idx_roll_order ON fabric_rolls(order_id);
        CREATE INDEX IF NOT EXISTS idx_observation_roll ON defect_observations(roll_id, verification_status);
        CREATE INDEX IF NOT EXISTS idx_image_roll ON fabric_images(roll_id);
        CREATE INDEX IF NOT EXISTS idx_batch_order ON production_batches(order_id);
        CREATE INDEX IF NOT EXISTS idx_link_roll ON batch_roll_links(roll_id);
        CREATE INDEX IF NOT EXISTS idx_machine_line_time ON machine_events(production_line, event_time);
        CREATE INDEX IF NOT EXISTS idx_plan_status ON recovery_plans(status, order_id);
        CREATE INDEX IF NOT EXISTS idx_audit_entity ON operation_audit(entity_type, entity_id);
        ''')
        _add_columns(con, 'recovery_plans', {
            'incident_id': 'INTEGER REFERENCES incidents(id)',
            'evidence_json': "TEXT NOT NULL DEFAULT '{}'",
        })


def backup_database() -> str | None:
    """Create a consistent SQLite backup before any Stage 3 schema changes."""
    if not db.DB_PATH.exists():
        return None
    with sqlite3.connect(db.DB_PATH) as source:
        migrated = source.execute("SELECT 1 FROM sqlite_master WHERE name='schema_migrations'").fetchone()
        if migrated and source.execute('SELECT 1 FROM schema_migrations WHERE version=3').fetchone():
            return None
        directory = db.DB_PATH.parent / 'backups'
        directory.mkdir(parents=True, exist_ok=True)
        name = datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%S%fZ')
        destination = directory / f'pre-stage3-{name}.db'
        with sqlite3.connect(destination) as target:
            source.backup(target)
    return str(destination)


def audit(con: sqlite3.Connection, entity_type: str, entity_id: str,
          event_type: str, actor: str, details: dict[str, Any] | None = None) -> None:
    con.execute('''INSERT INTO operation_audit
        (entity_type, entity_id, event_type, details_json, actor)
        VALUES (?, ?, ?, ?, ?)''',
        (entity_type, str(entity_id), event_type, json.dumps(details or {}), actor))


def dashboard_counts() -> dict[str, int]:
    """Return live operational counts; no demo metrics are inferred."""
    queries = {
        'registered_rolls': "SELECT COUNT(*) FROM fabric_rolls WHERE roll_id <> ''",
        'open_incidents': "SELECT COUNT(*) FROM incidents WHERE status='OPEN'",
        'verified_defects': "SELECT COUNT(*) FROM defect_observations WHERE verification_status='VERIFIED'",
        'rolls_on_hold': "SELECT COUNT(*) FROM fabric_rolls WHERE status='ON_HOLD'",
        'active_batches': "SELECT COUNT(*) FROM production_batches WHERE status IN ('PLANNED','IN_PROGRESS')",
        'pending_proposals': "SELECT COUNT(*) FROM recovery_plans WHERE status='PROPOSED'",
        'pending_approvals': "SELECT COUNT(*) FROM approval_requests WHERE decision='PENDING'",
    }
    with connect() as con:
        return {key: con.execute(sql).fetchone()[0] for key, sql in queries.items()}


def recent_audit(limit: int = 100) -> list[dict[str, Any]]:
    with connect() as con:
        rows = con.execute('SELECT * FROM operation_audit ORDER BY id DESC LIMIT ?',
                           (min(max(int(limit), 1), 500),)).fetchall()
        return [dict(row) for row in rows]
