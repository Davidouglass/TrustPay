import { AppShell } from '@/components/layout/AppShell';
import { StatCards } from '@/components/dashboard/widgets';
import { MilestoneCard } from '@/components/project/MilestoneCard';
import { Card } from '@/components/ui/primitives';
import { getFreelancerOverview } from '@/lib/data';
import type { MilestoneState } from '@/lib/projects-data';

export const dynamic = 'force-dynamic';

const ACTION: Partial<Record<MilestoneState, string>> = { FUNDED: 'Start work', IN_PROGRESS: 'Submit work' };

export default async function FreelancerDashboardPage() {
  const o = await getFreelancerOverview();
  const stats = [
    { label: 'Total Earned', value: o.earned, note: 'Paid to your bank' },
    { label: 'Secured for you', value: o.secured, note: 'Funded, awaiting release' },
    { label: 'Awaiting Approval', value: o.awaiting, note: 'With the client' },
    { label: 'Active Projects', value: o.active, plain: true, note: 'In progress now' },
  ];
  return (
    <AppShell title="Freelancer dashboard" balance={{ held: o.secured, awaiting: o.awaiting }}>
      <StatCards stats={stats} />
      <Card className="p-5 sm:p-6"><h2 className="text-lg font-semibold">My milestones</h2>
        <ul className="mt-5 space-y-3">{o.milestones.map((m, i) => <MilestoneCard key={m.id} m={m} index={i} action={ACTION[m.state] ?? null} />)}</ul></Card>
    </AppShell>
  );
}
