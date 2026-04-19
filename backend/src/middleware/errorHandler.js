// ============================================================
// src/middleware/errorHandler.js
// Manejador global de errores
// ============================================================
// Express ejecuta este middleware cuando alguna ruta llama a
// next(error) con un error. Centraliza el formato de respuestas
// de error para que sean consistentes en toda la API.
// ============================================================

function errorHandler(err, req, res, _next) {
  // Registrar el error en consola para debugging
  console.error(`[ERROR] ${req.method} ${req.originalUrl}`);
  console.error(err.stack || err.message);

  // Si el error viene de MySQL (código de error específico)
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      error:   'Registro duplicado',
      detalle: 'Ya existe un registro con esos datos',
    });
  }

  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({
      error:   'Referencia inválida',
      detalle: 'El ID relacionado no existe',
    });
  }

  // Error genérico del servidor
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error:   err.message || 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

module.exports = errorHandler;
