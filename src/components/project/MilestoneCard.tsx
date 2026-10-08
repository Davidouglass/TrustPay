import { Button, StatusPill } from '@/components/ui/primitives';
import { MILESTONE_UI, type Milestone } from '@/lib/projects-data';
import { naira } from '@/lib/format';

export function MilestoneCard({ m, index, action }: { m: Milestone; index: number; action?: string | null }) {
  const ui = MILESTONE_UI[m.state];
  const label = action === undefined ? ui.action : action;
  return (
    <li className="rounded-[20px] border border-line p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-hl text-sm font-semibold text-soft">{index + 1}</span>
          <div className="min-w-0"><h3 className="font-semibold">{m.title}</h3><p className="mt-1 text-sm text-ink2">{m.description}</p></div>
        </div>
        <StatusPill tone={ui.tone}>{ui.label}</StatusPill>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div><p className="text-xl font-semibold">{naira(m.amount)}</p><p className="text-xs text-ink2">{m.due}</p></div>
        {label && <Button type="button" variant={m.state === 'DISPUTED' ? 'outline' : 'primary'} className="w-full sm:w-auto">{label}</Button>}
      </div>
    </li>
  );
}
