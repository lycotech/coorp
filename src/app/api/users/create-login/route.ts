import { NextRequest, NextResponse } from 'next/server';
import { getDbPool } from '@/lib/db';
import bcrypt from 'bcrypt';
import mysql from 'mysql2/promise';

export async function POST(request: NextRequest) {
    let connection: mysql.PoolConnection | null = null;
    try {
        const {
            staff_no,
            email,
            password,
            login_type,
            // Add adminPassword for verification if needed
        } = await request.json();

        // Basic validation
        if (!staff_no || !email || !password || !login_type) {
            return NextResponse.json({ error: 'Missing required fields (staff_no, email, password, login_type)' }, { status: 400 });
        }

        // TODO: Add admin password verification step here if required

        const pool = getDbPool();
        connection = await pool.getConnection();
        await connection.beginTransaction();

        // Check if user login already exists
        const [existingUsers] = await connection.query<mysql.RowDataPacket[]>(
            'SELECT id FROM USERS WHERE staff_no = ? OR email = ? LIMIT 1',
            [staff_no, email]
        );

        if (existingUsers.length > 0) {
            await connection.rollback();
            return NextResponse.json({ error: 'A user login already exists for this Staff Number or Email.' }, { status: 409 }); // 409 Conflict
        }

        // Check if member exists (optional but good practice)
         const [existingMembers] = await connection.query<mysql.RowDataPacket[]>(
            'SELECT id FROM MEMBERS WHERE staff_no = ? LIMIT 1',
            [staff_no]
        );
        if (existingMembers.length === 0) {
             await connection.rollback();
            return NextResponse.json({ error: 'Cannot create login: Member record not found for this Staff Number.' }, { status: 404 });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user login
        const userData = {
            staff_no: staff_no,
            email: email,
            password: hashedPassword,
            login_type: login_type,
            login_status: 'Active', // Default to Active for new logins?
        };
        await connection.query('INSERT INTO USERS SET ?', userData);

        await connection.commit();

        return NextResponse.json({ message: 'User login created successfully' }, { status: 201 });

    } catch (error) {
        console.error('Create login failed:', error);
        if (connection) {
           try { await connection.rollback(); } catch (rbError) { console.error('Rollback Error:', rbError); }
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    } finally {
        if (connection) {
            connection.release();
        }
    }
} 