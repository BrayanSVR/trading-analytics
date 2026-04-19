// src/routes/dashboard.js
const express          = require('express');
const router           = express.Router();
const { getDashboard } = require('../controllers/dashboardController');

// GET /api/dashboard -> todos los KPIs del dashboard
router.get('/', getDashboard);

module.exports = router;
