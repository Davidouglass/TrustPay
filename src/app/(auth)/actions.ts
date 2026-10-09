'use server';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { startSession, endSession } from '@/lib/auth';

export type FormState = { error?: string } | undefined;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 10); // keeps login timing similar when the email is unknown
const home = (role: string) => (role === 'FREELANCER' ? '/freelancer' : '/dashboard');

export async function registerAction(fd: FormData): Promise<FormState> {
  const name = String(fd.get('name') ?? '').trim();
  const email = String(fd.get('email') ?? '').trim().toLowerCase();
  const password = String(fd.get('password') ?? '');
  const role = fd.get('role');
  if (name.length < 2) return { error: 'Enter your full name.' };
  if (!EMAIL.test(email)) return { error: 'Enter a valid email address.' };
  if (password.length < 8) return { error: 'Password must be at least 8 characters.' };
  if (role !== 'CLIENT' && role !== 'FREELANCER') return { error: 'Choose client or freelancer.' };
  if (await prisma.user.findUnique({ where: { email } })) return { error: 'An account with this email already exists.' };
  let user;
  try { user = await prisma.user.create({ data: { name, email, role, passwordHash: await bcrypt.hash(password, 10) } }); }
  catch { return { error: 'Could not create the account. Please try again.' }; }
  await startSession(user.id, user.role);
  redirect(home(user.role));
}

export async function loginAction(fd: FormData): Promise<FormState> {
  const email = String(fd.get('email') ?? '').trim().toLowerCase();
  const password = String(fd.get('password') ?? '');
  const user = await prisma.user.findUnique({ where: { email } });
  const ok = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !ok) return { error: 'Invalid email or password.' };
  await startSession(user.id, user.role);
  redirect(home(user.role));
}

export async function logoutAction() {
  endSession();
  redirect('/');
}
