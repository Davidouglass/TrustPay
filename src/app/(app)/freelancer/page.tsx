import { AppShell } from '@/components/layout/AppShell';
import { StatCards } from '@/components/dashboard/widgets';
import { MilestoneCard } from '@/components/project/MilestoneCard';
import { Card } from '@/components/ui/primitives';
import { getFreelancerOverview } from '@/lib/data';
import { requireRole } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function FreelancerDashboardPage() {
  const user = await requireRole('FREELANCER');
  const o = await getFreelancerOverview(user.id);
  const stats = [
    { label: 'Total Earned', value: o.earned, note: 'Paid to your bank' },
    { label: 'Secured for you', value: o.secured, note: 'Funded, awaiting release' },
    { label: 'Awaiting Approval', value: o.awaiting, note: 'With the client' },
    { label: 'Active Projects', value: o.active, plain: true, note: 'In progress now' },
  ];
  return (
    <AppShell title="Freelancer dashboard" balance={{ held: o.secured, awaiting: o.awaiting }} user={{ name: user.name, image: user.image }}>
      <StatCards stats={stats} />
      <Card className="p-5 sm:p-6"><h2 className="text-lg font-semibold">My milestones</h2>
        <ul className="mt-5 space-y-3">{o.milestones.map((m, i) => <MilestoneCard key={m.id} m={m} index={i} role="FREELANCER" />)}</ul></Card>
    </AppShell>
  );
}
