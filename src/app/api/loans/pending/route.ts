import { NextResponse } from 'next/server';
import { getDbPool } from '@/lib/db';
import mysql from 'mysql2/promise';

// Define the structure of the data expected from TEMP_LOANS
interface PendingLoan {
    id: number;
    ref_no: string | null;
    staff_no: string | null;
    reg_no: string | null;
    loan_type: string | null;
    amount_requested: number | null; // Assuming numeric after DB insert
    monthly_repayment: number | null;
    repayment_period: number | null;
    interest_rate: number | null;
    purpose: string | null;
    date_applied: string | null; // Assuming DATE stored as string 'YYYY-MM-DD'
    upload_batch_id: string | null;
    validation_status: string | null;
    validation_errors: string | null;
    // Add other relevant fields if needed
}

export async function GET() {
    let connection: mysql.PoolConnection | null = null;

    try {
        const pool = getDbPool();
        connection = await pool.getConnection();

        // Fetch loans from TEMP_LOANS where status is pending approval/validation
        // Adjust the WHERE clause based on the actual statuses used in UPLOAD_BATCHES
        // Example: Fetching loans from batches that are 'Validated' or 'Pending Validation'
        const [pendingLoans] = await connection.query<mysql.RowDataPacket[] & PendingLoan[]>(
            `SELECT tl.*
             FROM TEMP_LOANS tl
             JOIN UPLOAD_BATCHES ub ON tl.upload_batch_id = ub.batch_id
             WHERE ub.batch_status IN (?, ?)
             ORDER BY ub.upload_date DESC, tl.id ASC`,
            ['Validated', 'Pending Validation'] // Statuses indicating pending review
        );

        // Convert DECIMAL and other numeric types from string (if necessary, depending on mysql2 config)
        // Dates should already be strings ('YYYY-MM-DD')
        const formattedLoans = pendingLoans.map(loan => ({
            ...loan,
            amount_requested: loan.amount_requested !== null ? parseFloat(loan.amount_requested as unknown as string) : null,
            monthly_repayment: loan.monthly_repayment !== null ? parseFloat(loan.monthly_repayment as unknown as string) : null,
            repayment_period: loan.repayment_period !== null ? parseInt(loan.repayment_period as unknown as string, 10) : null,
            interest_rate: loan.interest_rate !== null ? parseFloat(loan.interest_rate as unknown as string) : null,
            // Ensure date_applied is returned as a string 'YYYY-MM-DD' or null
            date_applied: loan.date_applied ? new Date(loan.date_applied).toISOString().split('T')[0] : null
        }));


        return NextResponse.json(formattedLoans, { status: 200 });

    } catch (error) {
        console.error('Error fetching pending loans:', error);
        return NextResponse.json({ error: 'Internal Server Error fetching pending loans' }, { status: 500 });
    } finally {
        if (connection) {
            connection.release();
        }
    }
} 