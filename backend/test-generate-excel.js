const xlsx = require('xlsx');

// 1. Crear los datos de prueba
const clientesData = [
  { Nombre: 'Juan', Apellido: 'Perez', Email: 'juan.perez@test.com', Teléfono: '(300) 123-4567', Fuente: 'Facebook', Status: 'Lead', 'Valor Potencial': '$ 1.500.000,00', Fecha: '15/04/2026', Notas: 'Nota test 1' },
  { Nombre: 'Maria', Apellido: 'Gomez', Correo: 'maria.gomez@test.com', Movil: '3011234567', Canal: 'Ig', Estado: 'Matriculado', Presupuesto: '2,000,000.00', 'Fecha Registro': '16-04-2026', Observaciones: 'Test 2' },
  { Firstname: 'Error', Lastname: 'User', 'E-mail': 'erroruser', Phone: '123' } // Fallos esperados
];

const matriculasData = [
  { 'Cliente Email': 'maria.gomez@test.com', Curso: 'Trading 101', 'Valor Pagado': 'COP $ 1.000.000,00', 'Fecha Matrícula': '2026-04-16', 'Estado Matricula': 'activa', 'Payment Method': 'tarjeta', Notas: 'Pago en cuotas' },
  { 'Email Cliente': 'noexiste@test.com', Programa: 'Forex PRO', Monto: '2000000', Fecha: '17/04/2026', Estado: 'completada', 'Método de Pago': 'Transferencia' } // Fallo esperado
];

// 2. Crear workbook
const wb = xlsx.utils.book_new();

// 3. Convertir a worksheets
const wsClientes = xlsx.utils.json_to_sheet(clientesData);
const wsMatriculas = xlsx.utils.json_to_sheet(matriculasData);

// 4. Añadir hojas al workbook
xlsx.utils.book_append_sheet(wb, wsClientes, "Clientes");
xlsx.utils.book_append_sheet(wb, wsMatriculas, "Matriculas");

// 5. Escribir a disco
xlsx.writeFile(wb, "test-import.xlsx");
console.log("Archivo test-import.xlsx generado con éxito.");
