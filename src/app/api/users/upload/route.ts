import { NextRequest, NextResponse } from 'next/server';
import * as xlsx from 'xlsx';
import { getDbPool } from '@/lib/db';
// import bcrypt from 'bcrypt'; // Not needed for MEMBERS only upload
import mysql from 'mysql2/promise';

// 1. Interface matching Excel headers now
interface MemberUploadRow {
  staff_no?: string | number;
  firstname?: string; // This column contains the combined name
  // Keep other optional fields if they exist in Excel
  email?: string;
  gender?: string;
  dob?: string | number;
  date_of_appoint?: string | number;
  retirement_date?: string | number;
  mobile_no?: string;
  state_of_origin?: string;
  rank_grade?: string;
  bank_name?: string;
  acct_no?: string;
  member_status?: 'Active' | 'Inactive' | 'Retired' | 'Suspended' | 'Terminated' | string;
  reg_no?: string;
}

// Name parsing helper (Keep as is, but we'll pass the correct input)
function parseName(fullName: string | undefined): { firstname: string | null, surname: string | null } {
     if (!fullName) return { firstname: null, surname: null };
    try {
        const commaParts = fullName.split(',');
        const surname = commaParts[0]?.trim() || null;
        const restOfName = commaParts[1]?.trim();
        let firstname = restOfName;
        if (restOfName?.includes('.')) {
            // Try finding space after period
            const periodIndex = restOfName.indexOf('.');
            const spaceIndex = restOfName.indexOf(' ', periodIndex);
            firstname = spaceIndex > periodIndex ? restOfName.substring(spaceIndex + 1).trim() : restOfName.substring(periodIndex + 1).trim();
        } 
        // Removed the simple space check as it might be too aggressive

        if (!firstname && restOfName) {
            firstname = restOfName; // Assign rest if no specific pattern found after comma
        }

        return { firstname: firstname || null, surname };
    } catch {
        // Catch block used, but error object itself isn't needed here
        console.error(`Error occurred while parsing name: ${fullName}`);
        // Fallback logic remains the same
        const fallbackSurname = fullName?.includes(',') ? fullName.split(',')[0].trim() : null;
        const fallbackFirstname = fallbackSurname ? fullName.substring(fullName.indexOf(',') + 1).trim() : (fullName || null);
        return { firstname: fallbackFirstname, surname: fallbackSurname };
    }
}

// Date formatting helper (remains the same)
function formatExcelDate(excelDate: string | number | undefined): string | null {
    try {
        let date: Date;
        if (typeof excelDate === 'number') {
            // Assume it's an Excel date code
            date = xlsx.SSF.parse_date_code(excelDate);
        } else if (typeof excelDate === 'string') {
             // Try parsing as a standard date string
             date = new Date(excelDate);
             // Basic validation for parsed date
             if (isNaN(date.getTime())) return null;
        } else {
            // If undefined or other type, return null
            return null;
        }
        // Format to YYYY-MM-DD
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    } catch (error) { // Changed variable name from 'e' to 'error'
        console.error("Error parsing date:", excelDate, error); // Log the error and the input
        return null;
    }
}

export async function POST(request: NextRequest) {
  console.log('Hit /api/users/upload POST route (MEMBERS only - Revised)');
  let connection: mysql.PoolConnection | null = null;
  let insertedCount = 0;
  let skippedCount = 0;
  const errors: string[] = [];

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
    }

    const pool = getDbPool();
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = xlsx.read(buffer, { type: 'buffer', cellDates: false });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData: MemberUploadRow[] = xlsx.utils.sheet_to_json(worksheet);

    console.log(`Found ${jsonData.length} data rows in the sheet.`);

     if (jsonData.length === 0) {
        await connection.rollback();
        return NextResponse.json({ message: 'Excel sheet is empty or has no data rows.', inserted: 0, skipped: 0, errors: [] }, { status: 200 });
    }


    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i];
      const rowIndex = i + 2;

      // 2. Updated Validation: Check only for staff_no and the original firstname column
      const staffNo = row.staff_no?.toString();
      const combinedName = row.firstname; // Read the combined name from the 'firstname' column

      if (!staffNo || !combinedName) {
        const missing = [];
        if (!staffNo) missing.push('staff_no');
        if (!combinedName) missing.push('firstname (containing name)'); // Clarify which field is expected
        errors.push(`Row ${rowIndex}: Missing required fields (${missing.join(', ')}).`);
        skippedCount++;
        continue;
      }

      // 3. Check for existing MEMBER only
      const [existingMembers] = await connection.query<mysql.RowDataPacket[]>(
          'SELECT id FROM MEMBERS WHERE staff_no = ? LIMIT 1',
          [staffNo]
      );

      if (existingMembers.length > 0) {
         errors.push(`Row ${rowIndex}: Member with Staff No '${staffNo}' already exists.`);
         skippedCount++;
         continue;
      }

      // 4. Parse Name from the combined field
      const { firstname: parsedFirstname, surname: parsedSurname } = parseName(combinedName);

      // 5. Check if parsing was successful
      if (!parsedFirstname || !parsedSurname) {
           errors.push(`Row ${rowIndex}: Could not reliably parse name field "${combinedName}" into firstname and surname.`);
           skippedCount++;
           continue;
      }

      // 6. Prepare data for MEMBERS table (using parsed names)
      const memberData = {
        staff_no: staffNo,
        reg_no: row.reg_no || `REG-${staffNo}`,
        email: row.email || null,
        firstname: parsedFirstname, // Use parsed first name
        surname: parsedSurname,     // Use parsed surname
        gender: row.gender || null,
        dob: formatExcelDate(row.dob),
        date_of_appoint: formatExcelDate(row.date_of_appoint),
        retirement_date: formatExcelDate(row.retirement_date),
        mobile_no: row.mobile_no || null,
        state_of_origin: row.state_of_origin || null,
        rank_grade: row.rank_grade || null,
        bank_name: row.bank_name || null,
        acct_no: row.acct_no || null,
        member_status: row.member_status || 'Active',
      };

      // 7. Insert into MEMBERS only
      await connection.query('INSERT INTO MEMBERS SET ?', memberData);

      insertedCount++;
    }

    await connection.commit();

    console.log(`Upload finished. Inserted: ${insertedCount}, Skipped: ${skippedCount}. Errors: ${errors.length}`);
    if (errors.length > 0) {
        console.log("Sample errors:", errors.slice(0, 10)); // Log first 10 errors
    }

    return NextResponse.json({
        message: `Upload finished. Inserted: ${insertedCount}, Skipped: ${skippedCount}.`,
        inserted: insertedCount,
        skipped: skippedCount,
        errors: errors
    }, { status: 200 });

  } catch (error) {
    console.error('Upload API Error:', error);
    if (connection) {
        try { await connection.rollback(); } catch (rbError) { console.error('Rollback Error:', rbError); }
    }
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({
         error: 'Failed to process upload',
         details: message,
         inserted: insertedCount,
         skipped: skippedCount,
         errors: errors
        }, { status: 500 });
  } finally {
      if (connection) {
        try { connection.release(); } catch (relError) { console.error('Release Error:', relError); }
      }
  }
} 