import { AppShell } from '@/components/layout/AppShell';
import { StatCards, RecentPayouts } from '@/components/dashboard/widgets';
import { PaymentChart } from '@/components/dashboard/PaymentChart';
import { Transactions } from '@/components/dashboard/Transactions';

export default function DashboardPage() {
  return (
    <AppShell title="Dashboard">
      <StatCards />
      <div className="grid gap-5 xl:grid-cols-[2fr_1fr]"><PaymentChart /><RecentPayouts /></div>
      <Transactions />
    </AppShell>
  );
}
