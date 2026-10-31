import {MarketingNav,Footer} from '@/components/marketing';
export default function MarketingLayout({children}:{children:React.ReactNode}){return <><MarketingNav/><main>{children}</main><Footer/></>}
