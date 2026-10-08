import { Frame } from '@/components/layout/Frame';
import { Card, StatusPill } from '@/components/ui/primitives';
import { getCurrentUser, getDisputes } from '@/lib/data';
import { naira } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default async function DisputesPage() {
  const disputes = await getDisputes((await getCurrentUser()).id);
  return (
    <Frame title="Disputes">
      {disputes.length === 0 ? (
        <Card className="p-8 text-center"><p className="font-semibold">No disputes</p><p className="mt-2 text-sm text-ink2">Disputes you or your freelancers open on a milestone will appear here.</p></Card>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">{disputes.map(d => (
          <li key={d.id}><Card className="h-full p-5 sm:p-6">
            <div className="flex items-start justify-between gap-3"><div className="min-w-0"><h2 className="truncate text-lg font-semibold">{d.title}</h2><p className="text-sm text-ink2">{d.project}</p></div><StatusPill tone={d.tone}>{d.label}</StatusPill></div>
            <p className="mt-4 text-sm text-ink2">{d.reason}</p>
            <div className="mt-5 flex items-end justify-between"><p className="text-xs text-ink2">Raised by {d.raisedBy} · {d.date}</p><p className="text-lg font-semibold">{naira(d.amount)}</p></div>
          </Card></li>))}</ul>
      )}
    </Frame>
  );
}
