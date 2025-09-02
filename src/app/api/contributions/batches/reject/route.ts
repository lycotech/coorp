import { NextRequest, NextResponse } from 'next/server';
import { getDbPool } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import mysql from 'mysql2/promise';

export async function POST(request: NextRequest) {
    let connection: mysql.PoolConnection | null = null;
    let batchId: string | null = null;

    try {
        // Require authentication
        const currentUser = await requireAuth(request);
        
        const body = await request.json();
        batchId = body.batchId;
        const reason = body.rejectionReason || 'Rejected by administrator'; // Optional rejection reason

        if (!batchId) {
            return NextResponse.json({ error: 'Batch ID is required' }, { status: 400 });
        }

        const pool = getDbPool();
        if (!pool) {
            return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
        }
        
        connection = await pool.getConnection();
        await connection.beginTransaction();

        // 1. Fetch the batch status
        const [batchRows] = await connection.query<mysql.RowDataPacket[]>(
            'SELECT batch_status FROM UPLOAD_BATCHES WHERE batch_id = ? FOR UPDATE',
            [batchId]
        );

        if (batchRows.length === 0) {
            await connection.rollback();
            return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
        }

        const batchStatus = batchRows[0].batch_status;
        // Define which statuses can be rejected
        const rejectableStatuses = ['Pending', 'Validated', 'Pending Validation'];
        if (!rejectableStatuses.includes(batchStatus)) {
            await connection.rollback();
            return NextResponse.json({ error: `Batch cannot be rejected with status: ${batchStatus}` }, { status: 400 });
        }

        // 2. Update Batch Status to Rejected
        await connection.query(
            'UPDATE UPLOAD_BATCHES SET batch_status = ?, rejection_reason = ?, approved_by_user_id = ?, approval_date = ? WHERE batch_id = ?',
            [
                'Rejected', 
                reason,
                currentUser.userId, // Use actual rejecting user ID
                new Date(),      // Record rejection time in approval_date column (or add a rejected_date column)
                batchId
            ]
        );

        // 3. Delete all contributions for this batch from TEMP table
        const [deleteResult] = await connection.query<mysql.ResultSetHeader>(
            'DELETE FROM TEMP_CONTRIBUTIONS WHERE upload_batch_id = ?',
             [batchId]
        );

        await connection.commit();

        return NextResponse.json({ 
            message: `Batch ${batchId} rejected successfully. ${deleteResult.affectedRows} temporary records deleted.` 
        }, { status: 200 });

    } catch (error) {
        console.error(`Error rejecting contribution batch ${batchId}:`, error);
        if (connection) {
            await connection.rollback();
        }
        let errorMessage = 'Internal Server Error during batch rejection';
        if (error instanceof Error) {
            errorMessage = error.message;
        } else if (typeof error === 'string') {
            errorMessage = error;
        }
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    } finally {
        if (connection) {
            connection.release();
        }
    }
} 