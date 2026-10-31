'use client';
import {ActionForm,useAction,Panel} from '@/components/ui';
export function ContactForm(){const action=useAction();return <Panel title="Tell us about your factory" subtitle="Your request is stored in this installation. No email is sent automatically."><ActionForm fields={[{name:'name',label:'Your name'},{name:'email',label:'Work email'},{name:'company',label:'Factory or company'},{name:'message',label:'What would you like to explore?',type:'textarea'}]} label="Request a demo" onSubmit={data=>action.mutateAsync({path:'/demo-requests',data})}/></Panel>}
