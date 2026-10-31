'use client';
import {ResponsiveContainer,BarChart,Bar,XAxis,YAxis,Tooltip,CartesianGrid,Cell} from 'recharts';

const FEASTABLES_PALETTE = ['#15ccff', '#f54588', '#ffd000', '#003259', '#10b981', '#3300ff'];

export function FactoryChart({data,dataKey='value',color}:{data:{name:string;[key:string]:string|number}[];dataKey?:string;color?:string}){
  return <div style={{width:'100%',height:240,minWidth:0}}>
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{top:10,right:10,bottom:5,left:-15}}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#d5e8f5"/>
        <XAxis dataKey="name" tick={{fontSize:10,fill:'#536c87',fontWeight:600}} axisLine={false} tickLine={false}/>
        <YAxis tick={{fontSize:10,fill:'#536c87'}} axisLine={false} tickLine={false}/>
        <Tooltip contentStyle={{fontSize:12,fontWeight:600,borderRadius:10,border:'1.5px solid #cce3f2',backgroundColor:'#ffffff',color:'#002d54',boxShadow:'0 8px 24px rgba(0,45,84,0.1)'}} cursor={{fill:'rgba(21, 204, 255, 0.08)'}}/>
        <Bar isAnimationActive={false} dataKey={dataKey} radius={[6,6,0,0]} maxBarSize={48}>
          {data.map((_,i)=><Cell key={i} fill={color || FEASTABLES_PALETTE[i % FEASTABLES_PALETTE.length]}/>)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  </div>
}
