import type { Tone } from '@/lib/projects-data';
export type Tx = { ref: string; kind: 'Payments' | 'Payouts'; name: string; email: string; method: string; methodSub: string; statusLabel: string; tone: Tone; amount: number; date: string };
