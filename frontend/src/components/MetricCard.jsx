// src/components/MetricCard.jsx
// ============================================================
// Tarjeta de métrica reutilizable.
// Recibe: titulo, valor, subtitulo, icono, color, tendencia
// ============================================================

function MetricCard({ titulo, valor, subtitulo, icono, color = 'green', tendencia, prefijo = '', sufijo = '' }) {
  const colores = {
    green: {
      glow:   'rgba(0,212,170,0.08)',
      border: 'rgba(0,212,170,0.25)',
      text:   '#00D4AA',
      badge:  'rgba(0,212,170,0.12)',
    },
    blue: {
      glow:   'rgba(59,130,246,0.08)',
      border: 'rgba(59,130,246,0.25)',
      text:   '#3B82F6',
      badge:  'rgba(59,130,246,0.12)',
    },
    amber: {
      glow:   'rgba(245,158,11,0.08)',
      border: 'rgba(245,158,11,0.25)',
      text:   '#F59E0B',
      badge:  'rgba(245,158,11,0.12)',
    },
    red: {
      glow:   'rgba(239,68,68,0.08)',
      border: 'rgba(239,68,68,0.25)',
      text:   '#EF4444',
      badge:  'rgba(239,68,68,0.12)',
    },
    purple: {
      glow:   'rgba(168,85,247,0.08)',
      border: 'rgba(168,85,247,0.25)',
      text:   '#A855F7',
      badge:  'rgba(168,85,247,0.12)',
    },
  };

  const c = colores[color] || colores.green;

  // Formatear números grandes con separador de miles
  const formatearValor = (val) => {
    if (val === null || val === undefined) return '—';
    if (typeof val === 'string') return val;
    if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
    if (val >= 1_000)     return val.toLocaleString('es-CO');
    return val.toString();
  };

  return (
    <div
      className="card card-hover animate-count"
      style={{
        background:   `linear-gradient(135deg, #1A2235 0%, ${c.glow} 100%)`,
        borderColor:  c.border,
        position:     'relative',
        overflow:     'hidden',
      }}
    >
      {/* Decoración de fondo */}
      <div style={{
        position: 'absolute', top: -20, right: -20,
        width: 80, height: 80, borderRadius: '50%',
        background: c.glow, filter: 'blur(20px)',
        pointerEvents: 'none',
      }} />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'JetBrains Mono, monospace' }}>
          {titulo}
        </p>
        {icono && (
          <span style={{ fontSize: 20, opacity: 0.9 }}>{icono}</span>
        )}
      </div>

      {/* Valor principal */}
      <div style={{ marginBottom: '0.75rem' }}>
        <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '2rem', color: c.text, letterSpacing: '-0.02em', textShadow: `0 0 24px ${c.text}40`, lineHeight: 1 }}>
          {prefijo}{formatearValor(valor)}{sufijo}
        </span>
      </div>

      {/* Subtítulo + tendencia */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
        {subtitulo && (
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>{subtitulo}</span>
        )}
        {tendencia !== undefined && tendencia !== null && (
          <span style={{
            fontSize: 11, fontWeight: 600, fontFamily: 'JetBrains Mono, monospace',
            padding: '2px 8px', borderRadius: 20,
            background: tendencia >= 0 ? 'rgba(0,212,170,0.12)' : 'rgba(239,68,68,0.12)',
            color: tendencia >= 0 ? '#00D4AA' : '#EF4444',
          }}>
            {tendencia >= 0 ? '▲' : '▼'} {Math.abs(tendencia)}%
          </span>
        )}
      </div>
    </div>
  );
}

export default MetricCard;
