import { NextResponse } from 'next/server';
import { getDbPool } from '@/lib/db';
import mysql from 'mysql2/promise';

// Define the structure of the data expected from TEMP_CONTRIBUTIONS
interface PendingContribution {
    id: number;
    reg_no: string | null;
    staff_no: string | null;
    contribution_type: string | null;
    contribution_date: string | null; // DATE stored as 'YYYY-MM-DD'
    amount: number | null;
    upload_batch_id: string | null;
    validation_status: string | null;
    validation_errors: string | null;
    // Add other fields if needed
}

export async function GET() {
    let connection: mysql.PoolConnection | null = null;

    try {
        const pool = getDbPool();
        connection = await pool.getConnection();

        // Fetch contributions from TEMP_CONTRIBUTIONS for batches pending review
        const [pendingContributions] = await connection.query<mysql.RowDataPacket[] & PendingContribution[]>(
            `SELECT tc.*
             FROM TEMP_CONTRIBUTIONS tc
             JOIN UPLOAD_BATCHES ub ON tc.upload_batch_id = ub.batch_id
             WHERE ub.batch_status IN (?, ?)
             ORDER BY ub.upload_date DESC, tc.id ASC`,
            ['Validated', 'Pending Validation'] // Statuses indicating pending review
        );

        // Format data (ensure numbers are parsed, date is string)
        const formattedContributions = pendingContributions.map(contrib => ({
            ...contrib,
            amount: contrib.amount !== null ? parseFloat(contrib.amount as unknown as string) : null,
            contribution_date: contrib.contribution_date ? new Date(contrib.contribution_date).toISOString().split('T')[0] : null
        }));

        return NextResponse.json(formattedContributions, { status: 200 });

    } catch (error) {
        console.error('Error fetching pending contributions:', error);
        return NextResponse.json({ error: 'Internal Server Error fetching pending contributions' }, { status: 500 });
    } finally {
        if (connection) {
            connection.release();
        }
    }
} 