import Link from 'next/link';
import { Frame } from '@/components/layout/Frame';
import { Card } from '@/components/ui/primitives';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { settlePayment } from '@/lib/payments';

export const dynamic = 'force-dynamic';

/** Kora sends the customer here after checkout. The redirect proves nothing: we verify server-side with Kora before showing a result. */
export default async function PaymentReturnPage({ searchParams }: { searchParams: { reference?: string } }) {
  const me = await getCurrentUser();
  const reference = searchParams.reference ?? '';
  const own = reference ? await prisma.payment.findFirst({ where: { reference, payerId: me.id }, select: { milestone: { select: { projectId: true, title: true } } } }) : null;
  if (own) await settlePayment(reference);
  const pay = own ? await prisma.payment.findUnique({ where: { reference }, select: { status: true, flaggedForReview: true } }) : null;
  const view = !pay ? { t: 'Payment not found', d: 'We couldn’t find a payment for this link.' }
    : pay.status === 'SUCCESS' ? { t: 'Payment confirmed', d: `“${own!.milestone.title}” is funded. The freelancer can start work.` }
    : pay.status === 'FAILED' ? { t: 'Payment failed', d: 'The payment did not go through and you were not charged. You can try again from the milestone.' }
    : pay.flaggedForReview ? { t: 'Payment needs review', d: 'Your payment was received but needs a manual check before the milestone is funded.' }
    : { t: 'Payment still processing', d: 'We haven’t received confirmation yet. Bank transfers can take a few minutes. Refresh to check again.' };
  return (
    <Frame title="Payment">
      <Card className="p-6 sm:p-8"><h2 className="text-xl font-semibold">{view.t}</h2><p className="mt-2 text-sm text-ink2">{view.d}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          {own && <Link href={`/projects/${own.milestone.projectId}`} className="inline-flex h-11 items-center justify-center rounded-btn bg-primary px-5 text-sm font-semibold text-white hover:brightness-110">Back to project</Link>}
          {pay?.status === 'PENDING' && !pay.flaggedForReview && <Link href={`/payments/return?reference=${encodeURIComponent(reference)}`} className="inline-flex h-11 items-center justify-center rounded-btn border border-line px-5 text-sm font-semibold hover:bg-s2b">Check again</Link>}
        </div></Card>
    </Frame>
  );
}
