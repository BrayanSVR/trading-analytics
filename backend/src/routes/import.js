const express = require('express');
const router = express.Router();
const multer = require('multer');
const importController = require('../controllers/importController');
const { requireAdmin } = require('../middleware/auth');
const path = require('path');
const os = require('os');
const fs = require('fs');

// Ensure tmp upload directory exists
const uploadDir = path.join(os.tmpdir(), 'trading-excel-uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configurar multer para almacenar el archivo temporalmente en disco
// (Requerimiento: "Streaming para archivos > 1000 filas (no cargar todo en memoria)", por lo que almacenaremos en disco primero)
const upload = multer({
  dest: uploadDir,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB Limit
  fileFilter: (req, file, cb) => {
    // Validar extensión
    const ext = path.extname(file.originalname).toLowerCase();
    const mime = file.mimetype;
    
    // Validar solo .xlsx
    if (
      ext === '.xlsx' || 
      mime === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos Excel (.xlsx)'));
    }
  }
});

// Endpoint: POST /api/v1/import/excel
// Solo usuarios con rol de admin pueden importar datos
router.post('/excel', requireAdmin, upload.single('file'), importController.importExcel);

module.exports = router;
