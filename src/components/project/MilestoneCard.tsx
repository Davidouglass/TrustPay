'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button, StatusPill } from '@/components/ui/primitives';
import { Field, inputCls } from '@/components/ui/Field';
import { devFundMilestoneAction, submitWorkAction, reviewSubmissionAction, openDisputeAction, type ActionState } from '@/app/(app)/milestones/actions';
import { startKoraCheckoutAction } from '@/app/(app)/payments/actions';
import { MILESTONE_UI, type Milestone } from '@/lib/projects-data';
import { naira } from '@/lib/format';

type Role = 'CLIENT' | 'FREELANCER' | 'ADMIN';
type Panel = 'submit' | 'changes' | 'dispute';
const DISPUTABLE = ['FUNDED', 'IN_PROGRESS', 'SUBMITTED', 'AWAITING_APPROVAL'];
const area = `${inputCls} h-auto py-3`;

/** Server actions re-check who you are and the milestone state; this component only decides what to show. */
export function MilestoneCard({ m, index, role, devFunding = false, koraEnabled = false }: { m: Milestone; index: number; role: Role; devFunding?: boolean; koraEnabled?: boolean }) {
  const router = useRouter();
  const ui = MILESTONE_UI[m.state];
  const [panel, setPanel] = useState<Panel>();
  const [error, setError] = useState<string>();
  const [pending, start] = useTransition();
  const [text, setText] = useState(''), [links, setLinks] = useState('');
  const run = (fn: () => Promise<ActionState>) => start(() => {
    setError(undefined);
    void fn().then(r => { if (r?.error) setError(r.error); else { setPanel(undefined); setText(''); setLinks(''); router.refresh(); } });
  });
  const toggle = (p: Panel) => { setPanel(panel === p ? undefined : p); setError(undefined); setText(''); };

  const reviewing = m.state === 'SUBMITTED' || m.state === 'AWAITING_APPROVAL';
  const canFund = role === 'CLIENT' && m.state === 'AWAITING_FUNDING' && devFunding;
  const canSubmit = role === 'FREELANCER' && (m.state === 'FUNDED' || m.state === 'IN_PROGRESS');
  const canReview = role === 'CLIENT' && reviewing;
  const canPay = role === 'CLIENT' && m.state === 'AWAITING_FUNDING' && koraEnabled;
  const pay = () => start(() => { setError(undefined); void startKoraCheckoutAction(m.id).then(r => { if (r.url) window.location.assign(r.url); else setError(r.error ?? 'Could not start checkout.'); }); });
  const canDispute = role !== 'ADMIN' && DISPUTABLE.includes(m.state);
  const changesNote = role === 'FREELANCER' && m.state === 'IN_PROGRESS' && m.submission?.note;

  return (
    <li className="rounded-[20px] border border-line p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-hl text-sm font-semibold text-soft">{index + 1}</span>
          <div className="min-w-0"><h3 className="font-semibold">{m.title}</h3><p className="mt-1 text-sm text-ink2">{m.description}</p></div>
        </div>
        <StatusPill tone={ui.tone}>{ui.label}</StatusPill>
      </div>
      <div className="mt-4"><p className="text-xl font-semibold">{naira(m.amount)}</p><p className="text-xs text-ink2">{m.due}</p></div>

      {canReview && m.submission && (
        <div className="mt-4 rounded-[14px] bg-s2 p-4 text-sm">
          <p className="font-semibold">Submitted work (v{m.submission.version})</p><p className="mt-1 text-ink2">{m.submission.message}</p>
          <ul className="mt-2 space-y-1">{m.submission.links.map(l => <li key={l}><a href={l} target="_blank" rel="noopener noreferrer" className="break-all text-soft hover:underline">{l}</a></li>)}</ul>
        </div>)}
      {changesNote && <p className="mt-4 rounded-[14px] bg-warnbg p-4 text-sm text-warn">Changes requested: {m.submission?.note}</p>}
      {m.state === 'DISPUTED' && <p className="mt-4 text-sm text-ink2">A dispute is open on this milestone. See the Disputes page.</p>}

      {(canFund || canPay || canSubmit || canReview || canDispute) && (
        <div className="mt-4 flex flex-wrap gap-3">
          {canPay && <Button type="button" disabled={pending} onClick={pay}>{pending ? 'Opening checkout…' : 'Pay with Kora (test)'}</Button>}
          {canFund && <Button type="button" variant={canPay ? 'outline' : 'primary'} disabled={pending} onClick={() => run(() => devFundMilestoneAction(m.id))}>{pending ? 'Funding…' : 'Fund (simulated)'}</Button>}
          {canSubmit && <Button type="button" onClick={() => toggle('submit')}>{changesNote ? 'Resubmit work' : 'Submit work'}</Button>}
          {canReview && <>
            <Button type="button" disabled={pending} onClick={() => run(() => reviewSubmissionAction({ milestoneId: m.id, decision: 'APPROVE' }))}>{pending ? 'Working…' : 'Approve'}</Button>
            <Button type="button" variant="outline" onClick={() => toggle('changes')}>Request changes</Button></>}
          {canDispute && <Button type="button" variant="outline" onClick={() => toggle('dispute')}>Open dispute</Button>}
          {canFund && <p className="basis-full text-xs text-ink2">Development simulator: no real money moves. Disabled in production.</p>}
        </div>)}

      {panel === 'submit' && (
        <div className="mt-4 space-y-3">
          <Field label="What did you deliver?"><textarea value={text} onChange={e => setText(e.target.value)} rows={3} className={area} placeholder="Describe the work for the client…" /></Field>
          <Field label="Links (one per line, optional)"><textarea value={links} onChange={e => setLinks(e.target.value)} rows={2} className={area} placeholder="https://drive.google.com/…" /></Field>
          <Button type="button" disabled={pending} onClick={() => run(() => submitWorkAction({ milestoneId: m.id, message: text, links }))}>{pending ? 'Submitting…' : 'Send for review'}</Button>
        </div>)}
      {panel === 'changes' && (
        <div className="mt-4 space-y-3">
          <Field label="What should change?"><textarea value={text} onChange={e => setText(e.target.value)} rows={3} className={area} placeholder="Be specific so the freelancer can fix it…" /></Field>
          <Button type="button" disabled={pending} onClick={() => run(() => reviewSubmissionAction({ milestoneId: m.id, decision: 'CHANGES', note: text }))}>{pending ? 'Sending…' : 'Send request'}</Button>
        </div>)}
      {panel === 'dispute' && (
        <div className="mt-4 space-y-3">
          <Field label="What went wrong?"><textarea value={text} onChange={e => setText(e.target.value)} rows={3} className={area} placeholder="Explain the problem. The other party is notified." /></Field>
          <Button type="button" disabled={pending} onClick={() => run(() => openDisputeAction({ milestoneId: m.id, reason: text }))}>{pending ? 'Opening…' : 'Open dispute'}</Button>
        </div>)}
      {error && <p role="alert" className="mt-3 text-sm text-danger">{error}</p>}
    </li>
  );
}
