'use client';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {Logo} from '@/components/marketing';
import {ActionForm} from '@/components/ui';
import {post} from '@/lib/api';
import {toast} from 'sonner';
export default function Login(){const router=useRouter();return <main className="login-wrap"><section className="login-brand"><Link href="/"><Logo/></Link><div><div className="eyebrow" style={{color:'#f3b73f'}}>Human judgment. Recorded.</div><h1>QUALITY IS<br/>A HUMAN<br/>COMMITMENT.</h1></div></section><section className="login-form"><div className="eyebrow">Factory manager access</div><h2>Review with authority.</h2><p>Use the manager credential configured by your installation owner. It enables recorded verification and approval decisions.</p><ActionForm fields={[{name:'token',label:'Manager credential',type:'password'}]} label="Sign in to factory workspace" onSubmit={async data=>{await post('/auth/manager',data);sessionStorage.setItem('stitchrescue-manager',String(data.token));toast.success('Manager session authorized.');router.push('/app/approvals');}}/><Link href="/app" className="text-link" style={{marginTop:25,fontSize:12}}>Continue to operational records ↗</Link><small style={{color:'#77808d',marginTop:25}}>Local prototype access. No public account registration.</small></section></main>}
