const mysql = require('mysql2/promise');

// Class concepts: MySQL connection pool, parameterised queries and MVC models.
// Keep local credentials in .env (which is excluded from GitHub).
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'petcare',
  waitForConnections: true,
  connectionLimit: 10,
  dateStrings: true
});
module.exports = pool;
