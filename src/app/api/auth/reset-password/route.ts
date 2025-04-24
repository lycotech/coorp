import { NextRequest, NextResponse } from 'next/server';
import { getDbPool } from '@/lib/db';
import bcrypt from 'bcrypt';
import mysql from 'mysql2/promise';

export async function POST(request: NextRequest) {
    let connection;
    try {
        const { token, newPassword } = await request.json();

        if (!token || !newPassword) {
            return NextResponse.json({ error: 'Token and new password are required' }, { status: 400 });
        }

        if (newPassword.length < 6) {
             return NextResponse.json({ error: 'Password must be at least 6 characters long' }, { status: 400 });
        }

        const pool = getDbPool();
        if (!pool) {
            return NextResponse.json({ error: 'Database connection error' }, { status: 500 });
        }
        connection = await pool.getConnection();

        // Find user by the reset token
        const [users] = await connection.query<mysql.RowDataPacket[]>(
            'SELECT id, token_expiry FROM USERS WHERE reset_token = ?',
            [token]
        );

        if (users.length === 0) {
            return NextResponse.json({ error: 'Invalid or expired reset token' }, { status: 400 });
        }

        const user = users[0];

        // Check if token is expired
        const now = new Date();
        const expiryDate = user.token_expiry ? new Date(user.token_expiry) : null;

        if (!expiryDate || expiryDate <= now) {
             // Optionally clear the expired token from DB
             await connection.query('UPDATE USERS SET reset_token = NULL, token_expiry = NULL WHERE id = ?', [user.id]);
            return NextResponse.json({ error: 'Invalid or expired reset token' }, { status: 400 });
        }

        // Hash the new password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        // Update password and clear token fields
        await connection.query(
            'UPDATE USERS SET password = ?, reset_token = NULL, token_expiry = NULL WHERE id = ?',
            [hashedPassword, user.id]
        );

        return NextResponse.json({ message: 'Password reset successfully' }, { status: 200 });

    } catch (error) {
        console.error('Reset password failed:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    } finally {
        if (connection) {
            connection.release();
        }
    }
} 