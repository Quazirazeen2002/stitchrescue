'use client';

import Link from 'next/link';
import {PageHeading,Panel,DataTable,Loading,ErrorState,useData} from '@/components/ui';
import type {RecordData} from '@/types';
import {toast} from 'sonner';

export function AuditHistory() {
  const query = useData<{events: RecordData[]; legacy_fabric_events: RecordData[]}>('/audit');

  return (
    <>
      <PageHeading
        eyebrow="Traceable by design"
        title="Audit history"
        description="Review recorded material, production, investigation, proposal and human decision events."
      />
      {query.isPending ? (
        <Loading/>
      ) : query.isError ? (
        <ErrorState error={query.error}/>
      ) : (
        <>
          <Panel
            title="Connected operational events"
            badge={<span className="badge cyan">REAL-TIME</span>}
          >
            <DataTable
              rows={query.data.events}
              columns={[
                {key: 'id', label: 'Event'},
                {key: 'entity_type', label: 'Entity'},
                {key: 'entity_id', label: 'Record'},
                {key: 'event_type', label: 'Action'},
                {key: 'actor', label: 'Recorded by'},
                {key: 'created_at', label: 'Timestamp'},
                {key: 'details_json', label: 'Details'}
              ]}
            />
          </Panel>
          <Panel
            title="Preserved legacy fabric events"
            badge={<span className="badge neutral">ARCHIVE</span>}
          >
            <DataTable rows={query.data.legacy_fabric_events}/>
          </Panel>
        </>
      )}
    </>
  );
}

export function Settings() {
  const query = useData<RecordData>('/settings');

  return (
    <>
      <PageHeading
        eyebrow="Installation settings"
        title="Know your configuration."
        description="Server credentials remain on the backend. This view shows readiness without exposing secrets."
      />
      <Panel
        title="Server configuration"
        badge={<span className="badge yellow">ENVIRONMENT</span>}
      >
        {query.data ? (
          <div className="settings-list">
            {Object.entries(query.data).map(([key, value]) => (
              <div className="settings-item" key={key}>
                <span>{key.replaceAll('_', ' ')}</span>
                <strong>
                  {typeof value === 'boolean' ? (value ? 'Configured' : 'Not configured') : String(value)}
                </strong>
              </div>
            ))}
          </div>
        ) : query.isError ? (
          <ErrorState error={query.error}/>
        ) : (
          <Loading/>
        )}
      </Panel>
      <Panel
        title="Manager authorization"
        subtitle="A shared server-configured credential protects human decisions in this local prototype."
        badge={<span className="badge danger">AUTHENTICATION</span>}
      >
        <div className="quick-actions">
          <Link className="button primary" href="/login">
            Manager sign in ↗
          </Link>
          <button
            className="button secondary"
            onClick={() => {
              sessionStorage.removeItem('stitchrescue-manager');
              toast.success('Manager session cleared.');
            }}
          >
            Clear manager session
          </button>
        </div>
        <p className="info-note">
          Individual accounts, role management and production authentication are required before a factory deployment. The shared credential is intended for local validation.
        </p>
      </Panel>
    </>
  );
}
