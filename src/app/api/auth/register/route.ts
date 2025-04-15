import { NextRequest, NextResponse } from 'next/server';
import { getDbPool } from '@/lib/db';
import bcrypt from 'bcrypt';
import mysql from 'mysql2/promise'; // Import for types

// Define user type
type UserRow = { id: number };

export async function POST(request: NextRequest) {
  let connection;
  try {
    const { staff_no, email, password } = await request.json();

    // Basic validation
    if (!staff_no || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const pool = getDbPool();
    connection = await pool.getConnection();

    // Check if user (staff_no or email) already exists
    const [existingUsers] = await connection.query<mysql.RowDataPacket[] & UserRow[]>(
      'SELECT id FROM USERS WHERE staff_no = ? OR email = ?',
      [staff_no, email]
    );

    if (existingUsers.length > 0) {
      return NextResponse.json({ error: 'User with this Staff Number or Email already exists' }, { status: 409 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10); // 10 salt rounds

    // Insert new user
    // Define a type for the result of an INSERT query
    type InsertResult = { affectedRows: number; insertId: number; /* other fields */ };
    await connection.query<mysql.OkPacket & InsertResult>(
      'INSERT INTO USERS (staff_no, email, password, login_type, login_status) VALUES (?, ?, ?, ?, ?)',
      [staff_no, email, hashedPassword, 'Admin', 'Active'] // Assuming default values
    );

    // You might want to link this to the MEMBERS table as well, depending on your logic
    // For now, we just create the user login record.

    return NextResponse.json({ message: 'User registered successfully' }, { status: 201 });

  } catch (error) {
    console.error('Registration failed:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    if (connection) {
      connection.release();
    }
  }
} 