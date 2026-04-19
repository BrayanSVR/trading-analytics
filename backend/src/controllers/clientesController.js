// ============================================================
// src/controllers/clientesController.js
// Lógica de negocio para el módulo de clientes
// ============================================================

const { pool } = require('../config/db');

// ── GET /api/clientes ────────────────────────────────────────
// Retorna todos los clientes con filtros opcionales
// Query params:
//   ?estado=lead|matriculado|rechazado|inactivo
//   ?fuente=Facebook|Instagram|...
//   ?buscar=nombre_o_email
//   ?pagina=1&limite=20
// ─────────────────────────────────────────────────────────────
async function getClientes(req, res, next) {
  try {
    const { estado, fuente, buscar, pagina = 1, limite = 20 } = req.query;

    // Construir cláusula WHERE dinámicamente
    const condiciones = [];
    const valores     = [];

    if (estado) {
      condiciones.push('c.estado = ?');
      valores.push(estado);
    }
    if (fuente) {
      condiciones.push('c.fuente = ?');
      valores.push(fuente);
    }
    if (buscar) {
      condiciones.push('(c.nombre LIKE ? OR c.apellido LIKE ? OR c.email LIKE ?)');
      const termino = `%${buscar}%`;
      valores.push(termino, termino, termino);
    }

    const where    = condiciones.length ? `WHERE ${condiciones.join(' AND ')}` : '';
    const offset   = (parseInt(pagina) - 1) * parseInt(limite);

    // Consulta principal
    const [clientes] = await pool.query(
      `SELECT
         c.id,
         c.nombre,
         c.apellido,
         CONCAT(c.nombre, ' ', c.apellido) AS nombre_completo,
         c.email,
         c.telefono,
         c.fuente,
         c.campaña,
         c.estado,
         c.valor_potencial,
         c.fecha_registro,
         c.notas,
         -- Datos de matrícula si existe
         m.id          AS matricula_id,
         m.curso,
         m.valor_pagado,
         m.fecha_matricula,
         -- Días que tardó en matricularse
         CASE
           WHEN m.fecha_matricula IS NOT NULL
           THEN DATEDIFF(m.fecha_matricula, c.fecha_registro)
           ELSE NULL
         END AS dias_para_matricularse
       FROM clientes c
       LEFT JOIN matriculas m ON m.cliente_id = c.id
       ${where}
       ORDER BY c.fecha_registro DESC
       LIMIT ? OFFSET ?`,
      [...valores, parseInt(limite), offset]
    );

    // Contar total para paginación
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM clientes c ${where}`,
      valores
    );

    res.json({
      datos:        clientes,
      paginacion: {
        total,
        pagina:       parseInt(pagina),
        limite:       parseInt(limite),
        total_paginas: Math.ceil(total / parseInt(limite)),
      },
    });
  } catch (error) {
    next(error);
  }
}

// ── GET /api/clientes/:id ────────────────────────────────────
// Retorna un cliente con su historial completo
// ─────────────────────────────────────────────────────────────
async function getClientePorId(req, res, next) {
  try {
    const { id } = req.params;

    const [[cliente]] = await pool.query(
      `SELECT
         c.*,
         m.id          AS matricula_id,
         m.curso,
         m.valor_pagado,
         m.fecha_matricula,
         m.estado      AS estado_matricula,
         m.metodo_pago,
         DATEDIFF(m.fecha_matricula, c.fecha_registro) AS dias_para_matricularse
       FROM clientes c
       LEFT JOIN matriculas m ON m.cliente_id = c.id
       WHERE c.id = ?`,
      [id]
    );

    if (!cliente) {
      return res.status(404).json({ error: `Cliente con id ${id} no encontrado` });
    }

    res.json(cliente);
  } catch (error) {
    next(error);
  }
}

// ── POST /api/clientes ───────────────────────────────────────
// Crea un nuevo cliente (lead)
// ─────────────────────────────────────────────────────────────
async function crearCliente(req, res, next) {
  try {
    const {
      nombre, apellido, email, telefono,
      fuente, campaña, valor_potencial, notas
    } = req.body;

    // Validaciones básicas
    if (!nombre || !apellido || !email || !fuente) {
      return res.status(400).json({
        error: 'Campos requeridos: nombre, apellido, email, fuente',
      });
    }

    const [resultado] = await pool.query(
      `INSERT INTO clientes
         (nombre, apellido, email, telefono, fuente, campaña, valor_potencial, notas)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [nombre, apellido, email, telefono || null, fuente,
       campaña || null, valor_potencial || 0, notas || null]
    );

    res.status(201).json({
      mensaje:    'Cliente creado exitosamente',
      cliente_id: resultado.insertId,
    });
  } catch (error) {
    next(error);
  }
}

// ── PUT /api/clientes/:id ────────────────────────────────────
// Actualiza el estado u otros datos de un cliente
// ─────────────────────────────────────────────────────────────
async function actualizarCliente(req, res, next) {
  try {
    const { id } = req.params;
    const campos  = req.body;

    // Campos actualizables
    const permitidos = ['nombre', 'apellido', 'telefono', 'fuente',
                        'campaña', 'estado', 'valor_potencial', 'notas'];
    const sets   = [];
    const valores = [];

    for (const campo of permitidos) {
      if (campos[campo] !== undefined) {
        sets.push(`${campo} = ?`);
        valores.push(campos[campo]);
      }
    }

    if (sets.length === 0) {
      return res.status(400).json({ error: 'No se enviaron campos para actualizar' });
    }

    valores.push(id);
    await pool.query(
      `UPDATE clientes SET ${sets.join(', ')} WHERE id = ?`,
      valores
    );

    res.json({ mensaje: 'Cliente actualizado correctamente' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getClientes,
  getClientePorId,
  crearCliente,
  actualizarCliente,
};
