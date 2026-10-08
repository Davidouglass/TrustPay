import Link from 'next/link';
import { AuthShell, primaryLink } from '@/components/auth/AuthShell';
import { Field, inputCls } from '@/components/ui/Field';

const roles = [['CLIENT', 'I’m a client', 'I hire and pay freelancers'], ['FREELANCER', 'I’m a freelancer', 'I deliver work and get paid']] as const;

export default function RegisterPage() {
  return (
    <AuthShell title="Create your account" sub="Choose how you’ll use TrustPay."
      footer={<>Already have an account? <Link href="/login" className="font-semibold text-soft">Log in</Link></>}>
      <fieldset><legend className="mb-2 text-sm text-ink2">I am a…</legend>
        <div className="grid gap-3 sm:grid-cols-2">{roles.map(([v, t, d], i) => (
          <label key={v} className="cursor-pointer rounded-[14px] border border-line/60 p-4 has-[:checked]:border-primary has-[:checked]:bg-hl/40">
            <input type="radio" name="role" value={v} defaultChecked={i === 0} className="sr-only" />
            <span className="block text-sm font-semibold">{t}</span><span className="mt-1 block text-xs text-ink2">{d}</span>
          </label>))}</div></fieldset>
      <Field label="Full name"><input autoComplete="name" placeholder="Your name" className={inputCls} /></Field>
      <Field label="Email"><input type="email" autoComplete="email" placeholder="you@email.com" className={inputCls} /></Field>
      <Field label="Password"><input type="password" autoComplete="new-password" placeholder="At least 8 characters" className={inputCls} /></Field>
      <Link href="/dashboard" className={primaryLink}>Create account</Link>
      <p className="text-center text-xs text-ink2">Demo mode: sign-up is not connected yet.</p>
    </AuthShell>
  );
}
