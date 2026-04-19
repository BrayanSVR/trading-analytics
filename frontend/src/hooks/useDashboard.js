// src/hooks/useDashboard.js
// ============================================================
// Custom hook: encapsula la lógica de fetching del dashboard.
// Cualquier componente que lo use obtiene: datos, cargando, error.
// Separar el fetching del componente es una BUENA PRÁCTICA clave.
// ============================================================
import { useState, useEffect, useCallback } from 'react';
import { getDashboard } from '../services/api';

export function useDashboard() {
  const [datos,    setDatos]    = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error,    setError]    = useState(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const data = await getDashboard();
      setDatos(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cargar el dashboard');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargar();
    // Auto-refresh cada 60 segundos (útil en producción)
    const interval = setInterval(cargar, 60_000);
    return () => clearInterval(interval);
  }, [cargar]);

  return { datos, cargando, error, recargar: cargar };
}
