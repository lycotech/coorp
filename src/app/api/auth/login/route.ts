import { NextRequest, NextResponse } from 'next/server';
import { getDbPool } from '@/lib/db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
// import { cookies } from 'next/headers'; // No longer needed here
import mysql from 'mysql2/promise'; // Import for types

// Define user type based on your DB schema
type User = {
  id: number;
  staff_no: string;
  email: string;
  password?: string; // Password might not always be selected
  login_status: string;
  login_type: string;
  // Add other relevant fields like login_type if needed
};

// NOTE: This is a basic login. For production, implement session management (e.g., JWT, next-auth)

export async function POST(request: NextRequest) {
  let connection;
  try {
    const { identifier, password } = await request.json(); // identifier can be staff_no or email

    if (!identifier || !password) {
      return NextResponse.json({ error: 'Missing identifier or password' }, { status: 400 });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET is not defined in environment variables.');
      return NextResponse.json({ error: 'Internal Server Configuration Error' }, { status: 500 });
    }

    const pool = getDbPool();
    connection = await pool.getConnection();

    // Find user by staff_no or email - Select necessary fields for JWT
    const [users] = await connection.query<mysql.RowDataPacket[] & User[]>(
      'SELECT id, staff_no, email, password, login_status, login_type FROM USERS WHERE staff_no = ? OR email = ?',
      [identifier, identifier]
    );

    if (users.length === 0) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const user = users[0];

    // Check password
    if (!user.password) {
        console.error('User password hash not found in DB result for user:', user.id);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Check account status (optional, based on your schema)
    if (user.login_status !== 'Active') {
        return NextResponse.json({ error: 'Account is not active' }, { status: 403 });
    }

    // Generate JWT
    const tokenPayload = {
      userId: user.id,
      staffNo: user.staff_no,
      email: user.email,
      // Add role/type if available and needed for authorization
      type: user.login_type
    };

    const token = jwt.sign(tokenPayload, jwtSecret, {
      expiresIn: '1h', // Token expiry time (e.g., 1 hour)
    });

    // Update last_login time (optional)
    await connection.query('UPDATE USERS SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);

    // Set cookie and return success
    const response = NextResponse.json({ message: 'Login successful' }, { status: 200 });

    response.cookies.set('sessionToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60, // 1 hour in seconds
      path: '/',
      sameSite: 'lax',
    });

    return response;

  } catch (error) {
    console.error('Login failed:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    if (connection) {
      connection.release();
    }
  }
} 