// ============================================================
// src/middleware/auth.js
// Middleware para proteger rutas con JWT y control de roles
// ============================================================
const jwt = require('jsonwebtoken');

// Middleware para verificar que el usuario esté autenticado (token válido)
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(403).json({ error: 'Un token es requerido para la autenticación' });
  }

  try {
    // El token generalmente viene como "Bearer <token>"
    const tokenPart = token.split(' ')[1] || token;
    const decoded = jwt.verify(tokenPart, process.env.JWT_SECRET || 'secret-basico-123');
    req.user = decoded; // Guardamos los datos del token en req.user (id, email, role)
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
  return next();
};

// Middleware para verificar que el usuario tenga rol de admin
const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ error: 'Acceso denegado. Se requiere rol de administrador' });
};

module.exports = {
  verifyToken,
  requireAdmin
};
