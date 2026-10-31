'use client';

import {useState} from 'react';
import {ScanLine,Maximize2} from 'lucide-react';
import {toast} from 'sonner';
import {PageHeading,Panel,Badge,DataTable,Empty,useData} from '@/components/ui';
import {post} from '@/lib/api';
import type {Roll,RollDetail,RecordData} from '@/types';

interface InspectionResult {
  original_url: string;
  overlay_url: string;
  detections: RecordData[];
  evidence_source: string;
  status: string;
}

interface SamResult {
  id: number;
  overlay_url?: string;
  overlay_status?: string;
  preview_warning?: string;
  boxes: RecordData[];
  masks: RecordData[];
  raw_output: string;
  outcome: string;
  model: string;
  diagnostics: RecordData[];
}

export function VisualInspection() {
  const [file, setFile] = useState<File | null>(null);
  const [annotation, setAnnotation] = useState<File | null>(null);
  const [result, setResult] = useState<InspectionResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [view, setView] = useState('ground-truth');
  const [sam, setSam] = useState<SamResult | null>(null);
  const rolls = useData<Roll[]>('/fabric-rolls');
  const [roll, setRoll] = useState('');
  const detail = useData<RollDetail>(`/fabric-rolls/${encodeURIComponent(roll)}`, !!roll);
  const [image, setImage] = useState('');
  const [prompt, setPrompt] = useState('fabric defect');
  const [evaluating, setEvaluating] = useState(false);
  const [metrics, setMetrics] = useState<{iou: number; dice: number; scope: string} | null>(null);

  async function inspect() {
    if (!file) {
      toast.error('Select a fabric image.');
      return;
    }
    const form = new FormData();
    form.set('file', file);
    if (annotation) form.set('annotation', annotation);
    setBusy(true);
    try {
      setResult(await post('/inspections', form));
      setView('ground-truth');
      toast.success('Image evidence visualized.');
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function segment() {
    if (!image || !prompt.trim()) {
      toast.error('Select a preserved image and enter a prompt.');
      return;
    }
    setBusy(true);
    setSam(null);
    setMetrics(null);
    try {
      setSam(await post(`/images/${image}/segment`, {prompt}));
      setView('model');
      toast.success('SAM response preserved.');
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function evaluate() {
    if (!annotation || !sam) {
      toast.error('Supply a YOLO annotation for the same SAM source image.');
      return;
    }
    const form = new FormData();
    form.set('annotation', annotation);
    setEvaluating(true);
    try {
      setMetrics(await post(`/segmentations/${sam.id}/evaluate`, form));
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setEvaluating(false);
    }
  }

  const shown = view === 'model' ? sam?.overlay_url : view === 'original' ? result?.original_url : result?.overlay_url;

  return (
    <>
      <PageHeading
        eyebrow="Evidence workspace / Visual inspection"
        title="Look closer. Keep the source."
        description="View BDFD9 annotations and real SAM predictions as separate evidence layers. Zoom into preserved images."
      />
      <div className="canvas-grid">
        <div>
          <Panel
            title="Inspection canvas"
            subtitle="Images and overlays remain distinct from human-confirmed findings"
            badge={<span className="badge cyan">VISION CANVAS</span>}
          >
            <div className="canvas-toolbar">
              <button className={view === 'original' ? 'active' : ''} disabled={!result} onClick={() => setView('original')}>
                Original
              </button>
              <button className={view === 'ground-truth' ? 'active' : ''} disabled={!result} onClick={() => setView('ground-truth')}>
                Ground truth / annotation
              </button>
              <button className={view === 'model' ? 'active' : ''} disabled={!sam} onClick={() => setView('model')}>
                SAM prediction
              </button>
              {shown && (
                <a className="button secondary" href={shown} target="_blank" rel="noreferrer" style={{padding: '5px 12px', minHeight: 32}}>
                  <Maximize2 size={13}/> Full resolution
                </a>
              )}
            </div>
            <div className="inspection-canvas">
              {shown ? (
                <img src={shown} alt={`${view} fabric inspection evidence`}/>
              ) : (
                <div className="canvas-empty">
                  <ScanLine size={44} style={{margin: '0 auto 15px', color: 'var(--blue-medium)'}}/>
                  Upload fabric evidence to begin.<br/>No simulated model result is shown.
                </div>
              )}
            </div>
            <div className="evidence-legend">
              <span><i/>Ground truth</span>
              <span><i/>Model prediction</span>
              <span><i/>Human verification in FabricGuard</span>
            </div>
            {result && view !== 'model' && (
              <>
                <Badge value={result.evidence_source}/>
                <p className="info-note">{result.status}</p>
                <DataTable rows={result.detections}/>
              </>
            )}
            {sam && view === 'model' && (
              <>
                <Badge value="MODEL_PREDICTION"/>
                <p className="info-note">
                  {sam.model} · {sam.outcome} · Preview {sam.overlay_status} {sam.preview_warning || ''} · {sam.boxes.length} boxes · {sam.masks.length} masks. Segmentation does not classify or verify a fabric defect.
                </p>
                <DataTable rows={sam.boxes}/>
                <details>
                  <summary>Raw response and mask provenance</summary>
                  <pre className="json-view">{JSON.stringify(sam, null, 2)}</pre>
                </details>
              </>
            )}
          </Panel>
          {metrics && (
            <Panel title="Aligned mask comparison" subtitle="Binary union masks on the same source image" badge={<span className="badge good">METRICS</span>}>
              <div className="meta-grid">
                <div><small>Intersection over Union</small><b>{metrics.iou}</b></div>
                <div><small>Dice coefficient</small><b>{metrics.dice}</b></div>
              </div>
              <p className="info-note">{metrics.scope}</p>
            </Panel>
          )}
        </div>
        <div>
          <Panel title="BDFD9 / manual inspection" subtitle="Preserves the original Stage 1 polygon and box renderer" badge={<span className="badge yellow">GROUND TRUTH</span>}>
            <label className="file-upload">
              <span>Fabric photograph</span>
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={e => setFile(e.target.files?.[0] || null)}/>
            </label>
            <label className="file-upload">
              <span>YOLO annotation (.txt), optional</span>
              <input type="file" accept=".txt" onChange={e => setAnnotation(e.target.files?.[0] || null)}/>
            </label>
            <button className="button primary" disabled={busy} onClick={inspect}>
              {busy ? 'Processing…' : 'Visualize image evidence'} <ScanLine size={15}/>
            </button>
          </Panel>
          <Panel title="Meta SAM 3.1" subtitle="Uses a preserved FabricGuard photograph. Live API access is required." badge={<span className="badge pink">FOUNDATION MODEL</span>}>
            <label className="field">
              <span>Fabric roll</span>
              <select value={roll} onChange={e => {setRoll(e.target.value); setImage(''); setSam(null);}}>
                <option value="">Select roll</option>
                {rolls.data?.map(r => (
                  <option key={r.roll_id} value={r.roll_id}>{r.roll_id}</option>
                ))}
              </select>
            </label>
            <label className="field" style={{marginTop: 15}}>
              <span>Source image</span>
              <select value={image} onChange={e => {setImage(e.target.value); setSam(null);}}>
                <option value="">Select image</option>
                {detail.data?.images.map(i => (
                  <option key={i.id} value={i.id}>Image #{i.id} · {i.width_px} × {i.height_px}</option>
                ))}
              </select>
            </label>
            <label className="field" style={{margin: '15px 0 20px'}}>
              <span>Visual concept prompt</span>
              <input value={prompt} onChange={e => setPrompt(e.target.value)}/>
            </label>
            <button className="button primary" disabled={busy} onClick={segment}>
              {busy ? 'Waiting for model…' : 'Run live segmentation'} <ScanLine size={15}/>
            </button>
            {sam && (
              <>
                <p className="info-note">To evaluate, supply the matching source image’s YOLO annotation above. Comparison uses the union of supplied regions.</p>
                <button className="button secondary" disabled={evaluating || !annotation} onClick={evaluate}>
                  {evaluating ? 'Comparing…' : 'Compare aligned masks'}
                </button>
              </>
            )}
          </Panel>
        </div>
      </div>
    </>
  );
}
