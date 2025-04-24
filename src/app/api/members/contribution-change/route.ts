import { NextRequest, NextResponse } from 'next/server';
import { getDbPool } from '@/lib/db';
import mysql from 'mysql2/promise';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

// POST: Submit contribution change request
export async function POST(request: NextRequest) {
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
        // Verify token and extract staffNo
        const secret = new TextEncoder().encode(jwtSecret);
        const { payload } = await jwtVerify(token, secret);
        
        if (!payload.staffNo) {
            console.error('Token payload missing staffNo:', payload);
            return NextResponse.json({ error: 'Invalid token: Missing staff number' }, { status: 401 });
        }
        
        staffNo = payload.staffNo as string;
    } catch (error) {
        console.error('Token verification failed:', error);
        
        // Handle specific JWT errors
        const status = 401;
        let message = 'Invalid credentials';

        if (error instanceof Error) {
            // Check jose error codes for specific handling
            const joseErrorCode = (typeof error === 'object' && error !== null && 'code' in error && typeof error.code === 'string') ? error.code : undefined;

            if (joseErrorCode === 'ERR_JWT_EXPIRED') {
                message = 'Session expired. Please login again.';
                // Clear the cookie
                const response = NextResponse.json({ error: message }, { status });
                response.cookies.delete('sessionToken');
                return response;
            } else if (joseErrorCode === 'ERR_JWS_INVALID' || joseErrorCode === 'ERR_JWS_SIGNATURE_VERIFICATION_FAILED') {
                message = 'Invalid session token. Please login again.';
            }
        }
        
        return NextResponse.json({ error: message }, { status });
    }

    let connection: mysql.PoolConnection | null = null;

    try {
        const data = await request.json();
        
        // Validate request body
        if (!data.newContribution || isNaN(data.newContribution)) {
            return NextResponse.json({ error: 'Invalid contribution amount' }, { status: 400 });
        }

        // If they have loan, ensure loan reference is provided
        if (data.hasLoan && !data.loanRefNo) {
            return NextResponse.json({ error: 'Loan reference number is required' }, { status: 400 });
        }

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

        // Determine transaction type ID for contribution
        const [transactionTypeRows] = await connection.execute<mysql.RowDataPacket[]>(
            'SELECT id FROM TRANSACTION_TYPES WHERE type_name = ? LIMIT 1',
            ['Contribution']
        );

        if (transactionTypeRows.length === 0) {
            return NextResponse.json({ error: 'Contribution transaction type not found' }, { status: 500 });
        }

        const transactionTypeId = transactionTypeRows[0].id;

        // Insert contribution change request
        await connection.execute(
            `INSERT INTO CONTRIBUTION_CHANGES (
                reg_no, 
                transaction_type_id, 
                current_contribution, 
                new_contribution, 
                effective_date, 
                status
            ) VALUES (?, ?, ?, ?, CURRENT_DATE(), 'Pending')`,
            [
                regNo,
                transactionTypeId,
                data.currentContribution,
                data.newContribution
            ]
        );

        // If they have a loan, verify the loan exists
        if (data.hasLoan && data.loanRefNo) {
            const [loanRows] = await connection.execute<mysql.RowDataPacket[]>(
                'SELECT id FROM LOANS WHERE ref_no = ? AND reg_no = ? LIMIT 1',
                [data.loanRefNo, regNo]
            );

            if (loanRows.length === 0) {
                // We'll still accept the request but note the invalid loan reference
                console.warn(`Invalid loan reference (${data.loanRefNo}) provided by user ${staffNo}`);
            }
        }

        return NextResponse.json({ 
            success: true, 
            message: 'Contribution change request submitted successfully' 
        }, { status: 200 });

    } catch (error) {
        console.error('Error submitting contribution change request:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    } finally {
        if (connection) {
            connection.release();
        }
    }
}

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