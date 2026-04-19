const express = require('express');
const router = express.Router();
const multer = require('multer');
const importController = require('../controllers/importController');
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
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB Limit
});

// Endpoint: POST /api/v1/import/excel
router.post('/excel', upload.single('file'), importController.importExcel);

module.exports = router;
