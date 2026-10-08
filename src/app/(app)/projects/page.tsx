import Link from 'next/link';
import { Frame } from '@/components/layout/Frame';
import { Card, Avatar } from '@/components/ui/primitives';
import { projectTotal, projectReleased } from '@/lib/projects-data';
import { getCurrentUser, getProjects } from '@/lib/data';
import { naira } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default async function ProjectsPage() {
  const projects = await getProjects((await getCurrentUser()).id);
  return (
    <Frame title="Projects">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink2">{projects.length} projects</p>
        <Link href="/projects/new" className="inline-flex h-11 w-full items-center justify-center rounded-btn bg-primary px-5 text-sm font-semibold text-white hover:brightness-110 sm:w-auto">New project</Link>
      </div>
      <ul className="grid gap-4 md:grid-cols-2">
        {projects.map(p => (
          <li key={p.id}><Link href={`/projects/${p.id}`} className="block rounded-card transition hover:brightness-110">
            <Card className="p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3"><h2 className="truncate text-lg font-semibold">{p.title}</h2><span className="text-xs text-ink2">{p.status}</span></div>
              <div className="mt-3 flex items-center gap-2 text-sm text-ink2"><Avatar name={p.freelancer} size={28} />{p.freelancer}</div>
              <dl className="mt-5 grid grid-cols-2 gap-3 text-sm"><div><dt className="text-ink2">Total</dt><dd className="font-semibold">{naira(projectTotal(p))}</dd></div>
                <div><dt className="text-ink2">Released</dt><dd className="font-semibold">{naira(projectReleased(p))}</dd></div></dl>
            </Card>
          </Link></li>
        ))}
      </ul>
    </Frame>
  );
}
