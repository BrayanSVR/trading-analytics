-- ============================================================
-- TRADING ANALYTICS - Base de Datos
-- ============================================================
-- Ejecuta este archivo en MySQL Workbench o terminal con:
--   mysql -u root -p < schema.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS trading_analytics
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE trading_analytics;

-- ============================================================
-- TABLA: clientes
-- Registra cada persona que llega como lead (potencial cliente)
-- ============================================================
CREATE TABLE IF NOT EXISTS clientes (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  nombre          VARCHAR(100) NOT NULL,
  apellido        VARCHAR(100) NOT NULL,
  email           VARCHAR(150) NOT NULL UNIQUE,
  telefono        VARCHAR(20),
  fuente          ENUM(
                    'Facebook',
                    'Instagram',
                    'Pagina Web',
                    'Referido',
                    'Google Ads',
                    'Email Marketing',
                    'WhatsApp',
                    'Otro'
                  ) NOT NULL DEFAULT 'Otro',
  campaña         VARCHAR(100),           -- nombre de la campaña de marketing
  estado          ENUM(
                    'lead',               -- llegó pero no se matriculó
                    'matriculado',        -- ya pagó y está activo
                    'inactivo',           -- se matriculó pero abandonó
                    'rechazado'           -- no quiso continuar
                  ) NOT NULL DEFAULT 'lead',
  valor_potencial DECIMAL(10,2) DEFAULT 0.00,  -- cuánto podría pagar
  fecha_registro  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  notas           TEXT,
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================================
-- TABLA: matriculas
-- Registra cada matrícula efectiva (conversión exitosa)
-- ============================================================
CREATE TABLE IF NOT EXISTS matriculas (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  cliente_id      INT NOT NULL,
  curso           VARCHAR(150) NOT NULL,
  valor_pagado    DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  fecha_matricula DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  estado          ENUM('activa', 'completada', 'cancelada') DEFAULT 'activa',
  metodo_pago     ENUM('efectivo', 'transferencia', 'tarjeta', 'otro') DEFAULT 'transferencia',
  notas           TEXT,
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  -- Relación con clientes
  CONSTRAINT fk_matricula_cliente
    FOREIGN KEY (cliente_id) REFERENCES clientes(id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
);

-- ============================================================
-- ÍNDICES para mejorar el rendimiento de las consultas
-- ============================================================
CREATE INDEX idx_clientes_estado    ON clientes(estado);
CREATE INDEX idx_clientes_fuente    ON clientes(fuente);
CREATE INDEX idx_clientes_fecha     ON clientes(fecha_registro);
CREATE INDEX idx_matriculas_fecha   ON matriculas(fecha_matricula);
CREATE INDEX idx_matriculas_cliente ON matriculas(cliente_id);

-- ============================================================
-- DATOS DE PRUEBA - 60 clientes simulados
-- ============================================================

INSERT INTO clientes (nombre, apellido, email, telefono, fuente, campaña, estado, valor_potencial, fecha_registro) VALUES
-- Enero 2024
('Carlos',    'Ramírez',   'carlos.ramirez@email.com',   '3001234567', 'Facebook',      'Camp_FB_Enero',    'matriculado', 2500000, '2024-01-05 09:30:00'),
('María',     'González',  'maria.gonzalez@email.com',   '3012345678', 'Instagram',     'Camp_IG_Enero',    'matriculado', 2500000, '2024-01-08 10:15:00'),
('Jorge',     'Martínez',  'jorge.martinez@email.com',   '3023456789', 'Pagina Web',    NULL,               'lead',        2500000, '2024-01-10 11:00:00'),
('Ana',       'López',     'ana.lopez@email.com',        '3034567890', 'Referido',      NULL,               'matriculado', 2500000, '2024-01-12 14:00:00'),
('Luis',      'Pérez',     'luis.perez@email.com',       '3045678901', 'Google Ads',    'Camp_GA_Enero',    'lead',        2500000, '2024-01-15 09:00:00'),
('Sandra',    'Torres',    'sandra.torres@email.com',    '3056789012', 'Facebook',      'Camp_FB_Enero',    'matriculado', 2500000, '2024-01-18 16:30:00'),
('Andrés',    'Vargas',    'andres.vargas@email.com',    '3067890123', 'WhatsApp',      NULL,               'rechazado',   2500000, '2024-01-20 08:45:00'),
('Lucía',     'Castro',    'lucia.castro@email.com',     '3078901234', 'Email Marketing','Camp_EM_Q1',      'matriculado', 2500000, '2024-01-22 13:00:00'),
('Felipe',    'Mora',      'felipe.mora@email.com',      '3089012345', 'Instagram',     'Camp_IG_Enero',    'lead',        2500000, '2024-01-25 11:30:00'),
('Daniela',   'Ruiz',      'daniela.ruiz@email.com',     '3090123456', 'Referido',      NULL,               'matriculado', 2500000, '2024-01-28 10:00:00'),

-- Febrero 2024
('Sebastián', 'Herrera',   'sebastian.herrera@email.com','3101234567', 'Facebook',      'Camp_FB_Feb',      'matriculado', 2500000, '2024-02-03 09:15:00'),
('Valentina', 'Jiménez',   'valentina.jimenez@email.com','3112345678', 'Google Ads',    'Camp_GA_Feb',      'lead',        2500000, '2024-02-06 14:30:00'),
('Camilo',    'Sánchez',   'camilo.sanchez@email.com',   '3123456789', 'Pagina Web',    NULL,               'matriculado', 2500000, '2024-02-08 10:45:00'),
('Isabella',  'Díaz',      'isabella.diaz@email.com',    '3134567890', 'Instagram',     'Camp_IG_Feb',      'matriculado', 2500000, '2024-02-12 09:30:00'),
('Mateo',     'Flores',    'mateo.flores@email.com',     '3145678901', 'Referido',      NULL,               'lead',        2500000, '2024-02-15 11:00:00'),
('Sara',      'Medina',    'sara.medina@email.com',      '3156789012', 'WhatsApp',      NULL,               'matriculado', 2500000, '2024-02-18 16:00:00'),
('Diego',     'Morales',   'diego.morales@email.com',    '3167890123', 'Facebook',      'Camp_FB_Feb',      'rechazado',   2500000, '2024-02-20 08:30:00'),
('Natalia',   'Ortega',    'natalia.ortega@email.com',   '3178901234', 'Email Marketing','Camp_EM_Q1',      'matriculado', 2500000, '2024-02-23 13:15:00'),
('Alejandro', 'Reyes',     'alejandro.reyes@email.com',  '3189012345', 'Google Ads',    'Camp_GA_Feb',      'lead',        2500000, '2024-02-26 10:30:00'),
('Gabriela',  'Cruz',      'gabriela.cruz@email.com',    '3190123456', 'Pagina Web',    NULL,               'matriculado', 2500000, '2024-02-28 09:00:00'),

-- Marzo 2024
('Ricardo',   'Gómez',     'ricardo.gomez@email.com',    '3201234567', 'Instagram',     'Camp_IG_Mar',      'matriculado', 3000000, '2024-03-04 10:00:00'),
('Catalina',  'Álvarez',   'catalina.alvarez@email.com', '3212345678', 'Facebook',      'Camp_FB_Mar',      'lead',        3000000, '2024-03-07 14:45:00'),
('Pablo',     'Romero',    'pablo.romero@email.com',     '3223456789', 'Referido',      NULL,               'matriculado', 3000000, '2024-03-10 09:30:00'),
('Mariana',   'Mendoza',   'mariana.mendoza@email.com',  '3234567890', 'Google Ads',    'Camp_GA_Mar',      'matriculado', 3000000, '2024-03-13 11:15:00'),
('Esteban',   'Navarro',   'esteban.navarro@email.com',  '3245678901', 'WhatsApp',      NULL,               'lead',        3000000, '2024-03-16 16:30:00'),
('Paola',     'Rios',      'paola.rios@email.com',       '3256789012', 'Email Marketing','Camp_EM_Q1',      'matriculado', 3000000, '2024-03-19 08:45:00'),
('Nicolás',   'Peña',      'nicolas.pena@email.com',     '3267890123', 'Pagina Web',    NULL,               'lead',        3000000, '2024-03-21 13:00:00'),
('Laura',     'Vega',      'laura.vega@email.com',       '3278901234', 'Facebook',      'Camp_FB_Mar',      'matriculado', 3000000, '2024-03-24 10:15:00'),
('Tomás',     'Serrano',   'tomas.serrano@email.com',    '3289012345', 'Instagram',     'Camp_IG_Mar',      'rechazado',   3000000, '2024-03-27 09:45:00'),
('Sofía',     'Rojas',     'sofia.rojas@email.com',      '3290123456', 'Referido',      NULL,               'matriculado', 3000000, '2024-03-30 14:00:00'),

-- Abril 2024
('Julián',    'Espinosa',  'julian.espinosa@email.com',  '3301234567', 'Google Ads',    'Camp_GA_Abr',      'matriculado', 2800000, '2024-04-02 09:00:00'),
('Ximena',    'Pinto',     'ximena.pinto@email.com',     '3312345678', 'Facebook',      'Camp_FB_Abr',      'lead',        2800000, '2024-04-05 11:30:00'),
('Mauricio',  'Aguilar',   'mauricio.aguilar@email.com', '3323456789', 'WhatsApp',      NULL,               'matriculado', 2800000, '2024-04-08 14:00:00'),
('Tatiana',   'Contreras', 'tatiana.contreras@email.com','3334567890', 'Pagina Web',    NULL,               'lead',        2800000, '2024-04-11 10:30:00'),
('Rodrigo',   'Delgado',   'rodrigo.delgado@email.com',  '3345678901', 'Instagram',     'Camp_IG_Abr',      'matriculado', 2800000, '2024-04-14 09:15:00'),
('Viviana',   'Guerrero',  'viviana.guerrero@email.com', '3356789012', 'Email Marketing','Camp_EM_Q2',      'matriculado', 2800000, '2024-04-17 16:45:00'),
('Iván',      'Paredes',   'ivan.paredes@email.com',     '3367890123', 'Referido',      NULL,               'lead',        2800000, '2024-04-20 08:00:00'),
('Mónica',    'Ramos',     'monica.ramos@email.com',     '3378901234', 'Facebook',      'Camp_FB_Abr',      'matriculado', 2800000, '2024-04-23 13:30:00'),
('Cristian',  'Silva',     'cristian.silva@email.com',   '3389012345', 'Google Ads',    'Camp_GA_Abr',      'rechazado',   2800000, '2024-04-26 11:00:00'),
('Adriana',   'Vargas',    'adriana.vargas2@email.com',  '3390123456', 'Instagram',     'Camp_IG_Abr',      'matriculado', 2800000, '2024-04-29 10:00:00'),

-- Mayo 2024
('Ernesto',   'Cabrera',   'ernesto.cabrera@email.com',  '3401234567', 'Facebook',      'Camp_FB_May',      'matriculado', 3200000, '2024-05-03 09:30:00'),
('Patricia',  'Lara',      'patricia.lara@email.com',    '3412345678', 'Pagina Web',    NULL,               'lead',        3200000, '2024-05-07 14:15:00'),
('Hernán',    'Mejía',     'hernan.mejia@email.com',     '3423456789', 'WhatsApp',      NULL,               'matriculado', 3200000, '2024-05-10 10:00:00'),
('Claudia',   'Ospina',    'claudia.ospina@email.com',   '3434567890', 'Instagram',     'Camp_IG_May',      'matriculado', 3200000, '2024-05-13 09:15:00'),
('Eduardo',   'Quintero',  'eduardo.quintero@email.com', '3445678901', 'Google Ads',    'Camp_GA_May',      'lead',        3200000, '2024-05-16 16:00:00'),
('Diana',     'Salazar',   'diana.salazar@email.com',    '3456789012', 'Email Marketing','Camp_EM_Q2',      'matriculado', 3200000, '2024-05-19 08:30:00'),
('Arturo',    'Trujillo',  'arturo.trujillo@email.com',  '3467890123', 'Referido',      NULL,               'matriculado', 3200000, '2024-05-22 13:45:00'),
('Elena',     'Uribe',     'elena.uribe@email.com',      '3478901234', 'Facebook',      'Camp_FB_May',      'lead',        3200000, '2024-05-25 11:15:00'),
('Germán',    'Valencia',  'german.valencia@email.com',  '3489012345', 'Pagina Web',    NULL,               'rechazado',   3200000, '2024-05-28 10:30:00'),
('Amparo',    'Zambrano',  'amparo.zambrano@email.com',  '3490123456', 'Instagram',     'Camp_IG_May',      'matriculado', 3200000, '2024-05-31 09:00:00'),

-- Junio 2024
('Rodrigo',   'Acosta',    'rodrigo.acosta@email.com',   '3501234567', 'Google Ads',    'Camp_GA_Jun',      'matriculado', 3500000, '2024-06-03 10:15:00'),
('Lina',      'Barrera',   'lina.barrera@email.com',     '3512345678', 'Facebook',      'Camp_FB_Jun',      'lead',        3500000, '2024-06-06 14:30:00'),
('Fabio',     'Cardona',   'fabio.cardona@email.com',    '3523456789', 'WhatsApp',      NULL,               'matriculado', 3500000, '2024-06-09 09:45:00'),
('Martha',    'Duque',     'martha.duque@email.com',     '3534567890', 'Referido',      NULL,               'matriculado', 3500000, '2024-06-12 11:00:00'),
('Oswaldo',   'Echeverri', 'oswaldo.echeverri@email.com','3545678901', 'Instagram',     'Camp_IG_Jun',      'lead',        3500000, '2024-06-15 16:15:00'),
('Nathalia',  'Franco',    'nathalia.franco@email.com',  '3556789012', 'Email Marketing','Camp_EM_Q2',      'matriculado', 3500000, '2024-06-18 08:15:00'),
('Gustavo',   'Gaviria',   'gustavo.gaviria@email.com',  '3567890123', 'Pagina Web',    NULL,               'lead',        3500000, '2024-06-21 13:30:00'),
('Rebeca',    'Henao',     'rebeca.henao@email.com',     '3578901234', 'Facebook',      'Camp_FB_Jun',      'matriculado', 3500000, '2024-06-24 10:45:00'),
('Wilson',    'Ibáñez',    'wilson.ibanez@email.com',    '3589012345', 'Google Ads',    'Camp_GA_Jun',      'rechazado',   3500000, '2024-06-27 09:30:00'),
('Pilar',     'Jaramillo', 'pilar.jaramillo@email.com',  '3590123456', 'Referido',      NULL,               'matriculado', 3500000, '2024-06-30 14:00:00');

-- ============================================================
-- DATOS DE PRUEBA - Matrículas (sólo los clientes matriculados)
-- ============================================================

INSERT INTO matriculas (cliente_id, curso, valor_pagado, fecha_matricula, estado, metodo_pago) VALUES
-- Enero 2024
(1,  'Trading Básico',      2500000, '2024-01-10 10:00:00', 'activa',      'transferencia'),
(2,  'Análisis Técnico',    2500000, '2024-01-14 11:00:00', 'activa',      'tarjeta'),
(4,  'Trading Básico',      2500000, '2024-01-17 09:30:00', 'activa',      'transferencia'),
(6,  'Trading Avanzado',    2800000, '2024-01-24 14:00:00', 'completada',  'efectivo'),
(8,  'Análisis Técnico',    2500000, '2024-01-30 10:30:00', 'activa',      'tarjeta'),
(10, 'Trading Básico',      2500000, '2024-02-03 09:00:00', 'activa',      'transferencia'),

-- Febrero 2024
(11, 'Análisis Técnico',    2500000, '2024-02-08 10:00:00', 'activa',      'transferencia'),
(13, 'Trading Avanzado',    2800000, '2024-02-12 09:15:00', 'activa',      'tarjeta'),
(14, 'Trading Básico',      2500000, '2024-02-16 14:30:00', 'completada',  'transferencia'),
(16, 'Análisis Fundamental',2600000, '2024-02-22 10:00:00', 'activa',      'efectivo'),
(18, 'Trading Básico',      2500000, '2024-02-27 09:30:00', 'activa',      'transferencia'),
(20, 'Trading Avanzado',    2800000, '2024-03-03 11:00:00', 'activa',      'tarjeta'),

-- Marzo 2024
(21, 'Análisis Técnico',    2500000, '2024-03-08 09:00:00', 'activa',      'transferencia'),
(23, 'Trading Básico',      3000000, '2024-03-14 14:00:00', 'activa',      'tarjeta'),
(24, 'Trading Avanzado',    3000000, '2024-03-18 10:30:00', 'activa',      'transferencia'),
(26, 'Análisis Técnico',    3000000, '2024-03-23 09:15:00', 'activa',      'efectivo'),
(28, 'Trading Básico',      3000000, '2024-03-28 14:45:00', 'activa',      'tarjeta'),
(30, 'Trading Avanzado',    3000000, '2024-04-03 10:00:00', 'activa',      'transferencia'),

-- Abril 2024
(31, 'Análisis Fundamental',2800000, '2024-04-06 09:30:00', 'activa',      'transferencia'),
(33, 'Trading Básico',      2800000, '2024-04-12 11:00:00', 'activa',      'tarjeta'),
(35, 'Trading Avanzado',    2800000, '2024-04-18 14:30:00', 'activa',      'transferencia'),
(36, 'Análisis Técnico',    2800000, '2024-04-21 09:00:00', 'activa',      'efectivo'),
(38, 'Trading Básico',      2800000, '2024-04-26 10:15:00', 'activa',      'transferencia'),
(40, 'Trading Avanzado',    2800000, '2024-04-30 14:00:00', 'activa',      'tarjeta'),

-- Mayo 2024
(41, 'Análisis Técnico',    3200000, '2024-05-07 09:00:00', 'activa',      'transferencia'),
(43, 'Trading Básico',      3200000, '2024-05-13 11:30:00', 'activa',      'tarjeta'),
(44, 'Trading Avanzado',    3200000, '2024-05-17 14:00:00', 'activa',      'transferencia'),
(46, 'Análisis Fundamental',3200000, '2024-05-22 09:30:00', 'activa',      'efectivo'),
(47, 'Trading Básico',      3200000, '2024-05-26 10:45:00', 'activa',      'transferencia'),
(50, 'Trading Avanzado',    3200000, '2024-06-02 09:15:00', 'activa',      'tarjeta'),

-- Junio 2024
(51, 'Análisis Técnico',    3500000, '2024-06-06 10:00:00', 'activa',      'transferencia'),
(53, 'Trading Básico',      3500000, '2024-06-12 14:15:00', 'activa',      'tarjeta'),
(54, 'Trading Avanzado',    3500000, '2024-06-16 09:30:00', 'activa',      'transferencia'),
(56, 'Análisis Técnico',    3500000, '2024-06-21 11:00:00', 'activa',      'efectivo'),
(58, 'Trading Básico',      3500000, '2024-06-27 14:30:00', 'activa',      'transferencia'),
(60, 'Trading Avanzado',    3500000, '2024-07-01 10:00:00', 'activa',      'tarjeta');

-- ============================================================
-- VERIFICACIÓN: Muestra resumen de datos insertados
-- ============================================================
SELECT 'Clientes totales'   AS resumen, COUNT(*) AS cantidad FROM clientes
UNION ALL
SELECT 'Leads',                          COUNT(*) FROM clientes WHERE estado = 'lead'
UNION ALL
SELECT 'Matriculados',                   COUNT(*) FROM clientes WHERE estado = 'matriculado'
UNION ALL
SELECT 'Rechazados',                     COUNT(*) FROM clientes WHERE estado = 'rechazado'
UNION ALL
SELECT 'Total matrículas',               COUNT(*) FROM matriculas
UNION ALL
SELECT 'Valor total ($)',                SUM(valor_pagado) FROM matriculas;
