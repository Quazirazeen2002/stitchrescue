'use client';

import {useState} from 'react';
import Link from 'next/link';
import {PageHeading,Panel,ActionForm,DataTable,Badge,Empty,useData,useAction} from '@/components/ui';
import type {Plan,Approval} from '@/types';
import {money} from '@/lib/api';

export function Approvals() {
  const plans = useData<Plan[]>('/order-rescue/plans');
  const approvals = useData<Approval[]>('/approvals');
  const [selected, setSelected] = useState('');
  const action = useAction();
  const current = plans.data?.find(p => p.id === Number(selected)) || plans.data?.[0];
  const request = approvals.data?.find(a => a.recovery_plan_id === current?.id);
  const scenario = current?.calculation.scenarios.find(s => s.strategy === current.recommended_strategy);

  return (
    <>
      <PageHeading
        eyebrow="Human approval gateway"
        title="The decision stays with you."
        description="Review the exact proposal, assumptions and evidence before recording a manager decision."
        action={
          <Link href="/login" className="button secondary">
            Manager sign in ↗
          </Link>
        }
      />
      <div className="info-note">
        Approval records an authorized decision only. It does not release fabric, start rework, ship goods or execute a financial transaction.
      </div>
      <Panel
        title="Recovery proposal review"
        badge={<span className="badge cyan">PROPOSAL AUDIT</span>}
      >
        <label className="field" style={{maxWidth: 360, marginBottom: 20}}>
          <span>Select recovery proposal</span>
          <select aria-label="Select recovery proposal" value={current?.id || ''} onChange={e => setSelected(e.target.value)}>
            <option value="">Select a proposal</option>
            {plans.data?.map(p => (
              <option key={p.id} value={p.id}>
                Plan #{p.id} · {p.order_id} · {p.status}
              </option>
            ))}
          </select>
        </label>
        {current ? (
          <>
            <div className="selected-record" style={{marginTop: 20}}>
              <h3>Plan #{current.id} / {current.recommended_strategy.replaceAll('_', ' ')}</h3>
              <Badge value={current.status}/>
            </div>
            {scenario && (
              <>
                <div className="meta-grid">
                  <div>
                    <small>Estimated cost</small>
                    <b>{money(scenario.estimated_cost_bdt)}</b>
                  </div>
                  <div>
                    <small>Estimated time / recovery</small>
                    <b>{scenario.estimated_hours} h / {scenario.recoverable_quantity} units</b>
                  </div>
                  <div>
                    <small>Feasibility</small>
                    <Badge value={scenario.deadline_feasibility}/>
                  </div>
                </div>
                <div className="evidence-columns" style={{marginTop: 25}}>
                  <div>
                    <h3>Evidence and rationale</h3>
                    <p style={{fontSize: 12, lineHeight: 1.6, color: '#3f5267'}}>{current.evidence.description}</p>
                    <h3 style={{marginTop: 20}}>Assumptions</h3>
                    <ul>
                      {scenario.assumptions.map(a => (
                        <li key={a}>{a}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3>Missing information and approvals</h3>
                    <ul>
                      {[...scenario.missing_information, ...scenario.required_approvals].map((a, i) => (
                        <li key={i}>{a}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </>
            )}
          </>
        ) : (
          <Empty text="Save a recovery proposal in OrderRescue before requesting review."/>
        )}
      </Panel>
      <div className="workspace-grid equal">
        <Panel
          title="Request a manager review"
          subtitle="A plan can have one recorded approval request."
          badge={<span className="badge yellow">QUEUE</span>}
        >
          <ActionForm
            key={`requests-${plans.data?.length}-${approvals.data?.length}`}
            fields={[
              {
                name: 'plan_id',
                label: 'Proposed plan',
                type: 'select',
                options: plans.data?.filter(p => p.status === 'PROPOSED').map(p => ({value: String(p.id), label: `Plan #${p.id} · ${p.order_id}`})) || []
              },
              {name: 'requested_by', label: 'Requested by'}
            ]}
            label="Send to approval queue"
            onSubmit={data => action.mutateAsync({path: '/approvals', data: {...data, plan_id: Number(data.plan_id)}})}
          />
        </Panel>
        <Panel
          title="Record a human decision"
          subtitle={request ? `Approval #${request.id} / Plan #${current?.id}` : 'Select a plan with a pending approval request.'}
          badge={<span className="badge danger">MANAGER GATEWAY</span>}
        >
          {request?.decision === 'PENDING' ? (
            <ActionForm
              key={request.id}
              fields={[
                {
                  name: 'decision',
                  label: 'Decision',
                  type: 'select',
                  options: [
                    {value: 'APPROVED', label: 'Approve proposal'},
                    {value: 'REJECTED', label: 'Reject proposal'}
                  ]
                },
                {name: 'decided_by', label: 'Manager identity'},
                {name: 'notes', label: 'Decision notes', type: 'textarea'},
                {name: 'human_confirmation', label: 'I am the human manager reviewing this proposal.', type: 'checkbox'}
              ]}
              label="Record manager decision"
              onSubmit={data => {
                if (data.human_confirmation !== true) throw new Error('Confirm that you are the human manager.');
                if (!window.confirm(`Record ${data.decision} for Plan #${current?.id}? This decision cannot be repeated.`)) return Promise.resolve();
                return action.mutateAsync({path: `/approvals/${request.id}/decision`, data});
              }}
            />
          ) : request ? (
            <>
              <Badge value={request.decision}/>
              <p className="info-note">Decision by {request.decided_by}: {request.decision_notes}</p>
            </>
          ) : (
            <Empty text="Request approval for this plan first."/>
          )}
        </Panel>
      </div>
      <Panel
        title="Approval history"
        subtitle="Recorded decisions remain available for audit"
        badge={<span className="badge good">DECISION LOG</span>}
      >
        <DataTable
          rows={approvals.data || []}
          columns={[
            {key: 'id', label: 'Approval'},
            {key: 'recovery_plan_id', label: 'Plan'},
            {key: 'decision', label: 'Decision'},
            {key: 'requested_by', label: 'Requested by'},
            {key: 'decided_by', label: 'Decided by'},
            {key: 'decision_notes', label: 'Notes'}
          ]}
        />
      </Panel>
    </>
  );
}
