import 'server-only';
import { cache } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { COOKIE, signSession, verifySession, type Session } from '@/lib/session';

const DAYS = 7;
export async function startSession(uid: string, role: Session['role']) {
  const exp = Date.now() + DAYS * 864e5;
  cookies().set(COOKIE, await signSession({ uid, role, exp }), { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', expires: new Date(exp) });
}
export const endSession = () => cookies().delete(COOKIE);
export const getSession = cache(async () => verifySession(cookies().get(COOKIE)?.value));

/** The signed-in user, always re-read from the database (role comes from the DB, never from the cookie). */
export const getCurrentUser = cache(async () => {
  const s = await getSession();
  if (!s) redirect('/login');
  const user = await prisma.user.findUnique({ where: { id: s.uid } });
  if (!user) redirect('/login');
  return user;
});

/** Server-side role gate. Wrong role -> sent to their own dashboard. */
export async function requireRole(role: 'CLIENT' | 'FREELANCER') {
  const user = await getCurrentUser();
  if (user.role !== role) redirect(user.role === 'FREELANCER' ? '/freelancer' : '/dashboard');
  return user;
}
