// src/components/Sidebar.jsx
import { NavLink } from 'react-router-dom';

const NAV_ITEMS = [
  { to: '/',           icono: '⬛', label: 'Dashboard'    },
  { to: '/clientes',   icono: '👤', label: 'Clientes'     },
  { to: '/fuentes',    icono: '📡', label: 'Fuentes'      },
  { to: '/matriculas', icono: '📋', label: 'Matrículas'   },
  { to: '/conversion', icono: '🎯', label: 'Conversión'   },
];

function Sidebar() {
  return (
    <aside style={{
      width: 220,
      minHeight: '100vh',
      background: '#0D1424',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      left: 0, top: 0, bottom: 0,
      zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #00D4AA, #3B82F6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18,
          }}>
            📈
          </div>
          <div>
            <p style={{ margin: 0, fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14, color: 'var(--text)', lineHeight: 1.2 }}>
              Trading
            </p>
            <p style={{ margin: 0, fontSize: 10, color: 'var(--green)', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Analytics
            </p>
          </div>
        </div>
      </div>

      {/* Indicador LIVE */}
      <div style={{ padding: '0.75rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{
            width: 7, height: 7, borderRadius: '50%',
            background: '#00D4AA',
            boxShadow: '0 0 6px #00D4AA',
            animation: 'pulse 2s infinite',
            display: 'inline-block',
          }} />
          <span style={{ fontSize: 10, color: 'var(--green)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em' }}>
            SISTEMA ACTIVO
          </span>
        </div>
      </div>

      {/* Navegación */}
      <nav style={{ flex: 1, padding: '1rem 0.75rem' }}>
        <p style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '0 0.75rem', marginBottom: '0.5rem' }}>
          Módulos
        </p>
        {NAV_ITEMS.map(({ to, icono, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '0.6rem 0.75rem', borderRadius: 8,
              marginBottom: 4,
              textDecoration: 'none',
              fontSize: 13, fontWeight: isActive ? 600 : 400,
              color: isActive ? 'var(--green)' : 'var(--muted)',
              background: isActive ? 'rgba(0,212,170,0.08)' : 'transparent',
              borderLeft: isActive ? '2px solid var(--green)' : '2px solid transparent',
              transition: 'all 0.15s',
            })}
          >
            <span style={{ fontSize: 15 }}>{icono}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border)' }}>
        <p style={{ margin: 0, fontSize: 10, color: 'var(--muted)', fontFamily: 'JetBrains Mono, monospace' }}>
          v1.0.0 · Prácticas 2024
        </p>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </aside>
  );
}

export default Sidebar;
