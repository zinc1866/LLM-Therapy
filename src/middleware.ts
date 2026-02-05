import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Check instructor routes
    if (path.startsWith('/instructor') && token?.role !== 'INSTRUCTOR') {
      return NextResponse.redirect(new URL('/student', req.url));
    }

    // Check student routes
    if (path.startsWith('/student') && token?.role !== 'STUDENT') {
      return NextResponse.redirect(new URL('/instructor', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ['/instructor/:path*', '/student/:path*'],
};
