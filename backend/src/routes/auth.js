const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');

// Endpoint público para login
router.post('/login', authController.login);

// Endpoint protegido para obtener datos del usuario actual y verificar si el token sigue vivo
router.get('/me', verifyToken, authController.getMe);

module.exports = router;
