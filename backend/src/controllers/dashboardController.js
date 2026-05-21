const { pool } = require('../config/db');

async function getDashboard(req, res, next) {
  try {
    const [
      resumenResult,
      matriculasMesResult,
      fuentesResult,
      topCursosResult,
      tiempoConversionResult,
      tendencia7DiasResult,
    ] = await Promise.all([
      pool.query(`
        SELECT
          COUNT(*)                                          AS total_leads,
          SUM(fecha_conversion IS NOT NULL)                 AS total_matriculados,
          SUM(fecha_conversion IS NULL)                     AS leads_sin_convertir,
          SUM(estado_lead = 'Equivocado/Errado')            AS rechazados,
          ROUND(SUM(fecha_conversion IS NOT NULL) / COUNT(*) * 100, 2) AS tasa_conversion,
          0                                                 AS valor_total_generado
        FROM clientes
      `),
      pool.query(`
        SELECT
          DATE_FORMAT(fecha_conversion, '%Y-%m')  AS mes,
          DATE_FORMAT(fecha_conversion, '%b %Y')  AS mes_label,
          COUNT(*)                               AS total_matriculas,
          0                                      AS valor_mes
        FROM clientes
        WHERE fecha_conversion >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
        GROUP BY mes, mes_label
        ORDER BY mes ASC
      `),
      pool.query(`
        SELECT
          COALESCE(conversion_reciente, 'Desconocida') AS fuente,
          COUNT(*)                              AS total_leads,
          SUM(fecha_conversion IS NOT NULL)     AS matriculados,
          ROUND(SUM(fecha_conversion IS NOT NULL) / COUNT(*) * 100, 2) AS tasa_conversion,
          0                                     AS valor_generado
        FROM clientes
        GROUP BY fuente
        ORDER BY total_leads DESC
      `),
      pool.query(`
        SELECT
          COALESCE(programa, 'Sin Programa') AS curso,
          COUNT(*)        AS total_matriculas,
          0               AS valor_total,
          0               AS valor_promedio
        FROM clientes
        WHERE fecha_conversion IS NOT NULL
        GROUP BY curso
        ORDER BY total_matriculas DESC
        LIMIT 5
      `),
      pool.query(`
        SELECT
          ROUND(AVG(DATEDIFF(fecha_conversion, fecha_registro)), 1) AS dias_promedio,
          MIN(DATEDIFF(fecha_conversion, fecha_registro))           AS dias_minimo,
          MAX(DATEDIFF(fecha_conversion, fecha_registro))           AS dias_maximo
        FROM clientes
        WHERE fecha_conversion IS NOT NULL AND fecha_registro IS NOT NULL
      `),
      pool.query(`
        SELECT
          DATE(fecha_registro)           AS dia,
          DATE_FORMAT(fecha_registro, '%a %d')  AS dia_label,
          COUNT(*)                       AS nuevos_leads,
          SUM(fecha_conversion IS NOT NULL) AS matriculados
        FROM clientes
        WHERE fecha_registro >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        GROUP BY dia, dia_label
        ORDER BY dia ASC
      `),
    ]);

    const resumen          = resumenResult[0][0];
    const matriculasMes    = matriculasMesResult[0];
    const fuentes          = fuentesResult[0];
    const topCursos        = topCursosResult[0];
    const tiempoConversion = tiempoConversionResult[0][0];
    const tendencia7Dias   = tendencia7DiasResult[0];

    res.json({
      resumen: {
        total_leads:         Number(resumen.total_leads || 0),
        total_matriculados:  Number(resumen.total_matriculados || 0),
        leads_sin_convertir: Number(resumen.leads_sin_convertir || 0),
        rechazados:          Number(resumen.rechazados || 0),
        tasa_conversion:     Number(resumen.tasa_conversion || 0),
        valor_total_generado:Number(resumen.valor_total_generado || 0),
      },
      matriculas_por_mes:    matriculasMes,
      distribucion_fuentes:  fuentes,
      top_cursos:            topCursos,
      tiempo_conversion: {
        dias_promedio: Number(tiempoConversion?.dias_promedio || 0),
        dias_minimo:   Number(tiempoConversion?.dias_minimo || 0),
        dias_maximo:   Number(tiempoConversion?.dias_maximo || 0),
      },
      tendencia_7_dias:      tendencia7Dias,
      generado_en:           new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { getDashboard };
