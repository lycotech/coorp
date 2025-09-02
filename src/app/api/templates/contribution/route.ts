import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

export async function GET(request: NextRequest) {
  try {
    // Create a new workbook
    const workbook = XLSX.utils.book_new();

    // Define the contribution template structure - using exact headers expected by upload API
    const templateData = [
      ['reg_no', 'staff_no', 'contribution_type', 'contribution_date', 'amount'],
      ['REG001', 'EMP001', 'Monthly', '2024-01-15', '25000.00'],
      ['REG002', 'EMP002', 'Special', '2024-01-15', '30000.00'],
      ['REG003', 'EMP003', 'Monthly', '2024-01-15', '20000.00'],
      ['', '', '', '', ''],
      ['Instructions:', '', '', '', ''],
      ['1. reg_no: Enter member registration number (e.g., REG001)', '', '', '', ''],
      ['2. staff_no: Enter staff number (e.g., EMP001)', '', '', '', ''],
      ['3. contribution_type: Enter contribution type (e.g., Monthly, Special)', '', '', '', ''],
      ['4. contribution_date: Enter date in YYYY-MM-DD format', '', '', '', ''],
      ['5. amount: Enter amount in Naira (e.g., 25000.00)', '', '', '', ''],
    ];

    // Create worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(templateData);

    // Set column widths
    worksheet['!cols'] = [
      { width: 15 }, // reg_no
      { width: 15 }, // staff_no
      { width: 20 }, // contribution_type
      { width: 20 }, // contribution_date
      { width: 15 }, // amount
    ];

    // Style the header row
    const headerCells = ['A1', 'B1', 'C1', 'D1', 'E1'];
    headerCells.forEach(cell => {
      if (worksheet[cell]) {
        worksheet[cell].s = {
          font: { bold: true, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "4F46E5" } },
          alignment: { horizontal: "center" }
        };
      }
    });

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Contribution Template');

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Return the file
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="contribution_upload_template.xlsx"',
      },
    });
  } catch (error) {
    console.error('Error generating contribution template:', error);
    return NextResponse.json(
      { error: 'Failed to generate template' },
      { status: 500 }
    );
  }
}
