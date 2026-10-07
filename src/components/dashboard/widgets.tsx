import { Card, Avatar, Button, StatusPill } from '@/components/ui/primitives';
import { naira } from '@/lib/format';
import { stats, payouts } from '@/lib/mock';

const Arrow = ({ up }: { up: boolean }) =>
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={up ? '' : 'rotate-90'}><path d="M2 10 10 2M4 2h6v6" /></svg>;

export function StatCards() {
  return (
    <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 xl:grid-cols-4">
      {stats.map(s => (
        <Card key={s.label} className="p-5 sm:p-6">
          <p className="text-sm text-ink2">{s.label}</p>
          <p className="mt-4 truncate text-2xl font-semibold sm:text-[28px]">{s.plain ? s.value : naira(s.value)}</p>
          <p className="mt-2 flex items-center gap-1.5 text-sm text-ink2">
            <span className={`inline-flex items-center gap-1 font-semibold ${s.up ? 'text-delta' : 'text-danger'}`}><Arrow up={s.up} />{s.delta}%</span>vs last month
          </p>
        </Card>
      ))}
    </div>
  );
}

export function RecentPayouts() {
  return (
    <Card className="p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Recent payouts</h2>
        <Button variant="outline" small className="bg-s2b">View all</Button>
      </div>
      <ul className="mt-5 space-y-4">
        {payouts.map(p => (
          <li key={p.name} className="flex items-center gap-3">
            <Avatar name={p.name} />
            <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{p.name}</p><p className="truncate text-xs text-ink2">{p.project}</p></div>
            <div className="text-right"><p className="text-sm font-semibold">{naira(p.amount)}</p><p className="text-xs text-ink2">{p.when}</p></div>
          </li>
        ))}
      </ul>
    </Card>
  );
}

/** Replaces the Storage card. Figures are demo data until wired to Payment/Payout rows. */
export function ProtectedBalanceCard() {
  const held = 2125988, awaiting = 640000, pct = Math.round((awaiting / held) * 100);
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2.5">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-hl text-soft"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3 4 6v6c0 4.5 3.2 8 8 9 4.8-1 8-4.5 8-9V6l-8-3Z" /><path d="m9 12 2 2 4-4" /></svg></span>
        <span className="text-sm font-semibold uppercase tracking-wide">Protected Balance</span>
      </div>
      <p className="mt-4 text-2xl font-semibold">{naira(held)}</p>
      <div className="mt-3 h-2 rounded-full bg-s2"><div className="h-full rounded-full bg-soft" style={{ width: `${pct}%` }} /></div>
      <p className="mt-2 text-xs text-ink2">{naira(awaiting)} awaiting your approval</p>
      <Button className="mt-4 w-full">Fund a milestone</Button>
    </Card>
  );
}
export { StatusPill };
