import Link from 'next/link';
import { AuthShell, primaryLink } from '@/components/auth/AuthShell';
import { Field, inputCls } from '@/components/ui/Field';

export default function LoginPage() {
  return (
    <AuthShell title="Welcome back" sub="Log in to manage your projects and milestones."
      footer={<>New to TrustPay? <Link href="/register" className="font-semibold text-soft">Create an account</Link></>}>
      <Field label="Email"><input type="email" autoComplete="email" placeholder="you@email.com" className={inputCls} /></Field>
      <Field label="Password"><input type="password" autoComplete="current-password" placeholder="Your password" className={inputCls} /></Field>
      <Link href="/dashboard" className={primaryLink}>Log in</Link>
      <p className="text-center text-xs text-ink2">Demo mode: sign-in is not connected yet.</p>
    </AuthShell>
  );
}
