import { NextRequest, NextResponse } from 'next/server';
import * as xlsx from 'xlsx';
import { getDbPool } from '@/lib/db';
import mysql from 'mysql2/promise';
import { v4 as uuidv4 } from 'uuid'; // For generating unique batch IDs

// --- Expected Headers (adjust based on your Excel template) ---
// IMPORTANT: Make sure these EXACTLY match the headers in your Excel file (case-sensitive)
const EXPECTED_HEADERS = [
    'ref_no',           // VARCHAR(50)
    'staff_no',         // VARCHAR(50)
    'reg_no',           // VARCHAR(50)
    'loan_type',        // VARCHAR(100) -> Needs mapping to transaction_type_id eventually
    'amount_requested', // DECIMAL(15, 2)
    'monthly_repayment',// DECIMAL(15, 2)
    'repayment_period', // INT
    'interest_rate',    // DECIMAL(5, 2)
    'purpose',          // VARCHAR(255)
    'date_applied'      // DATE
];

// --- Interface for Temp Loan Data ---
interface TempLoanData {
    ref_no?: string | null;
    staff_no?: string | null;
    reg_no?: string | null;
    loan_type?: string | null;
    amount_requested?: number | string | null;
    monthly_repayment?: number | string | null;
    repayment_period?: number | string | null;
    interest_rate?: number | string | null;
    purpose?: string | null;
    date_applied?: string | Date | number | null;
    upload_batch_id: string;
    validation_status: 'Pending' | 'Valid' | 'Invalid';
    validation_errors?: string | null;
}

// --- Helper to Parse Excel Date ---
function parseExcelDate(excelDate: string | number | undefined | null): Date | null {
    if (excelDate === null || excelDate === undefined || excelDate === '') return null;
    if (typeof excelDate === 'number') {
        // Assume Excel serial date number (days since 1900 or 1904)
        // This conversion can be tricky, using a library like `xlsx`'s built-in handling is safer
        // Alternatively, use a dedicated date library if xlsx number conversion isn't robust enough
        const date = xlsx.SSF.parse_date_code(excelDate);
        // The result needs conversion to a standard Date object
        if (date) {
            // Construct Date (months are 0-indexed)
            return new Date(Date.UTC(date.y, date.m - 1, date.d, date.H || 0, date.M || 0, date.S || 0));
        }
        return null; // Return null if parsing fails
    }
    if (typeof excelDate === 'string') {
        // Try parsing common string formats (e.g., 'YYYY-MM-DD', 'MM/DD/YYYY')
        const parsedDate = new Date(excelDate);
        if (!isNaN(parsedDate.getTime())) {
            return parsedDate;
        }
    }
    return null; // Return null for unparseable formats
}

// --- Helper to Format Date for MySQL ---
function formatDateForMySQL(date: Date | null): string | null {
    if (!date || isNaN(date.getTime())) return null;
    // Format as 'YYYY-MM-DD'
    return date.toISOString().split('T')[0];
}

export async function POST(request: NextRequest) {
    let connection: mysql.PoolConnection | null = null;
    const batchId = uuidv4(); // Generate a unique ID for this upload batch

    try {
        const formData = await request.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        const fileName = file.name;
        // In a real app, store the file temporarily or stream it
        // For simplicity here, we read it into memory (can be memory-intensive for large files)
        const fileBuffer = await file.arrayBuffer();
        const workbook = xlsx.read(fileBuffer, { type: 'buffer', cellDates: false }); // Read dates as numbers initially

        const sheetName = workbook.SheetNames[0]; // Assume data is on the first sheet
        if (!sheetName) {
            return NextResponse.json({ error: 'Excel file is empty or has no sheets' }, { status: 400 });
        }
        const worksheet = workbook.Sheets[sheetName];
        // Type jsonData more accurately: array of arrays with mixed types
        const jsonData = xlsx.utils.sheet_to_json<(string | number | null)[]>(worksheet, { header: 1, raw: false, dateNF: 'yyyy-mm-dd' });

        if (jsonData.length < 2) { // Check for header + at least one data row
            return NextResponse.json({ error: 'Excel sheet has no data rows' }, { status: 400 });
        }

        const headers = (jsonData[0] as string[]).map(h => h?.trim());
        const actualHeaders = headers.filter(h => h); // Remove any empty header cells

        // --- Header Validation ---
        const missingHeaders = EXPECTED_HEADERS.filter(h => !actualHeaders.includes(h));
        if (missingHeaders.length > 0) {
            return NextResponse.json({ error: `Missing expected headers: ${missingHeaders.join(', ')}` }, { status: 400 });
        }
        // Optional: Check for unexpected headers if strict matching is needed

        const dataRows = jsonData.slice(1); // Get data rows (exclude header)
        const totalRecords = dataRows.length;
        let validRecordsCount = 0;
        let invalidRecordsCount = 0;

        const pool = getDbPool();
        connection = await pool.getConnection();
        await connection.beginTransaction(); // Start transaction

        // --- 1. Insert Batch Record ---
        const batchData = {
            batch_id: batchId,
            file_name: fileName,
            file_path: null, // Store path if saving file, null otherwise
            uploaded_by_user_id: 'system', // TODO: Get actual user ID from session/token
            upload_date: new Date(),
            upload_type: 'Loan', // Or more specific type
            total_records: totalRecords,
            valid_records: 0, // Will update later
            invalid_records: 0, // Will update later
            batch_status: 'Pending', // Initial status
            approved_by_user_id: null,
            approval_date: null,
            rejection_reason: null
        };
        await connection.query('INSERT INTO UPLOAD_BATCHES SET ?', batchData);

        // --- 2. Process and Insert Temp Loan Data ---
        const tempLoansToInsert: TempLoanData[] = [];
        for (let i = 0; i < totalRecords; i++) {
            // Type row more accurately
            const row = dataRows[i] as (string | number | null)[];
            // Use a more specific type, allowing null
            const rowData: Record<string, string | number | null> = {};
            headers.forEach((header, index) => {
                if (header) { // Only map headers that exist
                    rowData[header] = row[index] !== undefined ? row[index] : null;
                }
            });

            // Use const as the array reference itself is not reassigned
            const validationErrors: string[] = [];
            let isValid = true;

            // Basic Validations (add more as needed)
            if (!rowData.staff_no) {
                validationErrors.push('Missing staff_no');
                isValid = false;
            }
            if (!rowData.reg_no) {
                validationErrors.push('Missing reg_no');
                isValid = false;
            }
            // Convert potential number to string before parsing
            const amountRequestedStr = rowData.amount_requested !== null && rowData.amount_requested !== undefined ? String(rowData.amount_requested) : null;
            if (!amountRequestedStr || isNaN(parseFloat(amountRequestedStr))) {
                validationErrors.push('Invalid or missing amount_requested');
                isValid = false;
            }
            // Convert potential number to string before parsing
            const repaymentPeriodStr = rowData.repayment_period !== null && rowData.repayment_period !== undefined ? String(rowData.repayment_period) : null;
            if (repaymentPeriodStr && isNaN(parseInt(repaymentPeriodStr))) {
                validationErrors.push('Invalid repayment_period');
                isValid = false;
            }
            // Convert potential number to string before parsing
            const interestRateStr = rowData.interest_rate !== null && rowData.interest_rate !== undefined ? String(rowData.interest_rate) : null;
            if (interestRateStr && isNaN(parseFloat(interestRateStr))) {
                validationErrors.push('Invalid interest_rate');
                isValid = false;
            }

            // Date Validation/Parsing
            const parsedDateApplied = parseExcelDate(rowData.date_applied);
            if (rowData.date_applied && !parsedDateApplied) {
                 validationErrors.push('Invalid date_applied format');
                 isValid = false;
            }

            const tempLoan: TempLoanData = {
                ref_no: rowData.ref_no ? String(rowData.ref_no) : null, // Ensure string or null
                staff_no: String(rowData.staff_no || '') as string | null, // Ensure string
                reg_no: String(rowData.reg_no || '') as string | null,     // Ensure string
                loan_type: rowData.loan_type ? String(rowData.loan_type) : null, // Ensure string or null
                // Use validated string versions for parsing
                amount_requested: amountRequestedStr ? parseFloat(amountRequestedStr) : null,
                monthly_repayment: rowData.monthly_repayment !== null && rowData.monthly_repayment !== undefined ? parseFloat(String(rowData.monthly_repayment)) : null,
                repayment_period: repaymentPeriodStr ? parseInt(repaymentPeriodStr) : null,
                interest_rate: interestRateStr ? parseFloat(interestRateStr) : null,
                purpose: rowData.purpose ? String(rowData.purpose) : null, // Ensure string or null
                date_applied: formatDateForMySQL(parsedDateApplied), // Format for DB
                upload_batch_id: batchId,
                validation_status: isValid ? 'Valid' : 'Invalid',
                validation_errors: isValid ? null : validationErrors.join('; '),
            };

             // Convert fields back to correct types for insertion if necessary
             // (e.g., if validation changed them) - Already handled above

            tempLoansToInsert.push(tempLoan);

            if (isValid) {
                validRecordsCount++;
            } else {
                invalidRecordsCount++;
            }
        }

        // Batch Insert into TEMP_LOANS
        if (tempLoansToInsert.length > 0) {
            const columns = Object.keys(tempLoansToInsert[0]) as (keyof TempLoanData)[];
            // Use mapped types for better safety
            const values = tempLoansToInsert.map(loan => columns.map(col => loan[col]));
            const sql = `INSERT INTO TEMP_LOANS (${columns.join(', ')}) VALUES ?`;
            await connection.query(sql, [values]);
        }

        // --- 3. Update Batch Record Status and Counts ---
        const finalBatchStatus = invalidRecordsCount > 0 ? 'Pending Validation' : 'Validated'; // Or keep 'Pending' until explicit approval
        await connection.query(
            'UPDATE UPLOAD_BATCHES SET valid_records = ?, invalid_records = ?, batch_status = ? WHERE batch_id = ?',
            [validRecordsCount, invalidRecordsCount, finalBatchStatus, batchId]
        );

        await connection.commit(); // Commit transaction

        return NextResponse.json({
            message: `File processed successfully. Batch ID: ${batchId}. Records: ${totalRecords} total, ${validRecordsCount} valid, ${invalidRecordsCount} invalid. Status: ${finalBatchStatus}`,
            batchId: batchId
        }, { status: 201 }); // 201 Created

    } catch (error) {
        console.error('Loan upload error:', error);
        if (connection) {
            await connection.rollback(); // Rollback transaction on error
        }
        // Determine specific error type if possible
        let errorMessage = 'Internal Server Error during upload';
        if (error instanceof Error) {
            errorMessage = error.message;
        } else if (typeof error === 'string') {
            errorMessage = error;
        }
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    } finally {
        if (connection) {
            connection.release(); // Release connection back to the pool
        }
    }
} 