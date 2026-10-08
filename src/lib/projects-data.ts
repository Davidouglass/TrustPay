export type MilestoneState = 'DRAFT' | 'AWAITING_FUNDING' | 'FUNDED' | 'IN_PROGRESS' | 'SUBMITTED' | 'AWAITING_APPROVAL' | 'APPROVED' | 'PAYOUT_PENDING' | 'PAID' | 'DISPUTED' | 'CANCELLED';
export type Tone = 'success' | 'warning' | 'danger' | 'info';
export const MILESTONE_UI: Record<MilestoneState, { label: string; tone: Tone; action?: string }> = {
  DRAFT: { label: 'Draft', tone: 'info' },
  AWAITING_FUNDING: { label: 'Awaiting funding', tone: 'warning', action: 'Fund milestone' },
  FUNDED: { label: 'Funded', tone: 'info' },
  IN_PROGRESS: { label: 'In progress', tone: 'info' },
  SUBMITTED: { label: 'Submitted', tone: 'warning', action: 'Review & approve' },
  AWAITING_APPROVAL: { label: 'Awaiting approval', tone: 'warning', action: 'Review & approve' },
  APPROVED: { label: 'Approved', tone: 'success' },
  PAYOUT_PENDING: { label: 'Payout processing', tone: 'info' },
  PAID: { label: 'Paid', tone: 'success' },
  DISPUTED: { label: 'Disputed', tone: 'danger', action: 'View dispute' },
  CANCELLED: { label: 'Cancelled', tone: 'danger' },
};
export type Milestone = { id: string; title: string; description: string; amount: number; due: string; state: MilestoneState };
export type Project = { id: string; title: string; freelancer: string; status: string; milestones: Milestone[] };
export const projectTotal = (p: Project) => p.milestones.reduce((s, x) => s + x.amount, 0);
export const projectReleased = (p: Project) => p.milestones.filter(x => x.state === 'PAID').reduce((s, x) => s + x.amount, 0);
