'use server';
import { randomUUID } from 'node:crypto';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import type { MilestoneStatus } from '@prisma/client';

export type ActionState = { error?: string } | undefined;
const bad = (error: string): ActionState => ({ error });
const GONE = 'This milestone has changed. Refresh the page and try again.';
const REVIEWABLE: MilestoneStatus[] = ['SUBMITTED', 'AWAITING_APPROVAL'];
const DISPUTABLE: MilestoneStatus[] = ['FUNDED', 'IN_PROGRESS', 'SUBMITTED', 'AWAITING_APPROVAL'];
const load = (id: string) => prisma.milestone.findUnique({ where: { id }, include: { project: true } });

/** DEVELOPMENT ONLY. Marks a milestone funded WITHOUT any real money. Refuses to run in production.
 *  The payment is tagged channel 'DEV_SIMULATOR' so payout code must never release money for it. */
export async function devFundMilestoneAction(milestoneId: string): Promise<ActionState> {
  if (process.env.NODE_ENV === 'production') return bad('Simulated funding is disabled in production.');
  const me = await getCurrentUser();
  const m = await load(milestoneId);
  if (!m || m.project.clientId !== me.id) return bad('Milestone not found.');
  const ok = await prisma.$transaction(async tx => {
    const r = await tx.milestone.updateMany({ where: { id: m.id, status: 'AWAITING_FUNDING', project: { status: 'ACTIVE' } }, data: { status: 'FUNDED', fundedAt: new Date() } });
    if (r.count === 0) return false;
    await tx.payment.create({ data: { milestoneId: m.id, payerId: me.id, reference: `DEV-SIM-${randomUUID()}`, amount: m.amount, amountPaid: m.amount, status: 'SUCCESS', channel: 'DEV_SIMULATOR', paidAt: new Date(), verifyPayload: { simulated: true } } });
    await tx.milestoneEvent.create({ data: { milestoneId: m.id, from: 'AWAITING_FUNDING', to: 'FUNDED', actorId: me.id, note: 'SIMULATED funding (development only, no real money)' } });
    await tx.notification.create({ data: { userId: m.project.freelancerId, type: 'MILESTONE_FUNDED', title: 'Milestone funded (simulated)', body: `"${m.title}" was funded with the development simulator. No real money was received.`, projectId: m.projectId, milestoneId: m.id, dedupeKey: `MILESTONE_FUNDED:${m.id}` } });
    return true;
  });
  return ok ? undefined : bad(GONE);
}

export async function submitWorkAction(input: { milestoneId: string; message: string; links: string }): Promise<ActionState> {
  const me = await getCurrentUser();
  const message = input.message.trim();
  if (message.length < 10) return bad('Describe the delivered work (10+ characters).');
  const links = input.links.split('\n').map(l => l.trim()).filter(Boolean);
  if (links.length > 5) return bad('Add at most 5 links.');
  if (links.some(l => !/^https?:\/\/\S+$/i.test(l))) return bad('Links must start with http:// or https://');
  const m = await load(input.milestoneId);
  if (!m || m.project.freelancerId !== me.id) return bad('Milestone not found.');
  const ok = await prisma.$transaction(async tx => {
    const r = await tx.milestone.updateMany({ where: { id: m.id, status: { in: ['FUNDED', 'IN_PROGRESS'] }, project: { status: 'ACTIVE' } }, data: { status: 'SUBMITTED', submittedAt: new Date() } });
    if (r.count === 0) return false;
    const last = await tx.workSubmission.aggregate({ _max: { version: true }, where: { milestoneId: m.id } });
    const version = (last._max.version ?? 0) + 1;
    await tx.workSubmission.create({ data: { milestoneId: m.id, freelancerId: me.id, version, message, links } });
    await tx.milestoneEvent.create({ data: { milestoneId: m.id, from: m.status, to: 'SUBMITTED', actorId: me.id, note: `Submission v${version}` } });
    await tx.notification.create({ data: { userId: m.project.clientId, type: 'WORK_SUBMITTED', title: 'Work submitted', body: `${me.name} submitted "${m.title}" for review.`, projectId: m.projectId, milestoneId: m.id, dedupeKey: `WORK_SUBMITTED:${m.id}:${version}` } });
    return true;
  });
  return ok ? undefined : bad(GONE);
}

/** Client decision. APPROVE moves to APPROVED (the payout itself arrives with the Kora stage). */
export async function reviewSubmissionAction(input: { milestoneId: string; decision: 'APPROVE' | 'CHANGES'; note?: string }): Promise<ActionState> {
  const me = await getCurrentUser();
  const note = (input.note ?? '').trim();
  const approve = input.decision === 'APPROVE';
  if (!approve && note.length < 5) return bad('Tell the freelancer what to change (5+ characters).');
  const m = await load(input.milestoneId);
  if (!m || m.project.clientId !== me.id) return bad('Milestone not found.');
  const ok = await prisma.$transaction(async tx => {
    const r = await tx.milestone.updateMany({ where: { id: m.id, status: { in: REVIEWABLE } }, data: approve ? { status: 'APPROVED', approvedAt: new Date() } : { status: 'IN_PROGRESS' } });
    if (r.count === 0) return false;
    await tx.workSubmission.updateMany({ where: { milestoneId: m.id, decision: 'PENDING' }, data: { decision: approve ? 'APPROVED' : 'CHANGES_REQUESTED', reviewNote: note || null, reviewedAt: new Date() } });
    const sub = await tx.workSubmission.findFirst({ where: { milestoneId: m.id }, orderBy: { version: 'desc' } });
    const type = approve ? 'MILESTONE_APPROVED' : 'CHANGES_REQUESTED';
    await tx.milestoneEvent.create({ data: { milestoneId: m.id, from: m.status, to: approve ? 'APPROVED' : 'IN_PROGRESS', actorId: me.id, note: approve ? 'Approved' : note } });
    await tx.notification.create({ data: { userId: m.project.freelancerId, type, title: approve ? 'Milestone approved' : 'Changes requested', body: approve ? `"${m.title}" was approved.` : `${me.name} asked for changes on "${m.title}": ${note}`, projectId: m.projectId, milestoneId: m.id, dedupeKey: `${type}:${m.id}:${sub?.version ?? 0}` } });
    return true;
  });
  return ok ? undefined : bad(GONE);
}

export async function openDisputeAction(input: { milestoneId: string; reason: string }): Promise<ActionState> {
  const me = await getCurrentUser();
  const reason = input.reason.trim();
  if (reason.length < 10) return bad('Explain the problem (10+ characters).');
  const m = await load(input.milestoneId);
  if (!m || (m.project.clientId !== me.id && m.project.freelancerId !== me.id)) return bad('Milestone not found.');
  if (!DISPUTABLE.includes(m.status)) return bad('A dispute can’t be opened at this stage.');
  const other = m.project.clientId === me.id ? m.project.freelancerId : m.project.clientId;
  try {
    await prisma.$transaction(async tx => {
      const r = await tx.milestone.updateMany({ where: { id: m.id, status: m.status }, data: { status: 'DISPUTED', statusBeforeDispute: m.status } });
      if (r.count === 0) throw new Error('STALE');
      const d = await tx.dispute.create({ data: { projectId: m.projectId, milestoneId: m.id, raisedById: me.id, reason } });
      await tx.milestoneEvent.create({ data: { milestoneId: m.id, from: m.status, to: 'DISPUTED', actorId: me.id, note: reason } });
      await tx.notification.create({ data: { userId: other, type: 'DISPUTE_OPENED', title: 'Dispute opened', body: `${me.name} opened a dispute on "${m.title}".`, projectId: m.projectId, milestoneId: m.id, dedupeKey: `DISPUTE_OPENED:${d.id}` } });
    });
  } catch (e) {
    if (e instanceof Error && e.message === 'STALE') return bad(GONE);
    return bad((e as { code?: string }).code === 'P2002' ? 'A dispute is already open for this milestone.' : 'Could not open the dispute. Please try again.');
  }
}
