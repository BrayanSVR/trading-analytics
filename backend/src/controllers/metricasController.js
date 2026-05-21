const { pool } = require('../config/db');

async function getMetricasFuentes(req, res, next) {
  try {
    const [fuentes] = await pool.query(`
      SELECT
        COALESCE(conversion_reciente, 'Desconocida') AS fuente,
        COUNT(id)                                    AS total_leads,
        SUM(fecha_conversion IS NOT NULL)            AS matriculados,
        SUM(fecha_conversion IS NULL)                AS leads_activos,
        SUM(estado_lead = 'Equivocado/Errado')       AS rechazados,
        ROUND(SUM(fecha_conversion IS NOT NULL) / COUNT(id) * 100, 2) AS tasa_conversion_pct,
        0                                            AS valor_total_generado,
        0                                            AS valor_promedio_por_lead
      FROM clientes
      GROUP BY fuente
      ORDER BY total_leads DESC
    `);
    res.json({ fuentes });
  } catch (error) {
    next(error);
  }
}

async function getMatriculasPorMes(req, res, next) {
  try {
    const meses = Math.min(parseInt(req.query.meses) || 6, 24);
    const [datos] = await pool.query(`
      SELECT
        DATE_FORMAT(fecha_conversion, '%Y-%m')         AS periodo,
        DATE_FORMAT(fecha_conversion, '%M %Y')         AS periodo_label,
        COUNT(id)                                      AS total_matriculas,
        0                                              AS valor_total,
        0                                              AS valor_promedio,
        (
          SELECT COUNT(*) FROM clientes c
          WHERE DATE_FORMAT(c.fecha_registro, '%Y-%m')
              = DATE_FORMAT(clientes.fecha_conversion, '%Y-%m')
        )                                              AS leads_ese_mes
      FROM clientes
      WHERE fecha_conversion >= DATE_SUB(NOW(), INTERVAL ? MONTH)
      GROUP BY periodo, periodo_label, fecha_conversion
      ORDER BY periodo ASC
    `, [meses]);
    res.json({ exito: true, datos, meses_consultados: meses });
  } catch (error) {
    next(error);
  }
}

async function getMetricasConversion(req, res, next) {
  try {
    const [[resumen]] = await pool.query(`
      SELECT
        COUNT(*)                               AS total_leads,
        SUM(fecha_conversion IS NOT NULL)      AS matriculados,
        SUM(fecha_conversion IS NULL)          AS leads_pendientes,
        SUM(estado_lead = 'Equivocado/Errado') AS rechazados,
        SUM(estado_lead = 'Inactivo')          AS inactivos,
        ROUND(SUM(fecha_conversion IS NOT NULL) / COUNT(*) * 100, 2) AS tasa_global
      FROM clientes
    `);

    const [porFuente] = await pool.query(`
      SELECT
        COALESCE(conversion_reciente, 'Desconocida') AS fuente,
        COUNT(*)                               AS leads,
        SUM(fecha_conversion IS NOT NULL)      AS matriculados,
        ROUND(SUM(fecha_conversion IS NOT NULL) / COUNT(*) * 100, 2) AS tasa_pct
      FROM clientes
      GROUP BY fuente
      ORDER BY tasa_pct DESC
    `);

    const embudo = [
      { etapa: 'Total Leads',        cantidad: Number(resumen.total_leads || 0),        color: '#3B82F6' },
      { etapa: 'Interesados',        cantidad: Number(resumen.total_leads || 0) - Number(resumen.rechazados || 0), color: '#10B981' },
      { etapa: 'Matriculados',       cantidad: Number(resumen.matriculados || 0),        color: '#F59E0B' },
    ];

    res.json({
      resumen: {
        total_leads:       Number(resumen.total_leads || 0),
        matriculados:      Number(resumen.matriculados || 0),
        leads_pendientes:  Number(resumen.leads_pendientes || 0),
        rechazados:        Number(resumen.rechazados || 0),
        inactivos:         Number(resumen.inactivos || 0),
        tasa_global:       Number(resumen.tasa_global || 0),
      },
      embudo,
      por_fuente: porFuente.map(f => ({
        ...f,
        leads:        Number(f.leads || 0),
        matriculados: Number(f.matriculados || 0),
        tasa_pct:     Number(f.tasa_pct || 0),
      })),
    });
  } catch (error) {
    next(error);
  }
}

async function getTiempoConversion(req, res, next) {
  try {
    const [[general]] = await pool.query(`
      SELECT
        ROUND(AVG(DATEDIFF(fecha_conversion, fecha_registro)), 1)  AS dias_promedio,
        MIN(DATEDIFF(fecha_conversion, fecha_registro))            AS dias_minimo,
        MAX(DATEDIFF(fecha_conversion, fecha_registro))            AS dias_maximo,
        COUNT(id)                                                  AS muestra
      FROM clientes
      WHERE fecha_conversion IS NOT NULL AND fecha_registro IS NOT NULL
    `);

    const [porFuente] = await pool.query(`
      SELECT
        COALESCE(conversion_reciente, 'Desconocida')                  AS fuente,
        ROUND(AVG(DATEDIFF(fecha_conversion, fecha_registro)), 1)     AS dias_promedio,
        COUNT(id)                                                     AS total_conversiones
      FROM clientes
      WHERE fecha_conversion IS NOT NULL AND fecha_registro IS NOT NULL
      GROUP BY fuente
      ORDER BY dias_promedio ASC
    `);

    const [distribucion] = await pool.query(`
      SELECT
        CASE
          WHEN DATEDIFF(fecha_conversion, fecha_registro) <= 3  THEN '0-3 días'
          WHEN DATEDIFF(fecha_conversion, fecha_registro) <= 7  THEN '4-7 días'
          WHEN DATEDIFF(fecha_conversion, fecha_registro) <= 14 THEN '8-14 días'
          WHEN DATEDIFF(fecha_conversion, fecha_registro) <= 30 THEN '15-30 días'
          ELSE '+30 días'
        END AS rango,
        COUNT(*) AS cantidad
      FROM clientes
      WHERE fecha_conversion IS NOT NULL AND fecha_registro IS NOT NULL
      GROUP BY rango
      ORDER BY MIN(DATEDIFF(fecha_conversion, fecha_registro))
    `);

    res.json({
      general: {
        dias_promedio: Number(general.dias_promedio || 0),
        dias_minimo:   Number(general.dias_minimo || 0),
        dias_maximo:   Number(general.dias_maximo || 0),
        muestra:       Number(general.muestra || 0),
      },
      por_fuente:    porFuente.map(f => ({ ...f, dias_promedio: Number(f.dias_promedio || 0) })),
      distribucion,
    });
  } catch (error) {
    next(error);
  }
}

async function getValorPorFuente(req, res, next) {
  try {
    const [datos] = await pool.query(`
      SELECT
        COALESCE(conversion_reciente, 'Desconocida')           AS fuente,
        COUNT(id)                                              AS total_clientes,
        SUM(fecha_conversion IS NOT NULL)                      AS total_matriculas,
        0                                                      AS valor_total,
        0                                                      AS ticket_promedio,
        0                                                      AS valor_por_lead
      FROM clientes
      GROUP BY fuente
      ORDER BY total_clientes DESC
    `);

    const valorTotal = 0;
    const datosConPorcentaje = datos.map(f => ({
      ...f,
      total_clientes:  Number(f.total_clientes || 0),
      total_matriculas:Number(f.total_matriculas || 0),
      valor_total:     0,
      ticket_promedio: 0,
      valor_por_lead:  0,
      porcentaje_ingresos: 0,
    }));

    res.json({ valor_total_empresa: valorTotal, por_fuente: datosConPorcentaje });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getMetricasFuentes, getMatriculasPorMes, getMetricasConversion,
  getTiempoConversion, getValorPorFuente,
};
