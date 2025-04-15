import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers'; // Import cookies from next/headers for Route Handlers

// Interface for the expected JWT payload
interface DecodedToken {
    userId: number;
    staffNo: string;
    email: string;
    type: string; // User role (login_type)
    iat: number;
    exp: number;
}

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
        // Verify the token
        const decoded = jwt.verify(token, jwtSecret) as DecodedToken;

        // Return the user data from the token payload
        // Exclude sensitive or unnecessary info like iat, exp for the client
        const userData = {
            userId: decoded.userId,
            staffNo: decoded.staffNo,
            email: decoded.email,
            type: decoded.type,
        };

        return NextResponse.json(userData, { status: 200 });

    } catch (error) {
        console.error('Failed to verify token:', error);
        // Handle specific errors like token expiry if needed
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
    }
} 