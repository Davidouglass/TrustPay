import Link from 'next/link';
import { Frame } from '@/components/layout/Frame';
import { requireRole } from '@/lib/auth';
import { NewProjectForm } from '@/components/project/NewProjectForm';

export const dynamic = 'force-dynamic';

export default async function NewProjectPage() {
  await requireRole('CLIENT');
  return <Frame title="New project"><Link href="/projects" className="text-sm text-ink2 hover:text-white">← All projects</Link><NewProjectForm /></Frame>;
}
