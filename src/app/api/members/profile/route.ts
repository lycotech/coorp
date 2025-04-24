import { NextRequest, NextResponse } from 'next/server';
import { getDbPool } from '@/lib/db';
import mysql from 'mysql2/promise';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

// GET: Fetch user profile
export async function GET() {
    const cookieStore = await cookies();
    const token = cookieStore.get('sessionToken')?.value;

    if (!token) {
        return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        console.error('JWT_SECRET is not defined in environment variables.');
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }

    let staffNo;
    try {
        const secret = new TextEncoder().encode(jwtSecret);
        const { payload } = await jwtVerify(token, secret);
        staffNo = payload.staffNo as string;
    } catch (error) {
        console.error('Token verification failed:', error);
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    let connection: mysql.PoolConnection | null = null;

    try {
        const pool = getDbPool();
        if (!pool) {
            throw new Error('Database pool is not available');
        }
        
        connection = await pool.getConnection();

        // Fetch member details
        const [memberRows] = await connection.execute<mysql.RowDataPacket[]>(
            'SELECT * FROM MEMBERS WHERE staff_no = ? LIMIT 1',
            [staffNo]
        );

        if (memberRows.length === 0) {
            return NextResponse.json({ error: 'Member not found' }, { status: 404 });
        }

        return NextResponse.json({ member: memberRows[0] }, { status: 200 });

    } catch (error) {
        console.error('Error fetching member profile:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    } finally {
        if (connection) {
            connection.release();
        }
    }
}

// PUT: Update user profile
export async function PUT(request: NextRequest) {
    const cookieStore = await cookies();
    const token = cookieStore.get('sessionToken')?.value;

    if (!token) {
        return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        console.error('JWT_SECRET is not defined in environment variables.');
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }

    let staffNo;
    try {
        const secret = new TextEncoder().encode(jwtSecret);
        const { payload } = await jwtVerify(token, secret);
        staffNo = payload.staffNo as string;
    } catch (error) {
        console.error('Token verification failed:', error);
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    let connection: mysql.PoolConnection | null = null;

    try {
        const data = await request.json();
        
        const pool = getDbPool();
        if (!pool) {
            throw new Error('Database pool is not available');
        }
        
        connection = await pool.getConnection();

        // Verify member exists
        const [memberRows] = await connection.execute<mysql.RowDataPacket[]>(
            'SELECT id FROM MEMBERS WHERE staff_no = ? LIMIT 1',
            [staffNo]
        );

        if (memberRows.length === 0) {
            return NextResponse.json({ error: 'Member not found' }, { status: 404 });
        }

        // Update only allowed fields (prevent updating sensitive fields)
        const allowedFields = [
            'email', 'firstname', 'surname', 'gender', 'dob', 'mobile_no', 
            'state_of_origin', 'bank_name', 'acct_no'
        ];

        const updateData: Record<string, unknown> = {};
        for (const field of allowedFields) {
            if (data[field] !== undefined) {
                updateData[field] = data[field];
            }
        }

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
        }

        // Build update query
        const fields = Object.keys(updateData).map(field => `${field} = ?`).join(', ');
        const values = Object.values(updateData);
        values.push(staffNo); // Add staffNo for WHERE clause

        await connection.execute(
            `UPDATE MEMBERS SET ${fields}, last_profile_update = CURRENT_DATE() WHERE staff_no = ?`,
            values
        );

        return NextResponse.json({ success: true, message: 'Profile updated successfully' }, { status: 200 });

    } catch (error) {
        console.error('Error updating member profile:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    } finally {
        if (connection) {
            connection.release();
        }
    }
} 