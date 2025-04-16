import { NextResponse } from 'next/server';
// import jwt from 'jsonwebtoken'; // Remove jsonwebtoken
import { jwtVerify } from 'jose'; // Import jose
import { cookies } from 'next/headers'; // Import cookies from next/headers for Route Handlers

// Interface for the expected JWT payload (align with login route and middleware)
// We can use jose's JWTPayload and add our custom fields if needed, or just access directly
/* Remove interface
interface DecodedToken {
    userId: number;
    staffNo: string;
    email: string;
    type: string; // User role (login_type)
    iat: number;
    exp: number;
}
*/

export async function GET() {
    // Await the cookie store before accessing it
    const cookieStore = await cookies(); 
    const token = cookieStore.get('sessionToken')?.value;

    if (!token) {
        return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        console.error('JWT_SECRET is not defined in environment variables.');
        return NextResponse.json({ error: 'Internal Server Configuration Error' }, { status: 500 });
    }

    try {
        // Verify the token using jose
        // const decoded = jwt.verify(token, jwtSecret) as DecodedToken;
        const secret = new TextEncoder().encode(jwtSecret);
        const { payload } = await jwtVerify(token, secret);

        // Return the user data from the token payload
        // Access payload properties directly
        const userData = {
            userId: payload.userId as number, // Cast based on expected type
            staffNo: payload.staffNo as string,
            email: payload.email as string,
            type: payload.type as string,
        };

        // Basic validation: Check if essential data is present
        if (!userData.userId || !userData.staffNo || !userData.email || !userData.type) {
            console.error('/api/auth/me: JWT payload missing expected fields.', payload);
            return NextResponse.json({ error: 'Internal Server Error: Invalid token payload' }, { status: 500 });
        }

        return NextResponse.json(userData, { status: 200 });

    } catch (error) {
        console.error('Failed to verify token in /api/auth/me:', error);
        // Handle specific errors like token expiry if needed
        // Jose errors often have a 'code' property (e.g., 'ERR_JWT_EXPIRED')
        // We can check error.name or error.code if available
        let status = 500;
        let message = 'Internal Server Error';

        if (error instanceof Error) {
            // Check jose error codes for specific handling
            // Safely check if 'code' property exists and is a string
            const joseErrorCode = (typeof error === 'object' && error !== null && 'code' in error && typeof error.code === 'string') ? error.code : undefined;

            if (joseErrorCode === 'ERR_JWT_EXPIRED') {
                status = 401;
                message = 'Unauthorized: Token expired';
                const response = NextResponse.json({ error: message }, { status });
                response.cookies.delete('sessionToken');
                return response;
            } else if (joseErrorCode === 'ERR_JWS_INVALID' || joseErrorCode === 'ERR_JWS_SIGNATURE_VERIFICATION_FAILED' || joseErrorCode === 'ERR_JWT_CLAIM_VALIDATION_FAILED') {
                 status = 401;
                 message = 'Unauthorized: Invalid token';
            } else {
                 message = error.message; // Use generic error message for other errors
            }
        } else {
            message = 'An unknown error occurred during token verification';
        }

        return NextResponse.json({ error: message }, { status });
        /* Old error handling
        if (error instanceof jwt.TokenExpiredError) {
            // Create the response first, then modify cookies
            const response = NextResponse.json({ error: 'Unauthorized: Token expired' }, { status: 401 });
            response.cookies.delete('sessionToken');
            return response;
        }
        if (error instanceof jwt.JsonWebTokenError) {
            return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
        */
    }
} 