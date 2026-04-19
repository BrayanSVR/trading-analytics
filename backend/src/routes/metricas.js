// src/routes/metricas.js
const express = require('express');
const router  = express.Router();
const {
  getMetricasFuentes,
  getMatriculasPorMes,
  getMetricasConversion,
  getTiempoConversion,
  getValorPorFuente,
} = require('../controllers/metricasController');

// GET /api/metricas/fuentes           -> leads y conversión por canal
router.get('/fuentes', getMetricasFuentes);

// GET /api/metricas/matriculas-mes    -> matrículas por mes (param: ?meses=6)
router.get('/matriculas-mes', getMatriculasPorMes);

// GET /api/metricas/conversion        -> embudo de conversión
router.get('/conversion', getMetricasConversion);

// GET /api/metricas/tiempo-conversion -> tiempo promedio de cierre
router.get('/tiempo-conversion', getTiempoConversion);

// GET /api/metricas/valor-por-fuente  -> ROI por canal
router.get('/valor-por-fuente', getValorPorFuente);

module.exports = router;
