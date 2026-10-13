'use client';
import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/primitives';
import { Field, inputCls } from '@/components/ui/Field';
import { BANKS } from '@/lib/banks';
import { saveBankDetailsAction } from '@/app/(app)/settings/actions';

type Initial = { bankCode: string; accountNumber: string; accountName: string };

export function BankDetailsForm({ initial }: { initial: Initial }) {
  const [v, setV] = useState(initial);
  const [error, setError] = useState<string>();
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();
  const set = (k: keyof Initial) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => { setSaved(false); setV({ ...v, [k]: e.target.value }); };
  const submit = (e: React.FormEvent) => {
    e.preventDefault(); setError(undefined); setSaved(false);
    start(() => { void saveBankDetailsAction(v).then(r => (r?.error ? setError(r.error) : setSaved(true))); });
  };
  return (
    <form onSubmit={submit} className="mt-4 space-y-4">
      <Field label="Bank">
        <select value={v.bankCode} onChange={set('bankCode')} required className={inputCls}>
          <option value="">Select your bank</option>{BANKS.map(([code, name]) => <option key={code} value={code}>{name}</option>)}
        </select>
      </Field>
      <Field label="Account number"><input value={v.accountNumber} onChange={set('accountNumber')} required inputMode="numeric" maxLength={10} placeholder="10-digit NUBAN" className={inputCls} /></Field>
      <Field label="Account name"><input value={v.accountName} onChange={set('accountName')} required autoComplete="name" placeholder="As shown by your bank" className={inputCls} /></Field>
      <p className="text-xs text-ink2">Double-check these details. Payments sent to a wrong account can’t be reversed by TrustPay.</p>
      {error && <p role="alert" className="rounded-btn bg-dangerbg px-4 py-3 text-sm text-danger">{error}</p>}
      {saved && <p role="status" className="rounded-btn bg-okbg px-4 py-3 text-sm text-ok">Payout account saved.</p>}
      <Button type="submit" disabled={pending} className="w-full sm:w-auto">{pending ? 'Saving…' : 'Save payout account'}</Button>
    </form>
  );
}
