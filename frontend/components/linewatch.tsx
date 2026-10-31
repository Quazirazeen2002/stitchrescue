'use client';

import {useState} from 'react';
import {ArrowRight,GitBranch} from 'lucide-react';
import {
  PageHeading,
  Panel,
  ActionForm,
  DataTable,
  Badge,
  Empty,
  useData,
  useAction,
  orderOptions,
  actorField
} from '@/components/ui';
import type {Order,Roll,Batch,RecordData} from '@/types';

interface Trace {
  batch: Batch;
  linked_rolls: {roll_id: string; allocated_length_m: number; status: string}[];
  verified_defects: RecordData[];
  pending_observations: RecordData[];
  machine_events: RecordData[];
  potential_correlations: {event_id: number; line: string; interpretation: string}[];
  unknowns: string[];
  repeated_defects: RecordData[];
  causation: string;
  investigation_status: string;
}

export function LineWatch() {
  const batches = useData<Batch[]>('/production-batches');
  const rolls = useData<Roll[]>('/fabric-rolls');
  const orders = useData<Order[]>('/orders');
  const events = useData<RecordData[]>('/machine-events');
  const [selected, setSelected] = useState('');
  const current = selected || batches.data?.[0]?.batch_id || '';
  const trace = useData<Trace>(`/linewatch/${encodeURIComponent(current)}`, !!current);
  const action = useAction();
  const batchOptions = batches.data?.map(b => ({value: b.batch_id, label: `${b.batch_id} · ${b.order_id}`})) || [];

  return (
    <>
      <PageHeading
        eyebrow="Production traceability / LineWatch"
        title="Follow the fabric."
        description="Connect rolls, production batches and both production lines. Investigate the evidence without assuming a cause."
      />
      <details className="disclosure">
        <summary>Register a production batch</summary>
        <ActionForm
          fields={[
            {name: 'batch_id', label: 'Batch ID'},
            {name: 'order_id', label: 'Order', type: 'select', options: orderOptions(orders.data)},
            {name: 'cutting_line', label: 'Cutting line'},
            {name: 'sewing_line', label: 'Sewing line'},
            {name: 'planned_quantity', label: 'Planned quantity', type: 'number', min: 1},
            {name: 'produced_quantity', label: 'Produced quantity', type: 'number', value: 0, min: 0},
            {name: 'started_at', label: 'Started at', type: 'datetime-local', required: false},
            {name: 'completed_at', label: 'Completed at', type: 'datetime-local', required: false},
            {
              name: 'status',
              label: 'Batch status',
              type: 'select',
              value: 'PLANNED',
              options: ['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD'].map(v => ({value: v, label: v.replaceAll('_', ' ')}))
            },
            actorField
          ]}
          label="Register production batch"
          onSubmit={async data => {
            await action.mutateAsync({path: '/production-batches', data});
            setSelected(String(data.batch_id));
          }}
        />
      </details>
      <div className="workspace-grid equal">
        <Panel
          title="Allocate a fabric roll"
          subtitle="Same order only. Held and consumed rolls cannot receive new allocations."
          badge={<span className="badge cyan">ALLOCATION</span>}
        >
          <ActionForm
            key={`allocate-${batches.data?.length}-${rolls.data?.length}-${current}`}
            fields={[
              {name: 'batch_id', label: 'Production batch', type: 'select', value: current, options: batchOptions},
              {
                name: 'roll_id',
                label: 'Fabric roll',
                type: 'select',
                options: rolls.data?.filter(r => !['ON_HOLD', 'CONSUMED'].includes(r.status)).map(r => ({value: r.roll_id, label: `${r.roll_id} · ${r.order_id}`})) || []
              },
              {name: 'allocated_length_m', label: 'Allocated length (m)', type: 'number', min: 0.01},
              actorField
            ]}
            label="Link roll to batch"
            onSubmit={data => {
              const {batch_id, ...body} = data;
              setSelected(String(batch_id));
              return action.mutateAsync({path: `/production-batches/${encodeURIComponent(String(batch_id))}/allocations`, data: body});
            }}
          />
        </Panel>
        <Panel
          title="Record a machine event"
          subtitle="A recorded event is evidence; shared timing or line does not prove causation."
          badge={<span className="badge yellow">EVENT LOG</span>}
        >
          <ActionForm
            fields={[
              {name: 'machine_id', label: 'Machine ID'},
              {name: 'production_line', label: 'Production line'},
              {
                name: 'event_type',
                label: 'Event type',
                type: 'select',
                options: ['MAINTENANCE', 'BREAKDOWN', 'CLEANING', 'LUBRICATION', 'INSPECTION'].map(v => ({value: v, label: v}))
              },
              {name: 'event_time', label: 'Event timestamp', type: 'datetime-local'},
              {name: 'recorded_by', label: 'Recorded by'},
              {name: 'description', label: 'What happened?', type: 'textarea'}
            ]}
            label="Record machine event"
            onSubmit={data => action.mutateAsync({path: '/machine-events', data})}
          />
        </Panel>
      </div>
      <Panel
        title="Production trace"
        subtitle="Fabric roll → Production batch → Cutting line → Sewing line → Quality evidence"
        badge={<span className="badge good">TRACEABILITY</span>}
      >
        <div className="selected-record">
          <select value={current} aria-label="Select production batch" onChange={e => setSelected(e.target.value)}>
            <option value="">Select a production batch</option>
            {batchOptions.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <button
            className="button secondary"
            disabled={!current || action.isPending}
            onClick={() => action.mutate({path: `/linewatch/${encodeURIComponent(current)}/investigate`, data: {}})}
          >
            <GitBranch size={15}/> Save evidence investigation
          </button>
        </div>
        {trace.data ? (
          <>
            <div className="trace-flow">
              {[
                [trace.data.linked_rolls.map(r => r.roll_id).join(', ') || 'No allocation', 'Fabric rolls'],
                [trace.data.batch.batch_id, 'Production batch'],
                [trace.data.batch.cutting_line, 'Cutting line'],
                [trace.data.batch.sewing_line, 'Sewing line'],
                [`${trace.data.verified_defects.length} verified / ${trace.data.pending_observations.length} pending`, 'Quality evidence']
              ].map(([name, label], i) => (
                <div key={label} style={{display: 'flex', alignItems: 'center', gap: 10}}>
                  {i > 0 && <ArrowRight size={16} color="var(--blue-medium)"/>}
                  <div className="trace-node">
                    <small>{label}</small>
                    <b>{name}</b>
                  </div>
                </div>
              ))}
            </div>
            <div className="info-note">{trace.data.causation}</div>
            <div className="evidence-columns">
              <div>
                <h3>Confirmed defect observations</h3>
                <DataTable rows={trace.data.verified_defects}/>
              </div>
              <div>
                <h3>Pending observations</h3>
                <DataTable rows={trace.data.pending_observations}/>
              </div>
            </div>
            <div className="evidence-columns" style={{marginTop: 25}}>
              <div>
                <h3>Potential correlations</h3>
                <ul>
                  {trace.data.potential_correlations.map(c => (
                    <li key={c.event_id}>Event #{c.event_id} · {c.line}: {c.interpretation}</li>
                  ))}
                </ul>
                {!trace.data.potential_correlations.length && (
                  <p style={{fontSize: 11, color: '#5d758f'}}>No machine events are available to correlate.</p>
                )}
              </div>
              <div>
                <h3>Missing evidence and unknowns</h3>
                <ul>
                  {trace.data.unknowns.map(u => (
                    <li key={u}>{u}</li>
                  ))}
                </ul>
              </div>
            </div>
            <details style={{marginTop: 25}}>
              <summary>Repeated defects across batches</summary>
              <DataTable rows={trace.data.repeated_defects}/>
            </details>
          </>
        ) : (
          <Empty text="Register and select a batch to inspect its production trace."/>
        )}
      </Panel>
      <Panel title="Batch register" badge={<span className="badge neutral">BATCHES</span>}>
        <DataTable rows={batches.data || []}/>
      </Panel>
      <Panel
        title="Machine event history"
        subtitle="Events from both cutting and sewing lines remain traceable"
        badge={<span className="badge neutral">LOGS</span>}
      >
        <DataTable rows={events.data || []}/>
      </Panel>
    </>
  );
}
