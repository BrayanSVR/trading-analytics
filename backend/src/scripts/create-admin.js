// ============================================================
// src/scripts/create-admin.js
// Script utilitario para crear usuarios (incluyendo administradores)
// ============================================================
require('dotenv').config();
const { pool } = require('../config/db');
const bcrypt = require('bcryptjs');
const readline = require('readline');

// Configuración de interfaz interactiva en terminal
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const askQuestion = (query) => new Promise((resolve) => rl.question(query, resolve));

async function main() {
  try {
    let email = process.argv[2];
    let password = process.argv[3];
    let role = process.argv[4] || 'admin';

    console.log('\n=============================================');
    console.log('  🛠️  CREACIÓN DE USUARIOS - TRADING ANALYTICS');
    console.log('=============================================\n');

    // Si no se pasaron argumentos de email o contraseña por CLI, solicitarlos interactivamente
    if (!email || !password) {
      if (!email) {
        email = await askQuestion('📧 Introduce el email del usuario: ');
      }
      if (!password) {
        password = await askQuestion('🔑 Introduce la contraseña: ');
      }
      
      const inputRole = await askQuestion('👥 Introduce el rol (admin/viewer) [admin]: ');
      if (inputRole.trim()) {
        role = inputRole.trim().toLowerCase();
      }
    }

    email = email.trim();
    password = password.trim();
    role = role.trim();

    if (!email || !password) {
      console.error('\n❌ Error: El email y la contraseña son campos obligatorios.\n');
      rl.close();
      process.exit(1);
    }

    // Validar el formato del email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.error('\n❌ Error: El formato de correo electrónico no es válido.\n');
      rl.close();
      process.exit(1);
    }

    if (role !== 'admin' && role !== 'viewer') {
      console.error('\n❌ Error: El rol debe ser "admin" o "viewer".\n');
      rl.close();
      process.exit(1);
    }

    console.log('\n⏳ Conectando a la base de datos y validando...');

    // Verificar si el usuario ya existe
    const [rows] = await pool.query('SELECT * FROM app_users WHERE email = ?', [email]);
    if (rows.length > 0) {
      console.error(`\n❌ Error: El usuario con email "${email}" ya existe en el sistema.\n`);
      rl.close();
      process.exit(1);
    }

    // Hashear la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insertar en la base de datos
    await pool.query(
      'INSERT INTO app_users (email, password, role) VALUES (?, ?, ?)',
      [email, hashedPassword, role]
    );

    console.log('\n✨ ==========================================');
    console.log('  ✅ ¡USUARIO CREADO CON ÉXITO!');
    console.log('  ==========================================');
    console.log(`  📧 Email: ${email}`);
    console.log(`  👥 Rol:   ${role}`);
    console.log('=============================================\n');

  } catch (error) {
    console.error('\n❌ Error inesperado creando el usuario:', error.message || error);
  } finally {
    rl.close();
    process.exit(0);
  }
}

main();
