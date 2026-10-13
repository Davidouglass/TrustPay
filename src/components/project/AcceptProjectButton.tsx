'use client';
import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/primitives';
import { acceptProjectAction } from '@/app/(app)/projects/actions';

export function AcceptProjectButton({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string>();
  const [pending, start] = useTransition();
  const onClick = () => start(() => { void acceptProjectAction(projectId).then(r => (r?.error ? setError(r.error) : router.refresh())); });
  return (
    <div>
      <Button type="button" disabled={pending} onClick={onClick} className="w-full sm:w-auto">{pending ? 'Accepting…' : 'Accept project'}</Button>
      {error && <p role="alert" className="mt-2 text-sm text-danger">{error} {error.includes('Settings') && <Link href="/settings" className="font-semibold text-soft underline">Open Settings</Link>}</p>}
    </div>
  );
}
