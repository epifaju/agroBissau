import { withAuth } from 'next-auth/middleware';

export default withAuth(
  function middleware(req) {
    // Additional middleware logic can be added here
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
  matcher: ['/dashboard/:path*', '/admin/:path*'],
};

