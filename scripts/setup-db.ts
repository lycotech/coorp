import { getDbPool, closeDbPool } from '../src/lib/db';
import fs from 'fs';
import path from 'path';

async function setupDatabase() {
  let connection;
  try {
    const pool = getDbPool();
    connection = await pool.getConnection();
    console.log('Successfully connected to the database.');

    const schemaPath = path.join(__dirname, '../Schema.sql'); // Adjust path if Schema.sql is elsewhere
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    console.log('Executing SQL schema...');
    // The result type for multiple statements might vary; adjust as needed
    const results = await connection.query(schemaSql);
    console.log('Database schema executed successfully.', results); // Log results for debugging

  } catch (error) {
    console.error('Error setting up database:', error);
  } finally {
    if (connection) {
      connection.release();
      console.log('Database connection released.');
    }
    // Close the pool after the script runs
    await closeDbPool();
  }
}

setupDatabase(); 