'use client';
import {useState} from 'react';
import {useQueryClient} from '@tanstack/react-query';
import {toast} from 'sonner';
import {BrainCircuit,Calculator,TrendingUp,Save,FolderCheck} from 'lucide-react';
import {PageHeading,Panel,ActionForm,Badge,DataTable,Empty,useData,orderOptions} from '@/components/ui';
import type {Field} from '@/components/ui';
import type {Order,Calculation,RecordData,Plan} from '@/types';
import {post,money,number} from '@/lib/api';
import {FactoryChart} from '@/components/charts';

export function OrderRescue(){
  const orders=useData<Order[]>('/orders');
  const plans=useData<Plan[]>('/order-rescue/plans');
  const [orderId,setOrderId]=useState('');
  const selected=orders.data?.find(o=>o.id===(orderId||orders.data?.[0]?.id));
  const [calculation,setCalculation]=useState<Calculation|null>(null);
  const [inputs,setInputs]=useState<RecordData|null>(null);
  const [recommendation,setRecommendation]=useState('');
  const [thinking,setThinking]=useState(false);
  const client=useQueryClient();

  const fields:Field[]=[
    {name:'accepted_quantity',label:'Accepted units',type:'number',min:0,value:selected?selected.accepted_quantity:0},
    {name:'affected_quantity',label:'Affected units',type:'number',min:1,value:selected?.rejected||1},
    {name:'available_hours',label:'Available recovery hours',type:'number',min:0,value:selected?.hours_left||0},
    {name:'rework_cost_per_unit',label:'Rework cost / unit (BDT)',type:'number',min:0},
    {name:'rework_capacity_per_hour',label:'Rework units / hour',type:'number',min:.01},
    {name:'replacement_cost_per_unit',label:'Replacement cost / unit (BDT)',type:'number',min:0},
    {name:'replacement_capacity_per_hour',label:'Replacement units / hour',type:'number',min:.01},
    {name:'replacement_material_units',label:'Replacement material / units',type:'number',min:0},
    {name:'stock_quantity',label:'Available approved stock / units',type:'number',min:0},
    {name:'stock_unit_cost',label:'Stock allocation cost / unit (BDT)',type:'number',min:0},
    {name:'stock_handling_hours',label:'Stock handling hours',type:'number',min:0},
    {name:'material_compatible',label:'Material compatibility confirmed',type:'checkbox',required:false},
    {name:'buyer_spec_compatible',label:'Buyer specification compatibility confirmed',type:'checkbox',required:false},
    {name:'reinspection_authorized',label:'Quality reinspection authorized',type:'checkbox',required:false},
    {name:'capacity_confirmed',label:'Actual capacity availability confirmed',type:'checkbox',required:false},
    {name:'buyer_partial_authorized',label:'Buyer has authorized partial shipment',type:'checkbox',required:false},
    {name:'assumptions',label:'Source of estimates and assumptions',type:'textarea',hint:'Identify user estimates, factory records and any missing buyer requirements.'}
  ];

  async function recommend(){
    if(!inputs)return;
    setThinking(true);
    try{
      const r=await post<{report:string}>('/order-rescue/recommend',inputs);
      setRecommendation(r.report);
      await client.invalidateQueries();
    }catch(e){
      toast.error((e as Error).message);
    }finally{
      setThinking(false);
    }
  }

  return (
    <>
      <PageHeading
        eyebrow="Business recovery / OrderRescue"
        title="Compare before you commit."
        description="Four independent alternatives. Explicit estimates. A documented human decision."
      />
      <Panel
        title="Recovery assumptions"
        subtitle="Financial and capacity values are supplied by you. Python performs every calculation."
        badge={<span className="badge cyan">CALCULATOR</span>}
      >
        <label className="field" style={{maxWidth:360,marginBottom:20}}>
          <span>Select export order</span>
          <select aria-label="Recovery order" value={selected?.id||''} onChange={e=>{setOrderId(e.target.value);setCalculation(null);setInputs(null);setRecommendation('');}}>
            {orderOptions(orders.data).map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </label>
        {selected&&(
          <>
            <div className="meta-grid" style={{marginBottom:25}}>
              <div><small>Order quantity</small><b>{number(selected.quantity)} units</b></div>
              <div><small>Product / buyer</small><b>{selected.product} / {selected.buyer}</b></div>
              <div><small>Potential configured penalty</small><b>{money(selected.penalty_bdt)}</b></div>
            </div>
            <ActionForm
              key={selected.id}
              fields={fields}
              label="Calculate recovery alternatives"
              onSubmit={async data=>{
                const body={...data,order_id:selected.id};
                const result=await post<Calculation>('/order-rescue/calculate',body);
                setInputs(body);
                setCalculation(result);
                setRecommendation('');
                toast.success('Recovery alternatives calculated.');
              }}
            />
          </>
        )}
      </Panel>
      {calculation?(
        <>
          <div className="info-note">These are mutually exclusive alternatives. Never add their recovered quantities or share their assumed capacity without recalculating a combined plan.</div>
          <div className="scenario-grid">
            {calculation.scenarios.map(s=>(
              <article key={s.strategy} className="scenario-card">
                <div className="scenario-top">
                  <h3>{s.strategy.replaceAll('_',' ')}</h3>
                  <Badge value={s.deadline_feasibility}/>
                </div>
                <div className="scenario-cost">{money(s.estimated_cost_bdt)}</div>
                <div className="scenario-facts">
                  <div><b>{number(s.recoverable_quantity)}</b><small>Recoverable units</small></div>
                  <div><b>{number(s.unrecovered_quantity)}</b><small>Unrecovered units</small></div>
                  <div><b>{s.estimated_hours}</b><small>Estimated hours</small></div>
                </div>
                <h4>Required approvals</h4>
                <ul>{s.required_approvals.map(a=><li key={a}>{a}</li>)}</ul>
                <h4>Missing information</h4>
                {s.missing_information.length?(
                  <ul>{s.missing_information.map(m=><li key={m}>{m}</li>)}</ul>
                ):(
                  <p style={{fontSize:11,color:'var(--green)',fontWeight:600}}>Supplied prerequisites are confirmed. Human approval is still required.</p>
                )}
                <details style={{marginTop:15,fontSize:11}}>
                  <summary>Assumptions</summary>
                  <ul>{s.assumptions.map(a=><li key={a}>{a}</li>)}</ul>
                </details>
              </article>
            ))}
          </div>
          <div className="workspace-grid equal">
            <Panel
              title="Incremental recovery cost"
              subtitle="BDT estimates; partial shipment excludes freight and penalties"
              badge={<span className="badge pink">COST ANALYSIS</span>}
            >
              <FactoryChart data={calculation.scenarios.map(s=>({name:s.strategy.replaceAll('_',' '),value:s.estimated_cost_bdt}))}/>
            </Panel>
            <Panel
              title="Muse Wonder recommendation"
              subtitle="Optional model explanation of the Python results. It cannot authorize a plan."
              badge={<span className="badge warning">AI REASONING</span>}
            >
              <button className="button secondary" onClick={recommend} disabled={thinking}>
                <BrainCircuit size={17}/>{thinking?'Reviewing evidence…':'Ask for an evidence review'}
              </button>
              {recommendation?(
                <pre className="report-content" style={{marginTop:20}}>{recommendation}</pre>
              ):(
                <Empty text="Calculate first, then request a reasoning review when needed."/>
              )}
            </Panel>
          </div>
          <Panel
            title="Save a recovery proposal"
            subtitle="The server recalculates and stores an immutable scenario snapshot. Saving does not approve or execute it."
            badge={<span className="badge neutral">PROPOSAL GATEWAY</span>}
          >
            <ActionForm
              fields={[
                {name:'selected_strategy',label:'Selected alternative',type:'select',options:calculation.scenarios.map(s=>({value:s.strategy,label:s.strategy.replaceAll('_',' ')}))},
                {name:'incident_id',label:'Linked incident ID',type:'number',min:1,required:false},
                {name:'requested_by',label:'Proposed by'},
                {name:'evidence',label:'Evidence and rationale',type:'textarea'}
              ]}
              label="Save proposed recovery plan"
              onSubmit={async data=>{
                await post('/order-rescue/plans',{...data,inputs});
                await client.invalidateQueries();
                toast.success('Proposal saved. Request manager review in Approval Center.');
              }}
            />
          </Panel>
        </>
      ):(
        <Panel title="Scenario comparison" badge={<span className="badge cyan">ALTERNATIVES</span>}>
          <Empty text="Supply the order estimates above to compare recovery alternatives."/>
        </Panel>
      )}
      <Panel
        title="Saved recovery proposals"
        badge={<span className="badge good">RECORDS</span>}
      >
        <DataTable rows={plans.data||[]} columns={[{key:'id',label:'Plan'},{key:'order_id',label:'Order'},{key:'recommended_strategy',label:'Alternative'},{key:'status',label:'Status'},{key:'requested_by',label:'Proposed by'}]}/>
      </Panel>
    </>
  );
}
