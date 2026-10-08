import { Frame } from '@/components/layout/Frame';
import { Transactions } from '@/components/dashboard/Transactions';
import { getCurrentUser, getTransactions } from '@/lib/data';

export const dynamic = 'force-dynamic';

export default async function TransactionsPage() {
  const rows = await getTransactions((await getCurrentUser()).id);
  return <Frame title="Transactions"><Transactions rows={rows} /></Frame>;
}
