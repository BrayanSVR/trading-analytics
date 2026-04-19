// src/routes/clientes.js
const express = require('express');
const router  = express.Router();
const {
  getClientes,
  getClientePorId,
  crearCliente,
  actualizarCliente,
} = require('../controllers/clientesController');

// GET  /api/clientes          -> lista paginada con filtros
// POST /api/clientes          -> crear nuevo lead
router.route('/').get(getClientes).post(crearCliente);

// GET /api/clientes/:id       -> detalle de un cliente
// PUT /api/clientes/:id       -> actualizar un cliente
router.route('/:id').get(getClientePorId).put(actualizarCliente);

module.exports = router;
