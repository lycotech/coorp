import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

export interface CurrentUser {
    userId: number;
    staffNo: string;
    email: string;
    type: string;
}

export async function getCurrentUser(request?: NextRequest): Promise<CurrentUser | null> {
    try {
        let token: string | undefined;
        
        if (request) {
            // Extract from request cookies (for route handlers with explicit request)
            token = request.cookies.get('sessionToken')?.value;
        } else {
            // Extract from Next.js cookies (for route handlers without explicit request)
            const cookieStore = await cookies();
            token = cookieStore.get('sessionToken')?.value;
        }

        if (!token) {
            return null;
        }

        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            console.error('JWT_SECRET is not defined in environment variables.');
            return null;
        }

        // Verify the token using jose
        const secret = new TextEncoder().encode(jwtSecret);
        const { payload } = await jwtVerify(token, secret);

        // Return the user data from the token payload
        const userData: CurrentUser = {
            userId: payload.userId as number,
            staffNo: payload.staffNo as string,
            email: payload.email as string,
            type: payload.type as string,
        };

        // Basic validation: Check if essential data is present
        if (!userData.userId || !userData.staffNo || !userData.email || !userData.type) {
            console.error('JWT payload missing expected fields.', payload);
            return null;
        }

        return userData;

    } catch (error) {
        console.error('Failed to get current user:', error);
        return null;
    }
}

export async function requireAuth(request?: NextRequest): Promise<CurrentUser> {
    const user = await getCurrentUser(request);
    if (!user) {
        throw new Error('Unauthorized: Authentication required');
    }
    return user;
}
