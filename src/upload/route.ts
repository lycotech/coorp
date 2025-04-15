import { NextRequest, NextResponse } from 'next/server';
import { getDbPool } from '@/lib/db'; // Assuming db connection pool is exported from here
import * as xlsx from 'xlsx';
import { v4 as uuidv4 } from 'uuid'; // For generating unique batch IDs
import { OkPacket } from 'mysql2/promise'; // Import type for insert results

// Define an interface for the structure of a row in the Excel file
interface LoanDataRow {
  ref_no?: string;
  staff_no?: string;
  reg_no?: string;
  loan_type?: string;
  amount_requested?: number | string;
  monthly_repayment?: number | string;
  repayment_period?: number | string;
  interest_rate?: number | string;
  purpose?: string;
  date_applied?: Date | string | number; // Allow various types from Excel
}

// Define expected columns in the Excel file
const EXPECTED_COLUMNS = [
  'ref_no', 'staff_no', 'reg_no', 'loan_type', 'amount_requested',
  'monthly_repayment', 'repayment_period', 'interest_rate', 'purpose', 'date_applied'
];

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
    }

    // --- 1. Read and Parse Excel File ---
    const buffer = await file.arrayBuffer();
    const workbook = xlsx.read(buffer, { type: 'buffer', cellDates: true }); // Use cellDates: true
    const sheetName = workbook.SheetNames[0]; // Assuming data is in the first sheet
    const worksheet = workbook.Sheets[sheetName];
    const jsonData: LoanDataRow[] = xlsx.utils.sheet_to_json<LoanDataRow>(worksheet);

    if (jsonData.length === 0) {
      return NextResponse.json({ error: 'Uploaded file is empty or has no data.' }, { status: 400 });
    }

    // --- 2. Validate Headers ---
    const headers = Object.keys(jsonData[0]);
    const missingColumns = EXPECTED_COLUMNS.filter(col => !headers.includes(col));
    if (missingColumns.length > 0) {
      return NextResponse.json({ error: `Missing columns in Excel file: ${missingColumns.join(', ')}` }, { status: 400 });
    }

    const pool = getDbPool();
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
        // --- 3. Create Upload Batch ---
        const batchId = uuidv4();
        // TODO: Get actual logged-in user ID
        const uploadedByUserId = 'SYSTEM_UPLOAD'; // Placeholder - Replace with actual user ID from session
        const uploadDate = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

        const [batchResult] = await connection.query<OkPacket>(
        `INSERT INTO UPLOAD_BATCHES
            (batch_id, file_name, file_path, uploaded_by_user_id, upload_date, upload_type, total_records, batch_status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [batchId, file.name, '', uploadedByUserId, uploadDate, 'LOAN', jsonData.length, 'Pending'] // File path can be added later if storing files
        );

        if (batchResult.affectedRows !== 1) {
            throw new Error('Failed to create upload batch.');
        }

        // --- 4. Prepare and Insert Temp Loan Data ---
        const tempLoanValues = jsonData.map(row => {
            // Basic validation/transformation can happen here
            const validationErrors: string[] = [];
            const validationStatus: 'Pending' | 'Valid' | 'Invalid' = 'Pending'; // Start as Pending, validation can happen later

            // Convert date_applied if necessary (XLSX might parse it as Date object)
            let dateApplied = row.date_applied;
            if (dateApplied instanceof Date) {
                dateApplied = dateApplied.toISOString().slice(0, 10);
            } else if (typeof dateApplied === 'number') {
                // Handle Excel date serial number if necessary (less common with cellDates:true)
                const excelEpoch = new Date(Date.UTC(1899, 11, 30));
                dateApplied = new Date(excelEpoch.getTime() + dateApplied * 24 * 60 * 60 * 1000).toISOString().slice(0,10);
            } else if (typeof dateApplied === 'string' && !/^\d{4}-\d{2}-\d{2}$/.test(dateApplied)) {
                // Attempt to parse common date formats if it's a string but not YYYY-MM-DD
                try {
                  dateApplied = new Date(dateApplied).toISOString().slice(0, 10);
                } catch (parseError) {
                  console.error('Date parse error for value:', row.date_applied, parseError);
                  validationErrors.push('Invalid date_applied format');
                  // Keep original value or set to null depending on requirements
                }
            }

            return [
                row.ref_no || null,        // Default to null if undefined/empty
                row.staff_no || null,    // Default to null
                row.reg_no || null,      // Default to null
                row.loan_type || null,   // Default to null
                parseFloat(String(row.amount_requested)) || 0, // Ensure it's a string before parseFloat, default to 0
                parseFloat(String(row.monthly_repayment)) || 0, // Ensure it's a string, default to 0
                parseInt(String(row.repayment_period), 10) || 0, // Ensure it's a string, default to 0
                parseFloat(String(row.interest_rate)) || 0,     // Ensure it's a string, default to 0
                row.purpose || null,     // Default to null
                dateApplied || null,       // Use potentially converted date, default to null
                batchId,                   // Already handled
                JSON.stringify(validationErrors), // Already handled
                validationStatus           // Already handled
            ];
        });

        const sqlInsertTemp = `
        INSERT INTO TEMP_LOANS
            (ref_no, staff_no, reg_no, loan_type, amount_requested, monthly_repayment,
            repayment_period, interest_rate, purpose, date_applied, upload_batch_id,
            validation_errors, validation_status)
        VALUES ?`;

        await connection.query(sqlInsertTemp, [tempLoanValues]);

        // --- 5. Commit Transaction ---
        await connection.commit();

        return NextResponse.json({ message: 'File uploaded and data staged successfully.', batchId: batchId, recordCount: jsonData.length }, { status: 201 });

    } catch (error) {
        await connection.rollback(); // Rollback on any error during insertion
        console.error('Transaction Error:', error);
         if (error instanceof Error) {
            return NextResponse.json({ error: 'Failed to process file.', details: error.message }, { status: 500 });
         }
         return NextResponse.json({ error: 'Failed to process file due to an unknown error.' }, { status: 500 });
    } finally {
        connection.release(); // Release connection back to the pool
    }

  } catch (error) {
    console.error('Upload Error:', error);
     if (error instanceof Error) {
        return NextResponse.json({ error: 'Failed to upload file.', details: error.message }, { status: 500 });
     }
     return NextResponse.json({ error: 'Failed to upload file due to an unknown error.' }, { status: 500 });
  }
} 