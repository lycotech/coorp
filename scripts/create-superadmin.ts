import { getDbPool, closeDbPool } from '../src/lib/db';
import bcrypt from 'bcrypt';
import mysql from 'mysql2';

const ADMIN_STAFF_NO = 'admin'; // Use 'admin' as staff_no identifier
const ADMIN_EMAIL = 'admin@example.com'; // Provide a dummy email
const ADMIN_PASSWORD = 'admin';

async function createSuperAdmin() {
  let connection;
  try {
    console.log('Connecting to database...');
    const pool = getDbPool();
    connection = await pool.getConnection();
    console.log('Successfully connected.');

    // Check if admin user already exists
    // Define a type for the expected row structure (even if just ID)
    type UserRow = { id: number };
    const [existingAdmins] = await connection.query<mysql.RowDataPacket[] & UserRow[]>(
      'SELECT id FROM USERS WHERE staff_no = ? OR email = ?',
      [ADMIN_STAFF_NO, ADMIN_EMAIL]
    );

    if (existingAdmins.length > 0) {
      console.log('Admin user already exists.');
      return; // Exit if admin already exists
    }

    console.log('Admin user not found, creating...');
    // Hash the admin password
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

    // Insert the admin user
    // Define a type for the result of an INSERT query
    type InsertResult = { affectedRows: number; insertId: number; /* other fields */ };
    const [result] = await connection.query<mysql.OkPacket & InsertResult>(
      'INSERT INTO USERS (staff_no, email, password, login_type, login_status) VALUES (?, ?, ?, ?, ?)',
      [ADMIN_STAFF_NO, ADMIN_EMAIL, hashedPassword, 'SuperAdmin', 'Active'] // Use 'SuperAdmin' type
    );

    if (result.affectedRows > 0) {
      console.log('Superadmin user created successfully!');
    } else {
      console.error('Failed to create superadmin user.');
    }

  } catch (error) {
    console.error('Error creating superadmin:', error);
  } finally {
    if (connection) {
      console.log('Releasing database connection.');
      connection.release();
    }
    // Close the pool
    await closeDbPool();
  }
}

createSuperAdmin(); 