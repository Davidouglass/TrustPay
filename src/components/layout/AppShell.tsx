'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/ui/Logo';
import { Avatar, IconButton } from '@/components/ui/primitives';
import { ProtectedBalanceCard } from '@/components/dashboard/widgets';

const NAV = [['Dashboard', '/dashboard'], ['Projects', '/projects'], ['Transactions', '/transactions'], ['Disputes', '/disputes'], ['Settings', '/settings']] as const;

type Balance = { held: number; awaiting: number };
function SidebarBody({ onNavigate, balance }: { onNavigate?: () => void; balance: Balance }) {
  const path = usePathname();
  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex-1 overflow-y-auto rounded-card bg-s1 p-5">
        <Logo />
        <nav className="mt-6 rounded-[20px] bg-s2 p-3" aria-label="Main">
          <p className="px-3 pb-2 pt-1 text-xs font-semibold uppercase tracking-wide">Menu</p>
          {NAV.map(([label, href]) => {
            const active = path === href;
            return <Link key={href} href={href} onClick={onNavigate} aria-current={active ? 'page' : undefined}
              className={`flex h-12 items-center rounded-btn px-3 text-[15px] transition ${active ? 'bg-s3 font-medium text-white' : 'text-ink2 hover:text-white'}`}>{label}</Link>;
          })}
        </nav>
      </div>
      <ProtectedBalanceCard {...balance} />
    </div>
  );
}

export function AppShell({ title, children, balance }: { title: string; children: React.ReactNode; balance: Balance }) {
  const [open, setOpen] = useState(false);
  useEffect(() => { const k = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false); addEventListener('keydown', k); return () => removeEventListener('keydown', k); }, []);
  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 hidden w-[308px] p-5 pr-0 lg:block"><SidebarBody balance={balance} /></aside>
      <div className={`fixed inset-0 z-40 lg:hidden ${open ? '' : 'pointer-events-none'}`}>
        <div onClick={() => setOpen(false)} className={`absolute inset-0 bg-black/60 transition-opacity ${open ? 'opacity-100' : 'opacity-0'}`} />
        <aside aria-hidden={!open} className={`absolute inset-y-0 left-0 w-[min(308px,88vw)] bg-page p-4 transition-transform duration-200 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
          <SidebarBody onNavigate={() => setOpen(false)} balance={balance} />
        </aside>
      </div>
      <main className="min-w-0 p-4 sm:p-5 lg:pl-[348px]">
        <header className="flex items-center gap-3">
          <IconButton className="lg:hidden" aria-label="Open menu" onClick={() => setOpen(true)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
          </IconButton>
          <h1 className="min-w-0 flex-1 truncate text-2xl font-semibold sm:text-[32px]">{title}</h1>
          <label className="hidden h-11 w-72 items-center gap-2 rounded-full border border-line/60 bg-s2 px-4 text-ink2 md:flex">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
            <input placeholder="Type to start search…" className="w-full bg-transparent text-sm text-white outline-none placeholder:text-ink2" />
          </label>
          <Link href="/notifications" aria-label="Notifications" className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-icon text-white"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 1 1 12 0c0 7 3 8 3 8H3s3-1 3-8M10 20a2 2 0 0 0 4 0" /></svg></Link>
          <div className="hidden items-center gap-3 sm:flex"><Avatar name="David" src="/david.png" /><span className="text-sm font-semibold">David</span></div>
        </header>
        <div className="mt-6 space-y-5 sm:mt-8">{children}</div>
      </main>
    </div>
  );
}
