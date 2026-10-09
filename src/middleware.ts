import { NextResponse, type NextRequest } from 'next/server';
import { COOKIE, verifySession } from '@/lib/session';

// First gate only. Every page and action re-checks the session and role on the server.
export async function middleware(req: NextRequest) {
  if (!(await verifySession(req.cookies.get(COOKIE)?.value))) return NextResponse.redirect(new URL('/login', req.url));
  return NextResponse.next();
}
export const config = { matcher: ['/dashboard/:path*', '/projects/:path*', '/transactions/:path*', '/disputes/:path*', '/settings/:path*', '/notifications/:path*', '/freelancer/:path*'] };
