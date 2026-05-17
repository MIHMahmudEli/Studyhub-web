import { NextResponse } from 'next/server';

export function middleware(request) {
  const refreshToken = request.cookies.get('refresh_token');

  // If there's no refresh_token cookie, the user is likely not logged in
  if (!refreshToken) {
    const loginUrl = new URL('/auth', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Define which routes should be protected by this middleware
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/settings/:path*',
    '/notes/:path*',
    '/upload/:path*',
    '/bookmarks/:path*',
    '/resources/:path*',
    '/leaderboard/:path*',
  ],
};
