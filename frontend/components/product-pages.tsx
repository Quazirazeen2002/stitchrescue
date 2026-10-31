'use client';

import React from 'react';
import Link from 'next/link';
import {
  ScanLine,
  GitBranch,
  ChartNoAxesCombined,
  ShieldCheck,
  ArrowUpRight,
  Check,
  AlertTriangle,
  Zap,
  Clock,
  Boxes,
  FileSpreadsheet,
  Award,
  Layers,
  ArrowRight,
  Coins,
  Cpu,
  FileCheck2,
  Lock
} from 'lucide-react';
import { FinalCTA } from '@/components/marketing';

/* ==========================================================================
   FABRICGUARD DEDICATED PRODUCT PAGE
   Theme: Feastables Electric Cyan & Deep Midnight Ocean (#15ccff / #001f3b)
   ========================================================================== */

export function FabricGuardPage() {
  return (
    <>
      {/* HERO SECTION */}
      <section className="product-hero hero-flavor-cyan">
        <div className="product-hero-inner">
          <div>
            <div className="hero-candy-tag cyan">
              <ScanLine size={15} /> FabricGuard® • Incoming Material Clearance Gate
            </div>
            <h1>
              SEE EVERY DEFECT<br />
              <span>BEFORE IT CUTS</span><br />
              YOUR MARGIN.
            </h1>
            <p className="hero-desc">
              Transform fabric roll receiving from a chaotic blame game into an airtight digital
              evidence chain. Inspect incoming rolls with ASTM D5430 4-point accuracy, pin defect
              coordinates to the exact yard, and stop defective fabric before it touches a cutting table.
            </p>
            <div className="hero-cta-group">
              <Link href="/app/fabricguard" className="button primary">
                Launch FabricGuard ↗
              </Link>
              <Link href="/app/inspection" className="button outline-light">
                Inspect Live Demo Roll
              </Link>
              <Link href="#dispute-playbook" className="text-link" style={{ color: '#15ccff' }}>
                See Mill Dispute Playbook ↓
              </Link>
            </div>
          </div>

          {/* Hero Mockup Card */}
          <div className="hero-mockup-card">
            <div className="mockup-header">
              <div className="mockup-dots">
                <span />
                <span />
                <span />
              </div>
              <div>ROLL_INSPECTION_AUDIT // BDFD9-02</div>
              <span className="badge danger">QUARANTINED</span>
            </div>
            <div className="mockup-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 11, color: '#5f758d', textTransform: 'uppercase', fontWeight: 700 }}>Roll Identifier</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#001f3b' }}>ROLL-2024-B74-COTTON</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 11, color: '#5f758d', textTransform: 'uppercase', fontWeight: 700 }}>Dock Receiving Time</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#001f3b' }}>09:14 AM (Gate 2)</div>
                </div>
              </div>

              <div style={{ background: '#f0f7fc', borderRadius: 12, padding: 14, border: '1.5px solid #cce3f2', marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#002d54' }}>ASTM D5430 4-Point Score</span>
                  <span style={{ fontSize: 14, fontWeight: 800, color: '#d6186a' }}>31.2 pts / 100 yd² (FAIL &gt; 24)</span>
                </div>
                <div style={{ height: 8, background: '#d5e8f5', borderRadius: 9999, overflow: 'hidden' }}>
                  <div style={{ width: '85%', height: '100%', background: '#f54588', borderRadius: 9999 }} />
                </div>
              </div>

              <div style={{ fontSize: 12, color: '#435b73', marginBottom: 16 }}>
                <b>Defect Coordinate:</b> Yard 14.2 • <b>Class:</b> Warp Yarn Slub (4 pts) • <b>SAM 3.1 Bounding:</b> [x: 182, y: 440, w: 94, h: 28] • <b>Inspector:</b> K. Rahman (ID #QA-109)
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <Link href="/app/fabricguard" className="button primary" style={{ width: '100%', fontSize: 12, padding: '8px 14px' }}>
                  Open Photographic Evidence ↗
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STAT STRIP */}
      <div className="hero-stat-strip">
        <div className="hero-stat-inner">
          <div className="stat-item">
            <div className="stat-val">100%</div>
            <div className="stat-lbl">Photographic Ground Truth</div>
          </div>
          <div className="stat-item">
            <div className="stat-val">4-Point</div>
            <div className="stat-lbl">ASTM D5430 Standardized</div>
          </div>
          <div className="stat-item">
            <div className="stat-val">Sub-mm</div>
            <div className="stat-lbl">Coordinate Defect Mapping</div>
          </div>
          <div className="stat-item">
            <div className="stat-val">$0</div>
            <div className="stat-lbl">Unsubstantiated Mill Claims</div>
          </div>
        </div>
      </div>

      {/* HOW IT WORKS SECTION */}
      <section className="feast-section">
        <div className="section-heading">
          <div>
            <div className="eyebrow">Zero-Trust Material Receiving</div>
            <h2>3 STEPS TO BULLETPROOF<br />FABRIC CLEARANCE.</h2>
          </div>
          <p>
            Never rely on handwritten tags or vague mill claims. FabricGuard enforces a rigid digital
            handshake the instant a truck backs into your dock.
          </p>
        </div>

        <div className="feast-grid-3">
          <div className="feast-step-card">
            <div className="feast-step-badge">01</div>
            <h3>Dock Scan &amp; Roll Registration</h3>
            <p>
              Inward rolls are scanned upon receipt. Mill heat-lot barcodes, ordered GSM, cuttable width,
              and PO associations are recorded before fabric enters the warehouse.
            </p>
            <div className="feast-step-pill">FastAPI + SQLite Ledger</div>
          </div>

          <div className="feast-step-card">
            <div className="feast-step-badge" style={{ background: '#15ccff', color: '#001f3b' }}>02</div>
            <h3>4-Point Visual Inspection</h3>
            <p>
              Inspectors log defect length, width, and yardage position using standardized ASTM D5430
              rules. SAM 3.1 overlays bounding masks to eliminate human ambiguity.
            </p>
            <div className="feast-step-pill">SAM 3.1 + Human Verification</div>
          </div>

          <div className="feast-step-card">
            <div className="feast-step-badge" style={{ background: '#f54588', color: '#ffffff' }}>03</div>
            <h3>Clearance Gate &amp; Debit Export</h3>
            <p>
              If a roll exceeds tolerance, it is digitally quarantined. FabricGuard generates an
              exportable mill claim package with timestamped photos, yard markers, and debit calculations.
            </p>
            <div className="feast-step-pill">1-Click Debit Note PDF</div>
          </div>
        </div>
      </section>

      {/* DEEP DIVE FEATURES */}
      <section className="feast-section-dark">
        <div className="feast-section" style={{ padding: 0 }}>
          <div className="section-heading">
            <div>
              <div className="eyebrow" style={{ color: '#72e2ff' }}>Architected for High-Volume Mills</div>
              <h2>INTELLIGENCE THAT STANDS UP<br />TO FACTORY AUDITS.</h2>
            </div>
            <p>
              Built specifically for the pressures of Bangladesh, Vietnam, and regional garment hubs
              where fabric disputes cost hundreds of thousands of dollars each quarter.
            </p>
          </div>

          <div className="feast-grid-3">
            <div className="feast-feature-card">
              <div className="feast-feature-icon cyan">
                <ScanLine size={26} />
              </div>
              <h3>Ground Truth vs AI Guesswork</h3>
              <p>
                Other tools let AI hallucinate quality ratings. FabricGuard enforces a strict separation:
                SAM 3.1 identifies candidate defect regions, while a named human QA lead signs off on the class.
              </p>
              <ul>
                <li><Check size={16} /> Separate model prediction from truth</li>
                <li><Check size={16} /> BDFD9 standardized defect taxonomy</li>
                <li><Check size={16} /> Visual inspection canvas with coordinate overlay</li>
              </ul>
            </div>

            <div className="feast-feature-card">
              <div className="feast-feature-icon yellow">
                <FileSpreadsheet size={26} />
              </div>
              <h3>Automated ASTM D5430 Math</h3>
              <p>
                Eliminate manual calculation errors. FabricGuard automatically converts defect counts
                into official ASTM D5430 penalty points per 100 square yards based on roll length and width.
              </p>
              <ul>
                <li><Check size={16} /> Pure Python deterministic arithmetic</li>
                <li><Check size={16} /> Automatic 1, 2, 3, and 4-point assignments</li>
                <li><Check size={16} /> Configurable pass/fail point thresholds</li>
              </ul>
            </div>

            <div className="feast-feature-card">
              <div className="feast-feature-icon pink">
                <ShieldCheck size={26} />
              </div>
              <h3>Cryptographic Mill Claim Vault</h3>
              <p>
                When a mill rep pushes back on a debit note, present an immutable audit dossier with
                dock timestamps, roll barcodes, raw high-res images, and inspector signatures.
              </p>
              <ul>
                <li><Check size={16} /> Microsecond timestamped dock intake</li>
                <li><Check size={16} /> High-res crop of every penalized defect</li>
                <li><Check size={16} /> Exportable tamper-resistant audit report</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* DISPUTE PLAYBOOK SECTION */}
      <section className="feast-section" id="dispute-playbook">
        <div className="section-heading">
          <div>
            <div className="eyebrow">The FabricGuard Argument Winner</div>
            <h2>HOW FABRICGUARD WINS<br />THE MILL BLAME GAME.</h2>
          </div>
          <p>
            When a fabric mill disputes a $40,000 debit note, here is exactly how FabricGuard shuts down
            the argument with cold, timestamped evidence.
          </p>
        </div>

        <div className="dispute-card">
          <div className="dispute-header">
            <div className="dispute-title-wrap">
              <h3>Scenario: The $42,500 Yarn-Slub Debit Note Dispute</h3>
              <div className="dispute-sub">Incoming Cotton Single Jersey (Lot #LOT-992-B) • 12,000 meters</div>
            </div>
            <div className="dispute-risk-pill">EXPOSURE: $42,500 WRITE-OFF</div>
          </div>

          <div className="dispute-grid">
            <div className="dispute-side claim">
              <div className="dispute-side-tag red">
                <AlertTriangle size={14} /> The Mill Rep’s Accusation
              </div>
              <div className="dispute-quote">
                “Our fabric left our knitting mill with Grade-A certification. Your cutting room operators
                caused these yarn pulls during spreading on your vacuum tables. We reject your debit note.”
              </div>
              <p style={{ fontSize: 13, color: '#7a1236', lineHeight: 1.6 }}>
                Without FabricGuard, the factory general manager has no proof of when the defect appeared,
                and is forced to absorb the $42,500 loss or lose a key fabric supplier.
              </p>
            </div>

            <div className="dispute-side defense">
              <div className="dispute-side-tag green">
                <ShieldCheck size={14} /> The FabricGuard Evidence Counter
              </div>
              <div className="dispute-defense-steps">
                <div className="defense-step-row">
                  <Check size={16} />
                  <div>
                    <b>Dock Entry Timestamp:</b> Inspection photo was captured at Dock Station 2 on
                    Roll #B74 at 09:14 AM—48 hours before the roll was ever transferred to the cutting floor.
                  </div>
                </div>
                <div className="defense-step-row">
                  <Check size={16} />
                  <div>
                    <b>Sub-Millimeter Coordinate Proof:</b> High-resolution BDFD9 image pins yarn slub
                    at Yard 14.2, exactly 8 inches from left selvedge inside unopened plastic wrap.
                  </div>
                </div>
                <div className="defense-step-row">
                  <Check size={16} />
                  <div>
                    <b>Microscopic Ring-Spinning Defect:</b> SAM 3.1 polygon analysis reveals structural
                    ring-spun roving irregularity, proving the flaw occurred during yarn manufacturing.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="dispute-verdict-bar">
            <span><b>THE VERDICT:</b> Mill General Manager inspected the FabricGuard digital dossier, withdrew the objection, and credited $42,500 on the next yarn contract within 4 hours.</span>
            <Link href="/app/fabricguard" className="button dark" style={{ padding: '6px 16px', fontSize: 12 }}>
              Inspect Roll #B74 Record ↗
            </Link>
          </div>
        </div>

        {/* CTA Banner */}
        <div style={{ marginTop: 40, textAlign: 'center' }}>
          <Link href="/app/fabricguard" className="button primary" style={{ fontSize: 15, padding: '14px 34px' }}>
            Open FabricGuard Workspace ↗
          </Link>
        </div>
      </section>

      <FinalCTA />
    </>
  );
}

/* ==========================================================================
   LINEWATCH DEDICATED PRODUCT PAGE
   Theme: Feastables Peanut Butter Golden Yellow & Midnight Ocean (#ffd000 / #001f3b)
   ========================================================================== */

export function LineWatchPage() {
  return (
    <>
      {/* HERO SECTION */}
      <section className="product-hero hero-flavor-yellow">
        <div className="product-hero-inner">
          <div>
            <div className="hero-candy-tag yellow">
              <GitBranch size={15} /> LineWatch® • Floor Traceability &amp; Blame Removal
            </div>
            <h1>
              CONNECT THE THREAD<br />
              <span>FROM ROLL TO</span><br />
              RETAIL CARTON.
            </h1>
            <p className="hero-desc">
              Eradicate the eternal war between the Cutting Floor and the Sewing Lines. LineWatch
              creates unbroken genealogy linking fabric rolls, cut plies, bundle tickets, sewing
              lines, and machine telemetry—so you pinpoint root causes instantly without guessing.
            </p>
            <div className="hero-cta-group">
              <Link href="/app/linewatch" className="button dark">
                Open LineWatch Console ↗
              </Link>
              <Link href="/app/linewatch" className="button secondary">
                Explore Batch Graph
              </Link>
              <Link href="#dispute-playbook" className="text-link" style={{ color: '#001f3b' }}>
                See Cutting vs Sewing Blame War ↓
              </Link>
            </div>
          </div>

          {/* Hero Mockup Card */}
          <div className="hero-mockup-card">
            <div className="mockup-header" style={{ background: '#001f3b' }}>
              <div className="mockup-dots">
                <span />
                <span />
                <span />
              </div>
              <div>GENEALOGY_TRACE // BATCH-8820</div>
              <span className="badge neutral" style={{ background: '#ffd000', color: '#001f3b', border: 'none' }}>
                SPIKE ISOLATED
              </span>
            </div>
            <div className="mockup-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 11, color: '#5f758d', textTransform: 'uppercase', fontWeight: 700 }}>Production Batch</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#001f3b' }}>BATCH-8820 // POLO COLLARS</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 11, color: '#5f758d', textTransform: 'uppercase', fontWeight: 700 }}>Parent Fabric Roll</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#001f3b' }}>ROLL-2024-R109</div>
                </div>
              </div>

              {/* Step flow */}
              <div style={{ background: '#f0f7fc', borderRadius: 12, padding: 14, border: '1.5px solid #cce3f2', marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#003666', marginBottom: 8, textTransform: 'uppercase' }}>
                  Unbroken Handover Trail
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>1. Cutting Table 02 (1,450 Plies):</span>
                    <b style={{ color: '#0b7a42' }}>0.0% Cutting Error (Laser Validated)</b>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>2. Sewing Line 02 (600 Bundles):</span>
                    <b style={{ color: '#0b7a42' }}>0.4% Normal Defect Rate</b>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>3. Sewing Line 04 (600 Bundles):</span>
                    <b style={{ color: '#c71052' }}>14.1% Defect Spike (Puckering)</b>
                  </div>
                </div>
              </div>

              <div style={{ fontSize: 12, color: '#435b73', marginBottom: 16 }}>
                <b>Root Cause Found:</b> Needle tension re-thread &amp; lubrication event logged at 11:20 AM on Line 4, Machine #12. Cutting Table 2 exonerated.
              </div>

              <Link href="/app/linewatch" className="button dark" style={{ width: '100%', fontSize: 12, padding: '8px 14px' }}>
                View Full LineWatch Incident Graph ↗
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* STAT STRIP */}
      <div className="hero-stat-strip" style={{ borderTopColor: '#ffd000', borderBottomColor: '#f54588' }}>
        <div className="hero-stat-inner">
          <div className="stat-item">
            <div className="stat-val">100%</div>
            <div className="stat-lbl">Ply-to-Bundle Traceability</div>
          </div>
          <div className="stat-item">
            <div className="stat-val">0</div>
            <div className="stat-lbl">False Causation Assumptions</div>
          </div>
          <div className="stat-item">
            <div className="stat-val">2 Min</div>
            <div className="stat-lbl">Root Cause Incident Isolation</div>
          </div>
          <div className="stat-item">
            <div className="stat-val">100%</div>
            <div className="stat-lbl">Cross-Floor Accountability</div>
          </div>
        </div>
      </div>

      {/* 3 STEPS */}
      <section className="feast-section">
        <div className="section-heading">
          <div>
            <div className="eyebrow">Zero Finger-Pointing</div>
            <h2>3 FLOORS OF UNBROKEN<br />PRODUCTION ACCOUNTABILITY.</h2>
          </div>
          <p>
            When defects appear on finished garments, the sewing team blames the cutting table, and
            cutting blames the fabric mill. LineWatch ends the drama with hard forensic records.
          </p>
        </div>

        <div className="feast-grid-3">
          <div className="feast-step-card">
            <div className="feast-step-badge" style={{ background: '#ffd000', color: '#001f3b' }}>01</div>
            <h3>Spreading &amp; Bundle Tagging</h3>
            <p>
              Log fabric relaxation time, spread plies, and generate digital bundle tickets tied to the
              original fabric roll barcode. No mixed shade bands slip into production.
            </p>
            <div className="feast-step-pill">Roll-to-Ply Binding</div>
          </div>

          <div className="feast-step-card">
            <div className="feast-step-badge" style={{ background: '#001f3b', color: '#ffd000' }}>02</div>
            <h3>Sewing Line Telemetry</h3>
            <p>
              Log line-side quality checks, skipped stitches, puckering, and seam breaks in real time.
              Correlate defects against specific operators and machine stations.
            </p>
            <div className="feast-step-pill">Real-Time Floor Tracking</div>
          </div>

          <div className="feast-step-card">
            <div className="feast-step-badge" style={{ background: '#f54588', color: '#ffffff' }}>03</div>
            <h3>Root Cause Correlation</h3>
            <p>
              Connect machine maintenance events (needle cooling spray, motor recalibration, blade replacement)
              to defect surges without confusing correlation with cause.
            </p>
            <div className="feast-step-pill">Forensic Incident Graph</div>
          </div>
        </div>
      </section>

      {/* DEEP DIVE FEATURES */}
      <section className="feast-section-dark">
        <div className="feast-section" style={{ padding: 0 }}>
          <div className="section-heading">
            <div>
              <div className="eyebrow" style={{ color: '#ffd000' }}>Full Production Visibility</div>
              <h2>BUILT FOR CUTTING MASTERS<br />AND LINE SUPERVISORS.</h2>
            </div>
            <p>
              LineWatch bridges the operational gap between prep, cutting, assembly, and finishing.
            </p>
          </div>

          <div className="feast-grid-3">
            <div className="feast-feature-card">
              <div className="feast-feature-icon yellow">
                <GitBranch size={26} />
              </div>
              <h3>Genealogy Batch Graph</h3>
              <p>
                Follow any finished garment barcode backwards through the line supervisor, sewing station,
                bundle ticket, cutting table, and raw fabric roll.
              </p>
              <ul>
                <li><Check size={16} /> Instant parent-child roll inheritance</li>
                <li><Check size={16} /> Shade-band integrity verification</li>
                <li><Check size={16} /> Fast carton-level recall isolation</li>
              </ul>
            </div>

            <div className="feast-feature-card">
              <div className="feast-feature-icon cyan">
                <Cpu size={26} />
              </div>
              <h3>Correlation ≠ Causation Engine</h3>
              <p>
                Our AI reasoning engine (Muse Wonder) analyzes incident reports with a strict rule:
                never claim a machine event caused a defect without mechanical verification.
              </p>
              <ul>
                <li><Check size={16} /> Protects innocent machine operators</li>
                <li><Check size={16} /> Cites verified factory maintenance logs</li>
                <li><Check size={16} /> Prevents expensive unnecessary machine rebuilds</li>
              </ul>
            </div>

            <div className="feast-feature-card">
              <div className="feast-feature-icon pink">
                <Boxes size={26} />
              </div>
              <h3>Inter-Department Handover Signatures</h3>
              <p>
                Digital handovers between Cutting Masters and Sewing Floor Supervisors log exact ply
                counts and quality clearances before assembly begins.
              </p>
              <ul>
                <li><Check size={16} /> Eliminates missing ply shrinkage claims</li>
                <li><Check size={16} /> Time-stamped supervisor sign-offs</li>
                <li><Check size={16} /> Seamless mobile tablet interface</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* DISPUTE PLAYBOOK SECTION */}
      <section className="feast-section" id="dispute-playbook">
        <div className="section-heading">
          <div>
            <div className="eyebrow">The LineWatch Argument Winner</div>
            <h2>HOW LINEWATCH DEFUSES<br />THE CUTTING VS SEWING WAR.</h2>
          </div>
          <p>
            When 1,200 polo shirts fail final QC with puckered neckbands, the sewing room blames cutting.
            Here is how LineWatch settles the argument in 3 minutes flat.
          </p>
        </div>

        <div className="dispute-card">
          <div className="dispute-header" style={{ background: '#001f3b' }}>
            <div className="dispute-title-wrap">
              <h3>Scenario: The Sewing Line 4 vs Cutting Room Blame War</h3>
              <div className="dispute-sub">Order #PO-8820 // 1,200 Polo Shirts with Neckband Puckering</div>
            </div>
            <div className="dispute-risk-pill" style={{ background: '#ffd000', color: '#001f3b' }}>
              EXPOSURE: 3 DAYS DOWNTIME + $8,400 RE-CUTTING
            </div>
          </div>

          <div className="dispute-grid">
            <div className="dispute-side claim">
              <div className="dispute-side-tag red">
                <AlertTriangle size={14} /> The Sewing Floor Manager’s Accusation
              </div>
              <div className="dispute-quote">
                “Cutting Room sent distorted collar notches! The fabric bias was pulled on the cutting table.
                They must re-cut all 1,200 panels immediately and pay our line idle time!”
              </div>
              <p style={{ fontSize: 13, color: '#7a1236', lineHeight: 1.6 }}>
                In a traditional factory, the Cutting Master and Sewing GM scream at each other for 2 days
                while production halts, until the Managing Director arbitrarily orders a re-cut at factory expense.
              </p>
            </div>

            <div className="dispute-side defense">
              <div className="dispute-side-tag green">
                <ShieldCheck size={14} /> The LineWatch Forensic Counter
              </div>
              <div className="dispute-defense-steps">
                <div className="defense-step-row">
                  <Check size={16} />
                  <div>
                    <b>Parallel Batch Proof:</b> LineWatch reveals the cut collar plies were split evenly
                    between Sewing Line 2 and Sewing Line 4. Line 2 ran 600 pieces with a 0.4% defect rate.
                  </div>
                </div>
                <div className="defense-step-row">
                  <Check size={16} />
                  <div>
                    <b>Laser Calibration Logs:</b> Cutting Table 2 digital logs show zero dimensional deviation
                    (notches within ±0.3mm tolerance).
                  </div>
                </div>
                <div className="defense-step-row">
                  <Check size={16} />
                  <div>
                    <b>Maintenance Event Spike:</b> Line 4 machine #12 logged an emergency needle cooling
                    lubrication and re-threading event at 11:20 AM—the exact minute puckering defects began.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="dispute-verdict-bar">
            <span><b>THE VERDICT:</b> Factory GM inspected LineWatch batch trace. Sewing technician re-adjusted needle thread tension on Machine #12 in 10 minutes. Zero panels were re-cut, saving $8,400 and 3 days of delay.</span>
            <Link href="/app/linewatch" className="button dark" style={{ padding: '6px 16px', fontSize: 12 }}>
              Inspect Batch #8820 Record ↗
            </Link>
          </div>
        </div>

        {/* CTA Banner */}
        <div style={{ marginTop: 40, textAlign: 'center' }}>
          <Link href="/app/linewatch" className="button dark" style={{ fontSize: 15, padding: '14px 34px' }}>
            Open LineWatch Console ↗
          </Link>
        </div>
      </section>

      <FinalCTA />
    </>
  );
}

/* ==========================================================================
   ORDERRESCUE DEDICATED PRODUCT PAGE
   Theme: Feastables Milk Crunch Hot Pink & Golden Yellow (#f54588 / #ffd000)
   ========================================================================== */

export function OrderRescuePage() {
  return (
    <>
      {/* HERO SECTION */}
      <section className="product-hero hero-flavor-pink">
        <div className="product-hero-inner">
          <div>
            <div className="hero-candy-tag pink">
              <ChartNoAxesCombined size={15} /> OrderRescue® • Financial Recovery &amp; Buyer Defense
            </div>
            <h1>
              WHEN SHIP DATES COLLIDE,<br />
              <span>SAVE THE EXPORT</span><br />
              ORDER.
            </h1>
            <p className="hero-desc">
              When a major quality failure strikes 72 hours before the vessel sails, panic destroys margins.
              OrderRescue computes deterministic recovery scenarios across rework, fabric replacement,
              stock substitution, and partial sea/air splits—giving factory leaders mathematical certainty.
            </p>
            <div className="hero-cta-group">
              <Link href="/app/orderrescue" className="button primary">
                Launch OrderRescue Simulator ↗
              </Link>
              <Link href="/app/approvals" className="button outline-light">
                Manager Approval Center
              </Link>
              <Link href="#dispute-playbook" className="text-link" style={{ color: '#ffd000' }}>
                See Buyer Penalty Dispute Playbook ↓
              </Link>
            </div>
          </div>

          {/* Hero Mockup Card */}
          <div className="hero-mockup-card">
            <div className="mockup-header" style={{ background: '#001f3b' }}>
              <div className="mockup-dots">
                <span />
                <span />
                <span />
              </div>
              <div>RECOVERY_ENGINE // PO-8820-EX</div>
              <span className="badge good" style={{ background: '#ffd000', color: '#001f3b', border: 'none' }}>
                SAVES $76,400
              </span>
            </div>
            <div className="mockup-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 11, color: '#5f758d', textTransform: 'uppercase', fontWeight: 700 }}>Contract Order</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#001f3b' }}>20,000 WINTER JACKETS</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 11, color: '#5f758d', textTransform: 'uppercase', fontWeight: 700 }}>Vessel Cutoff</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#c71052' }}>Friday 18:00 (In 48h)</div>
                </div>
              </div>

              {/* Scenario matrix */}
              <div style={{ background: '#f0f7fc', borderRadius: 12, padding: 14, border: '1.5px solid #cce3f2', marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#003666', marginBottom: 8, textTransform: 'uppercase' }}>
                  Deterministic Scenario Modeling
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>1. Buyer Demand (100% Air Freight):</span>
                    <b style={{ color: '#c71052' }}>-$96,000 Loss</b>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>2. Internal Factory Overtime Rework:</span>
                    <b style={{ color: '#c71052' }}>-$42,000 + Cutoff Miss</b>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', background: '#e6f8fd', padding: '4px 8px', borderRadius: 6 }}>
                    <span style={{ fontWeight: 700, color: '#001f3b' }}>3. OrderRescue Sea/Air Split:</span>
                    <b style={{ color: '#0b7a42' }}>-$19,600 Cost (NET SAVINGS $76,400)</b>
                  </div>
                </div>
              </div>

              <div style={{ fontSize: 12, color: '#435b73', marginBottom: 16 }}>
                <b>Audit Plan:</b> Ship 18,200 units by scheduled sea vessel on Friday (on-time). Rework remaining 1,800 units over weekend; fly by air Tuesday. Buyer retail stores receive full opening stock.
              </div>

              <Link href="/app/orderrescue" className="button primary" style={{ width: '100%', fontSize: 12, padding: '8px 14px' }}>
                Open Financial Recovery Simulator ↗
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* STAT STRIP */}
      <div className="hero-stat-strip" style={{ borderTopColor: '#f54588', borderBottomColor: '#ffd000' }}>
        <div className="hero-stat-inner">
          <div className="stat-item">
            <div className="stat-val">100%</div>
            <div className="stat-lbl">Deterministic Arithmetic</div>
          </div>
          <div className="stat-item">
            <div className="stat-val">4</div>
            <div className="stat-lbl">Real-World Financial Scenarios</div>
          </div>
          <div className="stat-item">
            <div className="stat-val">85%</div>
            <div className="stat-lbl">Typical Air Penalty Reduction</div>
          </div>
          <div className="stat-item">
            <div className="stat-val">1-Click</div>
            <div className="stat-lbl">Signed Buyer Approval Dossier</div>
          </div>
        </div>
      </div>

      {/* 4 SCENARIOS */}
      <section className="feast-section">
        <div className="section-heading">
          <div>
            <div className="eyebrow">Rigid Mathematical Modeling</div>
            <h2>4 PROVEN RECOVERY<br />STRATEGIES. ZERO GUESSWORK.</h2>
          </div>
          <p>
            When an order goes sideways, there is no one-size-fits-all answer. OrderRescue compares
            all 4 industry recovery options using explicit costs, hours, and delivery dates.
          </p>
        </div>

        <div className="feast-grid-4">
          <div className="feast-step-card">
            <div className="feast-step-badge" style={{ background: '#ffd000', color: '#001f3b' }}>A</div>
            <h3>Overtime Rework</h3>
            <p>
              Calculates available seamstress hours, rework table throughput, hourly overtime penalty
              rates, and maximum pieces recoverable before shipping vessel gates lock.
            </p>
            <div className="feast-step-pill">Labor &amp; Capacity Model</div>
          </div>

          <div className="feast-step-card">
            <div className="feast-step-badge" style={{ background: '#15ccff', color: '#001f3b' }}>B</div>
            <h3>Fabric Replacement</h3>
            <p>
              Models local greige knitting turnaround, rapid dyeing schedules, express courier costs,
              and fast-track cutting to replace rejected plies without delay.
            </p>
            <div className="feast-step-pill">Supply Chain Lead Time</div>
          </div>

          <div className="feast-step-card">
            <div className="feast-step-badge" style={{ background: '#f54588', color: '#ffffff' }}>C</div>
            <h3>Stock Substitution</h3>
            <p>
              Identifies approved warehouse stock in identical shade-bands and fabric weights to fill
              order shortages legally, subject to buyer specification waivers.
            </p>
            <div className="feast-step-pill">Inventory Buffer Audit</div>
          </div>

          <div className="feast-step-card">
            <div className="feast-step-badge" style={{ background: '#10b981', color: '#ffffff' }}>D</div>
            <h3>Sea / Air Split</h3>
            <p>
              Calculates maximum allowable sea container units to ship on schedule, while flying only
              the minimum deficit via air freight—saving tens of thousands in freight fines.
            </p>
            <div className="feast-step-pill">Freight Margin Protector</div>
          </div>
        </div>
      </section>

      {/* ZERO HALLUCINATION MATH */}
      <section className="feast-section-dark">
        <div className="feast-section" style={{ padding: 0 }}>
          <div className="section-heading">
            <div>
              <div className="eyebrow" style={{ color: '#ffd000' }}>Strict Separation of Powers</div>
              <h2>WHY WE BAN AI FROM<br />CALCULATING RECOVERY DOLLARS.</h2>
            </div>
            <p>
              Large Language Models are probabilistic and prone to numerical hallucinations. In garment
              manufacturing, a $10,000 calculation mistake can wipe out an entire factory’s monthly margin.
            </p>
          </div>

          <div className="feast-grid-3">
            <div className="feast-feature-card">
              <div className="feast-feature-icon pink">
                <Coins size={26} />
              </div>
              <h3>100% Pure Python Mathematics</h3>
              <p>
                Every penalty dollar, air freight surcharge, piece rate, and timeline calculation is
                executed by deterministic Python formulas. 2 + 2 is always 4.
              </p>
              <ul>
                <li><Check size={16} /> Zero LLM numerical hallucinations</li>
                <li><Check size={16} /> Fully reproducible audit trail</li>
                <li><Check size={16} /> Transparent calculation formulas</li>
              </ul>
            </div>

            <div className="feast-feature-card">
              <div className="feast-feature-icon yellow">
                <FileCheck2 size={26} />
              </div>
              <h3>Missing Prerequisites Checklist</h3>
              <p>
                An option cannot be submitted for manager approval if mandatory real-world prerequisites
                are missing (e.g. no buyer authorization, lack of spare needles, missing greige yarn).
              </p>
              <ul>
                <li><Check size={16} /> Prevents unfeasible factory commitments</li>
                <li><Check size={16} /> Validates inventory before planning</li>
                <li><Check size={16} /> Requires explicit buyer waiver check</li>
              </ul>
            </div>

            <div className="feast-feature-card">
              <div className="feast-feature-icon cyan">
                <Lock size={26} />
              </div>
              <h3>Cryptographic Human Approval Gate</h3>
              <p>
                The machine only calculates and recommends; it never executes. A designated factory
                manager must physically log in, review the checklist, and sign the approval.
              </p>
              <ul>
                <li><Check size={16} /> Manager role credential required</li>
                <li><Check size={16} /> Signed approval recorded in immutable log</li>
                <li><Check size={16} /> Complete legal audit compliance</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* DISPUTE PLAYBOOK SECTION */}
      <section className="feast-section" id="dispute-playbook">
        <div className="section-heading">
          <div>
            <div className="eyebrow">The OrderRescue Argument Winner</div>
            <h2>HOW ORDERRESCUE CRUSHES<br />OVERSEAS BUYER PENALTIES.</h2>
          </div>
          <p>
            When a European or US buyer threatens an $80,000 air freight chargeback for a minor factory delay,
            here is how OrderRescue defends your factory’s cash.
          </p>
        </div>

        <div className="dispute-card">
          <div className="dispute-header" style={{ background: '#001f3b' }}>
            <div className="dispute-title-wrap">
              <h3>Scenario: The $80,000 Overseas Buyer Air Freight Penalty</h3>
              <div className="dispute-sub">Order #PO-8820 // 20,000 Winter Parkas for European Retailer</div>
            </div>
            <div className="dispute-risk-pill" style={{ background: '#f54588', color: '#ffffff' }}>
              EXPOSURE: $80,000 - $120,000 AIR FREIGHT CLAIM
            </div>
          </div>

          <div className="dispute-grid">
            <div className="dispute-side claim">
              <div className="dispute-side-tag red">
                <AlertTriangle size={14} /> The Buyer Sourcing Director’s Threat
              </div>
              <div className="dispute-quote">
                “Your factory missed the full Friday container handover. You will air freight all 20,000
                jackets to our Hamburg distribution center at factory expense, or we cancel the order!”
              </div>
              <p style={{ fontSize: 13, color: '#7a1236', lineHeight: 1.6 }}>
                Faced with bankruptcy-level freight bills or contract cancellation, factory owners typically
                cave in, losing all profitability on the season.
              </p>
            </div>

            <div className="dispute-side defense">
              <div className="dispute-side-tag green">
                <ShieldCheck size={14} /> The OrderRescue Mathematical Counter
              </div>
              <div className="dispute-defense-steps">
                <div className="defense-step-row">
                  <Check size={16} />
                  <div>
                    <b>Audited Sea Loading Proof:</b> OrderRescue proves 18,200 parkas (91% of total contract)
                    are inspected, packed, and loaded on the scheduled Friday sea container on time.
                  </div>
                </div>
                <div className="defense-step-row">
                  <Check size={16} />
                  <div>
                    <b>Retail Store Delivery Modeling:</b> The 18,200 sea units satisfy 100% of the buyer’s
                    initial retail launch requirements across 450 stores.
                  </div>
                </div>
                <div className="defense-step-row">
                  <Check size={16} />
                  <div>
                    <b>Guaranteed Air Split for Deficit:</b> The remaining 1,800 units finish over the weekend
                    and fly via commercial air on Tuesday, arriving in Hamburg 3 days before the sea vessel.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="dispute-verdict-bar">
            <span><b>THE VERDICT:</b> Buyer VP accepted the OrderRescue signed mathematical split shipment package. Factory shipped 18,200 units by sea, paying air freight only on 1,800 units—saving $76,400 in direct cash penalties.</span>
            <Link href="/app/orderrescue" className="button dark" style={{ padding: '6px 16px', fontSize: 12 }}>
              Run Split Calculation ↗
            </Link>
          </div>
        </div>

        {/* CTA Banner */}
        <div style={{ marginTop: 40, textAlign: 'center' }}>
          <Link href="/app/orderrescue" className="button primary" style={{ fontSize: 15, padding: '14px 34px' }}>
            Open OrderRescue Simulator ↗
          </Link>
        </div>
      </section>

      <FinalCTA />
    </>
  );
}
