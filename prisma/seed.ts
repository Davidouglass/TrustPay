import { PrismaClient, type MilestoneStatus, type User } from '@prisma/client';
import bcrypt from 'bcryptjs';

// Dev-only demo data. Wipes all tables first. Every account uses password: TrustPay123!
const db = new PrismaClient();
const k = (naira: number) => naira * 100; // naira -> kobo
const ago = (d: number) => new Date(Date.now() - d * 864e5);
let n = 0;

type Ms = { id: string; amount: number };

const milestone = (projectId: string, order: number, title: string, naira: number, status: MilestoneStatus, extra: object = {}) =>
  db.milestone.create({ data: { projectId, order, title, description: `${title} deliverables as agreed in the project brief.`, amount: k(naira), status, ...extra } });

const payment = (m: Ms, payerId: string, status: 'SUCCESS' | 'FAILED') => {
  n++;
  return db.payment.create({ data: {
    milestoneId: m.id, payerId, reference: `TP-PAY-SEED${n}`, amount: m.amount, status, channel: 'card',
    koraReference: status === 'SUCCESS' ? `KPY-SEED${n}` : null,
    amountPaid: status === 'SUCCESS' ? m.amount : null,
    paidAt: status === 'SUCCESS' ? ago(6) : null,
    failureReason: status === 'FAILED' ? 'Card declined' : null,
  } });
};

const payout = (m: Ms, paymentId: string, f: User, status: 'PROCESSING' | 'SUCCESS') =>
  db.payout.create({ data: {
    milestoneId: m.id, paymentId, recipientId: f.id, attempt: 1, reference: `TP-PO-${m.id}-1`, amount: m.amount, status,
    koraReference: status === 'SUCCESS' ? `KPO-SEED${++n}` : null,
    bankCode: f.bankCode!, accountNumber: f.accountNumber!, accountName: f.accountName!,
    claimedAt: ago(3), completedAt: status === 'SUCCESS' ? ago(2) : null,
  } });

async function main() {
  if (process.env.NODE_ENV === 'production') throw new Error('Refusing to seed production.');
  await db.notification.deleteMany(); await db.webhookEvent.deleteMany(); await db.milestoneEvent.deleteMany();
  await db.dispute.deleteMany(); await db.workSubmission.deleteMany(); await db.payout.deleteMany();
  await db.payment.deleteMany(); await db.milestone.deleteMany(); await db.project.deleteMany(); await db.user.deleteMany();

  const passwordHash = await bcrypt.hash('TrustPay123!', 10);
  const freelancer = (name: string, email: string, acct: string) =>
    db.user.create({ data: { name, email, role: 'FREELANCER', passwordHash, bankCode: '058', bankName: 'GTBank', accountNumber: acct, accountName: name.toUpperCase() } });

  const david = await db.user.create({ data: { name: 'David', email: 'david@trustpay.test', role: 'CLIENT', passwordHash, image: '/david.png' } });
  const adaeze = await freelancer('Adaeze Okafor', 'adaeze@trustpay.test', '0123456789');
  const tunde = await freelancer('Tunde Bakare', 'tunde@trustpay.test', '0234567890');
  const ngozi = await freelancer('Ngozi Eze', 'ngozi@trustpay.test', '0345678901');
  const kwame = await freelancer('Kwame Mensah', 'kwame@trustpay.test', '0456789012');
  const admin = await db.user.create({ data: { name: 'TrustPay Admin', email: 'admin@trustpay.test', role: 'ADMIN', passwordHash } });

  // Project A: paid + awaiting approval + awaiting funding
  const a = await db.project.create({ data: { title: 'Brand identity', description: 'Logo, guidelines and social kit.', clientId: david.id, freelancerId: adaeze.id, status: 'ACTIVE' } });
  const a1 = await milestone(a.id, 1, 'Logo concepts', 120000, 'PAID', { fundedAt: ago(14), paidAt: ago(2) });
  const a1p = await payment(a1, david.id, 'SUCCESS'); await payout(a1, a1p.id, adaeze, 'SUCCESS');
  const a2 = await milestone(a.id, 2, 'Brand guidelines', 180000, 'AWAITING_APPROVAL', { fundedAt: ago(8), submittedAt: ago(1) });
  await payment(a2, david.id, 'SUCCESS');
  await db.workSubmission.create({ data: { milestoneId: a2.id, freelancerId: adaeze.id, version: 1, message: 'Guidelines PDF is ready for review.', links: ['https://example.com/brand-guidelines'] } });
  await milestone(a.id, 3, 'Social media kit', 90000, 'AWAITING_FUNDING');

  // Project B: payout in flight + funded (one failed card attempt first)
  const b = await db.project.create({ data: { title: 'Mobile app UI', description: 'Wireframes and high-fidelity screens.', clientId: david.id, freelancerId: tunde.id, status: 'ACTIVE' } });
  const b1 = await milestone(b.id, 1, 'Wireframes', 150000, 'PAYOUT_PENDING', { fundedAt: ago(10), approvedAt: ago(1) });
  const b1p = await payment(b1, david.id, 'SUCCESS'); await payout(b1, b1p.id, tunde, 'PROCESSING');
  const b2 = await milestone(b.id, 2, 'High-fidelity screens', 350000, 'FUNDED', { fundedAt: ago(1) });
  await payment(b2, david.id, 'FAILED'); await payment(b2, david.id, 'SUCCESS');

  // Project C: open dispute
  const c = await db.project.create({ data: { title: 'Landing page copy', description: 'Website copy for launch.', clientId: david.id, freelancerId: ngozi.id, status: 'ACTIVE' } });
  const c1 = await milestone(c.id, 1, 'Homepage copy', 85000, 'DISPUTED', { statusBeforeDispute: 'SUBMITTED', fundedAt: ago(9), submittedAt: ago(4) });
  await payment(c1, david.id, 'SUCCESS');
  await db.workSubmission.create({ data: { milestoneId: c1.id, freelancerId: ngozi.id, version: 1, message: 'Homepage copy attached.', links: ['https://example.com/copy'] } });
  await db.dispute.create({ data: { projectId: c.id, milestoneId: c1.id, raisedById: david.id, reason: 'Copy does not match the agreed tone of voice.' } });

  // Project D: invitation pending
  const d = await db.project.create({ data: { title: 'Data dashboard', description: 'Analytics dashboard build.', clientId: david.id, freelancerId: kwame.id, status: 'PENDING_ACCEPTANCE' } });
  await milestone(d.id, 1, 'Dashboard prototype', 350000, 'DRAFT');

  await db.notification.createMany({ data: [
    { userId: david.id, type: 'WORK_SUBMITTED', title: 'Work submitted', body: 'Adaeze submitted "Brand guidelines" for review.', projectId: a.id, milestoneId: a2.id, dedupeKey: `WORK_SUBMITTED:${a2.id}:1:${david.id}` },
    { userId: david.id, type: 'PAYOUT_INITIATED', title: 'Payout on its way', body: 'Payment for "Wireframes" was sent to Tunde.', projectId: b.id, milestoneId: b1.id, dedupeKey: `PAYOUT_INITIATED:${b1.id}:${david.id}` },
    { userId: david.id, type: 'DISPUTE_OPENED', title: 'Dispute opened', body: 'You opened a dispute on "Homepage copy".', projectId: c.id, milestoneId: c1.id, dedupeKey: `DISPUTE_OPENED:${c1.id}:${david.id}` },
    { userId: ngozi.id, type: 'DISPUTE_OPENED', title: 'Dispute opened', body: 'David opened a dispute on "Homepage copy".', projectId: c.id, milestoneId: c1.id, dedupeKey: `DISPUTE_OPENED:${c1.id}:${ngozi.id}` },
    { userId: kwame.id, type: 'PROJECT_INVITED', title: 'New project invitation', body: 'David invited you to "Data dashboard".', projectId: d.id, dedupeKey: `PROJECT_INVITED:${d.id}:${kwame.id}` },
  ] });
  console.log(`Seeded. Admin id: ${admin.id}. Login: david@trustpay.test / TrustPay123!`);
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => db.$disconnect());
