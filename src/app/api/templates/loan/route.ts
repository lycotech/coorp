import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

export async function GET(request: NextRequest) {
  try {
    // Create a new workbook
    const workbook = XLSX.utils.book_new();

    // Define the loan template structure with correct headers
    const templateData = [
      ['ref_no', 'staff_no', 'reg_no', 'loan_type', 'amount_requested', 'monthly_repayment', 'repayment_period', 'interest_rate', 'purpose', 'date_applied'],
      ['LN001', 'M001', 'REG001', 'Personal Loan', '500000.00', '45833.33', '12', '12.5', 'Home improvement', '2025-01-15'],
      ['LN002', 'M002', 'REG002', 'Emergency Loan', '200000.00', '34666.67', '6', '10.0', 'Medical emergency', '2025-01-15'],
      ['LN003', 'M003', 'REG003', 'Business Loan', '1000000.00', '48000.00', '24', '15.0', 'Small business expansion', '2025-01-15'],
      ['LN004', 'M004', 'REG004', 'Educational Loan', '300000.00', '26500.00', '12', '8.0', 'University tuition fees', '2025-01-15'],
      ['', '', '', '', '', '', '', '', '', ''],
      ['Instructions:', '', '', '', '', '', '', '', '', ''],
      ['1. ref_no: Enter unique loan reference number (e.g., LN001, LN002)', '', '', '', '', '', '', '', '', ''],
      ['2. staff_no: Enter member staff number (e.g., M001)', '', '', '', '', '', '', '', '', ''],
      ['3. reg_no: Enter member registration number (e.g., REG001)', '', '', '', '', '', '', '', '', ''],
      ['4. loan_type: Enter loan type (Personal Loan, Emergency Loan, Business Loan, Educational Loan)', '', '', '', '', '', '', '', '', ''],
      ['5. amount_requested: Enter loan amount in Naira (e.g., 500000.00)', '', '', '', '', '', '', '', '', ''],
      ['6. monthly_repayment: Enter monthly repayment amount in Naira (e.g., 45833.33)', '', '', '', '', '', '', '', '', ''],
      ['7. repayment_period: Enter repayment period in months (e.g., 12)', '', '', '', '', '', '', '', '', ''],
      ['8. interest_rate: Enter annual interest rate as percentage (e.g., 12.5)', '', '', '', '', '', '', '', '', ''],
      ['9. purpose: Enter detailed loan purpose/reason', '', '', '', '', '', '', '', '', ''],
      ['10. date_applied: Enter application date in YYYY-MM-DD format', '', '', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', '', '', ''],
      ['Valid Loan Types:', '', '', '', '', '', '', '', '', ''],
      ['- Personal Loan (Up to ₦2,000,000, 6-36 months)', '', '', '', '', '', '', '', '', ''],
      ['- Emergency Loan (Up to ₦500,000, 3-12 months)', '', '', '', '', '', '', '', '', ''],
      ['- Business Loan (Up to ₦5,000,000, 12-60 months)', '', '', '', '', '', '', '', '', ''],
      ['- Educational Loan (Up to ₦1,000,000, 6-24 months)', '', '', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', '', '', ''],
      ['Interest Rate Guidelines:', '', '', '', '', '', '', '', '', ''],
      ['- Personal Loan: 10% - 15% per annum', '', '', '', '', '', '', '', '', ''],
      ['- Emergency Loan: 8% - 12% per annum', '', '', '', '', '', '', '', '', ''],
      ['- Business Loan: 12% - 18% per annum', '', '', '', '', '', '', '', '', ''],
      ['- Educational Loan: 6% - 10% per annum', '', '', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', '', '', ''],
      ['Monthly Repayment Calculation:', '', '', '', '', '', '', '', '', ''],
      ['Formula: (Principal + Interest) / Repayment Period', '', '', '', '', '', '', '', '', ''],
      ['Example: For ₦500,000 at 12.5% for 12 months:', '', '', '', '', '', '', '', '', ''],
      ['Monthly Payment = (500,000 + 62,500) / 12 = ₦45,833.33', '', '', '', '', '', '', '', '', ''],
    ];

    // Create worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(templateData);

    // Set column widths
    worksheet['!cols'] = [
      { width: 15 }, // ref_no
      { width: 15 }, // staff_no
      { width: 15 }, // reg_no
      { width: 18 }, // loan_type
      { width: 20 }, // amount_requested
      { width: 20 }, // monthly_repayment
      { width: 20 }, // repayment_period
      { width: 15 }, // interest_rate
      { width: 30 }, // purpose
      { width: 20 }, // date_applied
    ];

    // Style the header row
    const headerCells = ['A1', 'B1', 'C1', 'D1', 'E1', 'F1', 'G1', 'H1', 'I1', 'J1'];
    headerCells.forEach(cell => {
      if (worksheet[cell]) {
        worksheet[cell].s = {
          font: { bold: true, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "059669" } },
          alignment: { horizontal: "center" }
        };
      }
    });

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Loan Template');

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Return the file
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="loan_upload_template.xlsx"',
      },
    });
  } catch (error) {
    console.error('Error generating loan template:', error);
    return NextResponse.json(
      { error: 'Failed to generate template' },
      { status: 500 }
    );
  }
}
