import mysql from 'mysql2/promise';

// It is recommended to use environment variables for credentials in production
const dbConfig = {
  host: '50.6.160.202',
  user: 'cnbezvte_corpdbuser',
  password: '0msuH,0q-Ogg',
  database: 'cnbezvte_corpdb',
  waitForConnections: true,
  connectionLimit: 10, // Adjust pool size as needed
  queueLimit: 0,
  multipleStatements: true, // Allow execution of multiple SQL statements
};

let pool: mysql.Pool | null = null;

export function getDbPool() {
  if (!pool) {
    try {
      pool = mysql.createPool(dbConfig);
      console.log('MySQL connection pool created successfully.');
    } catch (error) {
      console.error('Error creating MySQL connection pool:', error);
      throw error; // Re-throw the error to indicate failure
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
