import sqlite3
from pathlib import Path
import os
from core.config import STORAGE_PATH

DB_PATH = Path(os.getenv("DATABASE_PATH", str(STORAGE_PATH / "stitchrescue.db")))


def connect():
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    con = sqlite3.connect(DB_PATH, timeout=30)
    con.row_factory =  sqlite3.Row
    con.execute("PRAGMA foreign_keys = ON")
    con.execute("PRAGMA busy_timeout = 30000")
    return con


def init_db():
    with connect() as con:
        con.executescript("""
        CREATE TABLE IF NOT EXISTS orders (
            id TEXT PRIMARY KEY,
            buyer TEXT NOT NULL,
            product TEXT NOT NULL,
            quantity INTEGER NOT NULL,
            completed INTEGER NOT NULL,
            rejected INTEGER NOT NULL,
            hours_left REAL NOT NULL,
            hourly_capacity REAL NOT NULL,
            penalty_bdt REAL NOT NULL
        );

        CREATE TABLE IF NOT EXISTS inspections (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id TEXT NOT NULL,
            image_path TEXT NOT NULL,
            defect_label TEXT NOT NULL,
            evidence_type TEXT NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(order_id) REFERENCES orders(id)
        );

        CREATE TABLE IF NOT EXISTS incidents (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id TEXT NOT NULL,
            defect_label TEXT NOT NULL,
            affected_quantity INTEGER NOT NULL,
            status TEXT NOT NULL DEFAULT 'OPEN',
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(order_id) REFERENCES orders(id)
        );
        """)

        con.executemany("""
        INSERT OR IGNORE INTO orders VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, [
            ("ORD-1001", "Buyer A", "Cotton Shirt",
             20000, 20000, 2000, 48, 120, 500000),
            ("ORD-1002", "Buyer B", "Polo Shirt",
             12000, 9000, 500, 36, 100, 250000),
            ("ORD-1003", "Buyer C", "T-Shirt",
             15000, 14000, 200, 72, 80, 180000)
        ])



# Add to core/database.py

def init_linewatch():
    with connect() as con:
        con.executescript("""
        CREATE TABLE IF NOT EXISTS production_batches (
            batch_id TEXT PRIMARY KEY,
            order_id TEXT NOT NULL,
            cutting_line TEXT,
            sewing_line TEXT,
            planned_quantity INTEGER NOT NULL,
            produced_quantity INTEGER DEFAULT 0,
            started_at TEXT,
            completed_at TEXT,
            status TEXT DEFAULT 'PLANNED'
        );

        CREATE TABLE IF NOT EXISTS batch_roll_links (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            batch_id TEXT NOT NULL,
            roll_id TEXT NOT NULL,
            allocated_length_m REAL NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(batch_id, roll_id),
            FOREIGN KEY(batch_id)
                REFERENCES production_batches(batch_id),
            FOREIGN KEY(roll_id)
                REFERENCES fabric_rolls(roll_id)
        );

        CREATE TABLE IF NOT EXISTS machine_events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            machine_id TEXT NOT NULL,
            production_line TEXT NOT NULL,
            event_type TEXT NOT NULL,
            description TEXT,
            event_time TEXT NOT NULL,
            recorded_by TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS linewatch_findings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            batch_id TEXT NOT NULL,
            finding_type TEXT NOT NULL,
            finding_summary TEXT NOT NULL,
            evidence_json TEXT,
            confidence_level TEXT DEFAULT 'UNASSESSED',
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(batch_id)
                REFERENCES production_batches(batch_id)
        );
        """)


def register_production_batch(
    batch_id,
    order_id,
    cutting_line,
    sewing_line,
    planned_quantity,
    started_at
):
    if int(planned_quantity) <= 0:
        raise ValueError("Quantity must be positive.")

    with connect() as con:
        order = con.execute(
            "SELECT id FROM orders WHERE id = ?",
            (order_id,)
        ).fetchone()

        if order is None:
            raise ValueError("Order does not exist.")

        con.execute("""
            INSERT INTO production_batches (
                batch_id, order_id, cutting_line,
                sewing_line, planned_quantity,
                started_at
            )
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            batch_id, order_id, cutting_line,
            sewing_line, int(planned_quantity),
            started_at
        ))


def link_roll_to_batch(
    batch_id, roll_id, allocated_length_m
):
    if float(allocated_length_m) <= 0:
        raise ValueError("Allocated length must be positive.")

    with connect() as con:
        batch = con.execute("""
            SELECT batch_id FROM production_batches
            WHERE batch_id = ?
        """, (batch_id,)).fetchone()

        roll = con.execute("""
            SELECT roll_id, length_m, status
            FROM fabric_rolls WHERE roll_id = ?
        """, (roll_id,)).fetchone()

        if not batch or not roll:
            raise ValueError("Batch or roll not found.")

        if roll["status"] == "ON_HOLD":
            raise ValueError(
                "Cannot allocate a roll currently on hold."
            )

        allocated = con.execute("""
            SELECT COALESCE(SUM(allocated_length_m), 0)
            FROM batch_roll_links
            WHERE roll_id = ?
        """, (roll_id,)).fetchone()[0]

        if allocated + float(allocated_length_m) > roll["length_m"]:
            raise ValueError(
                "Allocation exceeds roll length."
            )

        con.execute("""
            INSERT INTO batch_roll_links (
                batch_id, roll_id, allocated_length_m
            )
            VALUES (?, ?, ?)
        """, (
            batch_id, roll_id, float(allocated_length_m)
        ))


def record_machine_event(
    machine_id, production_line,
    event_type, description, event_time,
    recorded_by
):
    allowed = {
        "MAINTENANCE",
        "BREAKDOWN",
        "CLEANING",
        "LUBRICATION",
        "INSPECTION"
    }

    if event_type not in allowed:
        raise ValueError("Invalid machine event type.")

    with connect() as con:
        con.execute("""
            INSERT INTO machine_events (
                machine_id, production_line,
                event_type, description,
                event_time, recorded_by
            )
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            machine_id, production_line,
            event_type, description,
            event_time, recorded_by
        ))


def get_batch_trace(batch_id):
    with connect() as con:
        batch = con.execute("""
            SELECT * FROM production_batches
            WHERE batch_id = ?
        """, (batch_id,)).fetchone()

        if not batch:
            return None

        links = con.execute("""
            SELECT
                l.roll_id,
                l.allocated_length_m,
                r.supplier,
                r.fabric_type,
                r.status
            FROM batch_roll_links l
            JOIN fabric_rolls r
                ON r.roll_id = l.roll_id
            WHERE l.batch_id = ?
        """, (batch_id,)).fetchall()

        observations = con.execute("""
            SELECT
                d.id,
                d.roll_id,
                d.defect_label,
                d.position_m,
                d.verification_status,
                d.evidence_source
            FROM batch_roll_links l
            JOIN defect_observations d
                ON d.roll_id = l.roll_id
            WHERE l.batch_id = ?
        """, (batch_id,)).fetchall()

        return {
            "batch": dict(batch),
            "rolls": [dict(x) for x in links],
            "observations": [dict(x) for x in observations]
        }


def get_machine_events(production_line):
    with connect() as con:
        rows = con.execute("""
            SELECT * FROM machine_events
            WHERE production_line = ?
            ORDER BY event_time DESC
        """, (production_line,)).fetchall()

        return [dict(x) for x in rows]

def get_orders():
    with connect() as con:
        rows = con.execute(
            "SELECT * FROM orders ORDER BY id"
        ).fetchall()
        return [dict(row) for row in rows]


def get_order(order_id):
    with connect() as con:
        row = con.execute(
            "SELECT * FROM orders WHERE id = ?",
            (order_id,)
        ).fetchone()
        return dict(row) if row else None


def save_inspection(order_id, path, label, evidence_type):
    with connect() as con:
        cur = con.execute("""
        INSERT INTO inspections
        (order_id, image_path, defect_label, evidence_type)
        VALUES (?, ?, ?, ?)
        """, (order_id, path, label, evidence_type))
        return cur.lastrowid



def create_incident(order_id, label, quantity):
    with connect() as con:
        cur = con.execute("""
        INSERT INTO incidents
        (order_id, defect_label, affected_quantity)
        VALUES (?, ?, ?)
        """, (order_id, label, quantity))
        return cur.lastrowid


def get_incidents():
    with connect() as con:
        rows = con.execute("""
        SELECT * FROM incidents ORDER BY id DESC
        """).fetchall()
        return [dict(row) for row in rows]


def init_fabricguard():
    with connect() as con:
        con.executescript("""
        CREATE TABLE IF NOT EXISTS fabric_rolls (
            roll_id TEXT PRIMARY KEY,
            supplier TEXT NOT NULL,
            fabric_type TEXT NOT NULL,
            color TEXT,
            length_m REAL NOT NULL,
            order_id TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'RECEIVED',
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(order_id) REFERENCES orders(id)
        );

        CREATE TABLE IF NOT EXISTS defect_observations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            roll_id TEXT NOT NULL,
            image_path TEXT NOT NULL,
            defect_label TEXT NOT NULL,
            position_m REAL,
            width_position REAL,
            evidence_source TEXT NOT NULL,
            verification_status TEXT NOT NULL DEFAULT 'PENDING',
            inspector_notes TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(roll_id)
                REFERENCES fabric_rolls(roll_id)
        );

        CREATE TABLE IF NOT EXISTS fabric_audit_events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            roll_id TEXT NOT NULL,
            event_type TEXT NOT NULL,
            event_details TEXT,
            actor TEXT NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(roll_id)
                REFERENCES fabric_rolls(roll_id)
        );
        """)


def register_fabric_roll(
    roll_id,
    supplier,
    fabric_type,
    color,
    length_m,
    order_id
):
    with connect() as con:
        con.execute("""
            INSERT INTO fabric_rolls (
                roll_id, supplier, fabric_type,
                color, length_m, order_id
            )
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            roll_id, supplier, fabric_type,
            color, length_m, order_id
        ))

        con.execute("""
            INSERT INTO fabric_audit_events
            (roll_id, event_type, event_details, actor)
            VALUES (?, ?, ?, ?)
        """, (
            roll_id,
            "ROLL_REGISTERED",
            "Fabric roll registered",
            "system"
        ))


def get_fabric_rolls():
    with connect() as con:
        rows = con.execute("""
            SELECT * FROM fabric_rolls
            ORDER BY created_at DESC
        """).fetchall()

        return [dict(row) for row in rows]


def get_fabric_roll(roll_id):
    with connect() as con:
        row = con.execute("""
            SELECT * FROM fabric_rolls
            WHERE roll_id = ?
        """, (roll_id,)).fetchone()

        return dict(row) if row else None


def save_defect_observation(
    roll_id,
    image_path,
    defect_label,
    position_m,
    width_position,
    evidence_source,
    inspector_notes
):
    with connect() as con:
        cur = con.execute("""
            INSERT INTO defect_observations (
                roll_id, image_path, defect_label,
                position_m, width_position,
                evidence_source, inspector_notes
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            roll_id, image_path, defect_label,
            position_m, width_position,
            evidence_source, inspector_notes
        ))

        observation_id = cur.lastrowid

        con.execute("""
            INSERT INTO fabric_audit_events (
                roll_id, event_type, event_details, actor
            )
            VALUES (?, ?, ?, ?)
        """, (
            roll_id,
            "DEFECT_RECORDED",
            f"Observation {observation_id}: {defect_label}",
            "inspector"
        ))

        return observation_id


def get_roll_observations(roll_id):
    with connect() as con:
        rows = con.execute("""
            SELECT * FROM defect_observations
            WHERE roll_id = ?
            ORDER BY created_at DESC
        """, (roll_id,)).fetchall()

        return [dict(row) for row in rows]


def verify_observation(observation_id, decision, notes):
    allowed = {"VERIFIED", "REJECTED"}

    if decision not in allowed:
        raise ValueError("Invalid verification decision.")

    with connect() as con:
        row = con.execute("""
            SELECT roll_id FROM defect_observations
            WHERE id = ?
        """, (observation_id,)).fetchone()

        if row is None:
            raise ValueError("Observation not found.")

        con.execute("""
            UPDATE defect_observations
            SET verification_status = ?,
                inspector_notes = ?
            WHERE id = ?
        """, (decision, notes, observation_id))

        con.execute("""
            INSERT INTO fabric_audit_events (
                roll_id, event_type, event_details, actor
            )
            VALUES (?, ?, ?, ?)
        """, (
            row["roll_id"],
            "INSPECTION_" + decision,
            f"Observation {observation_id}: {notes}",
            "quality_inspector"
        ))


def update_fabric_roll_status(roll_id, status):
    allowed = {"RECEIVED", "UNDER_INSPECTION", "ON_HOLD",
               "QUALITY_CLEARED"}

    if status not in allowed:
        raise ValueError("Invalid roll status.")

    with connect() as con:
        con.execute("""
            UPDATE fabric_rolls
            SET status = ?
            WHERE roll_id = ?
        """, (status, roll_id))

        con.execute("""
            INSERT INTO fabric_audit_events (
                roll_id, event_type, event_details, actor
            )
            VALUES (?, ?, ?, ?)
        """, (
            roll_id,
            "STATUS_CHANGED",
            status,
            "quality_inspector"
        ))


def get_fabric_audit(roll_id):
    with connect() as con:
        rows = con.execute("""
            SELECT * FROM fabric_audit_events
            WHERE roll_id = ?
            ORDER BY created_at DESC
        """, (roll_id,)).fetchall()

        return [dict(row) for row in rows]
