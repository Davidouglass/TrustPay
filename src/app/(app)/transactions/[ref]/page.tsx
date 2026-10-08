import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Frame } from '@/components/layout/Frame';
import { Card, StatusPill } from '@/components/ui/primitives';
import { getCurrentUser, getTransaction } from '@/lib/data';
import { naira } from '@/lib/format';

export const dynamic = 'force-dynamic';

const Row = ({ label, children }: { label: string; children: React.ReactNode }) =>
  <div className="flex flex-wrap justify-between gap-1 border-b border-line/40 py-3 last:border-0"><dt className="text-sm text-ink2">{label}</dt><dd className="break-all text-sm font-medium">{children}</dd></div>;

export default async function TransactionDetailsPage({ params }: { params: { ref: string } }) {
  const t = await getTransaction(decodeURIComponent(params.ref), (await getCurrentUser()).id);
  if (!t) notFound();
  return (
    <Frame title="Transaction">
      <Link href="/transactions" className="text-sm text-ink2 hover:text-white">← All transactions</Link>
      <Card className="p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-sm text-ink2">{t.kind}</p><p className="mt-1 text-3xl font-semibold">{naira(t.amount)}</p></div><StatusPill tone={t.tone}>{t.label}</StatusPill></div>
        <dl className="mt-5">
          <Row label="Reference">{t.ref}</Row>
          <Row label="Kora reference">{t.koraRef ?? 'Not assigned yet'}</Row>
          <Row label={t.kind === 'Payment' ? 'Freelancer' : 'Recipient'}>{t.party}</Row>
          <Row label="Milestone">{t.milestone}</Row>
          <Row label="Project"><Link href={`/projects/${t.projectId}`} className="text-soft hover:underline">{t.project}</Link></Row>
          <Row label="Created">{t.created}</Row>
          <Row label={t.kind === 'Payment' ? 'Paid' : 'Completed'}>{t.settled ?? 'Not yet'}</Row>
          {t.note && <Row label="Failure reason">{t.note}</Row>}
        </dl>
      </Card>
    </Frame>
  );
}
