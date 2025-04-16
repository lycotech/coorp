import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose'; // Use jose for Edge runtime compatibility

const SECRET_KEY = process.env.JWT_SECRET;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  console.log(`--- Middleware invoked for path: ${pathname} ---`);

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

    console.log(`Middleware: Accessing ${pathname}`); // Log accessed path

    if (!token) {
      console.log('Middleware: No sessionToken cookie found. Redirecting to login.');
      return NextResponse.redirect(loginUrl);
    }

    // Log token presence and part of its value
    console.log(`Middleware: Found sessionToken cookie. Value starts with: ${token.substring(0, 10)}...`);

    if (!SECRET_KEY) {
        console.error('Middleware: JWT_SECRET is not defined in environment! Redirecting to login.');
        // Clear potentially invalid cookie if secret is missing
        const response = NextResponse.redirect(loginUrl);
        response.cookies.delete('sessionToken');
        return response;
    }

    // Log secret presence
    console.log(`Middleware: JWT_SECRET is available. Starts with: ${SECRET_KEY.substring(0, 5)}...`);

    try {
      const secret = new TextEncoder().encode(SECRET_KEY);
      // Verify the token
      const { payload } = await jwtVerify(token, secret);
      console.log('Middleware: Token verified successfully. Payload:', payload);
      return NextResponse.next(); // Token is valid, proceed
    } catch (error) { // Catch error as unknown
      let errorMessage = "Unknown error";
      let errorName = "UnknownError";
      if (error instanceof Error) { // Check if it's an Error instance
          errorMessage = error.message;
          errorName = error.name;
      } else if (typeof error === 'string') { // Handle string errors
          errorMessage = error;
      } else if (error && typeof error === 'object' && 'message' in error) {
          // Handle cases where error might be an object with a message property
          errorMessage = String(error.message);
          if ('name' in error && typeof error.name === 'string') {
              errorName = error.name;
          }
      }
      console.error(`Middleware: Token verification failed. Error: ${errorName} - ${errorMessage}. Redirecting to login.`);
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
 