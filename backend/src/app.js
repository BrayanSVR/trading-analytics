// ============================================================
// src/app.js - Punto de entrada del servidor Express
// ============================================================

const express  = require('express');
const cors     = require('cors');
require('dotenv').config();

const { testConnection } = require('./config/db');
const clientesRoutes     = require('./routes/clientes');
const dashboardRoutes    = require('./routes/dashboard');
const metricasRoutes     = require('./routes/metricas');
const importRoutes       = require('./routes/import');
const errorHandler       = require('./middleware/errorHandler');

const app  = express();
const PORT = process.env.PORT || 4000;

// ============================================================
// MIDDLEWARES GLOBALES
// ============================================================

// CORS: permite peticiones desde el frontend (React)
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173').split(',');
app.use(cors({
  origin: (origin, callback) => {
    // Permitir llamadas sin origin (Postman, curl) en desarrollo
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS bloqueado para: ${origin}`));
    }
  },
  methods:     ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));

// Parsear JSON en el body de las peticiones
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger simple para desarrollo: muestra cada request
app.use((req, _res, next) => {
  const now = new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' });
  console.log(`[${now}] ${req.method} ${req.originalUrl}`);
  next();
});

// ============================================================
// RUTAS DE LA API
// ============================================================
app.use('/api/clientes',  clientesRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/metricas',  metricasRoutes);
app.use('/api/v1/import', importRoutes);

// Ruta de salud: útil para verificar que el servidor responde
app.get('/api/health', (_req, res) => {
  res.json({
    status:    'OK',
    timestamp: new Date().toISOString(),
    version:   '1.0.0',
    ambiente:  process.env.NODE_ENV || 'development',
  });
});

// Ruta no encontrada (404)
app.use((_req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Manejador global de errores (siempre al final)
app.use(errorHandler);

// ============================================================
// INICIAR SERVIDOR
// ============================================================
async function startServer() {
  // Primero verificar la conexión a la base de datos
  await testConnection();

  app.listen(PORT, () => {
    console.log('');
    console.log('🚀 Servidor Trading Analytics corriendo');
    console.log(`   URL:  http://localhost:${PORT}`);
    console.log(`   API:  http://localhost:${PORT}/api`);
    console.log(`   Health: http://localhost:${PORT}/api/health`);
    console.log('');
    console.log('📌 Endpoints disponibles:');
    console.log('   GET /api/clientes');
    console.log('   GET /api/dashboard');
    console.log('   GET /api/metricas/fuentes');
    console.log('   GET /api/metricas/matriculas-mes');
    console.log('   GET /api/metricas/conversion');
    console.log('   GET /api/metricas/tiempo-conversion');
    console.log('   GET /api/metricas/valor-por-fuente');
  });
}

startServer().catch(console.error);

module.exports = app;
