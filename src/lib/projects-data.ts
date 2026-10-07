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
export type Project = { id: string; title: string; freelancer: string; status: 'Active' | 'Pending acceptance' | 'Completed'; milestones: Milestone[] };
const m = (id: string, title: string, amount: number, due: string, state: MilestoneState, description = `${title} deliverables as agreed in the brief.`): Milestone => ({ id, title, description, amount, due, state });
export const projects: Project[] = [
  { id: 'brand-identity', title: 'Brand identity', freelancer: 'Adaeze Okafor', status: 'Active', milestones: [
    m('b1', 'Logo concepts', 120000, '12 Oct 2026', 'PAID'), m('b2', 'Brand guidelines', 180000, '20 Oct 2026', 'AWAITING_APPROVAL'), m('b3', 'Social media kit', 90000, '30 Oct 2026', 'AWAITING_FUNDING')] },
  { id: 'mobile-app-ui', title: 'Mobile app UI', freelancer: 'Tunde Bakare', status: 'Active', milestones: [
    m('m1', 'Wireframes', 150000, '05 Oct 2026', 'PAYOUT_PENDING'), m('m2', 'High-fidelity screens', 350000, '25 Oct 2026', 'FUNDED')] },
  { id: 'landing-copy', title: 'Landing page copy', freelancer: 'Ngozi Eze', status: 'Active', milestones: [m('c1', 'Homepage copy', 85000, '02 Oct 2026', 'DISPUTED')] },
  { id: 'data-dashboard', title: 'Data dashboard', freelancer: 'Kwame Mensah', status: 'Pending acceptance', milestones: [m('d1', 'Dashboard prototype', 350000, '15 Nov 2026', 'DRAFT')] },
];
export const getProject = (id: string) => projects.find(p => p.id === id);
export const projectTotal = (p: Project) => p.milestones.reduce((s, x) => s + x.amount, 0);
export const projectReleased = (p: Project) => p.milestones.filter(x => x.state === 'PAID').reduce((s, x) => s + x.amount, 0);
