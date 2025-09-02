import { NextRequest, NextResponse } from 'next/server';
import { getDbPool } from '@/lib/db';
import mysql from 'mysql2/promise';

// Structure for data from MEMBER_BALANCES and TRANSACTION_TYPES
interface MemberBalance {
    transaction_type_id: number;
    current_balance: number; // Assuming DECIMAL is fetched as number or string parseable to number
    type_name: string; // From joined TRANSACTION_TYPES
}

// Keep the interface for documentation, but don't use it in the signature
// interface RouteContext {
//     params: {
//         staffNo: string;
//     }
// }

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ staffNo: string }> }
) {
    // Await params before accessing properties
    const { staffNo } = await context.params;
    let connection: mysql.PoolConnection | null = null;

    if (!staffNo) {
        return NextResponse.json({ error: 'Staff Number is required' }, { status: 400 });
    }

    try {
        const pool = getDbPool();
        if (!pool) {
            return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
        }
        connection = await pool.getConnection();

        // 1. Fetch member's reg_no using staff_no
        const [memberRows] = await connection.query<mysql.RowDataPacket[]>(
            'SELECT reg_no FROM MEMBERS WHERE staff_no = ? LIMIT 1',
            [staffNo]
        );

        if (memberRows.length === 0) {
            return NextResponse.json({ error: 'Member not found with this Staff Number' }, { status: 404 });
        }
        const regNo = memberRows[0].reg_no;

        // 2. Fetch balances for that reg_no, joining with transaction types
        const [balanceRows] = await connection.query<mysql.RowDataPacket[] & MemberBalance[]>(
            `SELECT mb.transaction_type_id, mb.current_balance, tt.type_name
             FROM MEMBER_BALANCES mb
             JOIN TRANSACTION_TYPES tt ON mb.transaction_type_id = tt.id
             WHERE mb.reg_no = ?`,
            [regNo]
        );

        // 3. Format the result into a key-value object { type_name: balance }
        const balances: { [key: string]: number | null } = {};
        balanceRows.forEach(row => {
            // Ensure balance is parsed as a float
            const balanceValue = row.current_balance !== null ? parseFloat(row.current_balance as unknown as string) : null;
            balances[row.type_name] = balanceValue;
        });

        // TODO: Optionally fetch *all* transaction types and merge to show 0 balances for types the member doesn't have yet.

        return NextResponse.json(balances, { status: 200 });

    } catch (error) {
        console.error(`Error fetching balances for staff no ${staffNo}:`, error);
        return NextResponse.json({ error: 'Internal Server Error fetching balances' }, { status: 500 });
    } finally {
        if (connection) {
            connection.release();
        }
    }
} 