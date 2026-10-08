import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';
import { Card } from '@/components/ui/primitives';

export function AuthShell({ title, sub, children, footer }: { title: string; sub: string; children: React.ReactNode; footer: React.ReactNode }) {
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden px-4 py-10">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[480px]" style={{ background: 'radial-gradient(55% 60% at 50% 0%, rgba(85,66,246,.4), transparent 70%)' }} />
      <div className="relative w-full max-w-md">
        <Link href="/" className="mb-6 flex justify-center" aria-label="TrustPay home"><Logo /></Link>
        <Card className="p-6 sm:p-8">
          <h1 className="text-2xl font-semibold">{title}</h1><p className="mt-2 text-sm text-ink2">{sub}</p>
          <div className="mt-6 space-y-4">{children}</div>
        </Card>
        <p className="mt-5 text-center text-sm text-ink2">{footer}</p>
      </div>
    </main>
  );
}
export const primaryLink = 'inline-flex h-11 w-full items-center justify-center rounded-btn bg-primary px-5 text-sm font-semibold text-white transition hover:brightness-110';
