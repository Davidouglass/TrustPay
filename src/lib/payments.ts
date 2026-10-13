import 'server-only';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { verifyCharge, evaluateCharge } from '@/lib/kora';

export type SettleResult = 'unknown' | 'ignored' | 'already' | 'funded' | 'failed' | 'pending' | 'flagged';
class NotFundable extends Error {}

const flag = async (id: string, reason: string, raw?: unknown): Promise<SettleResult> => {
  await prisma.payment.update({ where: { id }, data: { flaggedForReview: true, flagReason: reason, ...(raw ? { verifyPayload: raw as Prisma.InputJsonValue } : {}) } });
  return 'flagged';
};

/**
 * The ONLY place a Kora payment becomes SUCCESS / a milestone becomes FUNDED. Called by the webhook, the return page and nothing else.
 * It never trusts its caller: it re-verifies with Kora, checks amount + currency against OUR record, then uses compare-and-set
 * inside one transaction, so duplicate webhooks / refreshes / races are harmless.
 */
export async function settlePayment(reference: string): Promise<SettleResult> {
  const p = await prisma.payment.findUnique({ where: { reference }, include: { milestone: { include: { project: true } } } });
  if (!p) return 'unknown';
  if (p.channel === 'DEV_SIMULATOR') return 'ignored';          // simulated payments are never settled through Kora
  if (p.status !== 'PENDING') return 'already';
  if (p.currency !== 'NGN' || p.amount % 100 !== 0) return flag(p.id, 'Unsupported currency or amount');

  const charge = await verifyCharge(reference);
  const v = evaluateCharge(charge, p.amount / 100, p.currency);
  if (v.kind === 'unknown' || v.kind === 'pending') return 'pending';
  if (v.kind === 'flag') return flag(p.id, v.reason, charge.raw);

  if (v.kind === 'failed') {
    const done = await prisma.$transaction(async tx => {
      const r = await tx.payment.updateMany({ where: { id: p.id, status: 'PENDING' }, data: { status: 'FAILED', failureReason: v.reason, verifyPayload: charge.raw as Prisma.InputJsonValue } });
      if (r.count === 0) return false;
      await tx.notification.create({ data: { userId: p.payerId, type: 'PAYMENT_FAILED', title: 'Payment failed', body: `Your payment for "${p.milestone.title}" did not go through. You can try again.`, projectId: p.milestone.projectId, milestoneId: p.milestoneId, dedupeKey: `PAYMENT_FAILED:${p.id}` } });
      return true;
    });
    return done ? 'failed' : 'already';
  }

  try {
    return await prisma.$transaction(async tx => {
      const pay = await tx.payment.updateMany({ where: { id: p.id, status: 'PENDING' }, data: { status: 'SUCCESS', paidAt: new Date(), amountPaid: p.amount, koraReference: reference, channel: charge.method ?? 'kora', verifyPayload: charge.raw as Prisma.InputJsonValue } });
      if (pay.count === 0) return 'already' as const;
      const ms = await tx.milestone.updateMany({ where: { id: p.milestoneId, status: 'AWAITING_FUNDING', project: { status: 'ACTIVE' } }, data: { status: 'FUNDED', fundedAt: new Date() } });
      if (ms.count === 0) throw new NotFundable();             // rolls the payment update back
      await tx.milestoneEvent.create({ data: { milestoneId: p.milestoneId, from: 'AWAITING_FUNDING', to: 'FUNDED', actorId: null, note: `Kora payment ${reference} verified` } });
      await tx.notification.create({ data: { userId: p.milestone.project.freelancerId, type: 'MILESTONE_FUNDED', title: 'Milestone funded', body: `"${p.milestone.title}" in "${p.milestone.project.title}" is funded. You can start work.`, projectId: p.milestone.projectId, milestoneId: p.milestoneId, dedupeKey: `MILESTONE_FUNDED:${p.milestoneId}` } });
      return 'funded' as const;
    });
  } catch (e) {
    // Money arrived but the milestone can't take it (already funded / cancelled): keep it PENDING + flagged for manual refund.
    if (e instanceof NotFundable || (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002')) return flag(p.id, 'Payment verified but the milestone is no longer awaiting funding. Refund required.', charge.raw);
    throw e;
  }
}
