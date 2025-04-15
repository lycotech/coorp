import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose'; // Use jose for Edge runtime compatibility

const SECRET_KEY = process.env.JWT_SECRET;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for API routes, static files, login, register etc.
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') || // Assume files with extensions are static assets
    pathname === '/login' ||
    pathname === '/register'
  ) {
    return NextResponse.next();
  }

  // Check for token only on dashboard routes
  if (pathname.startsWith('/dashboard')) {
    const token = request.cookies.get('sessionToken')?.value;
    const loginUrl = new URL('/login', request.url);

    if (!token) {
      console.log('Middleware: No token found, redirecting to login.');
      return NextResponse.redirect(loginUrl);
    }

    if (!SECRET_KEY) {
        console.error('Middleware: JWT_SECRET is not defined!');
        // Handle this case appropriately - maybe redirect to an error page or login
        return NextResponse.redirect(loginUrl);
    }

    try {
      const secret = new TextEncoder().encode(SECRET_KEY);
      // Verify the token
      await jwtVerify(token, secret);
      // console.log('Middleware: Token verified successfully.');
      return NextResponse.next(); // Token is valid, proceed
    } catch (error) {
      console.error('Middleware: Invalid token:', error);
      // If token is invalid or expired, redirect to login
      // Clear the invalid cookie before redirecting
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete('sessionToken');
      return response;
    }
  }

  // Allow other paths (like the home page '/' if you have one) to pass through
  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)', // Apply middleware to most paths
  ],
};
 