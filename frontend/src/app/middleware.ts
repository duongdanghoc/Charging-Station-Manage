import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  sub: string;
  id: number;
  name: string;
  role: string;
  exp: number;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get token from cookie or header
  const token = request.cookies.get('authToken')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '');

  console.log(`[Middleware] Path: ${pathname}, Has token: ${!!token}`);

  // Public routes - no authentication needed
  const publicRoutes = [
    '/login',
    '/register', 
    '/forgot-password',
    '/reset-password',
    '/',
    '/about',
    '/contact'
  ];

  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(route));

  // If no token and trying to access protected route
  if (!token && !isPublicRoute) {
    console.log(`[Middleware] ❌ No token, redirecting to /login`);
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If has token, verify and check role-based access
  if (token) {
    try {
      const decoded = jwtDecode<JwtPayload>(token);
      const now = Date.now() / 1000;

      // Check if token expired
      if (decoded.exp < now) {
        console.log(`[Middleware] ❌ Token expired, redirecting to /login`);
        const response = NextResponse.redirect(new URL('/login', request.url));
        response.cookies.delete('authToken');
        return response;
      }

      const normalizedRole = decoded.role.toUpperCase().replace('ROLE_', '');
      console.log(`[Middleware] ✅ Valid token, role: ${normalizedRole}`);

      // Redirect authenticated users away from public routes
      if (pathname === '/login' || pathname === '/register') {
        let redirectPath = '/';
        
        switch (normalizedRole) {
          case 'ADMIN':
            redirectPath = '/admin';
            break;
          case 'VENDOR':
            redirectPath = '/vendor/dashboard';
            break;
          case 'CUSTOMER':
            redirectPath = '/customer/dashboard';
            break;
        }
        
        console.log(`[Middleware] 🔄 Already logged in, redirecting to ${redirectPath}`);
        return NextResponse.redirect(new URL(redirectPath, request.url));
      }

      // Role-based access control
      if (pathname.startsWith('/admin') && normalizedRole !== 'ADMIN') {
        console.log(`[Middleware] ❌ Unauthorized access to /admin`);
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }

      if (pathname.startsWith('/vendor') && normalizedRole !== 'VENDOR' && normalizedRole !== 'ADMIN') {
        console.log(`[Middleware] ❌ Unauthorized access to /vendor`);
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }

      if (pathname.startsWith('/customer') && normalizedRole !== 'CUSTOMER' && normalizedRole !== 'ADMIN') {
        console.log(`[Middleware] ❌ Unauthorized access to /customer`);
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }

    } catch (error) {
      console.error('[Middleware] ❌ Token decode error:', error);
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('authToken');
      return response;
    }
  }

  console.log(`[Middleware] ✅ Allowed access to ${pathname}`);
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
