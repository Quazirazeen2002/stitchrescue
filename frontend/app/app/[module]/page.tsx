import {notFound} from 'next/navigation';
import {FabricGuard} from '@/components/fabricguard';
import {LineWatch} from '@/components/linewatch';
import {OrderRescue} from '@/components/orderrescue';
import {VisualInspection} from '@/components/inspection';
import {Reports} from '@/components/reports';
import {Approvals} from '@/components/approvals';
import {AuditHistory,Settings} from '@/components/settings-audit';
const modules={'fabricguard':FabricGuard,'linewatch':LineWatch,'orderrescue':OrderRescue,'visual-inspection':VisualInspection,'reports':Reports,'approvals':Approvals,'audit':AuditHistory,'settings':Settings};
export default async function ModulePage({params}:{params:Promise<{module:string}>}){const {module}=await params;const Component=modules[module as keyof typeof modules];if(!Component)notFound();return <Component/>}
