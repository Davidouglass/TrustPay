import 'server-only';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import type { MilestoneState, Project, Tone } from '@/lib/projects-data';
import type { Tx } from '@/lib/types';

// Read-only queries. Money is stored in kobo; everything returned here is in naira.
const naira = (kobo: number) => kobo / 100;
export const fmtDate = (d: Date) => d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
const HELD = ['FUNDED', 'IN_PROGRESS', 'SUBMITTED', 'AWAITING_APPROVAL', 'APPROVED', 'PAYOUT_PENDING', 'DISPUTED'];
const AWAITING = ['SUBMITTED', 'AWAITING_APPROVAL'];
/** A user may only see projects where they are the client or the freelancer. */
const mine = (userId: string) => ({ OR: [{ clientId: userId }, { freelancerId: userId }] });
export { getCurrentUser } from '@/lib/auth';


export async function getBalance(clientId: string) {
  const ms = await prisma.milestone.findMany({ where: { project: mine(clientId) }, select: { amount: true, status: true } });
  const sum = (s: string[]) => naira(ms.filter(m => s.includes(m.status)).reduce((a, m) => a + m.amount, 0));
  return { held: sum(HELD), awaiting: sum(AWAITING) };
}

export async function getStats(clientId: string) {
  const [bal, active, paid] = await Promise.all([
    getBalance(clientId),
    prisma.project.count({ where: { ...mine(clientId), status: 'ACTIVE' } }),
    prisma.payout.aggregate({ _sum: { amount: true }, where: { status: 'SUCCESS', milestone: { project: mine(clientId) } } }),
  ]);
  return [
    { label: 'Total Protected', value: bal.held, note: 'Funded, not yet released' },
    { label: 'Pending Approval', value: bal.awaiting, note: 'Waiting for your review' },
    { label: 'Active Projects', value: active, plain: true, note: 'In progress now' },
    { label: 'Total Paid Out', value: naira(paid._sum.amount ?? 0), note: 'Released to freelancers' },
  ];
}

export async function getRecentPayouts(clientId: string) {
  const rows = await prisma.payout.findMany({ where: { milestone: { project: mine(clientId) } }, orderBy: { createdAt: 'desc' }, take: 5, include: { recipient: true, milestone: { include: { project: true } } } });
  return rows.map(p => ({ name: p.recipient.name, project: p.milestone.project.title, amount: naira(p.amount), when: fmtDate(p.createdAt) }));
}

const payTone: Record<string, [string, Tone]> = { SUCCESS: ['Funded', 'info'], PENDING: ['Pending', 'warning'], FAILED: ['Failed', 'danger'], REFUNDED: ['Refunded', 'warning'] };
const outTone: Record<string, [string, Tone]> = { SUCCESS: ['Released', 'success'], PROCESSING: ['Processing', 'info'], PENDING: ['Processing', 'info'], FAILED: ['Payout failed', 'danger'] };

export async function getTransactions(clientId: string): Promise<Tx[]> {
  const [payments, payouts] = await Promise.all([
    prisma.payment.findMany({ where: { OR: [{ payerId: clientId }, { milestone: { project: { freelancerId: clientId } } }] }, include: { milestone: { include: { project: { include: { freelancer: true } } } } } }),
    prisma.payout.findMany({ where: { milestone: { project: mine(clientId) } }, include: { recipient: true } }),
  ]);
  const rows = [
    ...payments.map(p => ({ at: p.createdAt, tx: { ref: p.reference, kind: 'Payments' as const, name: p.milestone.project.freelancer.name, email: p.milestone.project.freelancer.email,
      method: p.channel === 'card' ? 'Card payment' : 'Bank transfer', methodSub: p.milestone.title, statusLabel: payTone[p.status][0], tone: payTone[p.status][1], amount: naira(p.amount), date: fmtDate(p.createdAt) } })),
    ...payouts.map(p => ({ at: p.createdAt, tx: { ref: p.reference, kind: 'Payouts' as const, name: p.recipient.name, email: p.recipient.email,
      method: `Bank ****${p.accountNumber.slice(-4)}`, methodSub: 'Payout', statusLabel: outTone[p.status][0], tone: outTone[p.status][1], amount: naira(p.amount), date: fmtDate(p.createdAt) } })),
  ];
  return rows.sort((a, b) => b.at.getTime() - a.at.getTime()).map(r => r.tx);
}

const include = { freelancer: true, milestones: { orderBy: { order: 'asc' } } } satisfies Prisma.ProjectInclude;
type Row = Prisma.ProjectGetPayload<{ include: typeof include }>;
const PROJECT_STATUS: Record<string, string> = { DRAFT: 'Draft', PENDING_ACCEPTANCE: 'Pending acceptance', ACTIVE: 'Active', COMPLETED: 'Completed', CANCELLED: 'Cancelled' };
const toProject = (p: Row): Project => ({ id: p.id, title: p.title, freelancer: p.freelancer.name, status: PROJECT_STATUS[p.status],
  milestones: p.milestones.map(m => ({ id: m.id, title: m.title, description: m.description, amount: naira(m.amount), due: m.dueDate ? `Due ${fmtDate(m.dueDate)}` : 'No due date', state: m.status as MilestoneState })) });
export const getProjects = async (clientId: string) => (await prisma.project.findMany({ where: mine(clientId), include, orderBy: { createdAt: 'desc' } })).map(toProject);
export const getProject = async (id: string, clientId: string) => { const p = await prisma.project.findFirst({ where: { id, ...mine(clientId) }, include }); return p ? toProject(p) : null; };

const DISPUTE: Record<string, [string, Tone]> = { OPEN: ['Open', 'warning'], UNDER_REVIEW: ['Under review', 'info'], RESOLVED_RELEASED: ['Resolved: released', 'success'], RESOLVED_REFUNDED: ['Resolved: refunded', 'success'], DISMISSED: ['Dismissed', 'info'] };
export async function getDisputes(clientId: string) {
  const rows = await prisma.dispute.findMany({ where: { project: mine(clientId) }, orderBy: { createdAt: 'desc' }, include: { project: true, milestone: true, raisedBy: true } });
  return rows.map(d => ({ id: d.id, title: d.milestone.title, project: d.project.title, amount: naira(d.milestone.amount), reason: d.reason, label: DISPUTE[d.status][0], tone: DISPUTE[d.status][1], raisedBy: d.raisedBy.name, date: fmtDate(d.createdAt) }));
}

export async function getTransaction(ref: string, clientId: string) {
  const pay = await prisma.payment.findFirst({ where: { reference: ref, OR: [{ payerId: clientId }, { milestone: { project: { freelancerId: clientId } } }] }, include: { milestone: { include: { project: { include: { freelancer: true } } } } } });
  if (pay) {
    const [label, tone] = payTone[pay.status];
    return { ref, kind: 'Payment', label, tone, amount: naira(pay.amount), koraRef: pay.koraReference, milestone: pay.milestone.title, projectId: pay.milestone.projectId, project: pay.milestone.project.title,
      party: pay.milestone.project.freelancer.name, created: fmtDate(pay.createdAt), settled: pay.paidAt ? fmtDate(pay.paidAt) : null, note: pay.failureReason };
  }
  const out = await prisma.payout.findFirst({ where: { reference: ref, milestone: { project: mine(clientId) } }, include: { recipient: true, milestone: { include: { project: true } } } });
  if (!out) return null;
  const [label, tone] = outTone[out.status];
  return { ref, kind: 'Payout', label, tone, amount: naira(out.amount), koraRef: out.koraReference, milestone: out.milestone.title, projectId: out.milestone.projectId, project: out.milestone.project.title,
    party: out.recipient.name, created: fmtDate(out.createdAt), settled: out.completedAt ? fmtDate(out.completedAt) : null, note: out.failureReason };
}

export async function getFreelancerOverview(freelancerId: string) {
  const f = { id: freelancerId };
  const [ms, paid, active] = await Promise.all([
    prisma.milestone.findMany({ where: { project: { freelancerId: f.id } }, orderBy: [{ projectId: 'asc' }, { order: 'asc' }], include: { project: true } }),
    prisma.payout.aggregate({ _sum: { amount: true }, where: { recipientId: f.id, status: 'SUCCESS' } }),
    prisma.project.count({ where: { freelancerId: f.id, status: 'ACTIVE' } }),
  ]);
  const sum = (s: string[]) => naira(ms.filter(m => s.includes(m.status)).reduce((a, m) => a + m.amount, 0));
  return { earned: naira(paid._sum.amount ?? 0), secured: sum(HELD), awaiting: sum(AWAITING), active,
    milestones: ms.map(m => ({ id: m.id, title: m.title, description: m.project.title, amount: naira(m.amount), due: m.dueDate ? `Due ${fmtDate(m.dueDate)}` : 'No due date', state: m.status as MilestoneState })) };
}

export async function getNotifications(userId: string) {
  const rows = await prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 30 });
  return rows.map(n => ({ id: n.id, title: n.title, body: n.body, unread: !n.readAt, date: fmtDate(n.createdAt) }));
}
