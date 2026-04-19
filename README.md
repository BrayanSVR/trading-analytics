# 📈 Trading Analytics — Guía Completa del Proyecto

> Plataforma web de analítica y seguimiento de clientes para empresa de trading.
> **Stack:** Node.js + Express · MySQL · React + Vite · Tailwind CSS · Recharts

---

## Índice

1. [Arquitectura del sistema](#1-arquitectura-del-sistema)
2. [Preparar el entorno desde cero](#2-preparar-el-entorno-desde-cero)
3. [Configurar la base de datos MySQL](#3-configurar-la-base-de-datos-mysql)
4. [Arrancar el backend](#4-arrancar-el-backend)
5. [Probar la API con Postman o el navegador](#5-probar-la-api)
6. [Arrancar el frontend React](#6-arrancar-el-frontend-react)
7. [Estructura del proyecto](#7-estructura-del-proyecto)
8. [Fases del proyecto (plan de prácticas)](#8-fases-del-proyecto)
9. [Buenas prácticas y errores comunes](#9-buenas-prácticas-y-errores-comunes)
10. [Cómo escalar el sistema](#10-cómo-escalar-el-sistema)

---

## 1. Arquitectura del sistema

```
┌──────────────────────────────────────────────────────────┐
│                    NAVEGADOR / CLIENTE                   │
│              React + Vite   puerto :5173                 │
│    ┌─────────────────────────────────────────────────┐  │
│    │  Dashboard │ Clientes │ Fuentes │ Conversión     │  │
│    └──────────────────┬──────────────────────────────┘  │
└─────────────────────── │ ─────────────────────────────────┘
                         │  HTTP / REST  (axios)
                         ▼
┌──────────────────────────────────────────────────────────┐
│                   BACKEND API REST                       │
│              Node.js + Express   puerto :4000            │
│                                                          │
│   /api/dashboard        → KPIs ejecutivos                │
│   /api/clientes         → CRUD leads y clientes          │
│   /api/metricas/fuentes → análisis por canal             │
│   /api/metricas/...     → resto de métricas              │
└──────────────────────────┬───────────────────────────────┘
                           │  mysql2 (pool de conexiones)
                           ▼
┌──────────────────────────────────────────────────────────┐
│                  BASE DE DATOS MySQL                     │
│                   trading_analytics                      │
│                                                          │
│   tabla: clientes   (leads, fuente, estado, fechas)      │
│   tabla: matriculas (curso, valor, fecha_matricula)      │
│              FK: matriculas.cliente_id → clientes.id     │
└──────────────────────────────────────────────────────────┘
```

**¿Por qué esta arquitectura?**

- **Separación de responsabilidades**: el frontend nunca toca la base de datos directamente.
- **API REST**: permite conectar más clientes en el futuro (app móvil, reportes Excel, etc.).
- **Pool de conexiones MySQL**: evita abrir y cerrar una conexión en cada petición (mucho más eficiente).

---

## 2. Preparar el entorno desde cero

### 2.1 Instalar Node.js

1. Ve a [https://nodejs.org](https://nodejs.org) y descarga la versión **LTS** (20.x o superior).
2. Instala el paquete y verifica:

```bash
node --version    # debe mostrar v20.x.x o superior
npm  --version    # debe mostrar 10.x.x o superior
```

### 2.2 Instalar MySQL

**Opción A — MySQL Workbench (recomendada para principiantes):**
- Descarga MySQL Installer desde [https://dev.mysql.com/downloads/installer/](https://dev.mysql.com/downloads/installer/)
- Instala: MySQL Server + MySQL Workbench
- Durante la instalación elige una contraseña para `root` y guárdala

**Opción B — XAMPP (más simple):**
- Descarga desde [https://www.apachefriends.org](https://www.apachefriends.org)
- Abre XAMPP Control Panel → Start → MySQL
- El usuario es `root` sin contraseña por defecto

### 2.3 Instalar VS Code

- Descarga desde [https://code.visualstudio.com](https://code.visualstudio.com)
- Extensiones recomendadas:
  - **ES7+ React/Redux/React-Native snippets**
  - **MySQL** (de cweijan)
  - **Thunder Client** (para probar la API sin Postman)
  - **Prettier** (formateador de código)
  - **GitLens**

### 2.4 Instalar Git

```bash
git --version     # si no está instalado, descarga de https://git-scm.com
```

---

## 3. Configurar la base de datos MySQL

### 3.1 Ejecutar el schema SQL

**Opción A — MySQL Workbench:**
1. Abre MySQL Workbench → conecta a tu instancia local
2. Menú: File → Open SQL Script → selecciona `backend/database/schema.sql`
3. Ejecuta con el rayo ⚡ o `Ctrl+Shift+Enter`
4. Verifica que ves la tabla de resumen al final (60 clientes, 36 matrículas)

**Opción B — Terminal:**
```bash
# En Windows (ajusta la ruta si es necesario)
mysql -u root -p < backend/database/schema.sql

# En Mac/Linux
mysql -u root -p trading_analytics < backend/database/schema.sql
```

### 3.2 Verificar los datos

```sql
USE trading_analytics;
SELECT estado, COUNT(*) FROM clientes GROUP BY estado;
SELECT COUNT(*) AS total_matriculas, SUM(valor_pagado) AS ingresos FROM matriculas;
```

---

## 4. Arrancar el backend

### 4.1 Instalar dependencias

```bash
cd backend
npm install
```

Esto descarga: `express`, `mysql2`, `cors`, `dotenv`, `nodemon`.

### 4.2 Configurar variables de entorno

```bash
# Copia el archivo de ejemplo
cp .env.example .env

# Edita .env con tu editor y rellena:
# DB_PASSWORD=la_contraseña_que_pusiste_al_instalar_mysql
# DB_USER=root
# DB_NAME=trading_analytics
```

Contenido de `.env`:
```
PORT=4000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_contraseña_aquí
DB_NAME=trading_analytics

CORS_ORIGINS=http://localhost:5173
```

### 4.3 Iniciar el servidor

```bash
# Modo desarrollo (se reinicia automático al guardar cambios)
npm run dev

# Modo producción
npm start
```

Deberías ver:
```
✅ MySQL conectado correctamente
   Host: localhost | DB: trading_analytics

🚀 Servidor Trading Analytics corriendo
   URL:  http://localhost:4000
   API:  http://localhost:4000/api
```

---

## 5. Probar la API

Abre el navegador o usa Thunder Client / Postman:

| Endpoint | Descripción |
|----------|-------------|
| `GET http://localhost:4000/api/health` | Estado del servidor |
| `GET http://localhost:4000/api/dashboard` | Todos los KPIs |
| `GET http://localhost:4000/api/clientes` | Lista de clientes (paginada) |
| `GET http://localhost:4000/api/clientes?estado=lead` | Solo leads |
| `GET http://localhost:4000/api/clientes?buscar=carlos` | Buscar por nombre |
| `GET http://localhost:4000/api/metricas/fuentes` | Análisis por canal |
| `GET http://localhost:4000/api/metricas/matriculas-mes?meses=6` | Matrículas últimos 6 meses |
| `GET http://localhost:4000/api/metricas/conversion` | Tasa de conversión |
| `GET http://localhost:4000/api/metricas/tiempo-conversion` | Tiempo promedio cierre |
| `GET http://localhost:4000/api/metricas/valor-por-fuente` | ROI por canal |

**Crear un lead (POST):**
```json
POST http://localhost:4000/api/clientes
Content-Type: application/json

{
  "nombre": "Juan",
  "apellido": "Prueba",
  "email": "juan@test.com",
  "telefono": "3001234567",
  "fuente": "Facebook",
  "campaña": "Camp_FB_Test",
  "valor_potencial": 2500000
}
```

---

## 6. Arrancar el frontend React

### 6.1 Instalar dependencias

```bash
# Desde la raíz del proyecto
cd frontend
npm install
```

Esto descarga: `react`, `react-router-dom`, `axios`, `recharts`, `tailwindcss`, `vite`.

### 6.2 Configurar variable de entorno (opcional)

```bash
# frontend/.env  (si quieres apuntar a un backend diferente)
VITE_API_URL=http://localhost:4000/api
```

> **Nota:** Si no creas este archivo, el frontend usa el proxy de Vite configurado en `vite.config.js`, que redirige `/api` → `http://localhost:4000`. Esto funciona perfectamente en desarrollo.

### 6.3 Iniciar el servidor de desarrollo

```bash
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173) en el navegador.

> ⚠️ **Importante:** El backend debe estar corriendo en `:4000` para que el frontend pueda obtener datos.

---

## 7. Estructura del proyecto

```
trading-analytics/
│
├── backend/
│   ├── database/
│   │   └── schema.sql              ← Crea tablas e inserta datos de prueba
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js               ← Pool de conexiones MySQL
│   │   ├── controllers/
│   │   │   ├── clientesController.js   ← Lógica CRUD clientes
│   │   │   ├── dashboardController.js  ← KPIs del dashboard
│   │   │   └── metricasController.js   ← Métricas específicas
│   │   ├── middleware/
│   │   │   └── errorHandler.js     ← Manejador global de errores
│   │   ├── routes/
│   │   │   ├── clientes.js         ← Rutas /api/clientes
│   │   │   ├── dashboard.js        ← Rutas /api/dashboard
│   │   │   └── metricas.js         ← Rutas /api/metricas/*
│   │   └── app.js                  ← Servidor Express (punto de entrada)
│   ├── .env.example                ← Plantilla de variables de entorno
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── charts/
│   │   │   │   └── Graficas.jsx    ← Todos los componentes de gráficas
│   │   │   ├── LoadingState.jsx    ← Skeletons y estados de error
│   │   │   ├── MetricCard.jsx      ← Tarjeta de KPI reutilizable
│   │   │   └── Sidebar.jsx         ← Navegación lateral
│   │   ├── hooks/
│   │   │   ├── useDashboard.js     ← Hook para datos del dashboard
│   │   │   └── useFetch.js         ← Hook genérico de fetching
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx       ← Página principal con todos los KPIs
│   │   │   ├── Clientes.jsx        ← Tabla de clientes con búsqueda
│   │   │   └── Paginas.jsx         ← Fuentes, Matrículas, Conversión
│   │   ├── services/
│   │   │   └── api.js              ← Todas las llamadas HTTP (axios)
│   │   ├── App.jsx                 ← Rutas de la app
│   │   ├── main.jsx                ← Punto de entrada React
│   │   └── index.css               ← Estilos globales + Tailwind
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js              ← Config Vite + proxy al backend
│   ├── tailwind.config.js
│   └── postcss.config.js
│
├── .gitignore
└── README.md
```

---

## 8. Fases del proyecto

### 📅 Semana 1 — Fundamentos y configuración
**Objetivo:** El proyecto corre localmente y la base de datos tiene datos.

- [x] Instalar Node.js, MySQL, VS Code
- [x] Crear estructura de carpetas
- [x] Diseñar y ejecutar el schema SQL (`schema.sql`)
- [x] Configurar conexión MySQL en Node.js (`config/db.js`)
- [x] Servidor Express básico corriendo en `:4000`
- [x] Probar endpoint `/api/health`

**Checkpoint:** `GET http://localhost:4000/api/health` devuelve `{ "status": "OK" }` ✅

---

### 📅 Semana 2 — API REST completa
**Objetivo:** Todos los endpoints funcionan y devuelven datos reales.

- [x] Implementar controlador de clientes (GET con filtros, POST, PUT)
- [x] Implementar controlador del dashboard (todos los KPIs en paralelo)
- [x] Implementar controlador de métricas (fuentes, matrículas/mes, conversión, tiempo, valor)
- [x] Conectar rutas al servidor Express
- [x] Probar todos los endpoints con Postman o Thunder Client

**Checkpoint:** `GET /api/dashboard` devuelve objeto completo con `resumen`, `matriculas_por_mes`, `distribucion_fuentes`, etc. ✅

---

### 📅 Semana 3 — Frontend base
**Objetivo:** React corriendo con datos del backend.

- [x] Crear proyecto Vite + React + Tailwind
- [x] Configurar Axios y la capa de servicios (`api.js`)
- [x] Crear custom hooks (`useDashboard`, `useFetch`)
- [x] Crear componente `MetricCard`
- [x] Crear Sidebar con React Router
- [x] Dashboard mostrando KPIs reales

**Checkpoint:** El dashboard muestra 6 tarjetas de métricas con datos reales de MySQL ✅

---

### 📅 Semana 4 — Gráficas y páginas completas
**Objetivo:** Dashboard completo con todas las visualizaciones.

- [x] Integrar Recharts: barras, área, pie, barras horizontales
- [x] Completar página de Clientes con tabla, filtros y paginación
- [x] Completar página de Fuentes con cards y gráficas
- [x] Completar página de Matrículas con tabla histórica
- [x] Completar página de Conversión con embudo

**Checkpoint:** Las 5 páginas cargan datos reales y las gráficas se renderizan correctamente ✅

---

### 📅 Semana 5 — Pulido y funcionalidades extra
**Objetivo:** Proyecto listo para presentar.

- [ ] Formulario de creación de leads (frontend → POST backend)
- [ ] Validaciones de formularios
- [ ] Manejo de errores amigable (cuando el backend no responde)
- [ ] Loading states (skeletons mientras carga)
- [ ] Responsive básico (que se vea en tablets)
- [ ] README con instrucciones de instalación

---

### 📅 Semana 6 — Integración con datos reales (cuando tengas acceso)
**Objetivo:** Conectar con las bases de datos reales de la empresa.

- [ ] Mapear las columnas del sistema real a las del schema local
- [ ] Crear scripts de migración/importación de datos
- [ ] Ajustar consultas SQL según el modelo de datos real
- [ ] Probar con datos de producción en entorno de staging
- [ ] Documentar el proceso de actualización de datos

---

## 9. Buenas prácticas y errores comunes

### ✅ Buenas prácticas que ya aplica este proyecto

**Backend:**
- **Separación en capas**: `routes` → `controllers` → `config`. Nunca poner la lógica SQL directo en las rutas.
- **Pool de conexiones**: siempre usar `pool.getConnection()` + `connection.release()` para no agotar conexiones.
- **Variables de entorno**: ninguna contraseña o dato sensible en el código, siempre en `.env`.
- **Manejo centralizado de errores**: un solo `errorHandler` que formatea todos los errores igual.
- **Consultas parametrizadas**: usar `pool.query('SELECT * WHERE id = ?', [id])` NUNCA concatenar strings. Esto previene inyección SQL.

**Frontend:**
- **Capa de servicios separada**: todas las llamadas HTTP en `api.js`, los componentes no usan axios directamente.
- **Custom hooks**: la lógica de fetching separada de los componentes visuales.
- **Estados de carga y error**: siempre mostrar feedback al usuario mientras carga o si falla.

### ❌ Errores comunes a evitar

```javascript
// ❌ MAL: SQL directo en rutas, sin parámetros seguros (vulnerabilidad SQL injection)
app.get('/clientes', (req, res) => {
  db.query('SELECT * FROM clientes WHERE nombre = "' + req.query.nombre + '"');
});

// ✅ BIEN: separar en controller + parámetros seguros
// (controller)  pool.query('SELECT * FROM clientes WHERE nombre = ?', [req.query.nombre])


// ❌ MAL: contraseñas en el código
const db = mysql.createPool({ password: 'micontraseña123' });

// ✅ BIEN: siempre desde variables de entorno
const db = mysql.createPool({ password: process.env.DB_PASSWORD });


// ❌ MAL: llamadas API directas dentro del render del componente
function Dashboard() {
  axios.get('/api/dashboard').then(setDatos); // esto se llama en cada render!
  return <div>...</div>;
}

// ✅ BIEN: siempre dentro de useEffect o custom hook
function Dashboard() {
  const { datos } = useDashboard(); // el hook maneja el ciclo de vida
  return <div>...</div>;
}


// ❌ MAL: una sola conexión para todo el servidor
const connection = mysql.createConnection({...});
connection.connect(); // si falla, todo el servidor cae

// ✅ BIEN: pool de conexiones (ya configurado en config/db.js)
const pool = mysql.createPool({...}); // gestiona múltiples conexiones automáticamente
```

### 🔧 Errores de configuración más comunes

| Error | Causa | Solución |
|-------|-------|----------|
| `CORS bloqueado` | Frontend en :5173 bloqueado por Express | Verificar `CORS_ORIGINS` en `.env` |
| `ER_ACCESS_DENIED_ERROR` | Contraseña MySQL incorrecta | Revisar `DB_PASSWORD` en `.env` |
| `ECONNREFUSED 3306` | MySQL no está corriendo | Iniciar MySQL (XAMPP o servicio del sistema) |
| `Cannot GET /api/xxx` | Ruta mal definida | Revisar `app.use('/api/xxx', ruta)` en `app.js` |
| `Network Error` en React | Backend no está corriendo | Iniciar el backend con `npm run dev` primero |
| `Module not found` | Falta `npm install` | Ejecutar `npm install` en la carpeta correspondiente |

---

## 10. Cómo escalar el sistema

### A corto plazo (2-3 meses)

- **Autenticación**: agregar JWT para proteger la API. Los endpoints no deben ser públicos en producción.
  ```bash
  npm install jsonwebtoken bcryptjs
  ```
- **Caché**: usar `node-cache` para cachear el dashboard (no cambiar cada segundo).
- **Validación de inputs**: agregar `express-validator` para validar todos los campos del formulario.

### A mediano plazo (3-6 meses)

- **Exportar a Excel**: agregar endpoint que devuelva los datos en formato `.xlsx` usando la librería `exceljs`.
- **Notificaciones**: alertar cuando la tasa de conversión cae por debajo del umbral.
- **Más fuentes de datos**: conectar con la API de Facebook Ads, Google Ads para importar métricas de campañas automáticamente.
- **Filtros por fecha**: permitir seleccionar rangos de fechas personalizados en el dashboard.

### A largo plazo (6+ meses)

- **Pasar a PostgreSQL**: más robusto para consultas analíticas complejas.
- **Separar en microservicios**: módulo de clientes, módulo de matrículas, módulo de reportes.
- **Deploy en la nube**: Railway, Render (gratis) o AWS/GCP (empresarial).
- **Pipeline ETL**: script que importe automáticamente datos de las fuentes reales cada noche.

---

## Comandos rápidos

```bash
# Arrancar todo el proyecto (dos terminales)

# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm run dev

# Acceder
# Frontend:  http://localhost:5173
# API:       http://localhost:4000/api
# Health:    http://localhost:4000/api/health
```

---

## Preguntas frecuentes

**¿Por qué el frontend está en :5173 y el backend en :4000?**
Son dos servidores diferentes. En producción normalmente se ponen en el mismo dominio usando Nginx como proxy.

**¿Puedo usar otro motor de base de datos?**
Sí. El código SQL es estándar. Con cambios mínimos (driver y sintaxis de fechas) funciona en PostgreSQL o SQLite.

**¿Cómo conecto con la base de datos real de la empresa?**
Solo cambias las variables en `.env` (`DB_HOST`, `DB_USER`, etc.) sin tocar el código. Si el esquema es diferente, ajusta las consultas SQL en los controladores.

**¿Cómo hago el deploy a producción?**
- Backend: subir a Railway o Render, configurar las variables de entorno
- Frontend: ejecutar `npm run build` y subir la carpeta `dist/` a Vercel o Netlify
- MySQL: usar PlanetScale (gratis) o RDS de AWS
