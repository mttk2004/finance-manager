import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const passwordStatus = request.cookies.get('auth_status')?.value;
  const path = request.nextUrl.pathname;
  
  if (path.startsWith('/_next') || path.startsWith('/static') || path.startsWith('/api')) {
    return NextResponse.next();
  }
  
  if (path === '/login') {
    if (passwordStatus === 'authenticated') {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  if (passwordStatus !== 'authenticated') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
