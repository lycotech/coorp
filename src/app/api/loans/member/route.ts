import { NextRequest, NextResponse } from 'next/server';
import { getDbPool } from '@/lib/db';
import mysql from 'mysql2/promise';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

// GET: Fetch loans for the logged-in member
export async function GET(request: NextRequest) {
    const cookieStore = await cookies();
    const token = cookieStore.get('sessionToken')?.value;
    const searchParams = request.nextUrl.searchParams;
    const refNo = searchParams.get('ref');

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
        
        // Check if staffNo exists in payload
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

        // Query construction based on whether we're fetching a specific loan
        let loanQuery = `
            SELECT l.*, tt.type_name as loan_type 
            FROM LOANS l
            LEFT JOIN TRANSACTION_TYPES tt ON l.transaction_type_id = tt.id
            WHERE l.reg_no = ? 
        `;
        
        const queryParams = [regNo];
        
        // If reference number is provided, add it to the query
        if (refNo) {
            loanQuery += " AND l.ref_no = ?";
            queryParams.push(refNo);
        }
        
        // Add ordering
        loanQuery += " ORDER BY l.date_applied DESC";
        
        // Fetch loans for this member
        const [loanRows] = await connection.execute<mysql.RowDataPacket[]>(
            loanQuery,
            queryParams
        );

        // Prepare guarantor query
        let guarantorQuery = `
            SELECT g.*, CONCAT(m.firstname, ' ', m.surname) as guarantor_name
            FROM GUARANTORS g
            JOIN MEMBERS m ON g.guarantor_staff_no = m.staff_no
            WHERE g.applicant_reg_no = ?
        `;
        
        // If we're fetching a specific loan, only get guarantors for that loan
        if (refNo) {
            guarantorQuery += " AND g.ref_no = ?";
            const [guarantorRows] = await connection.execute<mysql.RowDataPacket[]>(
                guarantorQuery,
                [regNo, refNo]
            );
            
            // Group guarantors by loan reference number
            const guarantorsByLoan: Record<string, mysql.RowDataPacket[]> = {};
            guarantorRows.forEach(row => {
                if (!guarantorsByLoan[row.ref_no]) {
                    guarantorsByLoan[row.ref_no] = [];
                }
                guarantorsByLoan[row.ref_no].push(row);
            });
            
            // Add guarantors to each loan
            const loansWithGuarantors = loanRows.map(loan => ({
                ...loan,
                guarantors: guarantorsByLoan[loan.ref_no] || []
            }));
            
            return NextResponse.json({ loans: loansWithGuarantors }, { status: 200 });
        } else {
            // Fetch all guarantors for this member's loans
            const [guarantorRows] = await connection.execute<mysql.RowDataPacket[]>(
                guarantorQuery,
                [regNo]
            );
            
            // Group guarantors by loan reference number
            const guarantorsByLoan: Record<string, mysql.RowDataPacket[]> = {};
            guarantorRows.forEach(row => {
                if (!guarantorsByLoan[row.ref_no]) {
                    guarantorsByLoan[row.ref_no] = [];
                }
                guarantorsByLoan[row.ref_no].push(row);
            });
            
            // Add guarantors to each loan
            const loansWithGuarantors = loanRows.map(loan => ({
                ...loan,
                guarantors: guarantorsByLoan[loan.ref_no] || []
            }));
            
            return NextResponse.json({ loans: loansWithGuarantors }, { status: 200 });
        }

    } catch (error) {
        console.error('Error fetching member loans:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    } finally {
        if (connection) {
            connection.release();
        }
    }
} 