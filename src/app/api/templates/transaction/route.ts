import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

export async function GET(request: NextRequest) {
  try {
    // Create a new workbook
    const workbook = XLSX.utils.book_new();

    // Define the transaction template structure - using exact headers expected by upload API
    const templateData = [
      ['reg_no', 'staff_no', 'transaction_type_name', 'transaction_date', 'transaction_mode', 'amount', 'description'],
      ['REG001', 'EMP001', 'Contribution', '2024-01-15', 'Cash', '25000.00', 'Monthly contribution payment'],
      ['REG002', 'EMP002', 'Loan Repayment', '2024-01-15', 'Bank Transfer', '15000.00', 'Loan monthly repayment'],
      ['REG003', 'EMP003', 'Deposit', '2024-01-15', 'Bank Transfer', '100000.00', 'Savings deposit'],
      ['REG004', 'EMP004', 'Contribution', '2024-01-15', 'Cash', '30000.00', 'Monthly contribution payment'],
      ['', '', '', '', '', '', ''],
      ['Instructions:', '', '', '', '', '', ''],
      ['1. reg_no: Enter member registration number (e.g., REG001)', '', '', '', '', '', ''],
      ['2. staff_no: Enter staff number (e.g., EMP001)', '', '', '', '', '', ''],
      ['3. transaction_type_name: Enter transaction type', '', '', '', '', '', ''],
      ['4. transaction_date: Enter date in YYYY-MM-DD format', '', '', '', '', '', ''],
      ['5. transaction_mode: Enter mode (Cash, Bank Transfer, etc.)', '', '', '', '', '', ''],
      ['6. amount: Enter amount in Naira (e.g., 25000.00)', '', '', '', '', '', ''],
      ['7. description: Enter transaction description (optional)', '', '', '', '', '', ''],
    ];

    // Create worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(templateData);

    // Set column widths
    worksheet['!cols'] = [
      { width: 15 }, // reg_no
      { width: 15 }, // staff_no
      { width: 20 }, // transaction_type_name
      { width: 18 }, // transaction_date
      { width: 18 }, // transaction_mode
      { width: 15 }, // amount
      { width: 35 }, // description
    ];

    // Style the header row
    const headerCells = ['A1', 'B1', 'C1', 'D1', 'E1', 'F1', 'G1'];
    headerCells.forEach(cell => {
      if (worksheet[cell]) {
        worksheet[cell].s = {
          font: { bold: true, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "7C3AED" } },
          alignment: { horizontal: "center" }
        };
      }
    });

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Transaction Template');

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Return the file
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="transaction_upload_template.xlsx"',
      },
    });
  } catch (error) {
    console.error('Error generating transaction template:', error);
    return NextResponse.json(
      { error: 'Failed to generate template' },
      { status: 500 }
    );
  }
}
