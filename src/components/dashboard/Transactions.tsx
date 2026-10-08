'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Avatar, Button, SegmentedTabs, StatusPill } from '@/components/ui/primitives';
import { naira } from '@/lib/format';
import type { Tx } from '@/lib/types';

const TABS = ['All', 'Payments', 'Payouts'] as const;

export function Transactions({ rows: all }: { rows: Tx[] }) {
  const [tab, setTab] = useState<(typeof TABS)[number]>('All');
  const rows = all.filter(t => tab === 'All' || t.kind === tab);
  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><h2 className="text-lg font-semibold">Transactions</h2><p className="text-sm text-ink2">Every payment and payout, with its Kora reference.</p></div>
        <Button className="w-full sm:w-auto">Export Data</Button>
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <SegmentedTabs items={[...TABS]} value={tab} onChange={setTab} />
        <label className="flex h-11 w-full items-center gap-2 rounded-full border border-line/60 bg-s2 px-4 text-ink2 sm:w-72">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
          <input placeholder="Type to start search…" className="w-full bg-transparent text-sm text-white outline-none placeholder:text-ink2" />
        </label>
      </div>
      {/* ≥md: bordered table, as designed */}
      <div className="mt-5 hidden overflow-hidden rounded-[20px] border border-line md:block">
        <table className="w-full text-left text-sm">
          <thead><tr className="border-b border-line text-xs uppercase tracking-wide text-ink2">
            {['Reference', 'Counterparty', 'Channel', 'Status', 'Amount', 'Date'].map(h => <th key={h} className="px-4 py-4 font-medium first:pl-6">{h}</th>)}</tr></thead>
          <tbody>{rows.map(t => (
            <tr key={t.ref} className="border-b border-line/40 last:border-0">
              <td className="px-4 py-4 pl-6"><Link href={`/transactions/${t.ref}`} className="text-soft hover:underline">{t.ref}</Link></td>
              <td className="px-4 py-4"><div className="flex items-center gap-3"><Avatar name={t.name} size={32} /><div className="min-w-0"><p className="truncate font-medium">{t.name}</p><p className="truncate text-xs text-ink2">{t.email}</p></div></div></td>
              <td className="px-4 py-4"><p>{t.method}</p><p className="text-xs text-ink2">{t.methodSub}</p></td>
              <td className="px-4 py-4"><StatusPill tone={t.tone}>{t.statusLabel}</StatusPill></td>
              <td className="px-4 py-4 font-semibold">{naira(t.amount)}</td>
              <td className="px-4 py-4 text-ink2">{t.date}</td>
            </tr>))}</tbody>
        </table>
      </div>
      {/* <md: same data as cards, no horizontal scroll */}
      <ul className="mt-5 space-y-3 md:hidden">{rows.map(t => (
        <li key={t.ref} className="rounded-[20px] border border-line p-4">
          <div className="flex items-center gap-3"><Avatar name={t.name} /><div className="min-w-0 flex-1"><p className="truncate font-medium">{t.name}</p><Link href={`/transactions/${t.ref}`} className="block truncate text-xs text-soft">{t.ref}</Link></div><StatusPill tone={t.tone}>{t.statusLabel}</StatusPill></div>
          <div className="mt-4 flex items-end justify-between"><div><p className="text-sm">{t.method}</p><p className="text-xs text-ink2">{t.methodSub} · {t.date}</p></div><p className="text-lg font-semibold">{naira(t.amount)}</p></div>
        </li>))}</ul>
    </section>
  );
}
