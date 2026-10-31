'use client';
import Link from 'next/link';
import {Layers,TriangleAlert,ShieldCheck,Clock,GitBranch,ClipboardList,ArrowUpRight,Plus,ScanLine} from 'lucide-react';
import {PageHeading,Panel,DataTable,Badge,Empty,Loading,ErrorState,useData,ActionForm,useAction,orderOptions,actorField} from '@/components/ui';
import {FactoryChart} from '@/components/charts';
import type {Dashboard,Order} from '@/types';
import {number,money} from '@/lib/api';
const metrics=[
  ['registered_rolls','Registered rolls',Layers,'ocean'],
  ['open_incidents','Open incidents',TriangleAlert,'pink'],
  ['verified_defects','Verified defects',ShieldCheck,'green'],
  ['rolls_on_hold','Rolls on hold',Clock,'yellow'],
  ['active_batches','Active batches',GitBranch,'cyan'],
  ['pending_proposals','Recovery proposals',ClipboardList,'purple'],
  ['pending_approvals','Pending approvals',ShieldCheck,'amber'],
] as const;

export function CommandCenter(){
  const query=useData<Dashboard>('/dashboard');
  const orders=useData<Order[]>('/orders');
  const action=useAction();
  return <>
    <PageHeading
      eyebrow="Your factory, connected"
      title="Command Center"
      description="A clear view of material quality, production evidence and recovery decisions."
      action={<Link href="/app/fabricguard" className="button primary"><Plus size={16}/> Register fabric</Link>}
    />
    {query.isPending?<Loading/>:query.isError?<ErrorState error={query.error}/>:<>
      <div className="metric-grid">
        {metrics.map(([key,label,Icon,theme])=>(
          <article className={`metric-card metric-${theme}`} key={key}>
            <div className="metric-card-top">
              <div className="metric-icon-wrap"><Icon size={18}/></div>
              <span className="metric-tag">{key==='registered_rolls'?'LIVE':'COUNT'}</span>
            </div>
            <div className="metric-value">{number(query.data.counts[key]||0)}</div>
            <div className="metric-label">{label}</div>
            <div className="metric-foot">Current recorded factory data</div>
          </article>
        ))}
      </div>
      <div className="quick-actions">
        <Link href="/app/visual-inspection" className="quick-action-cyan"><ScanLine size={15}/> Inspect an image ↗</Link>
        <Link href="/app/linewatch" className="quick-action-ocean"><GitBranch size={15}/> Trace production ↗</Link>
        <Link href="/app/orderrescue" className="quick-action-pink"><ClipboardList size={15}/> Compare recovery ↗</Link>
        <Link href="/app/approvals" className="quick-action-yellow"><ShieldCheck size={15}/> Review approvals ↗</Link>
      </div>
      <div className="workspace-grid">
        <Panel
          title="Recent quality incidents"
          subtitle="Reported factory incidents awaiting resolution"
          badge={<span className="badge danger">ATTENTION</span>}
          actions={<TriangleAlert size={18} color="var(--pink)"/>}
        >
          <DataTable rows={query.data.incidents} columns={[{key:'id',label:'Incident'},{key:'order_id',label:'Order'},{key:'defect_label',label:'Defect'},{key:'affected_quantity',label:'Units'},{key:'status',label:'Status'}]}/>
        </Panel>
        <Panel
          title="Production risk"
          subtitle="Nominal capacity estimates; quality and transport require review"
          badge={<span className="badge neutral">REAL-TIME</span>}
        >
          <div className="risk-list">
            {query.data.production_risks.map(r=>(
              <div className={`risk-item risk-${r.risk.toLowerCase()}`} key={r.order_id}>
                <div>
                  <b>{r.order_id}</b>
                  <p>{number(r.remaining_units)} units remaining · {r.hours_left} hours available</p>
                  <p>Potential exposure {money(r.penalty_exposure_bdt)}</p>
                </div>
                <Badge value={r.risk}/>
              </div>
            ))}
          </div>
        </Panel>
      </div>
      <div className="workspace-grid equal">
        <Panel
          title="Recorded defect distribution"
          subtitle="All observations, including pending evidence"
          badge={<span className="badge cyan">ANALYTICS</span>}
        >
          {query.data.defect_distribution.length?<FactoryChart data={query.data.defect_distribution}/>:<Empty text="Defect categories appear after observations are recorded."/>}
        </Panel>
        <Panel
          title="Recent production activity"
          subtitle="Recorded actions across the connected workflow"
          badge={<span className="badge good">LIVE FEED</span>}
        >
          <DataTable rows={query.data.activity} columns={[{key:'event_type',label:'Action'},{key:'entity_id',label:'Record'},{key:'actor',label:'Recorded by'},{key:'created_at',label:'Time'}]}/>
        </Panel>
      </div>
      <Panel
        title="Recovery overview"
        subtitle="Proposals remain separate from approved decisions"
        badge={<span className="badge neutral">DECISIONS</span>}
      >
        <DataTable rows={query.data.recovery_plans} columns={[{key:'id',label:'Plan'},{key:'order_id',label:'Order'},{key:'recommended_strategy',label:'Strategy'},{key:'status',label:'Decision status'}]}/>
      </Panel>
    </>}
    <details className="disclosure"><summary>Report a quality incident</summary><ActionForm fields={[{name:'order_id',label:'Order',type:'select',options:orderOptions(orders.data)},{name:'defect_label',label:'Reported defect'},{name:'affected_quantity',label:'Affected units',type:'number',min:1},actorField]} label="Record quality incident" onSubmit={data=>action.mutateAsync({path:'/incidents',data})}/></details>
    <div className="info-note">Seeded orders are simulated prototype records. Dashboard counts reflect the actual records in this installation.</div>
  </>
}
