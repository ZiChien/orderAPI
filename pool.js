import mysql from 'mysql2/promise';
// import env
import 'dotenv/config'


// Create the connection pool. The pool-specific settings are the defaults
const pool = mysql.createPool({
    host: process.env.MYSQL_HOST_DEV,
    user: process.env.MYSQL_USER_DEV,
    password: process.env.MYSQL_PASSWORD_DEV,
    database: process.env.MYSQL_DATABASE_DEV,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});
export default pool;

