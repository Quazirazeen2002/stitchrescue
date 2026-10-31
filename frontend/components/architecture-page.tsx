'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Database,
  Calculator,
  BrainCircuit,
  Lock,
  FileText,
  AlertTriangle,
  Check,
  ArrowUpRight,
  Boxes,
  Cpu,
  Layers,
  Sparkles,
  Scale,
  Award,
  Clock,
  ArrowRight
} from 'lucide-react';
import { FinalCTA } from '@/components/marketing';

export function ArchitecturePage() {
  return (
    <>
      {/* HERO SECTION */}
      <section className="product-hero hero-flavor-arch">
        <div className="product-hero-inner">
          <div>
            <div className="hero-candy-tag arch">
              <Scale size={15} /> System Architecture &amp; The Factory Dispute Defense Playbook
            </div>
            <h1>
              THE LEGAL BLACK BOX<br />
              <span>FOR YOUR FACTORY</span><br />
              FLOOR.
            </h1>
            <p className="hero-desc">
              Designed for Factory Owners, Managing Directors, Head Merchandisers, and Buyer
              Representatives. Learn how StitchRescue is engineered from the inside out to produce
              bulletproof evidence, eliminate costly blame games, and defend millions in commercial disputes.
            </p>
            <div className="hero-cta-group">
              <Link href="#architecture-stack" className="button primary">
                Explore The 4-Layer Stack ↓
              </Link>
              <Link href="#dispute-playbooks" className="button outline-light">
                Read The 4 Dispute Playbooks ↓
              </Link>
              <Link href="/app" className="button secondary">
                Open Workspace ↗
              </Link>
            </div>
          </div>

          {/* Hero Mockup Card */}
          <div className="hero-mockup-card">
            <div className="mockup-header" style={{ background: '#00182e' }}>
              <div className="mockup-dots">
                <span />
                <span />
                <span />
              </div>
              <div>SYSTEM_INTEGRITY_VERIFIER // v3.1</div>
              <span className="badge good" style={{ background: '#10b981', color: '#ffffff', border: 'none' }}>
                TAMPER-PROOF LEDGER
              </span>
            </div>
            <div className="mockup-body">
              <div style={{ fontSize: 11, fontWeight: 800, color: '#0069a6', textTransform: 'uppercase', marginBottom: 12 }}>
                4-Layer Architectural Verification
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                <div style={{ background: '#e6f8fd', padding: '8px 12px', borderRadius: 8, borderLeft: '4px solid #15ccff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#001f3b' }}>1. The Evidence Vault (FastAPI + SQLite)</span>
                  <span style={{ fontSize: 11, fontWeight: 800, color: '#007799' }}>IMMUTABLE</span>
                </div>
                <div style={{ background: '#fff9e6', padding: '8px 12px', borderRadius: 8, borderLeft: '4px solid #ffd000', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#001f3b' }}>2. Deterministic Logic (Pure Python)</span>
                  <span style={{ fontSize: 11, fontWeight: 800, color: '#855b00' }}>2+2=4 STRICT</span>
                </div>
                <div style={{ background: '#ffebf3', padding: '8px 12px', borderRadius: 8, borderLeft: '4px solid #f54588', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#001f3b' }}>3. AI Interpreters (SAM 3.1 &amp; Muse Wonder)</span>
                  <span style={{ fontSize: 11, fontWeight: 800, color: '#d6186a' }}>READ-ONLY ACCESS</span>
                </div>
                <div style={{ background: '#ecfdf5', padding: '8px 12px', borderRadius: 8, borderLeft: '4px solid #10b981', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#001f3b' }}>4. The Human Gateway (Approval Center)</span>
                  <span style={{ fontSize: 11, fontWeight: 800, color: '#0b7a42' }}>HUMAN SIGNOFF</span>
                </div>
              </div>

              <div style={{ fontSize: 12, color: '#435b73', borderTop: '1px solid #d5e8f5', paddingTop: 12 }}>
                <b>Audit Guarantee:</b> Zero silent record edits. Zero AI hallucinations in financial math. 100% admissible in commercial arbitration.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STAT STRIP */}
      <div className="hero-stat-strip" style={{ borderTopColor: '#15ccff', borderBottomColor: '#f54588' }}>
        <div className="hero-stat-inner">
          <div className="stat-item">
            <div className="stat-val">4 Layers</div>
            <div className="stat-lbl">Strict Separation of Concerns</div>
          </div>
          <div className="stat-item">
            <div className="stat-val">100%</div>
            <div className="stat-lbl">Deterministic Python Arithmetic</div>
          </div>
          <div className="stat-item">
            <div className="stat-val">Read-Only</div>
            <div className="stat-lbl">AI Model Security Sandbox</div>
          </div>
          <div className="stat-item">
            <div className="stat-val">$0</div>
            <div className="stat-lbl">Unprovable Accusation Losses</div>
          </div>
        </div>
      </div>

      {/* WHY ARCHITECTURE MATTERS TO NON-TECHNICAL LEADERS */}
      <section className="feast-section">
        <div className="section-heading">
          <div>
            <div className="eyebrow">Plain English For Business Leaders</div>
            <h2>WHY SYSTEM ARCHITECTURE<br />PROTECTS YOUR PROFIT MARGIN.</h2>
          </div>
          <p>
            When an overseas buyer or fabric supplier challenges your numbers in a legal dispute,
            the first thing their legal team attacks is data credibility. If your numbers were
            generated by an AI model or can be edited by an IT worker, your claim collapses.
          </p>
        </div>

        <div style={{ background: '#ffffff', borderRadius: 20, border: '3px solid #001f3b', padding: 35, boxShadow: '8px 8px 0 #001f3b' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 25 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#f54588', textTransform: 'uppercase', marginBottom: 6 }}>
                The Traditional Factory Vulnerability
              </div>
              <h3 style={{ fontSize: 20, color: '#001f3b', marginBottom: 10 }}>Fragile WhatsApp &amp; Excel Records</h3>
              <p style={{ fontSize: 14, color: '#5f758d', lineHeight: 1.6 }}>
                Paper inspection tags get lost, Excel spreadsheets can be retroactively modified in
                seconds, and WhatsApp photos lack cryptographic metadata. When a buyer challenges an
                air freight claim, you have no legally defensible proof.
              </p>
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#10b981', textTransform: 'uppercase', marginBottom: 6 }}>
                The StitchRescue Engineered Defense
              </div>
              <h3 style={{ fontSize: 20, color: '#001f3b', marginBottom: 10 }}>The Indisputable Digital Chain of Custody</h3>
              <p style={{ fontSize: 14, color: '#5f758d', lineHeight: 1.6 }}>
                StitchRescue is designed like a commercial aviation flight recorder. Every action,
                barcode scan, photo crop, defect coordinate, and manager sign-off is stamped into
                an append-only ledger that nobody can secretly alter.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* THE 4 LAYERS EXPLAINED */}
      <section className="feast-section-dark" id="architecture-stack">
        <div className="feast-section" style={{ padding: 0 }}>
          <div className="section-heading">
            <div>
              <div className="eyebrow" style={{ color: '#72e2ff' }}>The 4-Layer Architecture Explained</div>
              <h2>BUILT LIKE A LEGAL VAULT.<br />EXPLAINED IN PLAIN ENGLISH.</h2>
            </div>
            <p>
              Here is how each layer of StitchRescue works, the plain-English analogy every factory
              owner understands, and why it wins in audits.
            </p>
          </div>

          {/* LAYER 1 */}
          <div className="arch-layer-card">
            <div className="arch-layer-top">
              <div className="layer-num-badge l1">Layer 01 // The Evidence Vault</div>
              <div className="layer-analogy-pill">Analogy: The Unbreakable Airplane Flight Recorder</div>
            </div>
            <h3>FastAPI &amp; SQLite Immutable Event Store</h3>
            <p className="lead-text">
              When a fabric roll arrives at your dock or an inspector records a defect, Layer 1 captures
              the raw photograph, barcode, camera timestamp, and user identifier. Once written, the record
              is locked. No user, supervisor, or IT administrator has permission to edit or delete history.
            </p>
            <div className="arch-two-col">
              <div className="arch-info-box">
                <h4>Why This Protects You in Disputes</h4>
                <p>
                  When a fabric mill claims “You photographed that defect after your cutting table ruined the
                  fabric,” you present the cryptographic dock timestamp proving the image was committed to
                  the vault 48 hours earlier when the roll was still in unopened plastic shrink-wrap.
                </p>
              </div>
              <div className="arch-rules-box">
                <h4>Layer 1 Guardrails</h4>
                <ul>
                  <li><Check size={16} /> Append-only event history (zero retroactive updates)</li>
                  <li><Check size={16} /> Microsecond server-validated timestamps</li>
                  <li><Check size={16} /> Full traceability from roll receipt to export carton</li>
                </ul>
              </div>
            </div>
          </div>

          {/* LAYER 2 */}
          <div className="arch-layer-card">
            <div className="arch-layer-top">
              <div className="layer-num-badge l2">Layer 02 // The Logic Engine</div>
              <div className="layer-analogy-pill">Analogy: The Strict Factory Accountant with an Iron Calculator</div>
            </div>
            <h3>Pure Python Deterministic Arithmetic</h3>
            <p className="lead-text">
              Artificial intelligence models (LLMs) are notorious for hallucinating numbers and generating
              random arithmetic. In garment manufacturing, a $10,000 calculation mistake destroys an entire
              season’s profit. StitchRescue never allows AI to calculate recovery costs, freight penalties,
              or ASTM D5430 points.
            </p>
            <div className="arch-two-col">
              <div className="arch-info-box">
                <h4>Why This Protects You in Disputes</h4>
                <p>
                  When presenting an OrderRescue partial sea/air shipment plan to an overseas brand VP,
                  every piece count, daily penalty surcharge, and delivery date is derived from rigid Python
                  formulas. The buyer’s financial auditors can verify the math cell-by-cell.
                </p>
              </div>
              <div className="arch-rules-box">
                <h4>Layer 2 Guardrails</h4>
                <ul>
                  <li><Check size={16} /> 100% deterministic arithmetic (2+2 always equals 4)</li>
                  <li><Check size={16} /> Zero AI hallucinations in dollar or unit amounts</li>
                  <li><Check size={16} /> Strict prerequisite verification before scenario generation</li>
                </ul>
              </div>
            </div>
          </div>

          {/* LAYER 3 */}
          <div className="arch-layer-card">
            <div className="arch-layer-top">
              <div className="layer-num-badge l3">Layer 03 // The AI Interpreters</div>
              <div className="layer-analogy-pill">Analogy: The Junior Lab Assistant with a High-Powered Magnifying Glass</div>
            </div>
            <h3>SAM 3.1 &amp; Meta Muse Wonder (Read-Only)</h3>
            <p className="lead-text">
              Artificial intelligence has two specific, bounded jobs: segmenting defect polygons on
              high-resolution fabric images (SAM 3.1) and synthesizing complex maintenance logs into plain-English
              investigation summaries (Muse Wonder). But crucially, the AI operates in a sandboxed, read-only state.
            </p>
            <div className="arch-two-col">
              <div className="arch-info-box">
                <h4>Why This Protects You in Disputes</h4>
                <p>
                  AI can assist your human inspectors in finding microscopic tears, but it can NEVER
                  unilaterally approve a shipment, debit a supplier, or delete a finding. The AI is a read-only
                  microscope; your human managers hold the pen.
                </p>
              </div>
              <div className="arch-rules-box">
                <h4>Layer 3 Guardrails</h4>
                <ul>
                  <li><Check size={16} /> Strict read-only database permissions (cannot execute or approve)</li>
                  <li><Check size={16} /> Clear visual separation between AI prediction and verified truth</li>
                  <li><Check size={16} /> Automated rule: Correlation is never presented as proven causation</li>
                </ul>
              </div>
            </div>
          </div>

          {/* LAYER 4 */}
          <div className="arch-layer-card">
            <div className="arch-layer-top">
              <div className="layer-num-badge l4">Layer 04 // The Human Gateway</div>
              <div className="layer-analogy-pill">Analogy: The Captain of the Ship Holding the Wheel</div>
            </div>
            <h3>Manager Approval Center &amp; Cryptographic Signatures</h3>
            <p className="lead-text">
              In garment manufacturing, signing an authorization moves real money—releasing 15,000 meters of
              fabric from quarantine, authorizing 48 hours of overtime rework, or billing a mill $40,000.
              StitchRescue requires a physical human manager to type their credential and review all prerequisites.
            </p>
            <div className="arch-two-col">
              <div className="arch-info-box">
                <h4>Why This Protects You in Disputes</h4>
                <p>
                  Courts, commercial arbitration panels, and international brand compliance auditors reject
                  automated software decisions. StitchRescue records the named manager, digital signature, and
                  timestamp on every single operational clearance.
                </p>
              </div>
              <div className="arch-rules-box">
                <h4>Layer 4 Guardrails</h4>
                <ul>
                  <li><Check size={16} /> Authenticated manager sign-off required for execution</li>
                  <li><Check size={16} /> Mandatory completion of missing prerequisite checklists</li>
                  <li><Check size={16} /> Full audit trail linking approved plan to original defect photo</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COMPARISON MATRIX */}
      <section className="feast-section">
        <div className="section-heading">
          <div>
            <div className="eyebrow">The Balance Sheet Reality</div>
            <h2>TRADITIONAL FACTORY VS.<br />STITCHRESCUE-DEFENDED FACTORY.</h2>
          </div>
          <p>
            How the 4-layer architecture fundamentally changes the outcome of the 4 most common disputes
            in export manufacturing.
          </p>
        </div>

        <div className="feast-matrix-wrap">
          <div className="feast-matrix-head">
            <div>Manufacturing Operational Dispute</div>
            <div>Traditional Factory (Without StitchRescue)</div>
            <div>Defended Factory (With StitchRescue)</div>
          </div>

          <div className="feast-matrix-row">
            <div className="dim-col">Fabric Mill Defect Claims (Warp Slubs, Shading)</div>
            <div className="bad-col">Mill rejects debit note claiming factory damaged fabric on cutting table. Factory absorbs $40k loss.</div>
            <div className="good-col">Timestamped dock photo with SAM coordinates proves defect existed 48h before cutting. Mill reimburses 100%.</div>
          </div>

          <div className="feast-matrix-row">
            <div className="dim-col">Cutting vs. Sewing Line Blame War</div>
            <div className="bad-col">Departments argue for 3 days; lines halt; Managing Director arbitrarily re-cuts 1,000 panels at factory cost.</div>
            <div className="good-col">LineWatch correlates parallel batches in 2 minutes, isolating sewing needle tension spike on Line 4. Zero recuts.</div>
          </div>

          <div className="feast-matrix-row">
            <div className="dim-col">Buyer Air Freight Penalty Threat</div>
            <div className="bad-col">Buyer demands 100% air freight on 20,000 units. Factory wipes out entire season’s profit margin ($80,000+).</div>
            <div className="good-col">OrderRescue proves 18,200 units on scheduled sea vessel satisfies store launch. Factory flies only 1,800 units, saving $76k.</div>
          </div>

          <div className="feast-matrix-row">
            <div className="dim-col">Third-Party QC Audit Discrepancies (SGS / BV)</div>
            <div className="bad-col">Auditor pulls random stained carton; container is frozen at port; Letter of Credit expires.</div>
            <div className="good-col">Instant export of 100% 4-point inspection history proves lot is within AQL 2.5 standard. Shipment released.</div>
          </div>
        </div>
      </section>

      {/* THE 4 DISPUTE PLAYBOOKS */}
      <section className="feast-section-dark" id="dispute-playbooks">
        <div className="feast-section" style={{ padding: 0 }}>
          <div className="section-heading">
            <div>
              <div className="eyebrow" style={{ color: '#ffd000' }}>The Factory Dispute Defense Playbook</div>
              <h2>4 REAL DISPUTES.<br />HOW TO WIN EVERY ARGUMENT.</h2>
            </div>
            <p>
              Step-by-step forensic defense sequences for factory leaders facing suppliers, internal divisions,
              overseas buyers, and third-party inspectors.
            </p>
          </div>

          {/* PLAYBOOK 1 */}
          <div className="dispute-card">
            <div className="dispute-header">
              <div className="dispute-title-wrap">
                <h3>Playbook 1: The Fabric Mill Defect Debit Note (Winning The Supplier Argument)</h3>
                <div className="dispute-sub">Counterparty: Textile Knitting/Dyeing Mill • Focus: Warp Slub &amp; Shading Claims</div>
              </div>
              <div className="dispute-risk-pill">FINANCIAL EXPOSURE: $30,000 – $100,000 WRITE-OFF</div>
            </div>

            <div className="dispute-grid">
              <div className="dispute-side claim">
                <div className="dispute-side-tag red">The Mill’s Aggressive Defense</div>
                <div className="dispute-quote">
                  “We supplied Grade-A fabric. Your spreading operators handled the rolls improperly,
                  or your cutting table vacuum caused tension warping. We will not honor your debit note.”
                </div>
                <p style={{ fontSize: 13, color: '#7a1236', lineHeight: 1.6 }}>
                  Mill representatives know factories rarely keep photographic evidence linked to roll barcodes
                  before cutting begins, allowing them to dodge debit notes.
                </p>
              </div>

              <div className="dispute-side defense">
                <div className="dispute-side-tag green">The StitchRescue 4-Step Defense Sequence</div>
                <div className="dispute-defense-steps">
                  <div className="defense-step-row">
                    <Check size={16} />
                    <div><b>1. Barcode Dock Timestamp:</b> Present the dock receiving log showing Roll #B74 was photographed upon physical truck unloading at 09:14 AM.</div>
                  </div>
                  <div className="defense-step-row">
                    <Check size={16} />
                    <div><b>2. Sub-Millimeter Coordinate Pin:</b> High-resolution BDFD9 image shows the defect inside unopened packaging at Yard 14.2, 8 inches from selvedge.</div>
                  </div>
                  <div className="defense-step-row">
                    <Check size={16} />
                    <div><b>3. ASTM D5430 Official Calculation:</b> Automated formula proves 31.2 points per 100 yd² (exceeding contractual 24-point failure threshold).</div>
                  </div>
                  <div className="defense-step-row">
                    <Check size={16} />
                    <div><b>4. 1-Click Debit Dossier:</b> Email the complete cryptographic audit pack directly to the Mill Managing Director before cutting starts.</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="dispute-verdict-bar">
              <span><b>THE RESULT:</b> Mill concedes without arbitration. $42,500 credit applied to next fabric contract within 24 hours.</span>
            </div>
          </div>

          {/* PLAYBOOK 2 */}
          <div className="dispute-card">
            <div className="dispute-header" style={{ background: '#001f3b' }}>
              <div className="dispute-title-wrap">
                <h3>Playbook 2: The Cutting Floor vs. Sewing Line Civil War (Winning The Internal Argument)</h3>
                <div className="dispute-sub">Counterparty: Internal Sewing Floor GM • Focus: Neckband Puckering &amp; Notch Distortions</div>
              </div>
              <div className="dispute-risk-pill" style={{ background: '#ffd000', color: '#001f3b' }}>
                FINANCIAL EXPOSURE: 3 DAYS LOST PRODUCTION + $8,400 RE-CUTTING
              </div>
            </div>

            <div className="dispute-grid">
              <div className="dispute-side claim">
                <div className="dispute-side-tag red">The Sewing Department Accusation</div>
                <div className="dispute-quote">
                  “Cutting Room sent distorted collar notches! The fabric bias was pulled on the cutting table.
                  They must re-cut all 1,200 panels immediately and pay our line idle time!”
                </div>
                <p style={{ fontSize: 13, color: '#7a1236', lineHeight: 1.6 }}>
                  Without LineWatch, the Managing Director is caught in a finger-pointing war between two senior
                  managers, ultimately wasting thousands re-cutting good fabric.
                </p>
              </div>

              <div className="dispute-side defense">
                <div className="dispute-side-tag green">The LineWatch Forensic Defense Sequence</div>
                <div className="dispute-defense-steps">
                  <div className="defense-step-row">
                    <Check size={16} />
                    <div><b>1. Parallel Batch Genealogy:</b> LineWatch reveals the cut collar plies were split evenly between Sewing Line 2 and Line 4. Line 2 ran with 0.4% defect rate.</div>
                  </div>
                  <div className="defense-step-row">
                    <Check size={16} />
                    <div><b>2. Caliper Log Verification:</b> Automated cutting table logs verify all 1,200 collar notches were laser-cut within ±0.3mm tolerance.</div>
                  </div>
                  <div className="defense-step-row">
                    <Check size={16} />
                    <div><b>3. Maintenance Event Timeline:</b> Line 4 machine #12 logged an emergency needle cooling spray and re-thread at 11:20 AM—the exact minute defects spiked.</div>
                  </div>
                  <div className="defense-step-row">
                    <Check size={16} />
                    <div><b>4. Objective Root Cause Identification:</b> Problem definitively isolated to sewing needle tension, completely clearing the Cutting Master.</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="dispute-verdict-bar">
              <span><b>THE RESULT:</b> Tension adjusted on Machine #12 in 10 minutes. Zero panels re-cut, saving $8,400 and ending internal hostility.</span>
            </div>
          </div>

          {/* PLAYBOOK 3 */}
          <div className="dispute-card">
            <div className="dispute-header" style={{ background: '#001f3b' }}>
              <div className="dispute-title-wrap">
                <h3>Playbook 3: The Overseas Buyer Air Freight Penalty (Winning The Buyer Argument)</h3>
                <div className="dispute-sub">Counterparty: European / US Brand Sourcing VP • Focus: Ship Window Cutoff Crises</div>
              </div>
              <div className="dispute-risk-pill" style={{ background: '#f54588', color: '#ffffff' }}>
                FINANCIAL EXPOSURE: $80,000 – $120,000 FREIGHT SURCHARGE
              </div>
            </div>

            <div className="dispute-grid">
              <div className="dispute-side claim">
                <div className="dispute-side-tag red">The Overseas Buyer Ultimatum</div>
                <div className="dispute-quote">
                  “Your factory missed the full Friday container handover. You will air freight all 20,000
                  jackets to our distribution center at factory expense, or we cancel the order!”
                </div>
                <p style={{ fontSize: 13, color: '#7a1236', lineHeight: 1.6 }}>
                  Sourcing directors use contract delay clauses to force factories to pay catastrophic air
                  freight bills, even when the delay affects only a tiny fraction of the order.
                </p>
              </div>

              <div className="dispute-side defense">
                <div className="dispute-side-tag green">The OrderRescue Mathematical Defense Sequence</div>
                <div className="dispute-defense-steps">
                  <div className="defense-step-row">
                    <Check size={16} />
                    <div><b>1. Audited On-Time Container Packing:</b> OrderRescue proves 18,200 units (91% of PO) are inspected and loaded in the scheduled Friday sea container.</div>
                  </div>
                  <div className="defense-step-row">
                    <Check size={16} />
                    <div><b>2. Retail Allocation Verification:</b> Proof that 18,200 units fulfills 100% of the buyer’s initial launch inventory for 450 retail storefronts.</div>
                  </div>
                  <div className="defense-step-row">
                    <Check size={16} />
                    <div><b>3. Guaranteed Air Split for Remainder:</b> The remaining 1,800 units finish over the weekend and fly Tuesday, landing 3 days before sea cargo.</div>
                  </div>
                  <div className="defense-step-row">
                    <Check size={16} />
                    <div><b>4. Signed Executive Proposal:</b> Present the buyer with a signed legal recovery plan guaranteeing zero retail sales loss.</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="dispute-verdict-bar">
              <span><b>THE RESULT:</b> Buyer Sourcing VP approves split shipment waiver. Factory pays air freight only on 1,800 units, saving $76,400 in direct cash.</span>
            </div>
          </div>

          {/* PLAYBOOK 4 */}
          <div className="dispute-card">
            <div className="dispute-header" style={{ background: '#001f3b' }}>
              <div className="dispute-title-wrap">
                <h3>Playbook 4: The Third-Party QC Audit Discrepancy (Winning The Auditor Argument)</h3>
                <div className="dispute-sub">Counterparty: SGS / Bureau Veritas / Intertek Inspector • Focus: AQL 2.5 Sampling Certificate</div>
              </div>
              <div className="dispute-risk-pill" style={{ background: '#10b981', color: '#ffffff' }}>
                FINANCIAL EXPOSURE: PORT SHIPMENT HOLD &amp; LC EXPIRATION
              </div>
            </div>

            <div className="dispute-grid">
              <div className="dispute-side claim">
                <div className="dispute-side-tag red">The Third-Party Auditor Rejection</div>
                <div className="dispute-quote">
                  “We opened random carton #42 and discovered a localized dye stain on one garment.
                  We are issuing a PENDING / REJECT inspection certificate and halting container seal.”
                </div>
                <p style={{ fontSize: 13, color: '#7a1236', lineHeight: 1.6 }}>
                  A rejected inspection certificate locks your shipping container at the port, risks missing
                  the Letter of Credit (LC) expiry date, and blocks bank payment releases.
                </p>
              </div>

              <div className="dispute-side defense">
                <div className="dispute-side-tag green">The StitchRescue Statistical Defense Sequence</div>
                <div className="dispute-defense-steps">
                  <div className="defense-step-row">
                    <Check size={16} />
                    <div><b>1. Instant Genealogy Carton Trace:</b> Scan Carton #42 barcode to pull the exact finishing station, operator ID, and parent fabric roll.</div>
                  </div>
                  <div className="defense-step-row">
                    <Check size={16} />
                    <div><b>2. Complete Lot Inspection History:</b> Export the 100% 4-point inspection record proving the total defect rate across 20,000 units is 0.6%.</div>
                  </div>
                  <div className="defense-step-row">
                    <Check size={16} />
                    <div><b>3. AQL 2.5 Statistical Proof:</b> Demonstrate that under ANSI/ASQ Z1.4 (ISO 2859-1), an allowable defect count of 14 units is legally permitted.</div>
                  </div>
                  <div className="defense-step-row">
                    <Check size={16} />
                    <div><b>4. Chief Auditor Override:</b> Present the cryptographic audit log to the inspection agency country manager for immediate certificate release.</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="dispute-verdict-bar">
              <span><b>THE RESULT:</b> Inspector updates certificate to “PASSED FOR EXPORT”. Container loaded on vessel on time; Letter of Credit negotiated smoothly.</span>
            </div>
          </div>
        </div>
      </section>

      {/* WHY LEGAL & AUDIT TEAMS LOVE STITCHRESCUE */}
      <section className="feast-section">
        <div className="section-heading">
          <div>
            <div className="eyebrow">Institutional Credibility</div>
            <h2>BUILT TO PASS INTERNATIONAL<br />AUDITS AND COMPLIANCE CHECKS.</h2>
          </div>
          <p>
            StitchRescue conforms to global quality standards recognized by the world’s leading garment
            brands and retail buying offices.
          </p>
        </div>

        <div className="feast-grid-3">
          <div className="feast-feature-card">
            <div className="feast-feature-icon cyan">
              <Award size={26} />
            </div>
            <h3>ASTM D5430 Standardized</h3>
            <p>
              The international 4-point fabric inspection standard recognized by major US and European
              buyers. FabricGuard computes points with zero deviation.
            </p>
            <ul>
              <li><Check size={16} /> Standardized point tiers (1, 2, 3, 4 pts)</li>
              <li><Check size={16} /> Automated width and yardage normalization</li>
            </ul>
          </div>

          <div className="feast-feature-card">
            <div className="feast-feature-icon yellow">
              <Scale size={26} />
            </div>
            <h3>ANSI / ASQ Z1.4 (AQL 2.5)</h3>
            <p>
              Statistical sampling algorithms aligned with ISO 2859-1. Defend your factory against
              unwarranted third-party inspection rejections.
            </p>
            <ul>
              <li><Check size={16} /> Formal lot acceptance criteria</li>
              <li><Check size={16} /> Statistically valid sample calculations</li>
            </ul>
          </div>

          <div className="feast-feature-card">
            <div className="feast-feature-icon pink">
              <Lock size={26} />
            </div>
            <h3>ISO 9001:2015 Traceability</h3>
            <p>
              Complies with international Quality Management System requirements for material chain of
              custody, non-conformance records, and management reviews.
            </p>
            <ul>
              <li><Check size={16} /> Unbroken roll-to-carton lineage</li>
              <li><Check size={16} /> Cryptographically signed approvals</li>
            </ul>
          </div>
        </div>
      </section>

      <FinalCTA />
    </>
  );
}
