const xlsx = require('xlsx');
const fs = require('fs');
const { pool } = require('../config/db');

// Utils
const normalizeHeader = (h) => (h || '').toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

const parseDate = (val) => {
  if (!val) return null;
  if (typeof val === 'number') {
    const date = new Date((val - 25569) * 86400 * 1000);
    return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
  }
  if (val instanceof Date) return val;

  const str = String(val).trim();
  let d, m, y, hr = '00', min = '00', sec = '00';
  
  const regexDMY = /^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})(?:\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?$/;
  const regexYMD = /^(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})(?:\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?$/;

  let match = str.match(regexDMY);
  if (match) {
    d = match[1]; m = match[2]; y = match[3];
    if (match[4]) { hr = match[4]; min = match[5]; sec = match[6] || '00'; }
  } else {
    match = str.match(regexYMD);
    if (match) {
      y = match[1]; m = match[2]; d = match[3];
      if (match[4]) { hr = match[4]; min = match[5]; sec = match[6] || '00'; }
    } else {
      const nd = new Date(str);
      if (!isNaN(nd.getTime())) return nd;
      return null;
    }
  }
  const strDate = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}T${hr.padStart(2, '0')}:${min.padStart(2, '0')}:${sec.padStart(2, '0')}Z`;
  return new Date(strDate);
};

const formatDateForMySQL = (date) => {
  if (!date || isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 19).replace('T', ' ');
};

const mapHubSpotColumns = (row) => {
  const mapping = {
    hubspot_id: ['idderegistro', 'hubspotid', 'id'],
    nombre: ['nombre', 'firstname'],
    apellido: ['apellidos', 'apellido', 'lastname'],
    ultima_actividad: ['ultimaactividad', 'lastactivity'],
    email: ['correo', 'email', 'correoelectronico'],
    ciudad: ['ciudad', 'city'],
    estado_lead: ['estadodellead', 'estado', 'leadstatus'],
    acciones: ['acciones', 'actions'],
    veces_contactado: ['numerodevecescontactado', 'vecescontactado'],
    sede: ['sede', 'branch'],
    fecha_conversion: ['fechadelaconversionmasreciente', 'fechaconversion'],
    programa: ['programa', 'program'],
    anotacion: ['anotacion', 'notas', 'anotaciones'],
    propietario: ['propietariodelcontacto', 'propietario'],
    fecha_registro: ['fechadecreacion', 'fecharegistro'],
    fecha_participacion: ['fechadeparticipacion', 'fechaparticipacion'],
    fecha_asignacion: ['fechadeasignacionalpropietario', 'fechaasignacion'],
    asistio_evento: ['asistioaevento', 'asistencia'],
    conversion_reciente: ['conversionmasreciente', 'conversionreciente']
  };

  let mapped = {};
  for (const key in row) {
    if (row[key] === null || row[key] === undefined || String(row[key]).trim() === '') continue;
    const normKey = normalizeHeader(key).replace(/\s+/g, '');
    for (const [dbField, variations] of Object.entries(mapping)) {
      if (variations.includes(normKey)) {
        mapped[dbField] = row[key];
        break;
      }
    }
  }
  return mapped;
};

exports.importExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Archivo Excel no proporcionado." });
    }

    const { skip_invalid = "true" } = req.body;
    const skipInvalid = skip_invalid === 'true' || skip_invalid === true;

    const workbook = xlsx.readFile(req.file.path, { cellDates: true });
    
    let summary = {
      clientes: { total_rows: 0, inserted: 0, updated: 0, failed: 0, errors: [] }
    };

    const startTime = Date.now();
    let connection;

    try {
      connection = await pool.getConnection();
      await connection.beginTransaction();

      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      let rows = xlsx.utils.sheet_to_json(worksheet, { defval: null });
      summary.clientes.total_rows = rows.length;

      for (let i = 0; i < rows.length; i++) {
        const rowNum = i + 2; 
        const rawRow = rows[i];
        const mapped = mapHubSpotColumns(rawRow);
        
        try {
          let {
            hubspot_id, nombre, apellido, ultima_actividad, email, ciudad,
            estado_lead, acciones, veces_contactado, sede, fecha_conversion,
            programa, anotacion, propietario, fecha_registro, fecha_participacion,
            fecha_asignacion, asistio_evento, conversion_reciente
          } = mapped;
          
          if (!hubspot_id && !email) {
            throw new Error("Se requiere al menos ID de registro o Correo.");
          }

          veces_contactado = parseInt(veces_contactado) || 0;
          const uAct = formatDateForMySQL(parseDate(ultima_actividad));
          const fConv = formatDateForMySQL(parseDate(fecha_conversion));
          const fReg = formatDateForMySQL(parseDate(fecha_registro));
          const fPart = formatDateForMySQL(parseDate(fecha_participacion));
          const fAsig = formatDateForMySQL(parseDate(fecha_asignacion));

          let exists = false;
          let queryParam = null;
          let queryField = null;

          if (hubspot_id) {
            const [existRows] = await connection.query('SELECT id FROM clientes WHERE hubspot_id = ?', [hubspot_id]);
            if (existRows.length > 0) { exists = true; queryParam = hubspot_id; queryField = 'hubspot_id'; }
          }
          if (!exists && email) {
            const [existRows] = await connection.query('SELECT id FROM clientes WHERE email = ?', [email]);
            if (existRows.length > 0) { exists = true; queryParam = email; queryField = 'email'; }
          }

          if (exists) {
            await connection.query(
                `UPDATE clientes SET 
                    nombre = ?, apellido = ?, ultima_actividad = ?, email = ?, ciudad = ?, 
                    estado_lead = ?, acciones = ?, veces_contactado = ?, sede = ?, fecha_conversion = ?, 
                    programa = ?, anotacion = ?, propietario = ?, fecha_registro = ?, 
                    fecha_participacion = ?, fecha_asignacion = ?, asistio_evento = ?, conversion_reciente = ?
                WHERE ${queryField} = ?`,
                [nombre, apellido, uAct, email, ciudad, estado_lead, acciones, veces_contactado, sede, fConv, programa, anotacion, propietario, fReg, fPart, fAsig, asistio_evento, conversion_reciente, queryParam]
            );
            summary.clientes.updated++;
          } else {
            await connection.query(
                `INSERT INTO clientes (hubspot_id, nombre, apellido, ultima_actividad, email, ciudad, estado_lead, acciones, veces_contactado, sede, fecha_conversion, programa, anotacion, propietario, fecha_registro, fecha_participacion, fecha_asignacion, asistio_evento, conversion_reciente)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [hubspot_id, nombre, apellido, uAct, email, ciudad, estado_lead, acciones, veces_contactado, sede, fConv, programa, anotacion, propietario, fReg, fPart, fAsig, asistio_evento, conversion_reciente]
            );
            summary.clientes.inserted++;
          }
        } catch (err) {
          summary.clientes.failed++;
          summary.clientes.errors.push({
            row: rowNum, error: err.message
          });
          if (!skipInvalid) throw err;
        }
      }

      await connection.commit();
      const endMs = Date.now() - startTime;
      fs.unlink(req.file.path, () => {});

      return res.status(200).json({ success: true, summary, processing_time_ms: endMs });
    } catch (err) {
       if (connection) await connection.rollback();
       fs.unlink(req.file.path, () => {});
       return res.status(500).json({ success: false, error: err.message });
    } finally {
       if (connection) connection.release();
    }
  } catch (err) {
    if (req.file) fs.unlink(req.file.path, () => {});
    return res.status(500).json({ error: "Fallo inesperado: " + err.message });
  }
};
