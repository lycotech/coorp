import { NextRequest, NextResponse } from 'next/server';
import { getDbPool } from '@/lib/db';
import mysql from 'mysql2/promise';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

// GET: Fetch current contribution for the member
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
        
        if (!payload.staffNo) {
            console.error('Token payload missing staffNo:', payload);
            return NextResponse.json({ error: 'Invalid token: Missing staff number' }, { status: 401 });
        }
        
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

        // First get the member's reg_no from staff_no
        const [memberRows] = await connection.execute<mysql.RowDataPacket[]>(
            'SELECT reg_no FROM MEMBERS WHERE staff_no = ? LIMIT 1',
            [staffNo]
        );

        if (memberRows.length === 0) {
            return NextResponse.json({ error: 'Member not found' }, { status: 404 });
        }

        const regNo = memberRows[0].reg_no;

        // Get contribution transaction type ID
        const [transactionTypeRows] = await connection.execute<mysql.RowDataPacket[]>(
            'SELECT id FROM TRANSACTION_TYPES WHERE type_name = ? LIMIT 1',
            ['Contribution']
        );

        if (transactionTypeRows.length === 0) {
            return NextResponse.json({ error: 'Contribution transaction type not found' }, { status: 500 });
        }

        const transactionTypeId = transactionTypeRows[0].id;

        // Get current balance
        const [balanceRows] = await connection.execute<mysql.RowDataPacket[]>(
            'SELECT current_balance FROM MEMBER_BALANCES WHERE reg_no = ? AND transaction_type_id = ? LIMIT 1',
            [regNo, transactionTypeId]
        );

        // Get current monthly contribution amount
        // Look for the most recent transaction to determine monthly contribution
        const [contributionRows] = await connection.execute<mysql.RowDataPacket[]>(
            `SELECT amount FROM TRANSACTIONS 
             WHERE reg_no = ? AND transaction_type_id = ? 
             ORDER BY transaction_date DESC LIMIT 1`,
            [regNo, transactionTypeId]
        );

        const contributionAmount = contributionRows.length > 0 ? contributionRows[0].amount : 0;
        const balance = balanceRows.length > 0 ? balanceRows[0].current_balance : 0;

        return NextResponse.json({
            amount: contributionAmount,
            balance: balance,
            transactionTypeId: transactionTypeId
        }, { status: 200 });

    } catch (error) {
        console.error('Error fetching contribution data:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    } finally {
        if (connection) {
            connection.release();
        }
    }
} 