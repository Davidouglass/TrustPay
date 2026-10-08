'use client';
import { useState } from 'react';
import { Card, Button } from '@/components/ui/primitives';
import { Field, inputCls } from '@/components/ui/Field';
import { naira } from '@/lib/format';

type Row = { id: number; title: string; amount: string };

export function NewProjectForm() {
  const [rows, setRows] = useState<Row[]>([{ id: 1, title: '', amount: '' }]);
  const total = rows.reduce((s, r) => s + (Number(r.amount) || 0), 0);
  const patch = (id: number, p: Partial<Row>) => setRows(rs => rs.map(r => (r.id === id ? { ...r, ...p } : r)));
  return (
    <div className="space-y-5">
      <Card className="space-y-4 p-5 sm:p-6">
        <h2 className="text-lg font-semibold">Project details</h2>
        <Field label="Project title"><input placeholder="e.g. Brand identity" className={inputCls} /></Field>
        <Field label="Description"><textarea rows={3} placeholder="What needs to be delivered?" className={`${inputCls} h-auto py-3`} /></Field>
        <Field label="Freelancer’s email"><input type="email" placeholder="freelancer@email.com" className={inputCls} /></Field>
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
          <Button type="button" className="w-full sm:w-auto">Create project</Button>
        </div>
        <p className="mt-3 text-xs text-ink2">Saving projects arrives with the backend stage.</p>
      </Card>
    </div>
  );
}
