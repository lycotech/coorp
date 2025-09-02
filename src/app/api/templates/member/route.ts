import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

export async function GET(request: NextRequest) {
  try {
    // Create a new workbook
    const workbook = XLSX.utils.book_new();

    // Define the member template structure - using fields expected by upload API
    const templateData = [
      ['staff_no', 'firstname', 'email', 'gender', 'dob', 'date_of_appoint', 'retirement_date', 'mobile_no', 'state_of_origin', 'rank_grade', 'bank_name', 'acct_no', 'member_status', 'reg_no'],
      ['EMP001', 'Doe, John A.', 'john.doe@company.com', 'Male', '1990-01-15', '2023-01-15', '2055-01-15', '+234-801-234-5678', 'Lagos', 'Grade 08', 'First Bank', '1234567890', 'Active', 'REG001'],
      ['EMP002', 'Smith, Jane M.', 'jane.smith@company.com', 'Female', '1985-06-10', '2022-06-10', '2050-06-10', '+234-803-456-7890', 'Kano', 'Grade 10', 'GTBank', '2345678901', 'Active', 'REG002'],
      ['EMP003', 'Johnson, Bob K.', 'bob.johnson@company.com', 'Male', '1988-03-20', '2023-03-20', '2053-03-20', '+234-805-678-9012', 'Ogun', 'Grade 07', 'UBA', '3456789012', 'Active', 'REG003'],
      ['', '', '', '', '', '', '', '', '', '', '', '', '', ''],
      ['Instructions:', '', '', '', '', '', '', '', '', '', '', '', '', ''],
      ['1. staff_no: Unique staff number (e.g., EMP001)', '', '', '', '', '', '', '', '', '', '', '', '', ''],
      ['2. firstname: Full name in format "Surname, First Middle" (e.g., Doe, John A.)', '', '', '', '', '', '', '', '', '', '', '', '', ''],
      ['3. email: Valid email address', '', '', '', '', '', '', '', '', '', '', '', '', ''],
      ['4. gender: Male or Female', '', '', '', '', '', '', '', '', '', '', '', '', ''],
      ['5. dob: Date of birth in YYYY-MM-DD format', '', '', '', '', '', '', '', '', '', '', '', '', ''],
      ['6. date_of_appoint: Employment date in YYYY-MM-DD format', '', '', '', '', '', '', '', '', '', '', '', '', ''],
      ['7. retirement_date: Retirement date in YYYY-MM-DD format', '', '', '', '', '', '', '', '', '', '', '', '', ''],
      ['8. mobile_no: Phone number with country code', '', '', '', '', '', '', '', '', '', '', '', '', ''],
      ['9. state_of_origin: State of origin', '', '', '', '', '', '', '', '', '', '', '', '', ''],
      ['10. rank_grade: Employee rank/grade', '', '', '', '', '', '', '', '', '', '', '', '', ''],
      ['11. bank_name: Bank name for salary payments', '', '', '', '', '', '', '', '', '', '', '', '', ''],
      ['12. acct_no: Bank account number', '', '', '', '', '', '', '', '', '', '', '', '', ''],
      ['13. member_status: Active, Inactive, Retired, Suspended, or Terminated', '', '', '', '', '', '', '', '', '', '', '', '', ''],
      ['14. reg_no: Registration number (e.g., REG001)', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ];

    // Create worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(templateData);

    // Set column widths
    worksheet['!cols'] = [
      { width: 15 }, // staff_no
      { width: 25 }, // firstname (full name)
      { width: 30 }, // email
      { width: 10 }, // gender
      { width: 15 }, // dob
      { width: 18 }, // date_of_appoint
      { width: 18 }, // retirement_date
      { width: 18 }, // mobile_no
      { width: 15 }, // state_of_origin
      { width: 15 }, // rank_grade
      { width: 20 }, // bank_name
      { width: 15 }, // acct_no
      { width: 15 }, // member_status
      { width: 15 }, // reg_no
    ];

    // Style the header row
    const headerCells = ['A1', 'B1', 'C1', 'D1', 'E1', 'F1', 'G1', 'H1', 'I1', 'J1', 'K1', 'L1', 'M1', 'N1'];
    headerCells.forEach(cell => {
      if (worksheet[cell]) {
        worksheet[cell].s = {
          font: { bold: true, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "DC2626" } },
          alignment: { horizontal: "center" }
        };
      }
    });

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Member Template');

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Return the file
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="member_upload_template.xlsx"',
      },
    });
  } catch (error) {
    console.error('Error generating member template:', error);
    return NextResponse.json(
      { error: 'Failed to generate template' },
      { status: 500 }
    );
  }
}
