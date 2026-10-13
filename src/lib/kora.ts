import 'server-only';
import { createHmac, timingSafeEqual } from 'node:crypto';

// Kora merchant API. Test vs live is chosen by the key, not the URL. https://developers.korapay.com/docs/checkout-redirect
const BASE = process.env.KORA_BASE_URL ?? 'https://api.korapay.com/merchant/api/v1';

/** TEST-MODE ONLY: refuses anything but an sk_test_ key unless KORA_ALLOW_LIVE=true. Never put the key in an error message or log. */
export function koraKey() {
  const k = process.env.KORA_SECRET_KEY;
  if (!k) throw new Error('KORA_SECRET_KEY is not set.');
  if (!k.startsWith('sk_test_') && process.env.KORA_ALLOW_LIVE !== 'true') throw new Error('Refusing to use a non-test Kora key (this build is test-mode only).');
  return k;
}

async function call(path: string, init: RequestInit) {
  const res = await fetch(`${BASE}${path}`, { ...init, headers: { Authorization: `Bearer ${koraKey()}`, 'Content-Type': 'application/json' }, cache: 'no-store', signal: AbortSignal.timeout(15_000) });
  const json = await res.json().catch(() => null);
  return { ok: res.ok, status: res.status, json };
}

export async function initializeCharge(p: { reference: string; amountNaira: number; email: string; name: string; redirectUrl: string; notificationUrl?: string; narration: string }) {
  const r = await call('/charges/initialize', { method: 'POST', body: JSON.stringify({
    amount: p.amountNaira, currency: 'NGN', reference: p.reference, redirect_url: p.redirectUrl,
    ...(p.notificationUrl ? { notification_url: p.notificationUrl } : {}), narration: p.narration, customer: { name: p.name, email: p.email } }) });
  const url = r.json?.data?.checkout_url;
  if (!r.ok || r.json?.status !== true || typeof url !== 'string') throw new Error(`Kora initialize failed (HTTP ${r.status}): ${r.json?.message ?? 'no message'}`);
  return url;
}

export type KoraCharge = { found: boolean; status?: string; amount?: number; currency?: string; transactionStatus?: string; method?: string; raw: unknown };
export async function verifyCharge(reference: string): Promise<KoraCharge> {
  const r = await call(`/charges/${encodeURIComponent(reference)}`, { method: 'GET' });
  const d = r.json?.data;
  if (!r.ok || r.json?.status !== true || !d || typeof d !== 'object') return { found: false, raw: r.json };
  const amt = d.amount_paid ?? d.amount;
  return { found: true, status: String(d.status ?? '').toLowerCase(), amount: amt == null ? undefined : Number(amt), currency: d.currency,
    transactionStatus: d.transaction_status, method: d.payment_method ? String(d.payment_method) : undefined, raw: r.json };
}

export type Verdict = { kind: 'success' } | { kind: 'failed'; reason: string } | { kind: 'pending' } | { kind: 'unknown' } | { kind: 'flag'; reason: string };
/** Decides what a verified Kora charge means for OUR record. Amount/currency come from our database, never from the client. */
export function evaluateCharge(c: KoraCharge, expectedNaira: number, expectedCurrency = 'NGN'): Verdict {
  if (!c.found) return { kind: 'unknown' };
  if (c.status === 'failed') return { kind: 'failed', reason: 'Payment failed at Kora' };
  if (c.status !== 'success') return { kind: 'pending' };
  if (c.currency !== undefined && c.currency !== expectedCurrency) return { kind: 'flag', reason: `Currency mismatch (${c.currency})` };
  if (c.amount !== undefined && Math.abs(c.amount - expectedNaira) > 0.001) return { kind: 'flag', reason: `Amount mismatch: expected ${expectedNaira}, Kora reports ${c.amount}` };
  if (c.transactionStatus !== undefined && c.transactionStatus !== 'success') return { kind: 'flag', reason: `Kora transaction status: ${c.transactionStatus}` };
  return { kind: 'success' };
}

/** Docs: x-korapay-signature = HMAC-SHA256 (hex) of JSON.stringify(payload.data) with the secret key. Constant-time compare. */
export function verifyWebhookSignature(data: unknown, signature: string | null, secret: string) {
  if (!signature || !/^[0-9a-f]{64}$/i.test(signature)) return false;
  const expected = createHmac('sha256', secret).update(JSON.stringify(data)).digest();
  return timingSafeEqual(expected, Buffer.from(signature, 'hex'));
}
