'use client';

import {useState} from 'react';
import {useQueryClient} from '@tanstack/react-query';
import {toast} from 'sonner';
import {Upload,ArrowUpRight,Layers,Image as ImageIcon,FileCheck2,ShieldCheck} from 'lucide-react';
import {
  PageHeading,
  Panel,
  ActionForm,
  DataTable,
  Badge,
  Empty,
  Loading,
  ErrorState,
  useData,
  useAction,
  orderOptions,
  actorField
} from '@/components/ui';
import type {Field} from '@/components/ui';
import {post} from '@/lib/api';
import type {Order,Roll,RollDetail,RecordData} from '@/types';

export function FabricGuard() {
  const rolls = useData<Roll[]>('/fabric-rolls');
  const orders = useData<Order[]>('/orders');
  const [selected, setSelected] = useState('');
  const current = selected || rolls.data?.[0]?.roll_id || '';
  const detail = useData<RollDetail>(`/fabric-rolls/${encodeURIComponent(current)}`, !!current);
  const action = useAction();
  const client = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [uploader, setUploader] = useState('');
  const [imageId, setImageId] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);

  const registerFields: Field[] = [
    {name: 'roll_id', label: 'Roll ID'},
    {name: 'supplier', label: 'Supplier'},
    {name: 'fabric_type', label: 'Fabric type'},
    {name: 'composition', label: 'Composition', required: false},
    {name: 'color', label: 'Colour', required: false},
    {name: 'length_m', label: 'Length (metres)', type: 'number', min: 0.01},
    {name: 'width_cm', label: 'Width (cm)', type: 'number', min: 0.01, required: false},
    {name: 'gsm', label: 'GSM', type: 'number', min: 0.01, required: false},
    {name: 'purchase_order', label: 'Purchase order', required: false},
    {name: 'order_id', label: 'Production order', type: 'select', options: orderOptions(orders.data)},
    {name: 'received_date', label: 'Received date', type: 'date', required: false},
    actorField
  ];

  async function upload() {
    if (!file || !uploader || !current) {
      toast.error('Select a roll, photograph and uploader identity.');
      return;
    }
    const form = new FormData();
    form.set('file', file);
    form.set('actor', uploader);
    setUploading(true);
    try {
      const image = await post<{id: number}>(`/fabric-rolls/${encodeURIComponent(current)}/images`, form);
      setImageId(image.id);
      await client.invalidateQueries();
      toast.success('Original photograph preserved.');
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <>
      <PageHeading
        eyebrow="Material quality / FabricGuard"
        title="Every roll has a story."
        description="Register incoming fabric, preserve original evidence and record human quality decisions."
      />
      <details className="disclosure">
        <summary>Register a fabric roll</summary>
        <ActionForm
          fields={registerFields}
          label="Register fabric roll"
          onSubmit={async data => {
            await action.mutateAsync({path: '/fabric-rolls', data});
            setSelected(String(data.roll_id));
            setImageId(null);
          }}
        />
      </details>
      <Panel
        title="Registered fabric"
        subtitle="Select a roll to work with its images, observations and history"
        badge={<span className="badge cyan">INVENTORY</span>}
      >
        <div className="selected-record">
          <select
            aria-label="Select fabric roll"
            value={current}
            onChange={e => {
              setSelected(e.target.value);
              setImageId(null);
            }}
          >
            <option value="">Select fabric roll</option>
            {rolls.data?.map(r => (
              <option key={r.roll_id} value={r.roll_id}>
                {r.roll_id} · {r.supplier}
              </option>
            ))}
          </select>
          {detail.data && <Badge value={detail.data.roll.status}/>}
        </div>
        {rolls.isPending ? (
          <Loading/>
        ) : rolls.isError ? (
          <ErrorState error={rolls.error}/>
        ) : (
          <DataTable
            rows={rolls.data || []}
            columns={[
              {key: 'roll_id', label: 'Roll'},
              {key: 'supplier', label: 'Supplier'},
              {key: 'fabric_type', label: 'Material'},
              {key: 'length_m', label: 'Length / m'},
              {key: 'order_id', label: 'Order'},
              {key: 'status', label: 'Status'}
            ]}
          />
        )}
      </Panel>
      {current && detail.isError ? (
        <ErrorState error={detail.error}/>
      ) : detail.data ? (
        <>
          <div className="meta-grid" style={{marginBottom: 24}}>
            <div>
              <small>Supplier / material</small>
              <b>{detail.data.roll.supplier} · {detail.data.roll.fabric_type}</b>
            </div>
            <div>
              <small>Composition / colour</small>
              <b>{detail.data.roll.composition || 'Not supplied'} · {detail.data.roll.color || 'Not supplied'}</b>
            </div>
            <div>
              <small>Order / roll length</small>
              <b>{detail.data.roll.order_id} · {detail.data.roll.length_m} m</b>
            </div>
          </div>
          <div className="workspace-grid equal">
            <Panel
              title="Original photographic evidence"
              subtitle="Immutable JPEG, PNG or WebP files, up to 20 MB"
              badge={<span className="badge pink">IMMUTABLE EVIDENCE</span>}
            >
              <label className="field">
                <span>Uploader identity</span>
                <input value={uploader} onChange={e => setUploader(e.target.value)} placeholder="Inspector name"/>
              </label>
              <div className="file-upload">
                <input
                  aria-label="Fabric photograph"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={e => setFile(e.target.files?.[0] || null)}
                />
                <button className="button secondary" disabled={uploading} onClick={upload}>
                  <Upload size={15}/> {uploading ? 'Uploading…' : 'Preserve original image'}
                </button>
              </div>
              <div className="image-grid">
                {detail.data.images.map(image => (
                  <button
                    className={`image-tile ${imageId === image.id ? 'active' : ''}`}
                    key={image.id}
                    onClick={() => setImageId(image.id)}
                  >
                    <img src={`/api/v1/images/${image.id}/file`} alt={`Fabric evidence ${image.id} for roll ${current}`}/>
                    <small>Image #{image.id} · {image.width_px} × {image.height_px}</small>
                  </button>
                ))}
              </div>
              {!detail.data.images.length && <Empty text="Upload a photograph to begin recording defect evidence."/>}
            </Panel>
            <Panel
              title="Record a defect observation"
              subtitle="Every finding starts PENDING. Evidence source is preserved."
              badge={<span className="badge yellow">PENDING FINDINGS</span>}
            >
              <ActionForm
                key={`${current}-${imageId}`}
                fields={[
                  {
                    name: 'image_id',
                    label: 'Evidence image',
                    type: 'select',
                    value: imageId ? String(imageId) : '',
                    options: detail.data.images.map(i => ({value: String(i.id), label: `Image #${i.id}`}))
                  },
                  {name: 'defect_label', label: 'Defect label'},
                  {
                    name: 'evidence_source',
                    label: 'Evidence source',
                    type: 'select',
                    options: ['HUMAN_REPORTED', 'BDFD9_GROUND_TRUTH', 'MODEL_PREDICTION'].map(v => ({value: v, label: v.replaceAll('_', ' ')}))
                  },
                  {name: 'position_m', label: 'Position along roll (m)', type: 'number', min: 0, required: false},
                  {name: 'width_position', label: 'Width position (%)', type: 'number', min: 0, max: 100, required: false},
                  {name: 'segmentation_run_id', label: 'SAM result ID', type: 'number', min: 1, required: false},
                  {name: 'model_confidence', label: 'Model-supplied confidence (0–1)', type: 'number', min: 0, max: 1, required: false},
                  {name: 'bbox_text', label: 'Bounding box [left, top, right, bottom]', required: false},
                  {name: 'inspector_notes', label: 'Inspector notes', type: 'textarea', required: false},
                  actorField
                ]}
                label="Save pending observation"
                onSubmit={data => {
                  const {bbox_text, ...body} = data;
                  return action.mutateAsync({
                    path: '/defects',
                    data: {
                      ...body,
                      roll_id: current,
                      image_id: Number(data.image_id),
                      ...(bbox_text ? {bbox: JSON.parse(String(bbox_text))} : {})
                    }
                  });
                }}
              />
            </Panel>
          </div>
          <Panel
            title="Defect evidence register"
            subtitle="Ground truth and model predictions remain separate from human verification"
            badge={<span className="badge good">EVIDENCE TRAIL</span>}
          >
            <div className="observation-list">
              {detail.data.observations.map(o => (
                <article className="observation-card" key={o.id}>
                  <div className="row">
                    <b>#{o.id} · {o.defect_label}</b>
                    <Badge value={o.verification_status}/>
                  </div>
                  <p>{o.evidence_source.replaceAll('_', ' ')} · Image #{o.image_id || 'legacy'} · {o.inspector_notes || 'No notes supplied'}</p>
                </article>
              ))}
            </div>
            {!detail.data.observations.length && <Empty/>}
          </Panel>
          <div className="workspace-grid equal">
            <Panel
              title="Human verification"
              subtitle="Requires manager sign in. Decisions are recorded once."
              badge={<span className="badge danger">MANAGER GATEWAY</span>}
            >
              <ActionForm
                key={`verify-${current}-${detail.data.observations.length}`}
                fields={[
                  {
                    name: 'observation_id',
                    label: 'Pending observation',
                    type: 'select',
                    options: detail.data.observations
                      .filter(o => o.verification_status === 'PENDING')
                      .map(o => ({value: String(o.id), label: `#${o.id} · ${o.defect_label}`}))
                  },
                  {
                    name: 'decision',
                    label: 'Decision',
                    type: 'select',
                    options: ['VERIFIED', 'REJECTED'].map(v => ({value: v, label: v}))
                  },
                  {name: 'inspector', label: 'Inspector identity'},
                  {name: 'notes', label: 'Decision notes', type: 'textarea'}
                ]}
                label="Record inspector decision"
                onSubmit={data => {
                  const {observation_id, ...body} = data;
                  return action.mutateAsync({path: `/defects/${observation_id}/verification`, data: body});
                }}
              />
            </Panel>
            <Panel
              title="Roll disposition"
              subtitle="Held rolls must return to inspection before quality clearance."
              badge={<span className="badge warning">DISPOSITION</span>}
            >
              <ActionForm
                key={`status-${current}-${detail.data.roll.status}`}
                fields={[
                  {
                    name: 'status',
                    label: 'New status',
                    type: 'select',
                    options: ['RECEIVED', 'UNDER_INSPECTION', 'ON_HOLD', 'QUALITY_CLEARED', 'CONSUMED'].map(v => ({
                      value: v,
                      label: v.replaceAll('_', ' ')
                    }))
                  },
                  actorField,
                  {name: 'notes', label: 'Disposition notes', type: 'textarea'}
                ]}
                label="Record human status decision"
                onSubmit={data =>
                  action.mutateAsync({path: `/fabric-rolls/${encodeURIComponent(current)}/status`, data, method: 'PATCH'})
                }
              />
              <p className="info-note">AI predictions never release fabric. Quality clearance requires resolved pending observations and a named human decision.</p>
            </Panel>
          </div>
          <Panel
            title="Roll history"
            subtitle="Registration, image uploads, evidence, decisions and production allocations"
            badge={<span className="badge neutral">AUDIT</span>}
          >
            <DataTable
              rows={[...detail.data.audit, ...detail.data.legacy_audit]}
              columns={[
                {key: 'event_type', label: 'Event'},
                {key: 'actor', label: 'Recorded by'},
                {key: 'created_at', label: 'Timestamp'},
                {key: 'details_json', label: 'Details'}
              ]}
            />
          </Panel>
          <Panel
            title="Production allocations"
            badge={<span className="badge cyan">ALLOCATIONS</span>}
          >
            <DataTable rows={detail.data.allocations}/>
          </Panel>
        </>
      ) : (
        !current && <Empty text="Register a fabric roll to start its quality record."/>
      )}
    </>
  );
}
