// ============================================================
// src/migrate.js
// Script para inicializar la base de datos (tablas necesarias)
// ============================================================
require('dotenv').config();
const { pool } = require('./config/db');
const bcrypt = require('bcryptjs');

async function migrate() {
  try {
    console.log('Iniciando migraciones...');
    
    // Crear tabla de usuarios si no existe
    await pool.query(`
      CREATE TABLE IF NOT EXISTS app_users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'viewer') NOT NULL DEFAULT 'viewer',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabla "app_users" verificada/creada');

    // Verificar si existe el administrador
    const [rows] = await pool.query('SELECT * FROM app_users WHERE email = ?', ['admin@empresa.com']);
    
    if (rows.length === 0) {
      // Crear usuario administrador por defecto
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      await pool.query(
        'INSERT INTO app_users (email, password, role) VALUES (?, ?, ?)',
        ['admin@empresa.com', hashedPassword, 'admin']
      );
      console.log('✅ Usuario administrador creado (admin@empresa.com / admin123)');
    } else {
      console.log('ℹ️ Usuario administrador ya existe');
    }

    // Verificar si existe el visor
    const [viewerRows] = await pool.query('SELECT * FROM app_users WHERE email = ?', ['viewer@empresa.com']);
    if (viewerRows.length === 0) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('viewer123', salt);
      await pool.query(
        'INSERT INTO app_users (email, password, role) VALUES (?, ?, ?)',
        ['viewer@empresa.com', hashedPassword, 'viewer']
      );
      console.log('✅ Usuario visor creado (viewer@empresa.com / viewer123)');
    } else {
      console.log('ℹ️ Usuario visor ya existe');
    }

    console.log('🎉 Migraciones completadas correctamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en las migraciones:', error);
    process.exit(1);
  }
}

migrate();
