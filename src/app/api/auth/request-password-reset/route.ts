import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getDbPool } from '@/lib/db';
import mysql from 'mysql2/promise';

// Function to generate a secure token
function generateResetToken(): string {
    return crypto.randomBytes(32).toString('hex');
}

export async function POST(request: NextRequest) {
    let connection;
    try {
        const { identifier } = await request.json();

        if (!identifier) {
            return NextResponse.json({ error: 'Identifier (email or staff number) is required' }, { status: 400 });
        }

        const pool = getDbPool();
        if (!pool) {
            return NextResponse.json({ error: 'Database connection error' }, { status: 500 });
        }
        connection = await pool.getConnection();

        // Find user by staff_no or email
        const [users] = await connection.query<mysql.RowDataPacket[]>(
            'SELECT id, email FROM USERS WHERE staff_no = ? OR email = ?',
            [identifier, identifier]
        );

        // --- Important Security Note --- 
        // ALWAYS return a generic success message, even if the user is not found.
        // This prevents attackers from guessing valid usernames/emails.

        if (users.length > 0) {
            const user = users[0];
            const resetToken = generateResetToken();
            const tokenExpiry = new Date(Date.now() + 3600000); // Token valid for 1 hour

            try {
                // Update user record with token and expiry
                await connection.query(
                    'UPDATE USERS SET reset_token = ?, token_expiry = ? WHERE id = ?',
                    [resetToken, tokenExpiry, user.id]
                );

                // --- Placeholder for Email Sending --- 
                // In a real application, send an email here.
                const resetUrl = `${request.nextUrl.origin}/reset-password?token=${resetToken}`;
                console.log(`---- PASSWORD RESET (DEV ONLY) ----`);
                console.log(`User Email: ${user.email}`); // Log email for dev convenience
                console.log(`Reset Link: ${resetUrl}`);
                console.log(`---- ------------------------- ----`);
                // Email content would include the resetUrl.
                // Example: sendPasswordResetEmail(user.email, resetUrl);

            } catch (updateError) {
                console.error('Failed to update user with reset token:', updateError);
                // Even if update fails, return generic success to client
                // Log the internal error for investigation.
            }
        }
         else {
            console.log(`Password reset requested for non-existent identifier: ${identifier}`);
         }

        // Always return success to the client
        return NextResponse.json({ message: 'If an account exists, a password reset link has been sent.' }, { status: 200 });

    } catch (error) {
        console.error('Request password reset failed:', error);
        // Return a generic server error message, but the client-side should still show the standard success message
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    } finally {
        if (connection) {
            connection.release();
        }
    }
} 