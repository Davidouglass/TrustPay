'use client';
import { useState, useTransition } from 'react';
import { createProjectAction } from '@/app/(app)/projects/actions';
import { Card, Button } from '@/components/ui/primitives';
import { Field, inputCls } from '@/components/ui/Field';
import { naira } from '@/lib/format';

type Row = { id: number; title: string; amount: string };

export function NewProjectForm() {
  const [rows, setRows] = useState<Row[]>([{ id: 1, title: '', amount: '' }]);
  const [error, setError] = useState<string>();
  const [pending, start] = useTransition();
  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setError(undefined);
    start(() => { void createProjectAction({ title: String(fd.get('title') ?? ''), description: String(fd.get('description') ?? ''), freelancerEmail: String(fd.get('freelancerEmail') ?? ''), milestones: rows.map(r => ({ title: r.title, amount: r.amount })) }).then(r => r?.error && setError(r.error)); });
  };
  const total = rows.reduce((s, r) => s + (Number(r.amount) || 0), 0);
  const patch = (id: number, p: Partial<Row>) => setRows(rs => rs.map(r => (r.id === id ? { ...r, ...p } : r)));
  return (
    <form onSubmit={submit} className="space-y-5">
      <Card className="space-y-4 p-5 sm:p-6">
        <h2 className="text-lg font-semibold">Project details</h2>
        <Field label="Project title"><input name="title" required placeholder="e.g. Brand identity" className={inputCls} /></Field>
        <Field label="Description"><textarea name="description" required rows={3} placeholder="What needs to be delivered?" className={`${inputCls} h-auto py-3`} /></Field>
        <Field label="Freelancer’s email"><input name="freelancerEmail" required type="email" placeholder="freelancer@email.com" className={inputCls} /></Field>
      </Card>
      <Card className="p-5 sm:p-6">
        <h2 className="text-lg font-semibold">Milestones</h2>
        <ul className="mt-4 space-y-3">{rows.map((r, i) => (
          <li key={r.id} className="grid gap-3 rounded-[16px] border border-line/60 p-4 sm:grid-cols-[1fr_180px_auto] sm:items-end">
            <Field label={`Milestone ${i + 1}`}><input value={r.title} onChange={e => patch(r.id, { title: e.target.value })} placeholder="e.g. Logo concepts" className={inputCls} /></Field>
            <Field label="Amount (₦)"><input inputMode="numeric" value={r.amount} onChange={e => patch(r.id, { amount: e.target.value.replace(/\D/g, '') })} placeholder="120000" className={inputCls} /></Field>
            <Button type="button" variant="outline" disabled={rows.length === 1} onClick={() => setRows(rs => rs.filter(x => x.id !== r.id))}>Remove</Button>
          </li>))}</ul>
        <Button type="button" variant="outline" className="mt-4 w-full sm:w-auto" onClick={() => setRows(rs => [...rs, { id: Date.now(), title: '', amount: '' }])}>Add milestone</Button>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line/40 pt-5">
          <p className="text-sm text-ink2">Project total <span className="ml-2 text-xl font-semibold text-white">{naira(total)}</span></p>
          <Button type="submit" disabled={pending} className="w-full sm:w-auto">{pending ? 'Creating…' : 'Create project'}</Button>
        </div>
        {error && <p role="alert" className="mt-4 rounded-btn bg-dangerbg px-4 py-3 text-sm text-danger">{error}</p>}
      </Card>
    </form>
  );
}
