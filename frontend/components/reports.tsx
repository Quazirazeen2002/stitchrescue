'use client';

import {useState} from 'react';
import {useQueryClient} from '@tanstack/react-query';
import {PageHeading,Panel,ActionForm,Empty,DataTable,useData,orderOptions,Badge} from '@/components/ui';
import {post} from '@/lib/api';
import type {Order,Batch,Report} from '@/types';

export function Reports() {
  const orders = useData<Order[]>('/orders');
  const batches = useData<Batch[]>('/production-batches');
  const reports = useData<Report[]>('/reports');
  const [active, setActive] = useState<Report | null>(null);
  const [fresh, setFresh] = useState('');
  const client = useQueryClient();

  return (
    <>
      <PageHeading
        eyebrow="Evidence-grounded reasoning"
        title="Investigation reports"
        description="Review factory evidence, cited knowledge and production context. AI explanations require live Meta access."
      />
      <div className="workspace-grid equal">
        <Panel
          title="Ask the investigator"
          subtitle="The orchestrator uses quality, knowledge and recovery specialists with bounded read tools."
          badge={<span className="badge cyan">AGENT ORCHESTRATOR</span>}
        >
          <ActionForm
            fields={[
              {name: 'order_id', label: 'Order', type: 'select', options: orderOptions(orders.data)},
              {
                name: 'batch_id',
                label: 'Production batch',
                type: 'select',
                required: false,
                options: batches.data?.map(b => ({value: b.batch_id, label: b.batch_id})) || []
              },
              {name: 'question', label: 'What should the investigation answer?', type: 'textarea'}
            ]}
            label="Run evidence investigation"
            onSubmit={async data => {
              const result = await post<{report: string}>('/agents/investigate', data);
              setFresh(result.report);
              setActive(null);
              await client.invalidateQueries();
            }}
          />
        </Panel>
        <Panel
          title="Factory knowledge"
          subtitle="The included SOP is simulated and never an approved buyer requirement."
          badge={<span className="badge yellow">KNOWLEDGE BASE</span>}
        >
          <KnowledgeSearch/>
        </Panel>
      </div>
      <Panel
        title="Investigation library"
        subtitle="Recorded deterministic findings and model reports"
        badge={<span className="badge good">EVIDENCE REPORTS</span>}
      >
        <label className="field" style={{maxWidth: 360, marginBottom: 20}}>
          <span>Select investigation report</span>
          <select
            aria-label="Select investigation report"
            value={active?.id || ''}
            onChange={e => {
              setActive(reports.data?.find(r => r.id === Number(e.target.value)) || null);
              setFresh('');
            }}
          >
            <option value="">Select a report</option>
            {reports.data?.map(r => (
              <option key={r.id} value={r.id}>
                #{r.id} · {r.report_type} · {r.order_id} · {r.created_at}
              </option>
            ))}
          </select>
        </label>
        {active || fresh ? (
          <div style={{marginTop: 20}}>
            {active && <Badge value={active.report_type}/>}
            <pre className="report-content" style={{marginTop: 15}}>{active?.report || fresh}</pre>
            {active?.evidence_json && (
              <details style={{marginTop: 15}}>
                <summary>Recorded evidence</summary>
                <pre className="json-view">{JSON.stringify(JSON.parse(active.evidence_json), null, 2)}</pre>
              </details>
            )}
          </div>
        ) : (
          <Empty text="Run an investigation or select a saved report."/>
        )}
        <DataTable
          rows={reports.data || []}
          columns={[
            {key: 'id', label: 'Report'},
            {key: 'report_type', label: 'Type'},
            {key: 'order_id', label: 'Order'},
            {key: 'created_at', label: 'Created'}
          ]}
        />
      </Panel>
    </>
  );
}

function KnowledgeSearch() {
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');
  const results = useData<{
    results: {
      document_id: string;
      section: number;
      text: string;
      status: string;
      citation: string;
      outdated: boolean;
      review_date_missing: boolean;
    }[];
  }>(`/knowledge?query=${encodeURIComponent(search)}`, !!search);

  return (
    <>
      <form
        onSubmit={e => {
          e.preventDefault();
          setSearch(query);
        }}
      >
        <label className="field">
          <span>Search factory documents</span>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Oil stain handling, rework, buyer acceptance…"
            required
          />
        </label>
        <button className="button secondary" style={{marginTop: 15}}>
          Retrieve cited evidence
        </button>
      </form>
      <div className="info-note">SIMULATED — NOT AN APPROVED FACTORY SOP.</div>
      {results.data?.results.map((r, i) => (
        <article className="observation-card" key={i} style={{marginTop: 12}}>
          <b>{r.citation}</b>
          <p>
            {r.status}
            {r.outdated ? ' · OUTDATED' : ''}
            {r.review_date_missing ? ' · Review date missing' : ''}
          </p>
          <p style={{fontSize: 11, color: '#3f5267', marginTop: 6}}>{r.text}</p>
        </article>
      ))}
      {search && !results.data?.results.length && (
        <Empty text="No matching document evidence. Supply approved factory and buyer documents."/>
      )}
    </>
  );
}
