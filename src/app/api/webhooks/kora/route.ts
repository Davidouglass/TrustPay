import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { koraKey, verifyWebhookSignature } from '@/lib/kora';
import { settlePayment } from '@/lib/payments';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const reply = (status: number, body: string) => new Response(body, { status });

/** Public + unauthenticated by design (Kora can't log in). Protection = signature check, then re-verification with Kora. */
export async function POST(req: Request) {
  const raw = await req.text();
  let body: { event?: unknown; data?: { reference?: unknown } };
  try { body = JSON.parse(raw); } catch { return reply(400, 'bad json'); }
  if (!body || typeof body !== 'object' || !body.data) return reply(400, 'bad payload');

  let key: string;
  try { key = koraKey(); } catch { return reply(500, 'not configured'); }
  if (!verifyWebhookSignature(body.data, req.headers.get('x-korapay-signature'), key)) return reply(401, 'invalid signature');

  const event = String(body.event ?? ''), reference = String(body.data.reference ?? '');
  if (!reference) return reply(200, 'ignored');
  const dedupeKey = `${event}:${reference}`;

  // Idempotency: one WebhookEvent per (event, reference). A replay of an already-handled event is acknowledged and skipped.
  try {
    await prisma.webhookEvent.create({ data: { provider: 'KORA', dedupeKey, event, reference, payload: body as Prisma.InputJsonValue, signatureValid: true } });
  } catch (e) {
    if (!(e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002')) return reply(500, 'retry');
    const prev = await prisma.webhookEvent.findUnique({ where: { provider_dedupeKey: { provider: 'KORA', dedupeKey } }, select: { status: true } });
    if (prev && (prev.status === 'PROCESSED' || prev.status === 'IGNORED')) return reply(200, 'duplicate');
  }

  if (event !== 'charge.success' && event !== 'charge.failed') {
    await prisma.webhookEvent.update({ where: { provider_dedupeKey: { provider: 'KORA', dedupeKey } }, data: { status: 'IGNORED', processedAt: new Date() } });
    return reply(200, 'ignored');
  }
  try {
    const result = await settlePayment(reference); // re-verifies with Kora; the webhook body is never trusted for status or amount
    await prisma.webhookEvent.update({ where: { provider_dedupeKey: { provider: 'KORA', dedupeKey } }, data: { status: result === 'unknown' || result === 'ignored' ? 'IGNORED' : 'PROCESSED', processedAt: new Date() } });
    return reply(200, 'ok');
  } catch (e) {
    await prisma.webhookEvent.update({ where: { provider_dedupeKey: { provider: 'KORA', dedupeKey } }, data: { status: 'FAILED', error: e instanceof Error ? e.message.slice(0, 300) : 'error' } });
    return reply(500, 'retry'); // non-200 makes Kora retry; settlePayment is idempotent
  }
}
