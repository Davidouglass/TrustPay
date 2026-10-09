'use client';
import { useState, useTransition } from 'react';
import { Field, inputCls } from '@/components/ui/Field';
import { loginAction, registerAction, type FormState } from '@/app/(auth)/actions';

const submitCls = 'inline-flex h-11 w-full items-center justify-center rounded-btn bg-primary px-5 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-60';
const roles = [['CLIENT', 'I’m a client', 'I hire and pay freelancers'], ['FREELANCER', 'I’m a freelancer', 'I deliver work and get paid']] as const;

function useAuthForm(action: (fd: FormData) => Promise<FormState>) {
  const [error, setError] = useState<string>();
  const [pending, start] = useTransition();
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setError(undefined);
    start(() => { void action(fd).then(r => r?.error && setError(r.error)); });
  };
  return { error, pending, onSubmit };
}
const Err = ({ msg }: { msg?: string }) => msg ? <p role="alert" className="rounded-btn bg-dangerbg px-4 py-3 text-sm text-danger">{msg}</p> : null;

export function LoginForm() {
  const { error, pending, onSubmit } = useAuthForm(loginAction);
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Err msg={error} />
      <Field label="Email"><input name="email" type="email" required autoComplete="email" placeholder="you@email.com" className={inputCls} /></Field>
      <Field label="Password"><input name="password" type="password" required autoComplete="current-password" placeholder="Your password" className={inputCls} /></Field>
      <button type="submit" disabled={pending} className={submitCls}>{pending ? 'Logging in…' : 'Log in'}</button>
    </form>
  );
}

export function RegisterForm() {
  const { error, pending, onSubmit } = useAuthForm(registerAction);
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Err msg={error} />
      <fieldset><legend className="mb-2 text-sm text-ink2">I am a…</legend>
        <div className="grid gap-3 sm:grid-cols-2">{roles.map(([v, t, d], i) => (
          <label key={v} className="cursor-pointer rounded-[14px] border border-line/60 p-4 has-[:checked]:border-primary has-[:checked]:bg-hl/40">
            <input type="radio" name="role" value={v} defaultChecked={i === 0} className="sr-only" />
            <span className="block text-sm font-semibold">{t}</span><span className="mt-1 block text-xs text-ink2">{d}</span>
          </label>))}</div></fieldset>
      <Field label="Full name"><input name="name" required autoComplete="name" placeholder="Your name" className={inputCls} /></Field>
      <Field label="Email"><input name="email" type="email" required autoComplete="email" placeholder="you@email.com" className={inputCls} /></Field>
      <Field label="Password"><input name="password" type="password" required minLength={8} autoComplete="new-password" placeholder="At least 8 characters" className={inputCls} /></Field>
      <button type="submit" disabled={pending} className={submitCls}>{pending ? 'Creating account…' : 'Create account'}</button>
    </form>
  );
}
