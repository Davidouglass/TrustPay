// Landing-page content. Testimonials are SAMPLE copy until real customers exist.
export const steps = [
  { n: '01', title: 'Create', body: 'Create a project, add your freelancer and define the milestones and amounts.' },
  { n: '02', title: 'Fund', body: 'The client funds a milestone through Kora, so the freelancer knows it is secured before starting.' },
  { n: '03', title: 'Deliver & Release', body: 'The freelancer submits the work, the client approves it, and the payment is released to their bank account.' },
];
export const features = [
  { title: 'Milestone funding', body: 'Fund one milestone at a time. Nobody pays for work that has not started, nobody works unpaid.' },
  { title: 'Work submission', body: 'Freelancers submit deliverables with notes and links. Clients see exactly what was delivered.' },
  { title: 'Clear approval', body: 'Approve or request changes. Every milestone shows its state, from funded to paid.' },
  { title: 'Payment release', body: 'Approved milestones are paid out to the freelancer’s Nigerian bank account.' },
];
export const trust = [
  ['Powered by Kora', 'Payments and payouts run through Kora.'],
  ['Every step tracked', 'Each milestone has an explicit, visible state.'],
  ['Naira first', 'Amounts and payouts in ₦.'],
  ['One payout per milestone', 'Duplicate payouts are blocked by design.'],
];
export const faqs = [
  { q: 'Is TrustPay a regulated escrow service?', a: 'No. TrustPay is a milestone-based payment protection and release platform. We do not present ourselves as a legally regulated escrow provider.' },
  { q: 'When does the freelancer get paid?', a: 'After the client approves a submitted milestone, TrustPay starts a payout to the freelancer’s bank account through Kora.' },
  { q: 'What if we disagree about the work?', a: 'Either side can open a dispute on a milestone. It is reviewed before any payment is released.' },
  { q: 'Which currency is supported?', a: 'Nigerian Naira (₦) for now.' },
];
export const testimonials = [
  { name: 'Adaeze Okafor', role: 'Brand designer', quote: 'I start work knowing the milestone is funded. No more chasing invoices.' },
  { name: 'Tunde Bakare', role: 'Product designer', quote: 'The approval flow keeps clients and me on the same page.' },
  { name: 'Chioma Nwosu', role: 'Startup founder', quote: 'I pay as work is delivered, not before. That changed how I hire.' },
];
export const footerCols = [
  ['Product', ['How it works', 'Features', 'FAQ']],
  ['Account', ['Log in', 'Sign up', 'Dashboard']],
  ['Legal', ['Terms', 'Privacy', 'Not a regulated escrow service']],
] as const;
