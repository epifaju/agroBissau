import { withAuth } from 'next-auth/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { getLocale } from '@/lib/i18n-config';

export default withAuth(
  function middleware(req) {
    // Set locale cookie if not present
    const locale = getLocale(req);
    const response = NextResponse.next();
    
    // Set locale cookie for next-intl
    if (!req.cookies.get('NEXT_LOCALE')) {
      response.cookies.set('NEXT_LOCALE', locale, {
        path: '/',
        maxAge: 31536000, // 1 year
        sameSite: 'lax',
      });
    }

    return response;
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        if (req.nextUrl.pathname.startsWith('/dashboard')) {
          return !!token;
        }
        if (req.nextUrl.pathname.startsWith('/admin')) {
          return token?.role === 'ADMIN';
        }
        return true;
      },
    },
  }
);

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/((?!api|_next|_vercel|.*\\..*).*)'],
};

