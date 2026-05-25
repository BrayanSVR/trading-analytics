// ============================================================
// src/config/db.js
// Configuración de conexión a MySQL
// ============================================================
// Usamos un "pool" de conexiones en vez de una sola conexión.
// El pool maneja varias conexiones al mismo tiempo sin cuellos
// de botella. Es la práctica estándar en producción.
// ============================================================

const mysql = require('mysql2/promise');
require('dotenv').config();

// Crear el pool de conexiones (soporta variables locales y variables automáticas de Railway)
const pool = mysql.createPool({
  host:            process.env.DB_HOST     || process.env.MYSQLHOST     || 'localhost',
  port:            process.env.DB_PORT     || process.env.MYSQLPORT     || 3306,
  user:            process.env.DB_USER     || process.env.MYSQLUSER     || 'root',
  password:        process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : (process.env.MYSQLPASSWORD !== undefined ? process.env.MYSQLPASSWORD : 'enero201998'),
  database:        process.env.DB_NAME     || process.env.MYSQLDATABASE || 'trading_analytics',
  waitForConnections: true,   // Espera si no hay conexiones libres
  connectionLimit: 10,        // Máximo 10 conexiones simultáneas
  queueLimit:      0,         // Sin límite en la cola de espera
  timezone:        '-05:00',  // UTC-5 Colombia
});

// Función que prueba la conexión al arrancar el servidor
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ MySQL conectado correctamente');
    console.log(`   Host: ${process.env.DB_HOST} | DB: ${process.env.DB_NAME}`);
    connection.release(); // Siempre devolver la conexión al pool
  } catch (error) {
    console.error('❌ Error conectando a MySQL:', error.message);
    console.error('   Verifica: host, usuario, contraseña y que MySQL esté corriendo');
    process.exit(1); // Detener servidor si no hay DB
  }
}

module.exports = { pool, testConnection };
