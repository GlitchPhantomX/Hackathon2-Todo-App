import { NextRequest, NextResponse } from 'next/server';

// Define protected routes
const protectedRoutes = ['/dashboard', '/tasks', '/profile', '/settings', '/new-dashboard'];

// Define auth routes
const authRoutes = ['/login', '/register'];

export function middleware(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    const pathname = request.nextUrl.pathname;

    const isProtectedRoute = protectedRoutes.some(route =>
      pathname.startsWith(route)
    );

    const isAuthRoute = authRoutes.some(route =>
      pathname.startsWith(route)
    );

    if (isProtectedRoute && !token) {
      const url = new URL('/login', request.url);
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }

    if (isAuthRoute && token) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|_next).*)',
  ],
};