import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from '@/lib/auth';

const protectedRoutes = ['/', '/admin', '/daily-quiz'];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtectedRoute = protectedRoutes.some((route) => 
    pathname === route || pathname.startsWith('/category/')
  );

  if (isProtectedRoute) {
    const session = request.cookies.get('session')?.value;
    let payload = null;

    if (session) {
      payload = await decrypt(session);
    }

    if (!session || !payload) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Admin only route protection
    if (pathname.startsWith('/admin') && payload.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Redirect logged-in users away from auth pages
  if (pathname === '/login' || pathname === '/register') {
    const session = request.cookies.get('session')?.value;
    if (session) {
      const payload = await decrypt(session);
      if (payload) {
        return NextResponse.redirect(new URL('/', request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
