import type {Metadata} from 'next';
import {Providers} from '@/components/providers';
import './globals.css';
export const metadata:Metadata={title:{default:'StitchRescue — Save the fabric. Protect the order.',template:'%s | StitchRescue'},description:'Quality intelligence, production traceability and recovery planning for garment manufacturing.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en" data-scroll-behavior="smooth"><body><Providers>{children}</Providers></body></html>}
