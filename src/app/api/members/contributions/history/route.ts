import { NextResponse } from 'next/server';
import { getDbPool } from '@/lib/db';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

export async function GET() {
  // Check if user is logged in
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
  }

  try {
    // Verify and decode the token
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    const staffNumber = payload.staff_number as string;

    if (!staffNumber) {
      return NextResponse.json({ error: 'Invalid token: Staff number not found' }, { status: 401 });
    }

    // Connect to the database
    const pool = await getDbPool();
    if (!pool) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }
    const connection = await pool.getConnection();

    try {
      // First, get the member's registration number using their staff number
      const [memberResult] = await connection.query(
        'SELECT registration_number FROM members WHERE staff_number = ?',
        [staffNumber]
      );

      const members = memberResult as { registration_number: string }[];
      if (members.length === 0) {
        return NextResponse.json({ error: 'Member not found' }, { status: 404 });
      }

      const regNumber = members[0].registration_number;

      // Get contribution transaction type ID
      const [transactionTypeResult] = await connection.query(
        'SELECT id FROM transaction_types WHERE name = ?',
        ['contribution']
      );

      const transactionTypes = transactionTypeResult as { id: number }[];
      if (transactionTypes.length === 0) {
        return NextResponse.json({ error: 'Contribution transaction type not found' }, { status: 404 });
      }

      const contributionTypeId = transactionTypes[0].id;

      // Fetch the member's contribution history
      const [contributionsResult] = await connection.query(
        `SELECT 
          t.id, 
          t.transaction_date, 
          t.amount, 
          t.description, 
          t.status,
          t.reference_no
        FROM 
          transactions t
        WHERE 
          t.member_id = ? 
          AND t.transaction_type_id = ?
        ORDER BY 
          t.transaction_date DESC`,
        [regNumber, contributionTypeId]
      );

      const contributions = contributionsResult as {
        id: number;
        transaction_date: string;
        amount: number;
        description: string;
        status: string;
        reference_no: string;
      }[];

      return NextResponse.json({ contributions }, { status: 200 });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error fetching contribution history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contribution history' },
      { status: 500 }
    );
  }
} 