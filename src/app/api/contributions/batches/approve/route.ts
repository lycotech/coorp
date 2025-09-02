import { NextRequest, NextResponse } from 'next/server';
import { getDbPool } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import mysql from 'mysql2/promise';

// Define the structure of the data expected from TEMP_CONTRIBUTIONS
interface TempContribution {
    id: number;
    reg_no: string;
    staff_no: string;
    contribution_type: string; // Name of the contribution type
    contribution_date: string; // DATE stored as 'YYYY-MM-DD'
    amount: number;
    upload_batch_id: string;
    validation_status: string;
    // Add other fields if needed
}

// Define structure for Transaction Type lookup
interface TransactionType {
    id: number;
    type_name: string;
    // Add other relevant fields if necessary, e.g., is_credit
}

export async function POST(request: NextRequest) {
    let connection: mysql.PoolConnection | null = null;
    let batchId: string | null = null;

    try {
        // Require authentication
        const currentUser = await requireAuth(request);
        
        const body = await request.json();
        batchId = body.batchId;

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
        // Allow approval only if Validated (or potentially Pending Validation if logic handles it)
        if (batchStatus !== 'Validated' && batchStatus !== 'Pending Validation') {
            await connection.rollback();
            return NextResponse.json({ error: `Batch cannot be approved with status: ${batchStatus}` }, { status: 400 });
        }

        // 2. Fetch *only valid* contributions for the batch
        const [contributionsToProcess] = await connection.query<mysql.RowDataPacket[] & TempContribution[]>(
            'SELECT * FROM TEMP_CONTRIBUTIONS WHERE upload_batch_id = ? AND validation_status = ?',
            [batchId, 'Valid']
        );

        if (contributionsToProcess.length === 0) {
            // If the batch was 'Validated' but has no valid entries (edge case) or 'Pending Validation' with no valid entries
            // Just update the batch status to Processed (or Rejected if preferred)
             await connection.query(
                'UPDATE UPLOAD_BATCHES SET batch_status = ?, approved_by_user_id = ?, approval_date = ? WHERE batch_id = ?',
                ['Processed', currentUser.userId, new Date(), batchId] // Use actual user ID
            );
             // Optionally delete invalid entries from temp table if desired
             // await connection.query('DELETE FROM TEMP_CONTRIBUTIONS WHERE upload_batch_id = ?', [batchId]);
            await connection.commit();
            return NextResponse.json({ message: 'Batch had no valid contributions to process. Status updated.' }, { status: 200 });
        }

        // --- Processing Valid Contributions ---

        // Optional: Pre-fetch relevant transaction types for efficiency
        const distinctTypes = [...new Set(contributionsToProcess.map(c => c.contribution_type))];
        const [transTypes] = await connection.query<mysql.RowDataPacket[] & TransactionType[]>(
            'SELECT id, type_name FROM TRANSACTION_TYPES WHERE type_name IN (?)',
            [distinctTypes]
        );
        const transactionTypeMap = new Map(transTypes.map(t => [t.type_name, t.id]));

        for (const contrib of contributionsToProcess) {
            // 3. Find Transaction Type ID
            const transactionTypeId = transactionTypeMap.get(contrib.contribution_type);
            if (!transactionTypeId) {
                throw new Error(`Transaction type '${contrib.contribution_type}' not found for contribution ID ${contrib.id}.`);
            }

            // 4. Insert into TRANSACTIONS table
            const transactionData = {
                reg_no: contrib.reg_no,
                staff_no: contrib.staff_no,
                transaction_type_id: transactionTypeId,
                transaction_date: contrib.contribution_date,
                transaction_mode: 'Upload', // Or specify based on type
                amount: contrib.amount,
                description: `Batch Upload Contribution - ${contrib.contribution_type}`, // Customize description
                status: 'Completed', // Or based on workflow
                reference_no: batchId, // Link back to the batch
                receipt_url: null
            };
            await connection.query('INSERT INTO TRANSACTIONS SET ?', transactionData);

            // 5. Update MEMBER_BALANCES (Add amount to current balance)
            // Use INSERT ... ON DUPLICATE KEY UPDATE to handle existing/new balances
            const balanceSql = `
                INSERT INTO MEMBER_BALANCES (reg_no, transaction_type_id, current_balance) 
                VALUES (?, ?, ?) 
                ON DUPLICATE KEY UPDATE current_balance = current_balance + VALUES(current_balance)
            `;
            await connection.query(balanceSql, [
                contrib.reg_no,
                transactionTypeId,
                contrib.amount
            ]);
        }

        // 6. Update Batch Status
        await connection.query(
            'UPDATE UPLOAD_BATCHES SET batch_status = ?, approved_by_user_id = ?, approval_date = ? WHERE batch_id = ?',
            ['Processed', currentUser.userId, new Date(), batchId] // Use actual user ID
        );

        // 7. Delete processed (valid) contributions from TEMP table
        const validIdsToDelete = contributionsToProcess.map(c => c.id);
        if (validIdsToDelete.length > 0) {
             await connection.query('DELETE FROM TEMP_CONTRIBUTIONS WHERE id IN (?)', [validIdsToDelete]);
        }
        // Optionally delete invalid contributions as well, or handle them separately
        // await connection.query('DELETE FROM TEMP_CONTRIBUTIONS WHERE upload_batch_id = ? AND validation_status = ?', [batchId, 'Invalid']);

        await connection.commit();

        return NextResponse.json({ message: `Batch ${batchId} approved successfully. ${contributionsToProcess.length} contributions processed.` }, { status: 200 });

    } catch (error) {
        console.error(`Error approving contribution batch ${batchId}:`, error);
        if (connection) {
            await connection.rollback();
        }
        let errorMessage = 'Internal Server Error during batch approval';
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