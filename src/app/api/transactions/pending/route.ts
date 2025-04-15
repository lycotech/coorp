import { NextResponse } from 'next/server';
import { getDbPool } from '@/lib/db';
import mysql from 'mysql2/promise';

// Define the structure of the data expected from TEMP_TRANSACTIONS
interface PendingTransaction {
    id: number;
    reg_no: string | null;
    staff_no: string | null;
    transaction_type_name: string | null;
    transaction_date: string | null; // DATE stored as 'YYYY-MM-DD'
    transaction_mode: string | null;
    amount: number | null;
    description: string | null;
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

        // Fetch transactions from TEMP_TRANSACTIONS for batches pending review
        const [pendingTransactions] = await connection.query<mysql.RowDataPacket[] & PendingTransaction[]>(
            `SELECT tt.*
             FROM TEMP_TRANSACTIONS tt
             JOIN UPLOAD_BATCHES ub ON tt.upload_batch_id = ub.batch_id
             WHERE ub.batch_status IN (?, ?)
             ORDER BY ub.upload_date DESC, tt.id ASC`,
            ['Pending', 'Validated'] // Use statuses defined in the schema ENUM
        );

        // Format data (ensure numbers are parsed, date is string)
        const formattedTransactions = pendingTransactions.map(trans => ({
            ...trans,
            amount: trans.amount !== null ? parseFloat(trans.amount as unknown as string) : null,
            transaction_date: trans.transaction_date ? new Date(trans.transaction_date).toISOString().split('T')[0] : null
        }));

        return NextResponse.json(formattedTransactions, { status: 200 });

    } catch (error) {
        console.error('Error fetching pending transactions:', error);
        return NextResponse.json({ error: 'Internal Server Error fetching pending transactions' }, { status: 500 });
    } finally {
        if (connection) {
            connection.release();
        }
    }
} 