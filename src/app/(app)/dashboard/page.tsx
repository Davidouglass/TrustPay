import { Frame } from '@/components/layout/Frame';
import { StatCards, RecentPayouts } from '@/components/dashboard/widgets';
import { PaymentChart } from '@/components/dashboard/PaymentChart';
import { Transactions } from '@/components/dashboard/Transactions';
import { getCurrentUser, getStats, getRecentPayouts, getTransactions } from '@/lib/data';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const { id } = await getCurrentUser();
  const [stats, payouts, txs] = await Promise.all([getStats(id), getRecentPayouts(id), getTransactions(id)]);
  return (
    <Frame title="Dashboard">
      <StatCards stats={stats} />
      <div className="grid gap-5 xl:grid-cols-[2fr_1fr]"><PaymentChart /><RecentPayouts payouts={payouts} /></div>
      <Transactions rows={txs} />
    </Frame>
  );
}
