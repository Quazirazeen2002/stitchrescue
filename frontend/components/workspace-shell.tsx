'use client';

import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {useState} from 'react';
import {
  LayoutDashboard,
  Layers,
  ScanLine,
  GitBranch,
  ChartNoAxesCombined,
  NotebookPen,
  ShieldCheck,
  History,
  Settings,
  ArrowUpRight,
  Menu,
  X
} from 'lucide-react';
import {Logo} from '@/components/marketing';

export const navigation = [
  {href: '/app', label: 'Command Center', icon: LayoutDashboard},
  {href: '/app/fabricguard', label: 'FabricGuard', icon: Layers},
  {href: '/app/visual-inspection', label: 'Visual Inspection', icon: ScanLine},
  {href: '/app/linewatch', label: 'LineWatch', icon: GitBranch},
  {href: '/app/orderrescue', label: 'OrderRescue', icon: ChartNoAxesCombined},
  {href: '/app/reports', label: 'Investigation Reports', icon: NotebookPen},
  {href: '/app/approvals', label: 'Approval Center', icon: ShieldCheck},
  {href: '/app/audit', label: 'Audit History', icon: History},
  {href: '/app/settings', label: 'Settings', icon: Settings}
];

export function WorkspaceShell({children}: {children: React.ReactNode}) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const currentNav = navigation.find(n => n.href === path);
  const title = currentNav?.label || 'Factory workspace';

  return (
    <div className="app-shell">
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-brand-row">
          <Link href="/"><Logo/></Link>
        </div>
        <div className="workspace-label">
          <span>FACTORY WORKSPACE</span>
        </div>
        <nav aria-label="Factory navigation">
          {navigation.map(n => (
            <Link
              href={n.href}
              key={n.href}
              className={path === n.href ? 'active' : ''}
              onClick={() => setOpen(false)}
            >
              <n.icon size={17}/>
              <span>{n.label}</span>
            </Link>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <Link href="/" className="sidebar-visit-link">
            <span>Visit public website</span>
            <ArrowUpRight size={13}/>
          </Link>
          <div className="sidebar-meta-box">
            <b>STITCHRESCUE / STAGE 3</b>
            <small>Connected factory intelligence</small>
          </div>
        </div>
      </aside>
      <div className="app-main">
        <div className="brand-strip" style={{height: 4}}/>
        <div className="app-topbar">
          <button className="app-mobile-menu" onClick={() => setOpen(!open)} aria-label="Toggle factory navigation">
            {open ? <X size={20}/> : <Menu size={20}/>}
          </button>
          <div className="breadcrumb">
            <span>Workspace</span>
            <span className="sep">/</span>
            <strong>{title}</strong>
          </div>
          <div className="topbar-right">
            <span className="workspace-pill">Local prototype</span>
            <Link href="/login" className="topbar-manager-link">
              <span>Manager sign in</span>
              <ArrowUpRight size={12}/>
            </Link>
            <Link href="/app/settings" className="user-avatar" aria-label="Open settings">SR</Link>
          </div>
        </div>
        <main className="app-content">{children}</main>
      </div>
    </div>
  );
}
