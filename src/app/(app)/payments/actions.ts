'use server';
import { randomUUID } from 'node:crypto';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { initializeCharge } from '@/lib/kora';

/** Starts a Kora test-mode checkout. Amount and currency come from the database, never from the browser. */
export async function startKoraCheckoutAction(milestoneId: string): Promise<{ url?: string; error?: string }> {
  const me = await getCurrentUser();
  const m = await prisma.milestone.findUnique({ where: { id: milestoneId }, include: { project: true } });
  if (!m || m.project.clientId !== me.id) return { error: 'Milestone not found.' };
  if (m.project.status !== 'ACTIVE' || m.status !== 'AWAITING_FUNDING') return { error: 'This milestone is not awaiting funding.' };
  if (m.project.currency !== 'NGN') return { error: 'Only NGN payments are supported.' };
  if (!Number.isInteger(m.amount) || m.amount < 10_000 || m.amount % 100 !== 0) return { error: 'Invalid milestone amount.' };
  const appUrl = process.env.APP_URL;
  if (!appUrl || !process.env.KORA_SECRET_KEY) return { error: 'Server setup incomplete: set APP_URL and KORA_SECRET_KEY in .env and restart.' };

  const reference = `TP-PAY-${randomUUID().replace(/-/g, '')}`; // unique per checkout; also the Kora transaction reference
  const payment = await prisma.payment.create({ data: { milestoneId: m.id, payerId: me.id, reference, amount: m.amount, currency: 'NGN', status: 'PENDING', channel: 'kora' } });
  try {
    const url = await initializeCharge({ reference, amountNaira: m.amount / 100, email: me.email, name: me.name, redirectUrl: `${appUrl}/payments/return`,
      notificationUrl: process.env.KORA_NOTIFICATION_URL || undefined, narration: `${m.title} (${m.project.title})`.slice(0, 100) });
    await prisma.payment.update({ where: { id: payment.id }, data: { checkoutUrl: url } });
    return { url };
  } catch (e) {
    await prisma.payment.update({ where: { id: payment.id }, data: { status: 'FAILED', failureReason: 'Could not start checkout' } });
    console.error('Kora initialize failed:', e instanceof Error ? e.message : 'unknown error');
    return { error: 'Could not start the payment. Please try again.' };
  }
}
