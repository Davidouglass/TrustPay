// Demo data for the UI pass. Amounts in naira. Replaced by Prisma queries later.
export const stats = [
  { label: 'Total Protected', value: 2125988, delta: 12, up: true },
  { label: 'Pending Approval', value: 640000, delta: 8, up: false },
  { label: 'Active Projects', value: 7, delta: 14, up: true, plain: true },
  { label: 'Total Paid Out', value: 4380000, delta: 21, up: true },
];
export const payouts = [
  { name: 'Adaeze Okafor', project: 'Brand identity', amount: 120000, when: '2h ago' },
  { name: 'Tunde Bakare', project: 'Mobile app UI', amount: 500000, when: 'Yesterday' },
  { name: 'Ngozi Eze', project: 'Copywriting', amount: 85000, when: '2 days ago' },
  { name: 'Kwame Mensah', project: 'Data dashboard', amount: 350000, when: '4 days ago' },
  { name: 'Amina Yusuf', project: 'Landing page', amount: 150000, when: '1 week ago' },
];
export type Tx = { ref: string; name: string; email: string; method: string; methodSub: string; status: 'Funded' | 'Released' | 'Pending approval' | 'Payout failed'; amount: number; date: string };
export const transactions: Tx[] = [
  { ref: 'TP-PAY-8F2K1', name: 'Adaeze Okafor', email: 'adaeze@email.co', method: 'Visa card **** 4831', methodSub: 'Card payment', status: 'Released', amount: 120000, date: '04 Oct 2026' },
  { ref: 'TP-PAY-7D9QX', name: 'Tunde Bakare', email: 'tunde@email.co', method: 'Bank transfer', methodSub: 'Pay with bank', status: 'Funded', amount: 500000, date: '03 Oct 2026' },
  { ref: 'TP-PAY-6C3LM', name: 'Ngozi Eze', email: 'ngozi@email.co', method: 'Visa card **** 1120', methodSub: 'Card payment', status: 'Pending approval', amount: 85000, date: '02 Oct 2026' },
  { ref: 'TP-PO-5B7NA', name: 'Kwame Mensah', email: 'kwame@email.co', method: 'GTBank ****2291', methodSub: 'Payout', status: 'Payout failed', amount: 350000, date: '30 Sep 2026' },
];
