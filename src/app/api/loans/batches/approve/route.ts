import { NextRequest, NextResponse } from 'next/server';
import { getDbPool } from '@/lib/db';
import mysql from 'mysql2/promise';

// Structure for data from TEMP_LOANS
interface TempLoan {
    id: number;
    ref_no: string | null;
    staff_no: string;
    reg_no: string;
    loan_type: string; // Name of the loan type
    amount_requested: number;
    monthly_repayment: number | null;
    repayment_period: number | null;
    interest_rate: number | null;
    purpose: string | null;
    date_applied: string; // DATE stored as 'YYYY-MM-DD'
    upload_batch_id: string;
    validation_status: string;
}

// Structure for Transaction Type lookup
interface TransactionType {
    id: number;
    type_name: string;
    // Include defaults if needed for LOANS table?
    // default_interest_rate?: number | null;
    // default_term_months?: number | null;
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

        // 2. Fetch valid loans for the batch
        const [loansToProcess] = await connection.query<mysql.RowDataPacket[] & TempLoan[]>(
            'SELECT * FROM TEMP_LOANS WHERE upload_batch_id = ? AND validation_status = ?',
            [batchId, 'Valid']
        );

        if (loansToProcess.length === 0) {
            await connection.query(
                'UPDATE UPLOAD_BATCHES SET batch_status = ?, approved_by_user_id = ?, approval_date = ? WHERE batch_id = ?',
                ['Processed', 'system_approve', new Date(), batchId]
            );
            await connection.commit();
            return NextResponse.json({ message: 'Batch had no valid loans to process. Status updated.' }, { status: 200 });
        }

        // 3. Pre-fetch transaction type details
        const distinctLoanTypes = [...new Set(loansToProcess.map(l => l.loan_type))];
        const [transTypes] = await connection.query<mysql.RowDataPacket[] & TransactionType[]>(
            'SELECT id, type_name FROM TRANSACTION_TYPES WHERE type_name IN (?)',
            [distinctLoanTypes]
        );
        const transactionTypeMap = new Map(transTypes.map(t => [t.type_name, t.id]));

        // --- Process Each Valid Loan ---
        for (const loan of loansToProcess) {
            const transactionTypeId = transactionTypeMap.get(loan.loan_type);
            if (!transactionTypeId) {
                throw new Error(`Transaction type '${loan.loan_type}' not found for temp loan ID ${loan.id}.`);
            }

            // 4. Insert into LOANS table
            const loanData = {
                ref_no: loan.ref_no, // Use ref_no from temp table if provided
                staff_no: loan.staff_no,
                reg_no: loan.reg_no,
                transaction_type_id: transactionTypeId,
                amount_requested: loan.amount_requested,
                monthly_repayment: loan.monthly_repayment,
                repayment_period: loan.repayment_period,
                interest_rate: loan.interest_rate,
                purpose: loan.purpose,
                status: 'Approved', // Set initial status upon approval
                date_applied: loan.date_applied,
                date_approved: new Date(), // Set approval date
                next_repayment_date: null, // TODO: Calculate this based on policy
                remaining_balance: loan.amount_requested, // Initial balance is full amount
                rejection_reason: null,
                loan_documents_url: null
            };

            // Ensure ref_no is unique - handle potential conflicts if necessary
            // This might require checking LOANS table before insert or handling DB unique constraint errors.
            // For simplicity, assuming ref_no from upload is unique or null.
            if (!loanData.ref_no) {
                 // Generate a unique ref_no if not provided in the upload
                 // Example: Could use batchId + loan id or a UUID
                 loanData.ref_no = `${batchId}-${loan.id}`;
            }

            await connection.query('INSERT INTO LOANS SET ?', loanData);

            // TODO: Optionally create a disbursement transaction in TRANSACTIONS table?
            // This depends on whether loan approval automatically means disbursement.
        }

        // 5. Update Batch Status to Processed
        await connection.query(
            'UPDATE UPLOAD_BATCHES SET batch_status = ?, approved_by_user_id = ?, approval_date = ? WHERE batch_id = ?',
            ['Processed', 'system_approve', new Date(), batchId] // TODO: Replace system_approve with actual user ID
        );

        // 6. Delete processed loans from TEMP table
        const validIdsToDelete = loansToProcess.map(l => l.id);
        if (validIdsToDelete.length > 0) {
            await connection.query('DELETE FROM TEMP_LOANS WHERE id IN (?)', [validIdsToDelete]);
        }

        await connection.commit();

        return NextResponse.json({ message: `Batch ${batchId} approved successfully. ${loansToProcess.length} loans processed.` }, { status: 200 });

    } catch (error) {
        console.error(`Error approving loan batch ${batchId}:`, error);
        if (connection) await connection.rollback();
        let errorMessage = 'Internal Server Error during batch approval';
        if (error instanceof Error) errorMessage = error.message;
        else if (typeof error === 'string') errorMessage = error;
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    } finally {
        if (connection) connection.release();
    }
} 