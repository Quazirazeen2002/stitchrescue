'use client';
import {useEffect,useState} from 'react';
import {useForm} from 'react-hook-form';
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';
import {useMutation,useQuery,useQueryClient} from '@tanstack/react-query';
import {toast} from 'sonner';
import {Loader2,ArrowUpRight,Inbox,AlertCircle} from 'lucide-react';
import {api,post} from '@/lib/api';
import type {RecordData} from '@/types';

export function useData<T>(path:string,enabled=true){
  return useQuery<T>({queryKey:[path],queryFn:()=>api<T>(path),enabled});
}

export function useAction(){
  const client=useQueryClient();
  return useMutation({
    mutationFn:({path,data,method}:{path:string;data:unknown;method?:string})=>post<unknown>(path,data,method),
    onSuccess:()=>{client.invalidateQueries();toast.success('Saved successfully.');},
    onError:(e:Error)=>toast.error(e.message)
  });
}

export type Field={
  name:string;
  label:string;
  type?:'text'|'number'|'textarea'|'select'|'date'|'datetime-local'|'checkbox'|'password';
  options?:{value:string;label:string}[];
  value?:string|number|boolean;
  required?:boolean;
  min?:number;
  max?:number;
  hint?:string
};

export function ActionForm({
  fields,
  onSubmit,
  label='Save record',
  busy=false,
  className=''
}:{
  fields:Field[];
  onSubmit:(data:RecordData)=>Promise<unknown>;
  label?:string;
  busy?:boolean;
  className?:string
}){
  const [ready,setReady]=useState(false);
  useEffect(()=>setReady(true),[]);
  const schema=z.record(z.string(),z.unknown()).superRefine((values,ctx)=>{
    fields.forEach(f=>{
      const v=values[f.name];
      if(f.required!==false && f.type!=='checkbox' && (v===''||v===undefined||v===null)){
        ctx.addIssue({code:'custom',message:`${f.label} is required.`,path:[f.name]});
      }
      if(f.type==='number' && v!=='' && v!==undefined){
        const n=Number(v);
        if(!Number.isFinite(n)||(f.min!==undefined&&n<f.min)||(f.max!==undefined&&n>f.max)){
          ctx.addIssue({code:'custom',message:`Enter a valid ${f.label.toLowerCase()}.`,path:[f.name]});
        }
      }
    });
  });
  const {register,handleSubmit,formState:{errors,isSubmitting}}=useForm<RecordData>({
    resolver:zodResolver(schema),
    defaultValues:Object.fromEntries(fields.map(f=>[f.name,f.value??(f.type==='checkbox'?false:'')]))
  });
  const submit=handleSubmit(async raw=>{
    const data:RecordData={};
    fields.forEach(f=>{
      const v=raw[f.name];
      if((v===''||v===undefined)&&f.required===false)return;
      data[f.name]=f.type==='number'?Number(v):f.type==='datetime-local'&&v?new Date(String(v)).toISOString():v;
    });
    try{
      await onSubmit(data);
    }catch(e){
      toast.error(e instanceof Error?e.message:'Could not save this record.');
    }
  });

  return (
    <form className={`action-form ${className}`} onSubmit={submit} method="post">
      <div className="form-grid">
        {fields.map(f=>(
          <label key={f.name} className={`field ${f.type==='textarea'?'wide':''} ${f.type==='checkbox'?'check-field':''}`}>
            {f.type!=='checkbox'&&<span>{f.label}{f.required!==false&&<small> *</small>}</span>}
            {f.type==='select'?(
              <select {...register(f.name)}>
                <option value="">Select {f.label.toLowerCase()}</option>
                {f.options?.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            ):f.type==='textarea'?(
              <textarea rows={3} {...register(f.name)}/>
            ):(
              <input
                type={f.type||'text'}
                step={f.type==='number'?'any':undefined}
                min={f.min}
                max={f.max}
                {...register(f.name)}
              />
            )}
            {f.type==='checkbox'&&<span>{f.label}</span>}
            {f.hint&&<small>{f.hint}</small>}
            {errors[f.name]&&<em>{String(errors[f.name]?.message)}</em>}
          </label>
        ))}
      </div>
      <button className="button primary" disabled={!ready||isSubmitting||busy} type="submit">
        {(isSubmitting||busy)?<Loader2 size={17} className="spin"/>:<ArrowUpRight size={17}/>} {label}
      </button>
    </form>
  );
}

export function Panel({
  title,
  subtitle,
  children,
  actions,
  badge,
  className='',
  theme
}:{
  title:string;
  subtitle?:string;
  children:React.ReactNode;
  actions?:React.ReactNode;
  badge?:React.ReactNode;
  className?:string;
  theme?:'ocean'|'cyan'|'pink'|'yellow'|'green'
}){
  const themeClass = theme ? `panel-${theme}` : '';
  return (
    <section className={`panel ${themeClass} ${className}`}>
      <div className="panel-heading">
        <div>
          <div style={{display:'flex',alignItems:'center',gap:10,flexWrap:'wrap'}}>
            <h2>{title}</h2>
            {badge}
          </div>
          {subtitle&&<p>{subtitle}</p>}
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}

export function Badge({value}:{value:unknown}){
  const text=String(value??'Unknown');
  const isDanger=/ON_HOLD|CRITICAL|REJECTED|NOT_FEASIBLE|BREAKDOWN|HIGH/.test(text);
  const isGood=/APPROVED|VERIFIED|CLEARED|FEASIBLE$|COMPLETED|LOW/.test(text)&&text!=='CONDITIONAL';
  const isCyan=/PLANNED|IN_PROGRESS|ALLOCATED|CONNECTED|RECEIVED/.test(text);
  const isWarning=/ATTENTION|WARNING|CONDITIONAL|PENDING|MEDIUM|UNDER_INSPECTION/.test(text);
  const cls=isDanger?'danger':isGood?'good':isCyan?'cyan':isWarning?'warning':'neutral';
  return <span className={`badge ${cls}`}>{text.replaceAll('_',' ')}</span>;
}

export function Empty({text='No records yet. Add the first record to begin.'}:{text?:string}){
  return <div className="empty"><Inbox size={25}/><p>{text}</p></div>;
}

export function Loading(){
  return <div className="empty"><Loader2 className="spin"/><p>Loading factory records…</p></div>;
}

export function ErrorState({error}:{error:Error|null}){
  return (
    <div className="error-state">
      <AlertCircle size={20}/>
      <div>
        <strong>Could not load factory records</strong>
        <p>{error?.message||'Check that the backend is running on port 8000, then refresh.'}</p>
      </div>
    </div>
  );
}

export function DataTable({rows,columns}:{rows:object[];columns?:{key:string;label:string}[]}){
  if(!rows.length)return <Empty/>;
  const cols=columns||Object.keys(rows[0]).filter(k=>!k.endsWith('_json')&&!k.endsWith('_path')&&k!=='path').slice(0,7).map(key=>({key,label:key.replaceAll('_',' ')}));
  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            {cols.map(c=><th key={c.key}>{c.label}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((item,i)=>(
            <tr key={i}>
              {cols.map(c=>{
                const value=(item as RecordData)[c.key];
                return (
                  <td key={c.key}>
                    {/status|decision|evidence_source/.test(c.key)?<Badge value={value}/>:typeof value==='object'?JSON.stringify(value):String(value??'—')}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function PageHeading({eyebrow,title,description,action}:{eyebrow:string;title:string;description:string;action?:React.ReactNode}){
  return (
    <header className="page-heading">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </header>
  );
}

export const orderOptions=(orders:{id:string}[]|undefined)=>orders?.map(o=>({value:o.id,label:o.id}))||[];
export const actorField:Field={name:'actor',label:'Recorded by'};
