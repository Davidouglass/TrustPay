'use server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export type ActionState = { error?: string } | undefined;
const MAX_NAIRA = 20_000_000; // keeps kobo inside the Int column

export async function createProjectAction(input: { title: string; description: string; freelancerEmail: string; milestones: { title: string; amount: string }[] }): Promise<ActionState> {
  const me = await getCurrentUser();
  if (me.role !== 'CLIENT') return { error: 'Only clients can create projects.' };
  const title = input.title.trim(), description = input.description.trim(), email = input.freelancerEmail.trim().toLowerCase();
  if (title.length < 3) return { error: 'Give the project a title (3+ characters).' };
  if (description.length < 10) return { error: 'Add a short description (10+ characters).' };
  if (input.milestones.length < 1 || input.milestones.length > 10) return { error: 'Add between 1 and 10 milestones.' };
  const ms: { order: number; title: string; description: string; amount: number }[] = [];
  for (const [i, m] of input.milestones.entries()) {
    const amount = Number(m.amount), t = m.title.trim();
    if (t.length < 2) return { error: `Milestone ${i + 1} needs a title.` };
    if (!Number.isInteger(amount) || amount < 100 || amount > MAX_NAIRA) return { error: `Milestone ${i + 1}: enter an amount between ₦100 and ₦20,000,000.` };
    ms.push({ order: i + 1, title: t, description: `${t} deliverables.`, amount: amount * 100 });
  }
  const freelancer = await prisma.user.findUnique({ where: { email } });
  if (!freelancer || freelancer.role !== 'FREELANCER') return { error: 'No freelancer account found with that email. Ask them to register as a freelancer first.' };

  const project = await prisma.$transaction(async tx => {
    const p = await tx.project.create({ data: {
      title, description, clientId: me.id, freelancerId: freelancer.id, status: 'PENDING_ACCEPTANCE',
      milestones: { create: ms.map(m => ({ ...m, events: { create: { to: 'DRAFT' as const, actorId: me.id, note: 'Created' } } })) },
    } });
    await tx.notification.create({ data: { userId: freelancer.id, type: 'PROJECT_INVITED', title: 'New project invitation', body: `${me.name} invited you to "${title}".`, projectId: p.id, dedupeKey: `PROJECT_INVITED:${p.id}` } });
    return p;
  });
  redirect(`/projects/${project.id}`);
}

export async function acceptProjectAction(projectId: string): Promise<ActionState> {
  const me = await getCurrentUser();
  // A payout needs somewhere to go: require bank details before the freelancer can accept.
  if (!me.bankCode || !me.accountNumber || !me.accountName) return { error: 'Add your payout bank details in Settings before accepting a project, so you can be paid.' };
  const done = await prisma.$transaction(async tx => {
    // Compare-and-set: only the assigned freelancer, only while the project is still pending.
    const res = await tx.project.updateMany({ where: { id: projectId, freelancerId: me.id, status: 'PENDING_ACCEPTANCE' }, data: { status: 'ACTIVE' } });
    if (res.count === 0) return false;
    const drafts = await tx.milestone.findMany({ where: { projectId, status: 'DRAFT' }, select: { id: true } });
    await tx.milestone.updateMany({ where: { projectId, status: 'DRAFT' }, data: { status: 'AWAITING_FUNDING' } });
    await tx.milestoneEvent.createMany({ data: drafts.map(m => ({ milestoneId: m.id, from: 'DRAFT' as const, to: 'AWAITING_FUNDING' as const, actorId: me.id, note: 'Project accepted' })) });
    const p = await tx.project.findUniqueOrThrow({ where: { id: projectId }, select: { clientId: true, title: true } });
    await tx.notification.create({ data: { userId: p.clientId, type: 'PROJECT_ACCEPTED', title: 'Project accepted', body: `${me.name} accepted "${p.title}". You can now fund its milestones.`, projectId, dedupeKey: `PROJECT_ACCEPTED:${projectId}` } });
    return true;
  });
  if (!done) return { error: 'This project can no longer be accepted.' };
  revalidatePath(`/projects/${projectId}`);
}
