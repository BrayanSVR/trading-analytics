// ============================================================
// src/controllers/authController.js
// Controlador para autenticación y login
// ============================================================
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');

// Función de login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son obligatorios' });
    }

    // Buscar usuario en la base de datos
    const [rows] = await pool.query('SELECT * FROM app_users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const user = rows[0];

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Generar Token JWT
    const secret = process.env.JWT_SECRET || 'secret-basico-123';
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      secret,
      { expiresIn: '8h' } // El token expira en 8 horas (jornada laboral)
    );

    // No enviar la contraseña al cliente
    delete user.password;

    res.status(200).json({
      message: 'Inicio de sesión exitoso',
      token,
      user
    });
  } catch (error) {
    next(error);
  }
};

// Función para obtener los datos del usuario actual (me)
exports.getMe = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const [rows] = await pool.query('SELECT id, email, role, created_at FROM app_users WHERE id = ?', [userId]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.status(200).json({ user: rows[0] });
  } catch (error) {
    next(error);
  }
};
