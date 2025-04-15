import { NextResponse } from 'next/server';
import { getDbPool } from '@/lib/db';
import mysql from 'mysql2/promise';

// Define the structure for the summary data
interface DashboardSummary {
    totalSavings: number | null;
    totalCommodity: number | null; // Assuming commodity balance exists
    totalActiveMembers: number;
    totalApplicants: number; // Clarify definition
    loanCounts: {
        total: number;
        declined: number;
        pending: number;
        active: number;
    };
    memberLoanStats: {
        totalActiveMembers: number;
        membersOnActiveLoan: number;
    };
}

export async function GET() {
    let connection: mysql.PoolConnection | null = null;

    try {
        const pool = getDbPool();
        connection = await pool.getConnection();

        // --- Aggregate Queries --- 

        // 1. Total Savings Balance (using transaction type name)
        const [savingsResult] = await connection.query<mysql.RowDataPacket[]>(
            `SELECT SUM(mb.current_balance) as total 
             FROM MEMBER_BALANCES mb
             JOIN TRANSACTION_TYPES tt ON mb.transaction_type_id = tt.id
             WHERE tt.type_name = ?`,
            ['Savings'] // Assuming 'Savings' is the correct type_name
        );
        const totalSavings = savingsResult[0]?.total ?? 0;

        // 2. Total Commodity Balance (assuming type_name is 'Commodity')
        const [commodityResult] = await connection.query<mysql.RowDataPacket[]>(
             `SELECT SUM(mb.current_balance) as total 
             FROM MEMBER_BALANCES mb
             JOIN TRANSACTION_TYPES tt ON mb.transaction_type_id = tt.id
             WHERE tt.type_name = ?`,
            ['Commodity'] // Assuming 'Commodity' is the correct type_name
        );
        const totalCommodity = commodityResult[0]?.total ?? 0;

        // 3. Total Active Membership
        const [activeMemberResult] = await connection.query<mysql.RowDataPacket[]>(
            "SELECT COUNT(*) as count FROM MEMBERS WHERE member_status = ?",
            ['Active']
        );
        const totalActiveMembers = activeMemberResult[0]?.count ?? 0;

        // 4. Total Applicants (Placeholder - using total members for now)
        // TODO: Replace this with the correct query based on definition
        const [applicantResult] = await connection.query<mysql.RowDataPacket[]>(
            "SELECT COUNT(*) as count FROM MEMBERS"
        );
        const totalApplicants = applicantResult[0]?.count ?? 0;

        // 5. Loan Counts by Status
        const [loanCountsResult] = await connection.query<mysql.RowDataPacket[]>(
            `SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'Declined' THEN 1 ELSE 0 END) as declined,
                SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN status = 'Active' THEN 1 ELSE 0 END) as active
             FROM LOANS`
            // Add WHERE clause if needed (e.g., filter by date range)
        );
        const loanCounts = {
            total: loanCountsResult[0]?.total ?? 0,
            declined: loanCountsResult[0]?.declined ?? 0,
            pending: loanCountsResult[0]?.pending ?? 0,
            active: loanCountsResult[0]?.active ?? 0,
        };

        // 6. Members on Active Loan
        const [membersOnLoanResult] = await connection.query<mysql.RowDataPacket[]>(
            "SELECT COUNT(DISTINCT staff_no) as count FROM LOANS WHERE status = ?",
            ['Active']
        );
        const membersOnActiveLoan = membersOnLoanResult[0]?.count ?? 0;

        // --- Compile Response --- 
        const summary: DashboardSummary = {
            totalSavings,
            totalCommodity,
            totalActiveMembers,
            totalApplicants,
            loanCounts,
            memberLoanStats: {
                totalActiveMembers: totalActiveMembers, // Reuse count from above
                membersOnActiveLoan: membersOnActiveLoan,
            },
        };

        return NextResponse.json(summary, { status: 200 });

    } catch (error) {
        console.error('Error fetching dashboard summary:', error);
        return NextResponse.json({ error: 'Internal Server Error fetching dashboard summary' }, { status: 500 });
    } finally {
        if (connection) {
            connection.release();
        }
    }
} 