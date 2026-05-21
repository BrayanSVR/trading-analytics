-- ============================================================
-- TRADING ANALYTICS - Base de Datos (HubSpot Schema)
-- ============================================================
CREATE DATABASE IF NOT EXISTS trading_analytics
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE trading_analytics;

DROP TABLE IF EXISTS matriculas;
DROP TABLE IF EXISTS clientes;

CREATE TABLE clientes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  hubspot_id VARCHAR(50) UNIQUE,
  nombre VARCHAR(100),
  apellido VARCHAR(100),
  ultima_actividad DATETIME,
  email VARCHAR(150),
  ciudad VARCHAR(100),
  estado_lead VARCHAR(100),
  acciones VARCHAR(100),
  veces_contactado INT DEFAULT 0,
  sede VARCHAR(100),
  fecha_conversion DATETIME,
  programa VARCHAR(150),
  anotacion TEXT,
  propietario VARCHAR(100),
  fecha_registro DATETIME,
  fecha_participacion DATETIME,
  fecha_asignacion DATETIME,
  asistio_evento VARCHAR(50),
  conversion_reciente VARCHAR(150),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE INDEX idx_clientes_hubspot ON clientes(hubspot_id);
CREATE INDEX idx_clientes_estado ON clientes(estado_lead);
CREATE INDEX idx_clientes_fecha ON clientes(fecha_registro);
