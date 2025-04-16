import mysql from 'mysql2/promise';

// It is recommended to use environment variables for credentials in production
// Read database configuration from environment variables
const dbConfig = {
  host: process.env.DB_HOST || 'localhost', // Default to localhost if not set
  user: process.env.DB_USER, // No default recommended for user/password
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'cooperative_db', // Default database name
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306, // Default MySQL port
  waitForConnections: true,
  connectionLimit: 10, // Adjust pool size as needed
  queueLimit: 0,
  multipleStatements: true, // Allow execution of multiple SQL statements
};

let pool: mysql.Pool | null = null;

export function getDbPool() {
  if (!pool) {
    // Add a check for essential environment variables before creating the pool
    if (!dbConfig.user || !dbConfig.password || !dbConfig.host || !dbConfig.database) {
        console.error('Database configuration error: Missing required environment variables (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME).');
        // Optionally, throw an error to prevent pool creation with incomplete config
        // throw new Error('Missing required database environment variables.');
        // Or return null/handle gracefully depending on application needs
        return null; // Example: return null, adjust as needed
    }

    try {
      pool = mysql.createPool(dbConfig);
      console.log('MySQL connection pool created successfully.');
    } catch (error) {
      console.error('Error creating MySQL connection pool:', error);
      throw error; // Update DBRe-throw the error to indicate failure
    }
  }
  return pool;
}

// Optional: Function to gracefully close the pool on application shutdown
export async function closeDbPool() {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('MySQL connection pool closed.');
  }
}

// Example of how to get a connection (can be removed or adapted)
// async function testConnection() {
//   let connection;
//   try {
//     const pool = getDbPool();
//     connection = await pool.getConnection();
//     console.log('Successfully connected to the database.');
//     // Perform a simple query
//     const [rows] = await connection.query('SELECT 1 + 1 AS solution');
//     console.log('Query result:', rows);
//   } catch (error) {
//     console.error('Database connection test failed:', error);
//   } finally {
//     if (connection) {
//       connection.release(); // Always release the connection back to the pool
//     }
//   }
// }

// Uncomment to test the connection when the module loads
// testConnection(); 
