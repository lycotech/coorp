import { NextRequest, NextResponse } from 'next/server';
import * as xlsx from 'xlsx';
import { getDbPool } from '@/lib/db';
import mysql from 'mysql2/promise';
import { v4 as uuidv4 } from 'uuid';

// --- Expected Headers (adjust based on your Excel template) ---
const EXPECTED_HEADERS = [
    'reg_no',            // VARCHAR(50)
    'staff_no',          // VARCHAR(50)
    'contribution_type', // VARCHAR(100)
    'contribution_date', // DATE
    'amount'             // DECIMAL(15, 2)
];

// --- Interface for Temp Contribution Data ---
interface TempContributionData {
    reg_no?: string | null;
    staff_no?: string | null;
    contribution_type?: string | null;
    contribution_date?: string | Date | number | null; // Excel date can be string or number
    amount?: number | string | null;
    upload_batch_id: string;
    validation_status: 'Pending' | 'Valid' | 'Invalid';
    validation_errors?: string | null;
}

// --- Helper to Parse Excel Date (Copied from loan upload, can be moved to utils) ---
function parseExcelDate(excelDate: string | number | undefined | null): Date | null {
    if (excelDate === null || excelDate === undefined || excelDate === '') return null;
    if (typeof excelDate === 'number') {
        const date = xlsx.SSF.parse_date_code(excelDate);
        if (date) {
            return new Date(Date.UTC(date.y, date.m - 1, date.d, date.H || 0, date.M || 0, date.S || 0));
        }
        return null;
    }
    if (typeof excelDate === 'string') {
        const parsedDate = new Date(excelDate);
        if (!isNaN(parsedDate.getTime())) {
            return parsedDate;
        }
    }
    return null;
}

// --- Helper to Format Date for MySQL (Copied from loan upload, can be moved to utils) ---
function formatDateForMySQL(date: Date | null): string | null {
    if (!date || isNaN(date.getTime())) return null;
    return date.toISOString().split('T')[0];
}

export async function POST(request: NextRequest) {
    let connection: mysql.PoolConnection | null = null;
    const batchId = uuidv4();

    try {
        const formData = await request.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        const fileName = file.name;
        const fileBuffer = await file.arrayBuffer();
        const workbook = xlsx.read(fileBuffer, { type: 'buffer', cellDates: false });

        const sheetName = workbook.SheetNames[0];
        if (!sheetName) {
            return NextResponse.json({ error: 'Excel file is empty or has no sheets' }, { status: 400 });
        }
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = xlsx.utils.sheet_to_json<(string | number | null)[]>(worksheet, { header: 1, raw: false, dateNF: 'yyyy-mm-dd' });

        if (jsonData.length < 2) {
            return NextResponse.json({ error: 'Excel sheet has no data rows' }, { status: 400 });
        }

        const headers = (jsonData[0] as string[]).map(h => h?.trim());
        const actualHeaders = headers.filter(h => h);

        // --- Header Validation ---
        const missingHeaders = EXPECTED_HEADERS.filter(h => !actualHeaders.includes(h));
        if (missingHeaders.length > 0) {
            return NextResponse.json({ error: `Missing expected headers: ${missingHeaders.join(', ')}` }, { status: 400 });
        }

        const dataRows = jsonData.slice(1);
        const totalRecords = dataRows.length;
        let validRecordsCount = 0;
        let invalidRecordsCount = 0;

        const pool = getDbPool();
        connection = await pool.getConnection();
        await connection.beginTransaction();

        // --- 1. Insert Batch Record ---
        const batchData = {
            batch_id: batchId,
            file_name: fileName,
            file_path: null,
            uploaded_by_user_id: 'system', // TODO: Get actual user ID
            upload_date: new Date(),
            upload_type: 'Contribution',
            total_records: totalRecords,
            valid_records: 0,
            invalid_records: 0,
            batch_status: 'Pending',
            approved_by_user_id: null,
            approval_date: null,
            rejection_reason: null
        };
        await connection.query('INSERT INTO UPLOAD_BATCHES SET ?', batchData);

        // --- 2. Process and Insert Temp Contribution Data ---
        const tempContributionsToInsert: TempContributionData[] = [];
        for (let i = 0; i < totalRecords; i++) {
            const row = dataRows[i] as (string | number | null)[];
            const rowData: Record<string, string | number | null> = {};
            headers.forEach((header, index) => {
                if (header) {
                    rowData[header] = row[index] !== undefined ? row[index] : null;
                }
            });

            const validationErrors: string[] = [];
            let isValid = true;

            // Basic Validations
            if (!rowData.reg_no) {
                validationErrors.push('Missing reg_no');
                isValid = false;
            }
            if (!rowData.staff_no) {
                validationErrors.push('Missing staff_no');
                isValid = false;
            }
            const amountStr = rowData.amount !== null && rowData.amount !== undefined ? String(rowData.amount) : null;
            if (!amountStr || isNaN(parseFloat(amountStr))) {
                validationErrors.push('Invalid or missing amount');
                isValid = false;
            }
            const parsedDate = parseExcelDate(rowData.contribution_date);
            if (!parsedDate) { // Require a valid date for contributions
                 validationErrors.push('Invalid or missing contribution_date format');
                 isValid = false;
            }

            const tempContribution: TempContributionData = {
                reg_no: String(rowData.reg_no || '') as string | null,
                staff_no: String(rowData.staff_no || '') as string | null,
                contribution_type: rowData.contribution_type ? String(rowData.contribution_type) : null,
                contribution_date: formatDateForMySQL(parsedDate),
                amount: amountStr ? parseFloat(amountStr) : null,
                upload_batch_id: batchId,
                validation_status: isValid ? 'Valid' : 'Invalid',
                validation_errors: isValid ? null : validationErrors.join('; '),
            };

            tempContributionsToInsert.push(tempContribution);

            if (isValid) {
                validRecordsCount++;
            } else {
                invalidRecordsCount++;
            }
        }

        // Batch Insert into TEMP_CONTRIBUTIONS
        if (tempContributionsToInsert.length > 0) {
            const columns = Object.keys(tempContributionsToInsert[0]) as (keyof TempContributionData)[];
            const values = tempContributionsToInsert.map(contrib => columns.map(col => contrib[col]));
            const sql = `INSERT INTO TEMP_CONTRIBUTIONS (${columns.join(', ')}) VALUES ?`;
            await connection.query(sql, [values]);
        }

        // --- 3. Update Batch Record Status and Counts ---
        const finalBatchStatus = invalidRecordsCount > 0 ? 'Pending Validation' : 'Validated';
        await connection.query(
            'UPDATE UPLOAD_BATCHES SET valid_records = ?, invalid_records = ?, batch_status = ? WHERE batch_id = ?',
            [validRecordsCount, invalidRecordsCount, finalBatchStatus, batchId]
        );

        await connection.commit();

        return NextResponse.json({
            message: `File processed successfully. Batch ID: ${batchId}. Records: ${totalRecords} total, ${validRecordsCount} valid, ${invalidRecordsCount} invalid. Status: ${finalBatchStatus}`,
            batchId: batchId
        }, { status: 201 });

    } catch (error) {
        console.error('Contribution upload error:', error);
        if (connection) {
            await connection.rollback();
        }
        let errorMessage = 'Internal Server Error during upload';
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