import type { MilestoneStatus as M, PaymentStatus as P, PayoutStatus as O } from '@prisma/client';

// Allowed transitions only. WHO may trigger each one is enforced in the services.
export const MILESTONE_TRANSITIONS: Record<M, readonly M[]> = {
  DRAFT: ['AWAITING_FUNDING', 'CANCELLED'],
  AWAITING_FUNDING: ['FUNDED', 'CANCELLED'],
  FUNDED: ['IN_PROGRESS', 'SUBMITTED', 'DISPUTED'],
  IN_PROGRESS: ['SUBMITTED', 'DISPUTED'],
  SUBMITTED: ['AWAITING_APPROVAL', 'APPROVED', 'IN_PROGRESS', 'DISPUTED'],
  AWAITING_APPROVAL: ['APPROVED', 'IN_PROGRESS', 'DISPUTED'],
  APPROVED: ['PAYOUT_PENDING'],
  PAYOUT_PENDING: ['PAID', 'APPROVED'], // APPROVED again = payout failed, awaiting retry
  DISPUTED: ['APPROVED', 'CANCELLED', 'FUNDED', 'IN_PROGRESS', 'SUBMITTED', 'AWAITING_APPROVAL'], // dismissed -> statusBeforeDispute
  PAID: [],
  CANCELLED: [],
};
export const PAYMENT_TRANSITIONS: Record<P, readonly P[]> = {
  PENDING: ['SUCCESS', 'FAILED'], SUCCESS: ['REFUNDED'], FAILED: [], REFUNDED: [],
};
export const PAYOUT_TRANSITIONS: Record<O, readonly O[]> = {
  PENDING: ['PROCESSING', 'FAILED'], PROCESSING: ['SUCCESS', 'FAILED'], SUCCESS: [], FAILED: [],
};

export const canTransition = <S extends string>(map: Record<S, readonly S[]>, from: S, to: S) => map[from].includes(to);
export function assertTransition<S extends string>(map: Record<S, readonly S[]>, from: S, to: S) {
  if (!canTransition(map, from, to)) throw new Error(`Illegal transition ${from} -> ${to}`);
}
