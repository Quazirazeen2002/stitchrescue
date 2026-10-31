import { NextRequest, NextResponse } from 'next/server';

// In-memory mock database for standalone cloud deployments (Vercel) when BACKEND_URL is not set
interface MockDB {
  rolls: Array<{
    roll_id: string;
    supplier: string;
    fabric_type: string;
    composition?: string;
    color: string;
    length_m: number;
    allocated_length_m?: number;
    status: string;
    order_id: string;
    created_at: string;
  }>;
  batches: Array<{
    batch_id: string;
    order_id: string;
    cutting_line: string;
    sewing_line: string;
    status: string;
    planned_quantity: number;
    created_at: string;
  }>;
  observations: Array<{
    id: number;
    roll_id: string;
    defect_label: string;
    evidence_source: string;
    verification_status: string;
    image_id: number;
    inspector_notes: string;
    created_at: string;
  }>;
  allocations: Array<{
    batch_id: string;
    roll_id: string;
    allocated_length_m: number;
    created_at: string;
  }>;
  plans: Array<any>;
  approvals: Array<any>;
  auditLogs: Array<any>;
  reports: Array<any>;
}

const db: MockDB = {
  rolls: [
    {
      roll_id: 'ROLL-GZ-105',
      supplier: 'Akij Textile Mills',
      fabric_type: 'Cotton Single Jersey',
      color: 'Navy Blue',
      length_m: 500.0,
      allocated_length_m: 150.0,
      order_id: 'ORD-1001',
      status: 'RECEIVED',
      composition: '100% Combed Cotton',
      created_at: '2026-10-31 09:47:46'
    },
    {
      roll_id: 'ROLL-AB-102',
      supplier: 'ABC Textiles Ltd',
      fabric_type: 'Cotton Interlock',
      color: 'White',
      length_m: 500.0,
      allocated_length_m: 200.0,
      order_id: 'ORD-1001',
      status: 'RECEIVED',
      composition: '95% Cotton 5% Elastane',
      created_at: '2026-10-31 09:12:23'
    },
    {
      roll_id: 'ROLL-2024-B74',
      supplier: 'Dhaka Knitting Co.',
      fabric_type: 'Pique Knit',
      color: 'Royal Blue',
      length_m: 650.0,
      allocated_length_m: 0.0,
      order_id: 'ORD-1001',
      status: 'ON_HOLD',
      composition: '100% Organic Cotton',
      created_at: '2026-10-31 09:24:26'
    }
  ],
  batches: [
    {
      batch_id: 'BATCH-8820',
      order_id: 'ORD-1001',
      cutting_line: 'Gerber-Auto-2',
      sewing_line: 'Sewing-Line-4',
      status: 'ALLOCATED',
      planned_quantity: 2000,
      created_at: '2026-10-31 10:00:00'
    }
  ],
  observations: [
    {
      id: 1,
      roll_id: 'ROLL-2024-B74',
      defect_label: 'Warp Yarn Slub',
      evidence_source: 'HUMAN_REPORTED',
      verification_status: 'VERIFIED',
      image_id: 1,
      inspector_notes: 'Visual slub identified at yard 14.2; ASTM 4-point penalty logged.',
      created_at: '2026-10-31 09:30:00'
    }
  ],
  allocations: [
    {
      batch_id: 'BATCH-8820',
      roll_id: 'ROLL-GZ-105',
      allocated_length_m: 150.0,
      created_at: '2026-10-31 10:05:00'
    }
  ],
  plans: [],
  approvals: [],
  auditLogs: [
    {
      id: 1,
      entity_type: 'ROLL',
      entity_id: 'ROLL-2024-B74',
      action: 'ROLL_REGISTERED',
      actor: 'Dock Lead Rafiq',
      timestamp: '2026-10-31 09:24:26'
    },
    {
      id: 2,
      entity_type: 'OBSERVATION',
      entity_id: '1',
      action: 'OBSERVATION_VERIFIED',
      actor: 'QA Lead Rahman',
      timestamp: '2026-10-31 09:35:00'
    }
  ],
  reports: []
};

const orders = [
  {
    id: 'ORD-1001',
    buyer: 'H&M Hennes & Mauritz',
    product: 'Cotton Polo Shirts',
    quantity: 20000,
    accepted_quantity: 18000,
    completed: 20000,
    rejected: 2000,
    hours_left: 48,
    hourly_capacity: 100,
    penalty_bdt: 500000
  },
  {
    id: 'ORD-1002',
    buyer: 'Zara / Inditex',
    product: 'Casual Chino Trousers',
    quantity: 15000,
    accepted_quantity: 14500,
    completed: 15000,
    rejected: 500,
    hours_left: 72,
    hourly_capacity: 120,
    penalty_bdt: 350000
  }
];

export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const pathStr = path.join('/');

  // If external BACKEND_URL is configured, proxy request
  if (process.env.BACKEND_URL && !process.env.BACKEND_URL.includes('127.0.0.1')) {
    try {
      const targetUrl = `${process.env.BACKEND_URL}/api/v1/${pathStr}${req.nextUrl.search}`;
      const res = await fetch(targetUrl, {
        headers: req.headers,
        cache: 'no-store'
      });
      const data = await res.json();
      return NextResponse.json(data, { status: res.status });
    } catch {
      // Fall through to standalone demo mode
    }
  }

  // Standalone serverless fallback
  if (pathStr === 'health') {
    return NextResponse.json({ status: 'ok', version: '0.3.0', mode: 'serverless-demo' });
  }

  if (pathStr === 'settings') {
    return NextResponse.json({
      ai_configured: true,
      manager_approval_configured: true,
      reasoning_model: 'muse-wonder-1.0',
      segmentation_model: 'sam-3.1',
      database: 'Vercel Serverless / SQLite',
      approval_mode: 'Human decision recording only; factory execution is manual.',
      knowledge_status: 'Demo factory SOP simulated. Operational records active.'
    });
  }

  if (pathStr === 'dashboard') {
    return NextResponse.json({
      counts: {
        registered_rolls: db.rolls.length,
        open_incidents: 1,
        verified_defects: db.observations.filter(o => o.verification_status === 'VERIFIED').length,
        rolls_on_hold: db.rolls.filter(r => r.status === 'ON_HOLD').length,
        active_batches: db.batches.length,
        pending_proposals: db.plans.length,
        pending_approvals: db.approvals.filter(a => a.decision === 'PENDING').length
      },
      incidents: [
        {
          id: 1,
          order_id: 'ORD-1001',
          defect_label: 'Warp Yarn Slub',
          affected_quantity: 2000,
          status: 'UNDER_INVESTIGATION'
        }
      ],
      activity: db.auditLogs.slice(-10),
      defect_distribution: [
        { name: 'Yarn Slub', value: 4 },
        { name: 'Oil Stain', value: 2 },
        { name: 'Skipped Stitch', value: 3 },
        { name: 'Seam Puckering', value: 5 }
      ],
      production_risks: [
        {
          order_id: 'ORD-1001',
          risk: 'MEDIUM',
          accepted_units: 18000,
          remaining_units: 2000,
          required_hours: 20,
          hours_left: 48,
          penalty_exposure_bdt: 500000
        }
      ],
      recovery_plans: db.plans.slice(-5)
    });
  }

  if (pathStr === 'orders') {
    return NextResponse.json(orders);
  }

  if (pathStr.startsWith('orders/')) {
    const id = path[1];
    const order = orders.find(o => o.id === id) || orders[0];
    return NextResponse.json(order);
  }

  if (pathStr === 'fabric-rolls') {
    return NextResponse.json(db.rolls);
  }

  if (pathStr.startsWith('fabric-rolls/')) {
    const rollId = path[1];
    const roll = db.rolls.find(r => r.roll_id === rollId) || db.rolls[0];
    const observations = db.observations.filter(o => o.roll_id === rollId);
    const allocations = db.allocations.filter(a => a.roll_id === rollId);
    return NextResponse.json({
      roll,
      images: [
        {
          id: 1,
          roll_id: roll.roll_id,
          url: '/images/textile-inspection.webp',
          width_px: 1920,
          height_px: 1080,
          created_at: roll.created_at
        }
      ],
      observations,
      verifications: observations.map(o => ({
        observation_id: o.id,
        decision: o.verification_status,
        inspector: 'QA Lead Rahman',
        notes: o.inspector_notes
      })),
      allocations,
      audit: db.auditLogs.filter(a => a.entity_id === rollId),
      legacy_audit: []
    });
  }

  if (pathStr === 'batches') {
    return NextResponse.json(db.batches);
  }

  if (pathStr === 'incidents') {
    return NextResponse.json([
      {
        id: 1,
        order_id: 'ORD-1001',
        defect_label: 'Warp Yarn Slub',
        affected_quantity: 2000,
        status: 'UNDER_INVESTIGATION'
      }
    ]);
  }

  if (pathStr === 'audit') {
    return NextResponse.json(db.auditLogs);
  }

  if (pathStr === 'approvals') {
    return NextResponse.json(db.approvals);
  }

  if (pathStr === 'plans' || pathStr === 'recovery/plans') {
    return NextResponse.json(db.plans);
  }

  return NextResponse.json({ detail: `Route ${pathStr} not found` }, { status: 404 });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const pathStr = path.join('/');

  // If external BACKEND_URL is configured, proxy request
  if (process.env.BACKEND_URL && !process.env.BACKEND_URL.includes('127.0.0.1')) {
    try {
      const targetUrl = `${process.env.BACKEND_URL}/api/v1/${pathStr}`;
      const body = await req.text();
      const res = await fetch(targetUrl, {
        method: 'POST',
        headers: req.headers,
        body
      });
      const data = await res.json();
      return NextResponse.json(data, { status: res.status });
    } catch {
      // Fall through to standalone demo mode
    }
  }

  let body: any = {};
  try {
    const text = await req.text();
    if (text) body = JSON.parse(text);
  } catch {
    body = {};
  }

  if (pathStr === 'auth/manager') {
    return NextResponse.json({
      authorized: true,
      scope: 'Human verification, quality clearance and recovery decisions. Prototype manager credential.'
    });
  }

  if (pathStr === 'fabric-rolls') {
    const newRoll = {
      roll_id: body.roll_id || `ROLL-${Date.now().toString().slice(-4)}`,
      supplier: body.supplier || 'Demo Supplier Ltd',
      fabric_type: body.fabric_type || 'Cotton',
      composition: body.composition || '100% Cotton',
      color: body.color || 'Navy',
      length_m: Number(body.length_m) || 500,
      allocated_length_m: 0,
      order_id: body.order_id || 'ORD-1001',
      status: 'RECEIVED',
      created_at: new Date().toISOString().replace('T', ' ').slice(0, 19)
    };
    db.rolls.unshift(newRoll);
    db.auditLogs.unshift({
      id: db.auditLogs.length + 1,
      entity_type: 'ROLL',
      entity_id: newRoll.roll_id,
      action: 'ROLL_REGISTERED',
      actor: body.actor || 'Factory QA Inspector',
      timestamp: newRoll.created_at
    });
    return NextResponse.json(newRoll, { status: 201 });
  }

  if (pathStr === 'batches') {
    const newBatch = {
      batch_id: body.batch_id || `BATCH-${Date.now().toString().slice(-4)}`,
      order_id: body.order_id || 'ORD-1001',
      cutting_line: body.cutting_line || 'Gerber-1',
      sewing_line: body.sewing_line || 'Line-2',
      status: 'ALLOCATED',
      planned_quantity: Number(body.planned_quantity) || 2000,
      created_at: new Date().toISOString().replace('T', ' ').slice(0, 19)
    };
    db.batches.unshift(newBatch);
    return NextResponse.json(newBatch, { status: 201 });
  }

  if (pathStr === 'batches/allocate' || pathStr === 'allocations') {
    const alloc = {
      batch_id: body.batch_id || 'BATCH-8820',
      roll_id: body.roll_id || 'ROLL-GZ-105',
      allocated_length_m: Number(body.allocated_length_m) || 100,
      created_at: new Date().toISOString().replace('T', ' ').slice(0, 19)
    };
    db.allocations.push(alloc);
    return NextResponse.json(alloc, { status: 201 });
  }

  if (pathStr === 'observations') {
    const obs = {
      id: db.observations.length + 1,
      roll_id: body.roll_id || 'ROLL-2024-B74',
      defect_label: body.defect_label || 'Yarn Slub',
      evidence_source: body.evidence_source || 'HUMAN_REPORTED',
      verification_status: 'PENDING',
      image_id: 1,
      inspector_notes: body.notes || 'Pending visual check',
      created_at: new Date().toISOString().replace('T', ' ').slice(0, 19)
    };
    db.observations.unshift(obs);
    return NextResponse.json(obs, { status: 201 });
  }

  if (pathStr === 'observations/verify' || pathStr.includes('verify')) {
    const obsId = Number(body.observation_id || body.id || 1);
    const obs = db.observations.find(o => o.id === obsId);
    if (obs) {
      obs.verification_status = body.decision || 'VERIFIED';
      obs.inspector_notes = body.notes || 'Verified by manager';
    }
    return NextResponse.json({ success: true, observation: obs });
  }

  if (pathStr === 'recovery/calculate' || pathStr === 'calculate') {
    const reworkCost = Number(body.rework_cost_per_unit || 20);
    const reworkRate = Number(body.rework_units_per_hour || 100);
    const replCost = Number(body.replacement_cost_per_unit || 180);
    const replRate = Number(body.replacement_units_per_hour || 120);
    const affected = 2000;
    const hoursLeft = 48;

    const reworkHours = Math.ceil(affected / reworkRate);
    const replHours = Math.ceil(affected / replRate);

    return NextResponse.json({
      order_id: body.order_id || 'ORD-1001',
      order_quantity: 20000,
      accepted_quantity: 18000,
      affected_quantity: affected,
      recovery_target: affected,
      scenarios: [
        {
          strategy: 'REWORK',
          recoverable_quantity: affected,
          unrecovered_quantity: 0,
          estimated_cost_bdt: affected * reworkCost,
          estimated_hours: reworkHours,
          deadline_fits: reworkHours <= hoursLeft,
          deadline_feasibility: reworkHours <= hoursLeft ? 'FEASIBLE' : 'RISK_OF_CUTOFF_MISS',
          required_approvals: ['Floor QA Lead', 'Line Supervisor'],
          assumptions: ['Dedicated rework table allocated', 'Spare needle inventory intact'],
          missing_information: [],
          potential_penalty_exposure_bdt: 0
        },
        {
          strategy: 'REPLACEMENT',
          recoverable_quantity: affected,
          unrecovered_quantity: 0,
          estimated_cost_bdt: affected * replCost,
          estimated_hours: replHours,
          deadline_fits: replHours <= hoursLeft,
          deadline_feasibility: replHours <= hoursLeft ? 'FEASIBLE' : 'RISK_OF_CUTOFF_MISS',
          required_approvals: ['Fabric Mill GM', 'Fast-Track Cutting'],
          assumptions: ['Greige yarn buffer in local warehouse'],
          missing_information: [],
          potential_penalty_exposure_bdt: 0
        },
        {
          strategy: 'STOCK_SUBSTITUTION',
          recoverable_quantity: 1000,
          unrecovered_quantity: 1000,
          estimated_cost_bdt: 150000,
          estimated_hours: 3,
          deadline_fits: true,
          deadline_feasibility: 'INSUFFICIENT_STOCK',
          required_approvals: ['Buyer Merchandiser Specification Waiver'],
          assumptions: ['Matched shade-band finished polo shirts'],
          missing_information: ['Missing 1,000 units to complete contract'],
          potential_penalty_exposure_bdt: 250000
        },
        {
          strategy: 'PARTIAL_SHIPMENT',
          recoverable_quantity: 18000,
          unrecovered_quantity: 2000,
          estimated_cost_bdt: 19600,
          estimated_hours: 0,
          deadline_fits: true,
          deadline_feasibility: 'CONDITIONAL_ON_BUYER_APPROVAL',
          required_approvals: ['Buyer Country Director LC Amendment'],
          assumptions: ['Ship 18,000 sea freight on-time; 2,000 air cargo Tuesday'],
          missing_information: ['Awaiting formal buyer LC extension'],
          potential_penalty_exposure_bdt: 0
        }
      ],
      inputs: body
    });
  }

  if (pathStr === 'plans' || pathStr === 'recovery/plans' || pathStr === 'proposals') {
    const newPlan = {
      id: db.plans.length + 1,
      order_id: body.order_id || 'ORD-1001',
      recommended_strategy: body.selected_alternative || 'REWORK',
      status: 'PROPOSED',
      calculation: body.calculation || {},
      evidence: { description: body.rationale || 'Verified defect evidence on incoming roll' },
      requested_by: body.proposed_by || 'Planner Kabir',
      created_at: new Date().toISOString().replace('T', ' ').slice(0, 19)
    };
    db.plans.unshift(newPlan);
    return NextResponse.json(newPlan, { status: 201 });
  }

  if (pathStr === 'approvals' || pathStr.includes('approvals')) {
    const decision = body.decision || 'APPROVED';
    const approval = {
      id: db.approvals.length + 1,
      recovery_plan_id: body.recovery_plan_id || 1,
      decision,
      decided_by: body.manager_identity || 'GM M. Chowdhury',
      decision_notes: body.decision_notes || 'Authorized for weekend overtime',
      requested_by: 'Planner Kabir',
      created_at: new Date().toISOString().replace('T', ' ').slice(0, 19)
    };
    db.approvals.unshift(approval);
    db.auditLogs.unshift({
      id: db.auditLogs.length + 1,
      entity_type: 'APPROVAL',
      entity_id: String(approval.id),
      action: `DECISION_${decision}`,
      actor: approval.decided_by,
      timestamp: approval.created_at
    });
    return NextResponse.json(approval, { status: 201 });
  }

  return NextResponse.json({ success: true, message: 'Action recorded' }, { status: 200 });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return POST(req, { params });
}
