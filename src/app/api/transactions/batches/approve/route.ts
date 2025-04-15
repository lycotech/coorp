import { NextRequest, NextResponse } from 'next/server';
import { getDbPool } from '@/lib/db';
import mysql from 'mysql2/promise';

// Structure for data from TEMP_TRANSACTIONS
interface TempTransaction {
    id: number;
    reg_no: string;
    staff_no: string;
    transaction_type_name: string;
    transaction_date: string; // DATE stored as 'YYYY-MM-DD'
    transaction_mode: string;
    amount: number;
    description: string | null;
    upload_batch_id: string;
    validation_status: string;
}

// Structure for Transaction Type lookup
interface TransactionType {
    id: number;
    type_name: string;
    is_credit: boolean | null;
    is_debit: boolean | null;
}

export async function POST(request: NextRequest) {
    let connection: mysql.PoolConnection | null = null;
    let batchId: string | null = null;

    try {
        const body = await request.json();
        batchId = body.batchId;

        if (!batchId) {
            return NextResponse.json({ error: 'Batch ID is required' }, { status: 400 });
        }

        const pool = getDbPool();
        connection = await pool.getConnection();
        await connection.beginTransaction();

        // 1. Verify batch status
        const [batchRows] = await connection.query<mysql.RowDataPacket[]>(
            'SELECT batch_status FROM UPLOAD_BATCHES WHERE batch_id = ? FOR UPDATE',
            [batchId]
        );
        if (batchRows.length === 0) {
            await connection.rollback();
            return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
        }
        const batchStatus = batchRows[0].batch_status;
        if (batchStatus !== 'Validated' && batchStatus !== 'Pending Validation') {
            await connection.rollback();
            return NextResponse.json({ error: `Batch cannot be approved with status: ${batchStatus}` }, { status: 400 });
        }

        // 2. Fetch valid transactions for the batch
        const [transactionsToProcess] = await connection.query<mysql.RowDataPacket[] & TempTransaction[]>(
            'SELECT * FROM TEMP_TRANSACTIONS WHERE upload_batch_id = ? AND validation_status = ?',
            [batchId, 'Valid']
        );

        if (transactionsToProcess.length === 0) {
            await connection.query(
                'UPDATE UPLOAD_BATCHES SET batch_status = ?, approved_by_user_id = ?, approval_date = ? WHERE batch_id = ?',
                ['Processed', 'system_approve', new Date(), batchId]
            );
            await connection.commit();
            return NextResponse.json({ message: 'Batch had no valid transactions to process. Status updated.' }, { status: 200 });
        }

        // 3. Pre-fetch transaction type details
        const distinctTypeNames = [...new Set(transactionsToProcess.map(t => t.transaction_type_name))];
        const [transTypes] = await connection.query<mysql.RowDataPacket[] & TransactionType[]>(
            'SELECT id, type_name, is_credit, is_debit FROM TRANSACTION_TYPES WHERE type_name IN (?)',
            [distinctTypeNames]
        );
        const transactionTypeMap = new Map(transTypes.map(t => [t.type_name, t]));

        // --- Process Each Valid Transaction ---
        for (const trans of transactionsToProcess) {
            const transTypeInfo = transactionTypeMap.get(trans.transaction_type_name);
            if (!transTypeInfo) {
                throw new Error(`Transaction type '${trans.transaction_type_name}' not found for temp transaction ID ${trans.id}.`);
            }

            // 4. Insert into TRANSACTIONS
            const transactionData = {
                reg_no: trans.reg_no,
                staff_no: trans.staff_no,
                transaction_type_id: transTypeInfo.id,
                transaction_date: trans.transaction_date,
                transaction_mode: trans.transaction_mode,
                amount: trans.amount,
                description: trans.description || `Batch Upload - ${trans.transaction_type_name}`, // Use provided or generate
                status: 'Completed',
                reference_no: batchId,
                receipt_url: null
            };
            await connection.query('INSERT INTO TRANSACTIONS SET ?', transactionData);

            // 5. Update MEMBER_BALANCES
            let balanceChange = 0;
            if (transTypeInfo.is_credit) {
                balanceChange = trans.amount; // Add positive amount for credit
            } else if (transTypeInfo.is_debit) {
                balanceChange = -trans.amount; // Add negative amount for debit
            } else {
                // Handle cases where type is neither credit nor debit if necessary
                console.warn(`Transaction type ${transTypeInfo.type_name} (ID: ${transTypeInfo.id}) is neither credit nor debit. Balance not updated.`);
                continue; // Skip balance update for this transaction
            }

            const balanceSql = `
                INSERT INTO MEMBER_BALANCES (reg_no, transaction_type_id, current_balance) 
                VALUES (?, ?, ?) 
                ON DUPLICATE KEY UPDATE current_balance = current_balance + VALUES(current_balance)
            `;
            await connection.query(balanceSql, [
                trans.reg_no,
                transTypeInfo.id,
                balanceChange // Apply the calculated change (+/-)
            ]);
        }

        // 6. Update Batch Status to Processed
        await connection.query(
            'UPDATE UPLOAD_BATCHES SET batch_status = ?, approved_by_user_id = ?, approval_date = ? WHERE batch_id = ?',
            ['Processed', 'system_approve', new Date(), batchId] // TODO: Replace system_approve with actual user ID
        );

        // 7. Delete processed transactions from TEMP table
        const validIdsToDelete = transactionsToProcess.map(t => t.id);
        if (validIdsToDelete.length > 0) {
            await connection.query('DELETE FROM TEMP_TRANSACTIONS WHERE id IN (?)', [validIdsToDelete]);
        }

        await connection.commit();

        return NextResponse.json({ message: `Batch ${batchId} approved successfully. ${transactionsToProcess.length} transactions processed.` }, { status: 200 });

    } catch (error) {
        console.error(`Error approving transaction batch ${batchId}:`, error);
        if (connection) await connection.rollback();
        let errorMessage = 'Internal Server Error during batch approval';
        if (error instanceof Error) errorMessage = error.message;
        else if (typeof error === 'string') errorMessage = error;
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    } finally {
        if (connection) connection.release();
    }
} 