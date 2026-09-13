import { NextResponse } from 'next/server';

export function middleware(request) {
  const token   = request.cookies.get('ems_token')?.value
                || request.headers.get('authorization')?.replace('Bearer ','');
  const { pathname } = request.nextUrl;

  // Public routes - always accessible
  const publicRoutes = ['/', '/login', '/register', '/forgot-password',
                        '/verify-email', '/events', '/payment/success', '/payment/failure'];
  const isPublic = publicRoutes.some(r => pathname === r || pathname.startsWith('/events/'));
  if (isPublic) return NextResponse.next();

  // Protected routes - check localStorage on client side
  // Middleware runs on edge, so we rely on client-side auth guards
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|icons|images|sw.js|manifest.json).*)'],
};
