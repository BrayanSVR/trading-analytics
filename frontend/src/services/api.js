// src/services/api.js
// ============================================================
// Capa de servicio: centraliza TODAS las llamadas a la API.
// Si cambias la URL base, solo lo cambias aquí.
// ============================================================
import axios from 'axios';

// En desarrollo, Vite redirige /api → http://localhost:4000
// Aseguramos que el BASE_URL termine en barra '/' para evitar que Axios ignore el prefijo '/api' en producción
const rawBaseUrl = import.meta.env.VITE_API_URL || '/api';
const BASE_URL = rawBaseUrl.endsWith('/') ? rawBaseUrl : `${rawBaseUrl}/`;

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // 10 segundos máximo de espera
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor de petición: inyectar token JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Interceptor de respuesta: manejar errores 401 centralmente y loguear
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si el error es 401 (No autorizado), cerramos sesión automáticamente
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    const msg = error.response?.data?.error || error.message;
    console.error(`[API Error] ${error.config?.url}: ${msg}`);
    return Promise.reject(error);
  }
);

// ── Dashboard ─────────────────────────────────────────────
export const getDashboard = () =>
  api.get('dashboard').then((r) => r.data);

// ── Clientes ──────────────────────────────────────────────
export const getClientes = (params = {}) =>
  api.get('clientes', { params }).then((r) => r.data);

export const getClientePorId = (id) =>
  api.get(`clientes/${id}`).then((r) => r.data);

export const crearCliente = (datos) =>
  api.post('clientes', datos).then((r) => r.data);

export const actualizarCliente = (id, datos) =>
  api.put(`clientes/${id}`, datos).then((r) => r.data);

// ── Métricas ──────────────────────────────────────────────
export const getMetricasFuentes = () =>
  api.get('metricas/fuentes').then((r) => r.data);

export const getMatriculasPorMes = (meses = 6) =>
  api.get('metricas/matriculas-mes', { params: { meses } }).then((r) => r.data);

export const getMetricasConversion = () =>
  api.get('metricas/conversion').then((r) => r.data);

export const getTiempoConversion = () =>
  api.get('metricas/tiempo-conversion').then((r) => r.data);

export const getValorPorFuente = () =>
  api.get('metricas/valor-por-fuente').then((r) => r.data);

// ── Importación ───────────────────────────────────────────
export const importarExcel = (formData) =>
  api.post('v1/import/excel', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then((r) => r.data);

export default api;
