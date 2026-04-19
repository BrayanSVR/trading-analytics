// ============================================================
// src/controllers/metricasController.js
// Endpoints de métricas específicas
// ============================================================

const { pool } = require('../config/db');

// ── GET /api/metricas/fuentes ────────────────────────────────
// Análisis detallado por canal de adquisición
// ─────────────────────────────────────────────────────────────
async function getMetricasFuentes(req, res, next) {
  try {
    const [fuentes] = await pool.query(`
      SELECT
        c.fuente,
        COUNT(c.id)                               AS total_leads,
        SUM(c.estado = 'matriculado')             AS matriculados,
        SUM(c.estado = 'lead')                    AS leads_activos,
        SUM(c.estado = 'rechazado')               AS rechazados,
        ROUND(
          SUM(c.estado = 'matriculado') / COUNT(c.id) * 100, 2
        )                                         AS tasa_conversion_pct,
        COALESCE(SUM(m.valor_pagado), 0)          AS valor_total_generado,
        ROUND(
          COALESCE(SUM(m.valor_pagado), 0) / NULLIF(COUNT(c.id), 0), 0
        )                                         AS valor_promedio_por_lead
      FROM clientes c
      LEFT JOIN matriculas m
             ON m.cliente_id = c.id AND m.estado != 'cancelada'
      GROUP BY c.fuente
      ORDER BY valor_total_generado DESC
    `);

    res.json({ fuentes });
  } catch (error) {
    next(error);
  }
}

// ── GET /api/metricas/matriculas-mes ────────────────────────
// Matrículas y valor generado mes a mes
// Query: ?meses=12  (cuántos meses hacia atrás, default 6)
// ─────────────────────────────────────────────────────────────
async function getMatriculasPorMes(req, res, next) {
  try {
    const meses = Math.min(parseInt(req.query.meses) || 6, 24);

    const [datos] = await pool.query(`
      SELECT
        DATE_FORMAT(m.fecha_matricula, '%Y-%m')         AS periodo,
        DATE_FORMAT(m.fecha_matricula, '%M %Y')         AS periodo_label,
        COUNT(m.id)                                     AS total_matriculas,
        SUM(m.valor_pagado)                             AS valor_total,
        AVG(m.valor_pagado)                             AS valor_promedio,
        (
          SELECT COUNT(*) FROM clientes c
          WHERE DATE_FORMAT(c.fecha_registro, '%Y-%m')
              = DATE_FORMAT(m.fecha_matricula, '%Y-%m')
        )                                               AS leads_ese_mes
      FROM matriculas m
      WHERE m.fecha_matricula >= DATE_SUB(NOW(), INTERVAL ? MONTH)
        AND m.estado != 'cancelada'
      GROUP BY 
        DATE_FORMAT(m.fecha_matricula, '%Y-%m'),
        DATE_FORMAT(m.fecha_matricula, '%M %Y'),
        m.fecha_matricula  -- <-- AGREGADO: columna base incluida
      ORDER BY periodo ASC
    `, [meses]);

    res.json({
      exito: true,
      datos,
      meses_consultados: meses
    });
  } catch (error) {
    next(error);
  }
}

// ── GET /api/metricas/conversion ────────────────────────────
// Embudo de conversión: cuántos avanzan en cada etapa
// ─────────────────────────────────────────────────────────────
async function getMetricasConversion(req, res, next) {
  try {
    const [[resumen]] = await pool.query(`
      SELECT
        COUNT(*)                          AS total_leads,
        SUM(estado = 'matriculado')       AS matriculados,
        SUM(estado = 'lead')              AS leads_pendientes,
        SUM(estado = 'rechazado')         AS rechazados,
        SUM(estado = 'inactivo')          AS inactivos,
        ROUND(SUM(estado='matriculado') / COUNT(*) * 100, 2) AS tasa_global
      FROM clientes
    `);

    // Tasa de conversión por fuente para comparar
    const [porFuente] = await pool.query(`
      SELECT
        fuente,
        COUNT(*)                               AS leads,
        SUM(estado = 'matriculado')            AS matriculados,
        ROUND(SUM(estado='matriculado') / COUNT(*) * 100, 2) AS tasa_pct
      FROM clientes
      GROUP BY fuente
      ORDER BY tasa_pct DESC
    `);

    // Embudo de conversión (formato para gráfica funnel)
    const embudo = [
      { etapa: 'Total Leads',        cantidad: Number(resumen.total_leads),        color: '#3B82F6' },
      { etapa: 'Interesados',        cantidad: Number(resumen.total_leads) - Number(resumen.rechazados), color: '#10B981' },
      { etapa: 'Matriculados',       cantidad: Number(resumen.matriculados),        color: '#F59E0B' },
    ];

    res.json({
      resumen: {
        total_leads:       Number(resumen.total_leads),
        matriculados:      Number(resumen.matriculados),
        leads_pendientes:  Number(resumen.leads_pendientes),
        rechazados:        Number(resumen.rechazados),
        inactivos:         Number(resumen.inactivos),
        tasa_global:       Number(resumen.tasa_global),
      },
      embudo,
      por_fuente: porFuente.map(f => ({
        ...f,
        leads:        Number(f.leads),
        matriculados: Number(f.matriculados),
        tasa_pct:     Number(f.tasa_pct),
      })),
    });
  } catch (error) {
    next(error);
  }
}

// ── GET /api/metricas/tiempo-conversion ─────────────────────
// Tiempo promedio que tarda un lead en convertirse
// ─────────────────────────────────────────────────────────────
async function getTiempoConversion(req, res, next) {
  try {
    const [[general]] = await pool.query(`
      SELECT
        ROUND(AVG(DATEDIFF(m.fecha_matricula, c.fecha_registro)), 1)  AS dias_promedio,
        MIN(DATEDIFF(m.fecha_matricula, c.fecha_registro))            AS dias_minimo,
        MAX(DATEDIFF(m.fecha_matricula, c.fecha_registro))            AS dias_maximo,
        COUNT(m.id)                                                   AS muestra
      FROM matriculas m
      JOIN clientes c ON m.cliente_id = c.id
    `);

    // Tiempo por fuente
    const [porFuente] = await pool.query(`
      SELECT
        c.fuente,
        ROUND(AVG(DATEDIFF(m.fecha_matricula, c.fecha_registro)), 1)  AS dias_promedio,
        COUNT(m.id)                                                   AS total_conversiones
      FROM matriculas m
      JOIN clientes c ON m.cliente_id = c.id
      GROUP BY c.fuente
      ORDER BY dias_promedio ASC
    `);

    // Distribución en rangos (para histograma)
    const [distribucion] = await pool.query(`
      SELECT
        CASE
          WHEN DATEDIFF(m.fecha_matricula, c.fecha_registro) <= 3  THEN '0-3 días'
          WHEN DATEDIFF(m.fecha_matricula, c.fecha_registro) <= 7  THEN '4-7 días'
          WHEN DATEDIFF(m.fecha_matricula, c.fecha_registro) <= 14 THEN '8-14 días'
          WHEN DATEDIFF(m.fecha_matricula, c.fecha_registro) <= 30 THEN '15-30 días'
          ELSE '+30 días'
        END AS rango,
        COUNT(*) AS cantidad
      FROM matriculas m
      JOIN clientes c ON m.cliente_id = c.id
      GROUP BY rango
      ORDER BY MIN(DATEDIFF(m.fecha_matricula, c.fecha_registro))
    `);

    res.json({
      general: {
        dias_promedio: Number(general.dias_promedio),
        dias_minimo:   Number(general.dias_minimo),
        dias_maximo:   Number(general.dias_maximo),
        muestra:       Number(general.muestra),
      },
      por_fuente:    porFuente.map(f => ({ ...f, dias_promedio: Number(f.dias_promedio) })),
      distribucion,
    });
  } catch (error) {
    next(error);
  }
}

// ── GET /api/metricas/valor-por-fuente ──────────────────────
// ROI y valor económico generado por canal
// ─────────────────────────────────────────────────────────────
async function getValorPorFuente(req, res, next) {
  try {
    const [datos] = await pool.query(`
      SELECT
        c.fuente,
        COUNT(DISTINCT c.id)                                   AS total_clientes,
        COUNT(DISTINCT m.id)                                   AS total_matriculas,
        COALESCE(SUM(m.valor_pagado), 0)                       AS valor_total,
        ROUND(COALESCE(AVG(m.valor_pagado), 0), 0)             AS ticket_promedio,
        ROUND(
          COALESCE(SUM(m.valor_pagado), 0) / NULLIF(COUNT(DISTINCT c.id), 0), 0
        )                                                      AS valor_por_lead
      FROM clientes c
      LEFT JOIN matriculas m
             ON m.cliente_id = c.id AND m.estado != 'cancelada'
      GROUP BY c.fuente
      ORDER BY valor_total DESC
    `);

    const valorTotal = datos.reduce((sum, f) => sum + Number(f.valor_total), 0);

    const datosConPorcentaje = datos.map(f => ({
      ...f,
      total_clientes:  Number(f.total_clientes),
      total_matriculas:Number(f.total_matriculas),
      valor_total:     Number(f.valor_total),
      ticket_promedio: Number(f.ticket_promedio),
      valor_por_lead:  Number(f.valor_por_lead),
      porcentaje_ingresos: valorTotal === 0
        ? 0
        : parseFloat((Number(f.valor_total) / valorTotal * 100).toFixed(2)),
    }));

    res.json({
      valor_total_empresa: valorTotal,
      por_fuente:          datosConPorcentaje,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getMetricasFuentes,
  getMatriculasPorMes,
  getMetricasConversion,
  getTiempoConversion,
  getValorPorFuente,
};
