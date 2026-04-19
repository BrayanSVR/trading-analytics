// src/App.jsx
import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Clientes from './pages/Clientes';
import { Fuentes, Matriculas, Conversion } from './pages/Paginas';

function App() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar fijo */}
      <Sidebar />

      {/* Contenido principal con margen para el sidebar */}
      <main style={{
        marginLeft: 220,
        flex: 1,
        padding: '2rem',
        minHeight: '100vh',
        maxWidth: '100%',
        overflow: 'hidden',
      }}>
        <Routes>
          <Route path="/"           element={<Dashboard />} />
          <Route path="/clientes"   element={<Clientes />}  />
          <Route path="/fuentes"    element={<Fuentes />}   />
          <Route path="/matriculas" element={<Matriculas />} />
          <Route path="/conversion" element={<Conversion />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
