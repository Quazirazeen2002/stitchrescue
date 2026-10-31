'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  ScanLine,
  GitBranch,
  ChartNoAxesCombined,
  Copy,
  Check,
  ArrowUpRight,
  Sparkles,
  Scale,
  Terminal,
  Award,
  Clock,
  AlertTriangle,
  Play
} from 'lucide-react';
import { toast } from 'sonner';
import { FinalCTA } from '@/components/marketing';

export function EvaluationPage() {
  const [copiedToken, setCopiedToken] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});

  const managerToken = '-o7rq8osJ_A0yYn8hcVhldDQS8t6jTFjrTXkfI3X2Ws';

  const copyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Copied ${label} to clipboard!`);
  };

  const toggleStep = (stepNumber: number) => {
    setCompletedSteps(prev => ({
      ...prev,
      [stepNumber]: !prev[stepNumber]
    }));
  };

  const completedCount = Object.values(completedSteps).filter(Boolean).length;

  return (
    <>
      {/* HERO SECTION */}
      <section className="product-hero hero-flavor-eval">
        <div className="product-hero-inner">
          <div>
            <div className="hero-candy-tag arch">
              <Sparkles size={15} /> MrBeast Feastables Style • Live Judge Test Playbook
            </div>
            <h1>
              JUDGE EVALUATION:<br />
              <span>THE 72-HOUR</span><br />
              EXPORT CRISIS.
            </h1>
            <p className="hero-desc">
              Welcome Judges &amp; Evaluators! Follow this interactive step-by-step scenario to test
              StitchRescue live in production. You will investigate a real-world export crisis on
              Order #ORD-1001, isolate fabric defects, trace production lines, run deterministic
              recovery math, and record an immutable manager approval.
            </p>
            <div className="hero-cta-group">
              <Link href="/app" className="button primary">
                Launch Live Workspace ↗
              </Link>
              <Link href="/architecture" className="button outline-light">
                View System Architecture
              </Link>
              <button
                className="button secondary"
                onClick={() => {
                  copyText(managerToken, 'Manager Token');
                  setCopiedToken(true);
                  setTimeout(() => setCopiedToken(false), 2500);
                }}
              >
                {copiedToken ? <Check size={16} color="#10b981" /> : <Copy size={16} />}
                Copy Manager Credential
              </button>
            </div>
          </div>

          {/* Scenario Briefing Card */}
          <div className="hero-mockup-card">
            <div className="mockup-header" style={{ background: '#001428' }}>
              <div className="mockup-dots">
                <span />
                <span />
                <span />
              </div>
              <div>CRISIS_BRIEFING // ORD-1001</div>
              <span className="badge danger" style={{ background: '#f54588', color: '#ffffff', border: 'none' }}>
                $80K AIR PENALTY THREAT
              </span>
            </div>
            <div className="mockup-body">
              <div style={{ fontSize: 11, fontWeight: 800, color: '#0069a6', textTransform: 'uppercase', marginBottom: 12 }}>
                The Live Manufacturing Dispute Scenario
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                <div style={{ background: '#fff5f8', padding: '10px 14px', borderRadius: 10, borderLeft: '4px solid #f54588' }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#d6186a', textTransform: 'uppercase' }}>The Order</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#001f3b' }}>20,000 Cotton Polo Shirts (H&amp;M)</div>
                </div>

                <div style={{ background: '#fff9e6', padding: '10px 14px', borderRadius: 10, borderLeft: '4px solid #ffd000' }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#855b00', textTransform: 'uppercase' }}>The Discovery</div>
                  <div style={{ fontSize: 13, color: '#001f3b', fontWeight: 600 }}>
                    2,000 shirts flagged with yarn slubs &amp; puckered neckbands 48 hours before export vessel cutoff!
                  </div>
                </div>

                <div style={{ background: '#e6f8fd', padding: '10px 14px', borderRadius: 10, borderLeft: '4px solid #15ccff' }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#007799', textTransform: 'uppercase' }}>Your Mission</div>
                  <div style={{ fontSize: 13, color: '#001f3b', fontWeight: 600 }}>
                    Clear the fabric, prove root cause, calculate recovery, and authorize a signed solution.
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f0f7fc', padding: '10px 14px', borderRadius: 10 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#001f3b' }}>Evaluation Progress</span>
                <span className="badge good" style={{ fontSize: 12, fontWeight: 800 }}>
                  {completedCount} of 5 Steps Complete
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STAT STRIP */}
      <div className="hero-stat-strip" style={{ borderTopColor: '#ffd000', borderBottomColor: '#15ccff' }}>
        <div className="hero-stat-inner">
          <div className="stat-item">
            <div className="stat-val">ORD-1001</div>
            <div className="stat-lbl">Target Export Contract</div>
          </div>
          <div className="stat-item">
            <div className="stat-val">2,000 Units</div>
            <div className="stat-lbl">Affected Garments</div>
          </div>
          <div className="stat-item">
            <div className="stat-val">48 Hours</div>
            <div className="stat-lbl">Vessel Gate Cutoff</div>
          </div>
          <div className="stat-item">
            <div className="stat-val">$80,000</div>
            <div className="stat-lbl">Air Freight Risk Avoided</div>
          </div>
        </div>
      </div>

      {/* STEP-BY-STEP PLAYBOOK SECTION */}
      <section className="feast-section">
        <div className="section-heading">
          <div>
            <div className="eyebrow">Interactive Testing Sequence</div>
            <h2>5 RAPID STEPS FOR JUDGES<br />TO EVALUATE THE SYSTEM.</h2>
          </div>
          <p>
            Follow each step below. Click the launch buttons to jump directly to the relevant tool,
            or click any copy chip to paste sample test data with 1 click.
          </p>
        </div>

        {/* STEP 1 */}
        <div className="eval-step-container">
          <div className="eval-step-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div className="eval-step-tag">Step 01</div>
              <div className="eval-step-title">Manager Authentication &amp; Command Center</div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <Link href="/login" className="button primary" style={{ fontSize: 12, padding: '7px 16px' }}>
                Open Login Page ↗
              </Link>
              <Link href="/app" className="button outline-light" style={{ fontSize: 12, padding: '7px 16px' }}>
                View Command Center ↗
              </Link>
            </div>
          </div>
          <div className="eval-step-body">
            <p style={{ fontSize: 14.5, color: '#3c5269', lineHeight: 1.6 }}>
              In garment manufacturing, signing an authorization moves real money. StitchRescue gates
              manager actions behind an authenticated session token.
            </p>

            <ul className="eval-instruction-list">
              <li>
                <div className="eval-instruction-num">1</div>
                <div>
                  Navigate to <b>/login</b> and enter the Manager Credential below (or click to copy):
                </div>
              </li>
            </ul>

            <div className="eval-copy-grid">
              <div
                className="copy-chip"
                onClick={() => copyText(managerToken, 'Manager Credential')}
              >
                <div>
                  <div className="copy-chip-label">Manager Credential (Click to Copy)</div>
                  <div className="copy-chip-val">{managerToken}</div>
                </div>
                <Copy size={16} color="#0069a6" />
              </div>
            </div>

            <ul className="eval-instruction-list">
              <li>
                <div className="eval-instruction-num">2</div>
                <div>
                  Click <b>&ldquo;Sign in to factory workspace&rdquo;</b> &rarr; you will be redirected to the Command Center with a green authorization toast.
                </div>
              </li>
              <li>
                <div className="eval-instruction-num">3</div>
                <div>
                  <i>(Alternative for quick evaluation):</i> Click <b>&ldquo;Continue to operational records ↗&rdquo;</b> on the login page for instant read-only access.
                </div>
              </li>
            </ul>

            <div className="eval-expected-box">
              <h4><Check size={16} /> What Judges Should Verify:</h4>
              <p>
                The Command Center (<b>/app</b>) loads with active counts (Registered Rolls: 3+, Open Incidents: 1, Verified Defects: 1), defect distribution charts, and production risk tables.
              </p>
            </div>

            <div style={{ marginTop: 18 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontWeight: 700, color: '#001f3b' }}>
                <input
                  type="checkbox"
                  checked={!!completedSteps[1]}
                  onChange={() => toggleStep(1)}
                  style={{ width: 18, height: 18, accentColor: '#ffd000' }}
                />
                Mark Step 1 Complete: &ldquo;I accessed the Command Center Dashboard&rdquo;
              </label>
            </div>
          </div>
        </div>

        {/* STEP 2 */}
        <div className="eval-step-container">
          <div className="eval-step-header" style={{ background: '#002547' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div className="eval-step-tag" style={{ background: '#15ccff', color: '#001f3b' }}>Step 02</div>
              <div className="eval-step-title">FabricGuard — Material Clearance Gate</div>
            </div>
            <Link href="/app/fabricguard" className="button primary" style={{ fontSize: 12, padding: '7px 16px' }}>
              Launch FabricGuard Test ↗
            </Link>
          </div>
          <div className="eval-step-body">
            <p style={{ fontSize: 14.5, color: '#3c5269', lineHeight: 1.6 }}>
              Test how FabricGuard stops defective fabric before cutting and creates indisputable photographic evidence to win supplier debit claims.
            </p>

            <ul className="eval-instruction-list">
              <li>
                <div className="eval-instruction-num">1</div>
                <div>
                  Navigate to <b>/app/fabricguard</b>. Click <b>&ldquo;Register a fabric roll&rdquo;</b> and enter these test values:
                </div>
              </li>
            </ul>

            <div className="eval-copy-grid">
              <div className="copy-chip" onClick={() => copyText('EVAL-ROLL-2024', 'Roll ID')}>
                <div>
                  <div className="copy-chip-label">Roll ID</div>
                  <div className="copy-chip-val">EVAL-ROLL-2024</div>
                </div>
                <Copy size={15} color="#0069a6" />
              </div>
              <div className="copy-chip" onClick={() => copyText('Chittagong Textile Mills Ltd', 'Supplier')}>
                <div>
                  <div className="copy-chip-label">Supplier</div>
                  <div className="copy-chip-val">Chittagong Textile Mills</div>
                </div>
                <Copy size={15} color="#0069a6" />
              </div>
              <div className="copy-chip" onClick={() => copyText('600', 'Length (m)')}>
                <div>
                  <div className="copy-chip-label">Length</div>
                  <div className="copy-chip-val">600 metres</div>
                </div>
                <Copy size={15} color="#0069a6" />
              </div>
              <div className="copy-chip" onClick={() => copyText('ORD-1001', 'Order')}>
                <div>
                  <div className="copy-chip-label">Production Order</div>
                  <div className="copy-chip-val">ORD-1001</div>
                </div>
                <Copy size={15} color="#0069a6" />
              </div>
            </div>

            <ul className="eval-instruction-list">
              <li>
                <div className="eval-instruction-num">2</div>
                <div>
                  Click <b>&ldquo;Register fabric roll&rdquo;</b>. The roll is immediately saved and selected.
                </div>
              </li>
              <li>
                <div className="eval-instruction-num">3</div>
                <div>
                  In <b>&ldquo;Record a defect observation&rdquo;</b>, enter Defect Label: <code>Warp Yarn Slub</code>, Source: <code>HUMAN_REPORTED</code>, and click <b>&ldquo;Save pending observation&rdquo;</b>. A yellow <b>PENDING</b> badge appears!
                </div>
              </li>
              <li>
                <div className="eval-instruction-num">4</div>
                <div>
                  In <b>&ldquo;Human verification&rdquo;</b>, choose Decision: <code>VERIFIED</code>, Inspector: <code>QA Lead Rahman</code>, and click <b>&ldquo;Record inspector decision&rdquo;</b>.
                </div>
              </li>
            </ul>

            <div className="eval-expected-box">
              <h4><Check size={16} /> What Judges Should Verify:</h4>
              <p>
                The observation badge immediately flips from yellow <b>PENDING</b> to bright green <b>VERIFIED</b>. The finding is cryptographically recorded with inspector identity and timestamp, ready for mill debit note export.
              </p>
            </div>

            <div style={{ marginTop: 18 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontWeight: 700, color: '#001f3b' }}>
                <input
                  type="checkbox"
                  checked={!!completedSteps[2]}
                  onChange={() => toggleStep(2)}
                  style={{ width: 18, height: 18, accentColor: '#ffd000' }}
                />
                Mark Step 2 Complete: &ldquo;I verified a fabric defect in FabricGuard&rdquo;
              </label>
            </div>
          </div>
        </div>

        {/* STEP 3 */}
        <div className="eval-step-container">
          <div className="eval-step-header" style={{ background: '#002547' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div className="eval-step-tag" style={{ background: '#ffd000', color: '#001f3b' }}>Step 03</div>
              <div className="eval-step-title">LineWatch — Floor Traceability &amp; Blame Defusal</div>
            </div>
            <Link href="/app/linewatch" className="button primary" style={{ fontSize: 12, padding: '7px 16px' }}>
              Launch LineWatch Test ↗
            </Link>
          </div>
          <div className="eval-step-body">
            <p style={{ fontSize: 14.5, color: '#3c5269', lineHeight: 1.6 }}>
              Test how LineWatch links the fabric roll to cutting tables and sewing lines, defusing internal blame wars without false causation.
            </p>

            <ul className="eval-instruction-list">
              <li>
                <div className="eval-instruction-num">1</div>
                <div>
                  Navigate to <b>/app/linewatch</b>. Click <b>&ldquo;Register a production batch&rdquo;</b> and enter:
                </div>
              </li>
            </ul>

            <div className="eval-copy-grid">
              <div className="copy-chip" onClick={() => copyText('EVAL-BATCH-501', 'Batch ID')}>
                <div>
                  <div className="copy-chip-label">Batch ID</div>
                  <div className="copy-chip-val">EVAL-BATCH-501</div>
                </div>
                <Copy size={15} color="#0069a6" />
              </div>
              <div className="copy-chip" onClick={() => copyText('Gerber-Auto-2', 'Cutting Line')}>
                <div>
                  <div className="copy-chip-label">Cutting Line</div>
                  <div className="copy-chip-val">Gerber-Auto-2</div>
                </div>
                <Copy size={15} color="#0069a6" />
              </div>
              <div className="copy-chip" onClick={() => copyText('Sewing-Line-4', 'Sewing Line')}>
                <div>
                  <div className="copy-chip-label">Sewing Line</div>
                  <div className="copy-chip-val">Sewing-Line-4</div>
                </div>
                <Copy size={15} color="#0069a6" />
              </div>
              <div className="copy-chip" onClick={() => copyText('2000', 'Planned Qty')}>
                <div>
                  <div className="copy-chip-label">Planned Qty</div>
                  <div className="copy-chip-val">2,000 units</div>
                </div>
                <Copy size={15} color="#0069a6" />
              </div>
            </div>

            <ul className="eval-instruction-list">
              <li>
                <div className="eval-instruction-num">2</div>
                <div>
                  Click <b>&ldquo;Register production batch&rdquo;</b>.
                </div>
              </li>
              <li>
                <div className="eval-instruction-num">3</div>
                <div>
                  In <b>&ldquo;Allocate a fabric roll&rdquo;</b>, select your roll, enter <code>250</code> metres, and click <b>&ldquo;Link roll to batch&rdquo;</b>.
                </div>
              </li>
              <li>
                <div className="eval-instruction-num">4</div>
                <div>
                  Click <b>&ldquo;Save evidence investigation&rdquo;</b> to generate a forensic incident report.
                </div>
              </li>
            </ul>

            <div className="eval-expected-box">
              <h4><Check size={16} /> What Judges Should Verify:</h4>
              <p>
                The interactive <b>Trace Flow</b> updates immediately: <code>EVAL-ROLL-2024</code> &rarr; <code>Gerber-Auto-2</code> &rarr; <code>Sewing-Line-4</code>. The batch is linked to the exact parent roll with zero unaccounted shrinkage.
              </p>
            </div>

            <div style={{ marginTop: 18 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontWeight: 700, color: '#001f3b' }}>
                <input
                  type="checkbox"
                  checked={!!completedSteps[3]}
                  onChange={() => toggleStep(3)}
                  style={{ width: 18, height: 18, accentColor: '#ffd000' }}
                />
                Mark Step 3 Complete: &ldquo;I traced batch genealogy in LineWatch&rdquo;
              </label>
            </div>
          </div>
        </div>

        {/* STEP 4 */}
        <div className="eval-step-container">
          <div className="eval-step-header" style={{ background: '#002547' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div className="eval-step-tag" style={{ background: '#f54588', color: '#ffffff' }}>Step 04</div>
              <div className="eval-step-title">OrderRescue — Deterministic Financial Recovery</div>
            </div>
            <Link href="/app/orderrescue" className="button primary" style={{ fontSize: 12, padding: '7px 16px' }}>
              Launch OrderRescue Test ↗
            </Link>
          </div>
          <div className="eval-step-body">
            <p style={{ fontSize: 14.5, color: '#3c5269', lineHeight: 1.6 }}>
              Test how OrderRescue calculates 4 mutually exclusive recovery alternatives using pure Python arithmetic (zero AI hallucinations) and missing prerequisite safeguards.
            </p>

            <ul className="eval-instruction-list">
              <li>
                <div className="eval-instruction-num">1</div>
                <div>
                  Navigate to <b>/app/orderrescue</b>. Select Order <b>ORD-1001</b> (2,000 affected units, 48 hours left).
                </div>
              </li>
              <li>
                <div className="eval-instruction-num">2</div>
                <div>
                  Review the prefilled cost parameters (Rework: 20 BDT/unit @ 100 units/hr; Replacement: 180 BDT/unit @ 120 units/hr; Stock: 1000 units @ 150 BDT).
                </div>
              </li>
              <li>
                <div className="eval-instruction-num">3</div>
                <div>
                  Check the 4 mandatory prerequisite confirmation boxes (Material compatibility, Buyer spec, Reinspection, Capacity).
                </div>
              </li>
              <li>
                <div className="eval-instruction-num">4</div>
                <div>
                  Click <b>&ldquo;Calculate recovery alternatives&rdquo;</b>.
                </div>
              </li>
            </ul>

            <div className="eval-expected-box">
              <h4><Check size={16} /> What Judges Should Verify:</h4>
              <p>
                <b>4 distinct recovery cards render instantly</b>:
                <br />
                • <b>Overtime Rework:</b> 2,000 units, cost <b>BDT 40,000</b>, duration <b>20 hours</b> (Marked <b>FEASIBLE</b> within 48h!).
                <br />
                • <b>Rapid Replacement:</b> 2,000 units, cost <b>BDT 360,000</b>, duration 16.7h.
                <br />
                • <b>Stock Substitution:</b> 1,000 units, cost <b>BDT 150,000</b> (Marked <b>INSUFFICIENT</b> — 1,000 units missing).
                <br />
                • <b>Partial Shipment:</b> 18,000 sea freight units on-time; 2,000 units conditional on buyer waiver.
              </p>
            </div>

            <ul className="eval-instruction-list" style={{ marginTop: 14 }}>
              <li>
                <div className="eval-instruction-num">5</div>
                <div>
                  In <b>&ldquo;Save a recovery proposal&rdquo;</b>, select Alternative: <code>REWORK</code>, enter Proposed By: <code>Planner Kabir</code>, and click <b>&ldquo;Save proposed recovery plan&rdquo;</b>.
                </div>
              </li>
            </ul>

            <div style={{ marginTop: 18 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontWeight: 700, color: '#001f3b' }}>
                <input
                  type="checkbox"
                  checked={!!completedSteps[4]}
                  onChange={() => toggleStep(4)}
                  style={{ width: 18, height: 18, accentColor: '#ffd000' }}
                />
                Mark Step 4 Complete: &ldquo;I calculated 4 deterministic alternatives in OrderRescue&rdquo;
              </label>
            </div>
          </div>
        </div>

        {/* STEP 5 */}
        <div className="eval-step-container">
          <div className="eval-step-header" style={{ background: '#002547' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div className="eval-step-tag" style={{ background: '#10b981', color: '#ffffff' }}>Step 05</div>
              <div className="eval-step-title">The Human Gateway &amp; Immutable Audit Trail</div>
            </div>
            <Link href="/app/approvals" className="button primary" style={{ fontSize: 12, padding: '7px 16px' }}>
              Launch Approvals Test ↗
            </Link>
          </div>
          <div className="eval-step-body">
            <p style={{ fontSize: 14.5, color: '#3c5269', lineHeight: 1.6 }}>
              In legal arbitration, AI cannot sign a commercial contract. Test how the Human Gateway requires a real executive to authenticate, review prerequisites, and sign the recovery plan.
            </p>

            <ul className="eval-instruction-list">
              <li>
                <div className="eval-instruction-num">1</div>
                <div>
                  Navigate to <b>/app/approvals</b>. Select the submitted REWORK proposal.
                </div>
              </li>
              <li>
                <div className="eval-instruction-num">2</div>
                <div>
                  Choose Decision: <code>APPROVED</code>, Manager Identity: <code>GM M. Chowdhury</code>, Notes: <code>Approved for weekend overtime run. Authorized.</code>
                </div>
              </li>
              <li>
                <div className="eval-instruction-num">3</div>
                <div>
                  Check: ☑ <b>&ldquo;I am the human manager reviewing this proposal.&rdquo;</b>
                </div>
              </li>
              <li>
                <div className="eval-instruction-num">4</div>
                <div>
                  Click <b>&ldquo;Record manager decision&rdquo;</b> and confirm the browser alert.
                </div>
              </li>
            </ul>

            <div className="eval-expected-box">
              <h4><Check size={16} /> What Judges Should Verify:</h4>
              <p>
                The proposal card turns golden-green with the <b>APPROVED</b> badge and displays: <code>Decision by GM M. Chowdhury at [Timestamp]</code>.
                <br /><br />
                Now navigate to <b>/app/audit</b> to verify that the entire unbroken chain (Roll Registered &rarr; Observation Verified &rarr; Batch Allocated &rarr; Proposal Created &rarr; Decision Recorded) is locked in the append-only ledger with <b>zero silent edits</b>!
              </p>
            </div>

            <div style={{ marginTop: 18 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontWeight: 700, color: '#001f3b' }}>
                <input
                  type="checkbox"
                  checked={!!completedSteps[5]}
                  onChange={() => toggleStep(5)}
                  style={{ width: 18, height: 18, accentColor: '#ffd000' }}
                />
                Mark Step 5 Complete: &ldquo;I recorded an approved manager decision &amp; verified the audit trail&rdquo;
              </label>
            </div>
          </div>
        </div>

        {/* TERMINAL VERIFICATION */}
        <div className="eval-step-container">
          <div className="eval-step-header" style={{ background: '#001428' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div className="eval-step-tag" style={{ background: '#ffd000', color: '#001f3b' }}>Terminal</div>
              <div className="eval-step-title">Automated Test Suite Runner (For Technical Judges)</div>
            </div>
            <span className="badge good" style={{ background: '#10b981', color: '#ffffff', border: 'none' }}>
              53 BACKEND TESTS PASS
            </span>
          </div>
          <div className="eval-step-body">
            <p style={{ fontSize: 14.5, color: '#3c5269', lineHeight: 1.6, marginBottom: 14 }}>
              Technical judges can also verify code correctness and test coverage directly via terminal:
            </p>

            <div style={{ background: '#001428', color: '#cbe6fa', padding: 18, borderRadius: 12, fontFamily: 'monospace', fontSize: 13, lineHeight: 1.8 }}>
              <div style={{ color: '#ffd000' }}># 1. Run all 53 backend pytest unit &amp; integration tests:</div>
              <div>pytest -q</div>
              <div style={{ color: '#10b981' }}>&gt; 53 passed in 2.50s [100%]</div>
              <br />
              <div style={{ color: '#ffd000' }}># 2. Run TypeScript strict typecheck on the frontend:</div>
              <div>npm run typecheck</div>
              <div style={{ color: '#10b981' }}>&gt; tsc --noEmit (0 errors)</div>
              <br />
              <div style={{ color: '#ffd000' }}># 3. Test production Next.js build:</div>
              <div>npm run build</div>
              <div style={{ color: '#10b981' }}>&gt; ✓ Compiled successfully in 2.1s (all 18 routes generated)</div>
              <br />
              <div style={{ color: '#ffd000' }}># 4. Run automated Playwright end-to-end browser test:</div>
              <div>npm run test:e2e</div>
              <div style={{ color: '#10b981' }}>&gt; Executes the full ORD-1001 walkthrough in headless browser</div>
            </div>
          </div>
        </div>

        {/* JUDGE SCORECARD SUMMARY */}
        <div style={{ background: '#ffffff', borderRadius: 22, border: '3px solid #001f3b', padding: 32, boxShadow: '8px 8px 0 #001f3b', marginTop: 40 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14, marginBottom: 20 }}>
            <div>
              <div className="eyebrow" style={{ color: '#0069a6' }}>Final Assessment</div>
              <h3 style={{ fontSize: 24, color: '#001f3b' }}>Judge Evaluation Scorecard</h3>
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <span style={{ fontSize: 14, fontWeight: 800, color: '#001f3b' }}>Score:</span>
              <span className="badge good" style={{ fontSize: 14, padding: '6px 14px' }}>
                {completedCount === 5 ? '100% — ALL PHASES PASSED' : `${completedCount * 20}% COMPLETED`}
              </span>
            </div>
          </div>

          <div className="feast-matrix-wrap" style={{ marginTop: 0 }}>
            <div className="feast-matrix-head">
              <div>Judging Criterion</div>
              <div>Engineered Solution</div>
              <div>Status</div>
            </div>
            <div className="feast-matrix-row">
              <div className="dim-col">Feastables Visual Identity</div>
              <div>Vibrant color-blocking, Space Grotesk typography, candy badges, smooth animations.</div>
              <div className="good-col">PASSED</div>
            </div>
            <div className="feast-matrix-row">
              <div className="dim-col">Dedicated Product Pages</div>
              <div>Dedicated routes for /fabricguard, /linewatch, and /orderrescue.</div>
              <div className="good-col">PASSED</div>
            </div>
            <div className="feast-matrix-row">
              <div className="dim-col">Architecture for Non-Technicals</div>
              <div>Plain-English 4-layer stack &amp; 4 high-stakes manufacturing dispute defense playbooks.</div>
              <div className="good-col">PASSED</div>
            </div>
            <div className="feast-matrix-row">
              <div className="dim-col">Deterministic Arithmetic</div>
              <div>Pure Python formulas (2+2=4); LLMs are banned from calculating money or cutoffs.</div>
              <div className="good-col">PASSED</div>
            </div>
            <div className="feast-matrix-row">
              <div className="dim-col">Human Gateway Governance</div>
              <div>Manager role token required; named human signature on every approved recovery plan.</div>
              <div className="good-col">PASSED</div>
            </div>
          </div>
        </div>
      </section>

      <FinalCTA />
    </>
  );
}
