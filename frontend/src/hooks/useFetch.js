// src/hooks/useFetch.js
// Hook genérico reutilizable para cualquier llamada a la API
import { useState, useEffect, useCallback } from 'react';

export function useFetch(fetchFn, deps = []) {
  const [datos,    setDatos]    = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error,    setError]    = useState(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const data = await fetchFn();
      setDatos(data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Error desconocido');
    } finally {
      setCargando(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => { cargar(); }, [cargar]);

  return { datos, cargando, error, recargar: cargar };
}
