'use server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { validateBank, type BankInput } from '@/lib/banks';

export type ActionState = { error?: string } | undefined;

/** Freelancers only. Later payouts snapshot these details at approval time, so editing never redirects an approved payout. */
export async function saveBankDetailsAction(input: BankInput): Promise<ActionState> {
  const me = await getCurrentUser();
  if (me.role !== 'FREELANCER') return { error: 'Only freelancers have a payout account.' };
  const v = validateBank(input);
  if ('error' in v) return { error: v.error };
  await prisma.user.update({ where: { id: me.id }, data: v.ok });
  revalidatePath('/settings');
}
