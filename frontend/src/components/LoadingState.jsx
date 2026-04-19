// src/components/LoadingState.jsx
export function SkeletonCard() {
  return (
    <div className="card" style={{ animation: 'pulse 1.5s ease-in-out infinite' }}>
      <div style={{ height: 12, width: '60%', background: '#1E3A5F', borderRadius: 6, marginBottom: 16 }} />
      <div style={{ height: 36, width: '80%', background: '#1E3A5F', borderRadius: 6, marginBottom: 12 }} />
      <div style={{ height: 10, width: '40%', background: '#1E3A5F', borderRadius: 6 }} />
    </div>
  );
}

export function SkeletonChart() {
  return (
    <div className="card" style={{ animation: 'pulse 1.5s ease-in-out infinite', height: 300 }}>
      <div style={{ height: 14, width: '40%', background: '#1E3A5F', borderRadius: 6, marginBottom: 20 }} />
      <div style={{ height: 220, background: 'linear-gradient(to top, #1E3A5F44, transparent)', borderRadius: 8 }} />
    </div>
  );
}

export function ErrorState({ mensaje, onReintentar }) {
  return (
    <div style={{
      textAlign: 'center', padding: '3rem',
      background: 'rgba(239,68,68,0.05)',
      border: '1px solid rgba(239,68,68,0.2)',
      borderRadius: 12,
    }}>
      <div style={{ fontSize: 40, marginBottom: '1rem' }}>⚠️</div>
      <p style={{ color: '#EF4444', fontWeight: 600, marginBottom: '0.5rem' }}>
        Error al cargar datos
      </p>
      <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: '1.5rem' }}>
        {mensaje}
      </p>
      {onReintentar && (
        <button onClick={onReintentar} style={{
          background: 'rgba(239,68,68,0.12)', color: '#EF4444',
          border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8,
          padding: '8px 20px', cursor: 'pointer', fontWeight: 600,
          transition: 'all 0.2s',
        }}>
          ↺ Reintentar
        </button>
      )}
    </div>
  );
}

export function LoadingSpinner({ texto = 'Cargando...' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--muted)', padding: '1rem' }}>
      <div style={{
        width: 18, height: 18, borderRadius: '50%',
        border: '2px solid var(--border)',
        borderTop: '2px solid var(--green)',
        animation: 'spin 0.8s linear infinite',
      }} />
      <span style={{ fontSize: 13 }}>{texto}</span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
