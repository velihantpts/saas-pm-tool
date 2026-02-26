import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

const publicPaths = ['/login', '/register', '/forgot-password', '/reset-password', '/invite'];

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Allow public paths and API auth routes
  if (publicPaths.some((p) => pathname.startsWith(p)) || pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  // Redirect unauthenticated users to login
  if (!req.auth) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|manifest.json|icon-|og-).*)'],
};
