// ============================================================
// src/controllers/dashboardController.js
// KPIs principales para el dashboard ejecutivo
// ============================================================

const { pool } = require('../config/db');

// ── GET /api/dashboard ───────────────────────────────────────
// Retorna TODOS los KPIs del dashboard en una sola llamada.
// El frontend puede hacer una sola petición y obtener todo.
// ─────────────────────────────────────────────────────────────
async function getDashboard(req, res, next) {
  try {
    // Ejecutar todas las consultas en paralelo para mejor rendimiento
    const [
      resumenResult,
      matriculasMesResult,
      fuentesResult,
      topCursosResult,
      tiempoConversionResult,
      tendencia7DiasResult,
    ] = await Promise.all([

      // ── 1. RESUMEN GENERAL ─────────────────────────────────
      pool.query(`
        SELECT
          COUNT(*)                                          AS total_leads,
          SUM(estado = 'matriculado')                      AS total_matriculados,
          SUM(estado = 'lead')                             AS leads_sin_convertir,
          SUM(estado = 'rechazado')                        AS rechazados,
          ROUND(
            SUM(estado = 'matriculado') / COUNT(*) * 100, 2
          )                                                AS tasa_conversion,
          COALESCE(
            (SELECT SUM(valor_pagado) FROM matriculas WHERE estado != 'cancelada'), 0
          )                                                AS valor_total_generado
        FROM clientes
      `),

      // ── 2. MATRÍCULAS POR MES (últimos 6 meses) ───────────
      pool.query(`
        SELECT
          DATE_FORMAT(fecha_matricula, '%Y-%m')  AS mes,
          DATE_FORMAT(fecha_matricula, '%b %Y')  AS mes_label,
          COUNT(*)                               AS total_matriculas,
          SUM(valor_pagado)                      AS valor_mes
        FROM matriculas
        WHERE fecha_matricula >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
          AND estado != 'cancelada'
        GROUP BY mes, mes_label
        ORDER BY mes ASC
      `),

      // ── 3. DISTRIBUCIÓN POR FUENTE ────────────────────────
      pool.query(`
        SELECT
          fuente,
          COUNT(*)                              AS total_leads,
          SUM(estado = 'matriculado')           AS matriculados,
          ROUND(
            SUM(estado = 'matriculado') / COUNT(*) * 100, 2
          )                                     AS tasa_conversion,
          COALESCE((
            SELECT SUM(m.valor_pagado)
            FROM matriculas m
            JOIN clientes c2 ON m.cliente_id = c2.id
            WHERE c2.fuente = c.fuente AND m.estado != 'cancelada'
          ), 0)                                 AS valor_generado
        FROM clientes c
        GROUP BY fuente
        ORDER BY total_leads DESC
      `),

      // ── 4. TOP CURSOS ────────────────────────────────────
      pool.query(`
        SELECT
          curso,
          COUNT(*)        AS total_matriculas,
          SUM(valor_pagado) AS valor_total,
          AVG(valor_pagado) AS valor_promedio
        FROM matriculas
        WHERE estado != 'cancelada'
        GROUP BY curso
        ORDER BY total_matriculas DESC
        LIMIT 5
      `),

      // ── 5. TIEMPO PROMEDIO DE CONVERSIÓN ─────────────────
      pool.query(`
        SELECT
          ROUND(AVG(DATEDIFF(m.fecha_matricula, c.fecha_registro)), 1) AS dias_promedio,
          MIN(DATEDIFF(m.fecha_matricula, c.fecha_registro))           AS dias_minimo,
          MAX(DATEDIFF(m.fecha_matricula, c.fecha_registro))           AS dias_maximo
        FROM matriculas m
        JOIN clientes c ON m.cliente_id = c.id
      `),

      // ── 6. LEADS ÚLTIMOS 7 DÍAS ───────────────────────────
      pool.query(`
        SELECT
          DATE(fecha_registro)           AS dia,
          DATE_FORMAT(fecha_registro, '%a %d')  AS dia_label,
          COUNT(*)                       AS nuevos_leads,
          SUM(estado = 'matriculado')    AS matriculados
        FROM clientes
        WHERE fecha_registro >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        GROUP BY dia, dia_label
        ORDER BY dia ASC
      `),
    ]);

    // Extraer los datos de los resultados de MySQL
    const resumen          = resumenResult[0][0];
    const matriculasMes    = matriculasMesResult[0];
    const fuentes          = fuentesResult[0];
    const topCursos        = topCursosResult[0];
    const tiempoConversion = tiempoConversionResult[0][0];
    const tendencia7Dias   = tendencia7DiasResult[0];

    res.json({
      resumen: {
        total_leads:         Number(resumen.total_leads),
        total_matriculados:  Number(resumen.total_matriculados),
        leads_sin_convertir: Number(resumen.leads_sin_convertir),
        rechazados:          Number(resumen.rechazados),
        tasa_conversion:     Number(resumen.tasa_conversion),
        valor_total_generado:Number(resumen.valor_total_generado),
      },
      matriculas_por_mes:    matriculasMes,
      distribucion_fuentes:  fuentes,
      top_cursos:            topCursos,
      tiempo_conversion: {
        dias_promedio: Number(tiempoConversion.dias_promedio),
        dias_minimo:   Number(tiempoConversion.dias_minimo),
        dias_maximo:   Number(tiempoConversion.dias_maximo),
      },
      tendencia_7_dias:      tendencia7Dias,
      generado_en:           new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { getDashboard };
