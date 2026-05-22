import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute() {
  const { user, loading } = useAuth();

  // Muestra un estado de carga mientras se verifica el token
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', justifyContent: 'center', alignItems: 'center', 
        height: '100vh', background: '#0D1424', color: '#00D4AA',
        fontFamily: 'JetBrains Mono, monospace'
      }}>
        Verificando sesión...
      </div>
    );
  }

  // Si no hay usuario, redirige al login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Si hay usuario, renderiza las rutas hijas (Outlet)
  return <Outlet />;
}

export default ProtectedRoute;
