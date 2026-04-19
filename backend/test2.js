const mapClienteColumns = (row) => {
  const normalizeHeader = (h) => (h || '').toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

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

const rawRow = { Nombre: 'Juan', Apellido: 'Perez', Email: 'juan.perez@test.com', Teléfono: '(300) 123-4567' };
console.log(mapClienteColumns(rawRow));
