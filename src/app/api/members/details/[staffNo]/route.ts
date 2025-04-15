import { NextRequest, NextResponse } from 'next/server';
import { getDbPool } from '@/lib/db';
import mysql from 'mysql2/promise';

// Define expected data structure from MEMBERS table
interface MemberDetails {
    id: number;
    staff_no: string;
    email: string | null;
    firstname: string | null;
    surname: string | null;
    member_status: string | null;
    // Include other fields you might want to display
}

// Define structure for the USERS table check
interface UserCheck {
    id: number;
}

export async function GET(
    request: NextRequest,
    { params }: { params: { staffNo: string } }
) {
    const staffNo = params.staffNo;
    let connection: mysql.PoolConnection | null = null;

    if (!staffNo) {
        return NextResponse.json({ error: 'Staff Number is required' }, { status: 400 });
    }

    try {
        const pool = getDbPool();
        connection = await pool.getConnection();

        // Fetch member details
        const [memberRows] = await connection.query<mysql.RowDataPacket[] & MemberDetails[]>(
            'SELECT id, staff_no, email, firstname, surname, member_status FROM MEMBERS WHERE staff_no = ? LIMIT 1',
            [staffNo]
        );

        if (memberRows.length === 0) {
            return NextResponse.json({ error: 'Member not found with this Staff Number' }, { status: 404 });
        }

        const memberDetails = memberRows[0];

        // Check if a login already exists for this member
        const [userRows] = await connection.query<mysql.RowDataPacket[] & UserCheck[]>(
            'SELECT id FROM USERS WHERE staff_no = ? LIMIT 1',
            [staffNo]
        );

        const loginExists = userRows.length > 0;

        // Return member details and whether a login exists
        return NextResponse.json({ member: memberDetails, loginExists }, { status: 200 });

    } catch (error) {
        console.error('Error fetching member details:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    } finally {
        if (connection) {
            connection.release();
        }
    }
} 