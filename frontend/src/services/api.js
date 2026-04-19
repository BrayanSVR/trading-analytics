// src/services/api.js
// ============================================================
// Capa de servicio: centraliza TODAS las llamadas a la API.
// Si cambias la URL base, solo lo cambias aquí.
// ============================================================
import axios from 'axios';

// En desarrollo, Vite redirige /api → http://localhost:4000
// En producción, cambia esta variable en .env
const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // 10 segundos máximo de espera
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor de respuesta: loguear errores centralmente
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const msg = error.response?.data?.error || error.message;
    console.error(`[API Error] ${error.config?.url}: ${msg}`);
    return Promise.reject(error);
  }
);

// ── Dashboard ─────────────────────────────────────────────
export const getDashboard = () =>
  api.get('/dashboard').then((r) => r.data);

// ── Clientes ──────────────────────────────────────────────
export const getClientes = (params = {}) =>
  api.get('/clientes', { params }).then((r) => r.data);

export const getClientePorId = (id) =>
  api.get(`/clientes/${id}`).then((r) => r.data);

export const crearCliente = (datos) =>
  api.post('/clientes', datos).then((r) => r.data);

export const actualizarCliente = (id, datos) =>
  api.put(`/clientes/${id}`, datos).then((r) => r.data);

// ── Métricas ──────────────────────────────────────────────
export const getMetricasFuentes = () =>
  api.get('/metricas/fuentes').then((r) => r.data);

export const getMatriculasPorMes = (meses = 6) =>
  api.get('/metricas/matriculas-mes', { params: { meses } }).then((r) => r.data);

export const getMetricasConversion = () =>
  api.get('/metricas/conversion').then((r) => r.data);

export const getTiempoConversion = () =>
  api.get('/metricas/tiempo-conversion').then((r) => r.data);

export const getValorPorFuente = () =>
  api.get('/metricas/valor-por-fuente').then((r) => r.data);

export default api;
