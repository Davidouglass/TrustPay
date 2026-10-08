import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Frame } from '@/components/layout/Frame';
import { Card, Avatar } from '@/components/ui/primitives';
import { MilestoneCard } from '@/components/project/MilestoneCard';
import { projectTotal, projectReleased } from '@/lib/projects-data';
import { getCurrentUser, getProject } from '@/lib/data';
import { naira } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default async function ProjectDetailsPage({ params }: { params: { id: string } }) {
  const p = await getProject(params.id, (await getCurrentUser()).id);
  if (!p) notFound();
  const stats = [['Project total', projectTotal(p)], ['Released', projectReleased(p)], ['Still to release', projectTotal(p) - projectReleased(p)]] as const;
  return (
    <Frame title={p.title}>
      <Link href="/projects" className="text-sm text-ink2 hover:text-white">← All projects</Link>
      <div className="flex items-center gap-3"><Avatar name={p.freelancer} /><div><p className="font-semibold">{p.freelancer}</p><p className="text-xs text-ink2">Freelancer · {p.status}</p></div></div>
      <div className="grid gap-4 min-[520px]:grid-cols-3">
        {stats.map(([l, v]) => <Card key={l} className="p-5"><p className="text-sm text-ink2">{l}</p><p className="mt-2 text-2xl font-semibold">{naira(v)}</p></Card>)}
      </div>
      <Card className="p-5 sm:p-6"><h2 className="text-lg font-semibold">Milestones</h2>
        <ul className="mt-5 space-y-3">{p.milestones.map((m, i) => <MilestoneCard key={m.id} m={m} index={i} />)}</ul></Card>
    </Frame>
  );
}
