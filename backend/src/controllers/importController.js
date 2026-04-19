const xlsx = require('xlsx');
const fs = require('fs');
const { pool } = require('../config/db');

// Utils
const normalizeHeader = (h) => (h || '').toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

const parseDate = (val) => {
  if (!val) return null;
  // Si es un número (formato serial de Excel)
  if (typeof val === 'number') {
    // Excel epoch es Dec 30 1899 (con el bug del bisiesto 1900)
    // sheetjs lo maneja internamente en ocasiones o retorna número
    const date = new Date((val - 25569) * 86400 * 1000);
    // Para UTC
    const utcCols = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
    return utcCols;
  }
  
  if (val instanceof Date) return val;

  const str = String(val).trim();
  // Match forms
  let d, m, y, hr = '00', min = '00', sec = '00';
  
  // Regex para DD/MM/YYYY o DD-MM-YYYY
  const regexDMY = /^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})(?:\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?$/;
  // Regex para YYYY-MM-DD
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
      // Intenta parseo nativo
      const nd = new Date(str);
      if (!isNaN(nd.getTime())) return nd;
      return null; // falló
    }
  }

  const strDate = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}T${hr.padStart(2, '0')}:${min.padStart(2, '0')}:${sec.padStart(2, '0')}Z`;
  return new Date(strDate); // UTC para no sufrir corrimiento
};

const formatDateForMySQL = (date) => {
  if (!date || isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 19).replace('T', ' ');
};

const parseDecimal = (val) => {
  if (val === null || val === undefined || val === '') return null;
  if (typeof val === 'number') return val;
  let str = String(val).toUpperCase();
  // Limpiar monedas
  str = str.replace(/[$]/g, '').replace(/COP/g, '').replace(/USD/g, '').replace(/\s+/g, '');
  // En cop formato 2.500.000,00 o 2,500,000.00
  // Detectar coma como decimal
  if (str.includes(',') && str.includes('.')) {
    // Si la coma está después del punto, el punto es separador de miles
    if (str.lastIndexOf(',') > str.lastIndexOf('.')) {
      str = str.replace(/\./g, '').replace(',', '.');
    } else {
        str = str.replace(/,/g, '');
    }
  } else if (str.includes(',')) {
     // Si solo hay coma y suele separar miles o decimales
     // heurística: si son 2 decimales asume que es coma
     const parts = str.split(',');
     if(parts.length === 2 && parts[1].length <= 2) {
         str = str.replace(',', '.');
     } else {
         str = str.replace(/,/g, '');
     }
  }
  const floatVal = parseFloat(str);
  return isNaN(floatVal) ? null : floatVal;
};

const mapEnum = (val, allowed, defaultVal) => {
  if (!val) return defaultVal;
  const str = String(val).toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  // Intentar mapeos extra
  let translated = str;
  if(str === 'web' || str === 'pagina web') translated = 'pagina web';
  else if (str === 'fb' || str === 'facebook') translated = 'facebook';
  else if (str === 'ig' || str === 'instagram') translated = 'instagram';
  else if (str === 'google') translated = 'google ads';
  else if (str === 'referal') translated = 'referido';
  
  const match = allowed.find(a => {
      const aNorm = a.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return aNorm === translated;
  });
  return match || null;
};

const mapClienteColumns = (row) => {
  const mapping = {
    nombre: ['nombre', 'nombres', 'firstname'],
    apellido: ['apellido', 'apellidos', 'lastname'],
    email: ['email', 'correo', 'correoelectronico', 'e-mail'],
    telefono: ['telefono', 'celular', 'movil', 'phone'],
    fuente: ['fuente', 'canal', 'origen', 'source'],
    campaña: ['campana', 'campaign'],
    estado: ['estado', 'status'],
    valor_potencial: ['valorpotencial', 'valor', 'presupuesto', 'potentialvalue'],
    fecha_registro: ['fecharegistro', 'fecha', 'date'],
    notas: ['notas', 'observaciones', 'notes', 'comentarios']
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

const mapMatriculaColumns = (row) => {
  const mapping = {
    cliente_email: ['clienteemail', 'emailcliente', 'correocliente', 'email'],
    curso: ['curso', 'programa', 'course'],
    valor_pagado: ['valorpagado', 'valor', 'precio', 'monto', 'amount'],
    fecha_matricula: ['fechamatricula', 'fecha', 'date'],
    estado: ['estadomatricula', 'estado'],
    metodo_pago: ['metodopago', 'formadepago', 'paymentmethod'],
    notas: ['notas', 'observaciones', 'notes']
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

    const {
      sheet_clientes = "Clientes",
      sheet_matriculas = "Matriculas",
      header_row = 1,
      mode = "upsert",
      skip_invalid = "true",
      dry_run = "false"
    } = req.body;

    const isDryRun = dry_run === 'true' || dry_run === true;
    const skipInvalid = skip_invalid === 'true' || skip_invalid === true;

    // Load workbook
    const workbook = xlsx.readFile(req.file.path, { cellDates: true });
    
    let summary = {
      clientes: { total_rows: 0, inserted: 0, updated: 0, failed: 0, errors: [] },
      matriculas: { total_rows: 0, inserted: 0, updated: 0, failed: 0, errors: [] }
    };

    const startTime = Date.now();
    let connection;

    try {
      connection = await pool.getConnection();
      if (!isDryRun) await connection.beginTransaction();

      // ============== PROCESAR CLIENTES ==============
      // Determinamos qué hoja usar: si el user especificó y existe, bien.
      // Si no, si solo hay una hoja asumimos que es de Clientes (según lógica común, o según las columnas).
      const sheetClientesName = workbook.SheetNames.includes(sheet_clientes) ? sheet_clientes : workbook.SheetNames[0];
      const sheetMName = workbook.SheetNames.includes(sheet_matriculas) ? sheet_matriculas : null;
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      if (workbook.SheetNames.includes(sheetClientesName)) {
        const worksheet = workbook.Sheets[sheetClientesName];
        let rows = xlsx.utils.sheet_to_json(worksheet, { range: parseInt(header_row) - 1, defval: null });
        summary.clientes.total_rows = rows.length;

        for (let i = 0; i < rows.length; i++) {
          const rowNum = i + parseInt(header_row) + 1; // 1-based start after headers
          const rawRow = rows[i];
          const mapped = mapClienteColumns(rawRow);
          
          try {
            // Validaciones elementales
            let { nombre, apellido, email, telefono, fuente, campaña, estado, valor_potencial, fecha_registro, notas } = mapped;
            
            if (!nombre || !apellido || !email) {
              console.log("DEBUG: Validation failed", { rawRow, mapped });
              throw new Error("Faltan campos obligatorios: Nombre, Apellido, o Email.");
            }
            nombre = String(nombre).trim();
            apellido = String(apellido).trim();
            email = String(email).trim().toLowerCase();
            
            if (!emailRegex.test(email)) throw new Error("Formato de email inválido.");
            
            if (telefono) {
                telefono = String(telefono).replace(/[\s\-\(\)]/g, '');
                if(telefono.length < 7 || telefono.length > 15) throw new Error("Teléfono debe tener entre 7 y 15 dígitos.");
            }

            fuente = mapEnum(fuente, ['Facebook', 'Instagram', 'Pagina Web', 'Referido', 'Google Ads', 'Email Marketing', 'WhatsApp', 'Otro'], 'Otro');
            if (!fuente) throw new Error("Fuente de cliente no permitida.");

            estado = mapEnum(estado, ['lead', 'matriculado', 'inactivo', 'rechazado'], 'lead');
            if(!estado) throw new Error("Estado de cliente no permitido.");

            let valPotencialParsed = parseDecimal(valor_potencial) || 0.00;
            
            let fechaRegParsed = parseDate(fecha_registro);
            let dateStr = formatDateForMySQL(fechaRegParsed) || formatDateForMySQL(new Date());

            // Revisar unicidad MySQL
            const [existRows] = await connection.query('SELECT id FROM clientes WHERE email = ?', [email]);
            const exists = existRows.length > 0;

            if (exists) {
                if (mode === 'skip') {
                    throw new Error("Email duplicado: el cliente ya existe (modo=skip).");
                }
                if (mode === 'error') {
                    throw new Error("Email duplicado: el cliente ya existe (modo=error).");
                }
                // UPSERT
                if (!isDryRun) {
                    await connection.query(
                        `UPDATE clientes SET 
                            nombre = ?, apellido = ?, telefono = ?, fuente = ?, campaña = ?, estado = ?, valor_potencial = ?, notas = ? 
                        WHERE email = ?`,
                        [nombre, apellido, telefono, fuente, campaña || null, estado, valPotencialParsed, notas || null, email]
                    );
                }
                summary.clientes.updated++;
            } else {
                // INS
                if (!isDryRun) {
                    await connection.query(
                        `INSERT INTO clientes (nombre, apellido, email, telefono, fuente, campaña, estado, valor_potencial, fecha_registro, notas)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                        [nombre, apellido, email, telefono, fuente, campaña || null, estado, valPotencialParsed, dateStr, notas || null]
                    );
                }
                summary.clientes.inserted++;
            }
          } catch (err) {
            summary.clientes.failed++;
            summary.clientes.errors.push({
              row: rowNum,
              sheet: sheetClientesName,
              column: "N/A",
              value: mapped.email || "N/A",
              error: err.message
            });
            if (!skipInvalid) {
                throw new Error(`Fallo en Clientes Fila ${rowNum}: ${err.message}`);
            }
          }
        }
      }

      // ============== PROCESAR MATRÍCULAS ==============
      if (sheetMName && workbook.SheetNames.includes(sheetMName)) {
        const worksheet = workbook.Sheets[sheetMName];
        let rows = xlsx.utils.sheet_to_json(worksheet, { range: parseInt(header_row) - 1, defval: null });
        summary.matriculas.total_rows = rows.length;

        for (let i = 0; i < rows.length; i++) {
          const rowNum = i + parseInt(header_row) + 1;
          const rawRow = rows[i];
          const mapped = mapMatriculaColumns(rawRow);
          
          try {
            let { cliente_email, curso, valor_pagado, fecha_matricula, estado, metodo_pago, notas } = mapped;
            
            if (!cliente_email) throw new Error("Falta Email del Cliente.");
            if (!curso) throw new Error("Falta el Curso.");

            cliente_email = String(cliente_email).trim().toLowerCase();
            curso = String(curso).trim();

            const [clientData] = await connection.query('SELECT id, estado FROM clientes WHERE email = ?', [cliente_email]);
            if (clientData.length === 0) {
               throw new Error("Cliente no encontrado para crear matrícula.");
            }
            if (clientData[0].estado === 'rechazado') {
                throw new Error("No se pueden asociar matrículas a un cliente en estado 'rechazado'.");
            }
            const cliente_id = clientData[0].id;

            let valPagadoParsed = parseDecimal(valor_pagado);
            if (valPagadoParsed === null || valPagadoParsed < 0) throw new Error("El valor pagado debe ser válido y >= 0.");

            let fMatriculaParsed = parseDate(fecha_matricula);
            let dateMat = formatDateForMySQL(fMatriculaParsed) || formatDateForMySQL(new Date());

            estado = mapEnum(estado, ['activa', 'completada', 'cancelada'], 'activa');
            if(!estado) throw new Error("Estado de matrícula no permitido.");

            metodo_pago = mapEnum(metodo_pago, ['efectivo', 'transferencia', 'tarjeta', 'otro'], 'transferencia');
            if(!metodo_pago) throw new Error("Método de pago no permitido.");

            if (!isDryRun) {
                await connection.query(
                    `INSERT INTO matriculas (cliente_id, curso, valor_pagado, fecha_matricula, estado, metodo_pago, notas)
                    VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [cliente_id, curso, valPagadoParsed, dateMat, estado, metodo_pago, notas || null]
                );
            }
            summary.matriculas.inserted++;
          } catch(err) {
            summary.matriculas.failed++;
            summary.matriculas.errors.push({
              row: rowNum,
              sheet: sheetMName,
              column: "N/A",
              value: mapped.cliente_email || "N/A",
              error: err.message
            });
            if (!skipInvalid) {
                throw new Error(`Fallo en Matrículas Fila ${rowNum}: ${err.message}`);
            }
          }
        }
      }

      if (!isDryRun) {
         await connection.commit();
      }

      const endMs = Date.now() - startTime;
      
      // Limpiar archivo subido
      fs.unlink(req.file.path, () => {});

      return res.status(200).json({
          success: true,
          import_id: "import-"+Date.now(),
          summary,
          processing_time_ms: endMs
      });

    } catch (err) {
       if (connection) await connection.rollback();
       fs.unlink(req.file.path, () => {});
       return res.status(500).json({ success: false, error: err.message });
    } finally {
       if (connection) connection.release();
    }
  } catch (err) {
    if (req.file) fs.unlink(req.file.path, () => {});
    return res.status(500).json({ error: "Fallo inesperado leyendo Excel: " + err.message });
  }
};
