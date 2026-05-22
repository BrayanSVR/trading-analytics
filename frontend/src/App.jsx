// src/App.jsx
import { Routes, Route, Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Clientes from './pages/Clientes';
import { Fuentes, Matriculas, Conversion } from './pages/Paginas';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';

// Layout principal que incluye el Sidebar para las rutas protegidas
function MainLayout() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{
        marginLeft: 220,
        flex: 1,
        padding: '2rem',
        minHeight: '100vh',
        maxWidth: '100%',
        overflow: 'hidden',
      }}>
        <Outlet />
      </main>
    </div>
  );
}

function App() {
  return (
    <Routes>
      {/* Rutas Públicas */}
      <Route path="/login" element={<Login />} />

      {/* Rutas Protegidas */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/"           element={<Dashboard />} />
          <Route path="/clientes"   element={<Clientes />}  />
          <Route path="/fuentes"    element={<Fuentes />}   />
          <Route path="/matriculas" element={<Matriculas />} />
          <Route path="/conversion" element={<Conversion />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
