import { NextRequest, NextResponse } from 'next/server';

// Define protected routes
const protectedRoutes = ['/dashboard', '/tasks', '/profile', '/settings'];

// Define auth routes (routes that are only accessible when not authenticated)
const authRoutes = ['/login', '/register'];

export function middleware(request: NextRequest) {
  // Get the token from cookies
  const token = request.cookies.get('token')?.value;

  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some(route =>
    request.nextUrl.pathname.startsWith(route)
  );

  // Check if the current path is an auth route
  const isAuthRoute = authRoutes.some(route =>
    request.nextUrl.pathname.startsWith(route)
  );

  // If user is trying to access a protected route but is not authenticated
  if (isProtectedRoute && !token) {
    // Redirect to login page
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.search = `?redirect=${request.nextUrl.pathname}`;
    return NextResponse.redirect(url);
  }

  // If user is authenticated but trying to access an auth route (like login/signup)
  if (isAuthRoute && token) {
    // Redirect to dashboard
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  // Allow the request to continue
  return NextResponse.next();
}

// Configure which routes the middleware should run for
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};