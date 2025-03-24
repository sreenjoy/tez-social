import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname;
  
  // Check if the path is a public path that doesn't need authentication
  const isPublicPath = path === '/auth/login' || 
                       path === '/auth/register' || 
                       path === '/' || 
                       path.startsWith('/api/');

  // Get the token from the cookie
  const isAuthenticated = request.cookies.has('user');

  // If the user is on a protected path and not authenticated, redirect to login
  if (!isPublicPath && !isAuthenticated) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
  
  // If the user is authenticated and trying to access auth pages, redirect to dashboard
  if (isAuthenticated && (path === '/auth/login' || path === '/auth/register')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // Otherwise, continue with the request
  return NextResponse.next();
}

// Only run middleware on the following paths
export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /_static (inside /public)
     * 4. all root files inside /public (e.g. /favicon.ico)
     */
    '/((?!_next|_static|_vercel|[\\w-]+\\.\\w+).*)',
  ],
}; 