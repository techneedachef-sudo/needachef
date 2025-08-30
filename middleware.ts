import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { USER_COOKIE_NAME } from '@/utils/constants';
import { getJwtPayload } from './app/api/auth/_lib/auth-utils';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(USER_COOKIE_NAME)?.value;

  // Helper function to handle unauthorized access
  const handleUnauthorized = () => {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.search = `redirect=${pathname}`; // Pass original path for redirection after login
    return NextResponse.redirect(url);
  };

  // Helper function to handle forbidden access
  const handleForbidden = (loginPath: string) => {
    const url = request.nextUrl.clone();
    url.pathname = loginPath;
    url.search = `error=forbidden`;
    return NextResponse.redirect(url);
  }

  // Protect /admin routes

  if (pathname.startsWith("/admin")) {
    if (!token) {
      return handleUnauthorized();
    }
    try {
      const payload = await getJwtPayload(token);
      if (!payload || (payload.role as string).toLowerCase() !== 'admin') {
        return handleForbidden('/login');
      }
    } catch (err) {
      const response = handleUnauthorized();
      response.cookies.delete(USER_COOKIE_NAME);
      return response;
    }
  }

  // Protect /dashboard routes (for regular users)
  if (pathname.startsWith('/dashboard')) {
    if (!token) {
      return handleUnauthorized();
    }
    try {
      const payload = await getJwtPayload(token);
      if (payload) {
        if ((payload.role as string).toLowerCase() === 'admin') {
          return NextResponse.redirect(new URL('/admin/dashboard', request.url));
        }
        if ((payload.role as string).toLowerCase() === 'partner') {
          return NextResponse.redirect(new URL('/partner/dashboard', request.url));
        }
      }
    } catch (err) {
      const response = handleUnauthorized();
      response.cookies.delete(USER_COOKIE_NAME);
      return response;
    }
  }

  // Protect /partner routes
  if (pathname.startsWith('/partner')) {
    // Allow access to the login page itself
    if (pathname.startsWith('/login')) {
      return NextResponse.next();
    }

    if (!token) {
      return handleUnauthorized();
    }

    try {
      const payload = await getJwtPayload(token);
      if (!payload || (payload.role as string).toLowerCase() !== 'partner') {
        return handleForbidden('/login');
      }
    } catch (err) {
      const response = handleUnauthorized();
      response.cookies.delete(USER_COOKIE_NAME);
      return response;
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*", "/partner/:path*"],
};