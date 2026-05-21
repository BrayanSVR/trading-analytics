const { pool } = require('../config/db');

async function getClientes(req, res, next) {
  try {
    const { estado, programa, buscar, pagina = 1, limite = 20 } = req.query;

    const condiciones = [];
    const valores     = [];

    if (estado) {
      condiciones.push('estado_lead = ?');
      valores.push(estado);
    }
    if (programa) {
      condiciones.push('programa = ?');
      valores.push(programa);
    }
    if (buscar) {
      condiciones.push('(nombre LIKE ? OR apellido LIKE ? OR email LIKE ? OR hubspot_id LIKE ?)');
      const termino = `%${buscar}%`;
      valores.push(termino, termino, termino, termino);
    }

    const where    = condiciones.length ? `WHERE ${condiciones.join(' AND ')}` : '';
    const offset   = (parseInt(pagina) - 1) * parseInt(limite);

    const [clientes] = await pool.query(
      `SELECT
         id, hubspot_id, nombre, apellido, CONCAT(nombre, ' ', apellido) AS nombre_completo,
         ultima_actividad, email, ciudad, estado_lead, acciones, veces_contactado, sede,
         fecha_conversion, programa, anotacion, propietario, fecha_registro,
         fecha_participacion, fecha_asignacion, asistio_evento, conversion_reciente
       FROM clientes
       ${where}
       ORDER BY id DESC
       LIMIT ? OFFSET ?`,
      [...valores, parseInt(limite), offset]
    );

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM clientes ${where}`,
      valores
    );

    res.json({
      datos: clientes,
      paginacion: {
        total,
        pagina: parseInt(pagina),
        limite: parseInt(limite),
        total_paginas: Math.ceil(total / parseInt(limite)),
      },
    });
  } catch (error) {
    next(error);
  }
}

async function getClientePorId(req, res, next) {
  try {
    const { id } = req.params;

    const [[cliente]] = await pool.query(
      `SELECT * FROM clientes WHERE id = ?`,
      [id]
    );

    if (!cliente) return res.status(404).json({ error: `Cliente con id ${id} no encontrado` });
    res.json(cliente);
  } catch (error) {
    next(error);
  }
}

async function crearCliente(req, res, next) {
  try {
    const {
      nombre, apellido, email, hubspot_id, estado_lead, programa, propietario
    } = req.body;

    if (!nombre || !email) {
      return res.status(400).json({ error: 'Campos requeridos: nombre, email' });
    }

    const [resultado] = await pool.query(
      `INSERT INTO clientes
         (nombre, apellido, email, hubspot_id, estado_lead, programa, propietario)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [nombre, apellido || null, email, hubspot_id || null, estado_lead || 'Nuevo', programa || null, propietario || null]
    );

    res.status(201).json({
      mensaje: 'Cliente creado exitosamente',
      cliente_id: resultado.insertId,
    });
  } catch (error) {
    next(error);
  }
}

async function actualizarCliente(req, res, next) {
  try {
    const { id } = req.params;
    const campos  = req.body;

    const permitidos = ['nombre', 'apellido', 'email', 'estado_lead', 'acciones', 'programa', 'propietario', 'anotacion'];
    const sets   = [];
    const valores = [];

    for (const campo of permitidos) {
      if (campos[campo] !== undefined) {
        sets.push(`${campo} = ?`);
        valores.push(campos[campo]);
      }
    }

    if (sets.length === 0) return res.status(400).json({ error: 'No hay campos válidos para actualizar' });

    valores.push(id);
    await pool.query(`UPDATE clientes SET ${sets.join(', ')} WHERE id = ?`, valores);
    res.json({ mensaje: 'Cliente actualizado correctamente' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getClientes, getClientePorId, crearCliente, actualizarCliente,
};
