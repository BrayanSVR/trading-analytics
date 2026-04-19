// src/pages/Dashboard.jsx
import { useDashboard } from '../hooks/useDashboard';
import MetricCard from '../components/MetricCard';
import { SkeletonCard, SkeletonChart, ErrorState } from '../components/LoadingState';
import {
  GraficaMatriculasMes,
  GraficaValorMes,
  GraficaFuentesPie,
  GraficaValorFuente,
  GraficaEmbudo,
} from '../components/charts/Graficas';

// ── Sección con título ───────────────────────────────────────
function Seccion({ titulo, subtitulo, children }) {
  return (
    <section style={{ marginBottom: '2rem' }}>
      <div style={{ marginBottom: '1rem' }}>
        <h2 style={{ margin: 0, fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16, color: 'var(--text)' }}>
          {titulo}
        </h2>
        {subtitulo && (
          <p style={{ margin: 0, fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>{subtitulo}</p>
        )}
      </div>
      {children}
    </section>
  );
}

// ── Tabla de fuentes ─────────────────────────────────────────
function TablaFuentes({ fuentes = [] }) {
  const formatCOP = (v) => `$${Number(v).toLocaleString('es-CO')}`;

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)' }}>
            {['Fuente', 'Leads', 'Matriculados', 'Tasa Conv.', 'Valor Generado'].map((h) => (
              <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--muted)', fontFamily: 'JetBrains Mono, monospace', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {fuentes.map((f, i) => (
            <tr key={i} style={{ borderBottom: '1px solid rgba(30,58,95,0.5)', transition: 'background 0.15s' }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,212,170,0.03)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600 }}>{f.fuente}</td>
              <td style={{ padding: '10px 12px', color: 'var(--muted)', fontFamily: 'JetBrains Mono, monospace' }}>{f.total_leads}</td>
              <td style={{ padding: '10px 12px' }}>
                <span className="badge badge-green">{f.matriculados}</span>
              </td>
              <td style={{ padding: '10px 12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ flex: 1, height: 4, background: 'var(--border)', borderRadius: 2, maxWidth: 60 }}>
                    <div style={{ height: '100%', width: `${Math.min(f.tasa_conversion, 100)}%`, background: 'var(--green)', borderRadius: 2 }} />
                  </div>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--green)' }}>
                    {f.tasa_conversion}%
                  </span>
                </div>
              </td>
              <td style={{ padding: '10px 12px', color: '#3B82F6', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>
                {formatCOP(f.valor_generado)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Página principal ─────────────────────────────────────────
function Dashboard() {
  const { datos, cargando, error, recargar } = useDashboard();

  if (error) return <ErrorState mensaje={error} onReintentar={recargar} />;

  const r = datos?.resumen;

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-in-out' }}>
      {/* Header de página */}
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ margin: 0, fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 24, color: 'var(--text)' }}>
            Dashboard Ejecutivo
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--muted)' }}>
            Vista general de métricas de adquisición y conversión de clientes
          </p>
        </div>
        <button
          onClick={recargar}
          style={{
            background: 'rgba(0,212,170,0.08)', color: 'var(--green)',
            border: '1px solid rgba(0,212,170,0.2)', borderRadius: 8,
            padding: '8px 16px', cursor: 'pointer', fontSize: 12,
            fontFamily: 'JetBrains Mono, monospace', transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => e.target.style.background = 'rgba(0,212,170,0.15)'}
          onMouseLeave={(e) => e.target.style.background = 'rgba(0,212,170,0.08)'}
        >
          ↺ Actualizar
        </button>
      </div>

      {/* ── KPIs Principales ── */}
      <Seccion titulo="Resumen General" subtitulo="Indicadores clave del negocio">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          {cargando ? (
            Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)
          ) : (
            <>
              <MetricCard
                titulo="Total Leads"
                valor={r?.total_leads}
                subtitulo="Clientes potenciales"
                icono="👥" color="blue"
              />
              <MetricCard
                titulo="Matriculados"
                valor={r?.total_matriculados}
                subtitulo="Conversiones exitosas"
                icono="✅" color="green"
              />
              <MetricCard
                titulo="Sin Convertir"
                valor={r?.leads_sin_convertir}
                subtitulo="Leads pendientes"
                icono="⏳" color="amber"
              />
              <MetricCard
                titulo="Tasa Conversión"
                valor={r?.tasa_conversion}
                sufijo="%"
                subtitulo="Leads → Matrículas"
                icono="🎯" color="purple"
              />
              <MetricCard
                titulo="Valor Generado"
                valor={r?.valor_total_generado}
                prefijo="$"
                subtitulo="Ingresos totales"
                icono="💰" color="green"
              />
              <MetricCard
                titulo="Días Prom. Cierre"
                valor={datos?.tiempo_conversion?.dias_promedio}
                sufijo=" días"
                subtitulo="Lead a matrícula"
                icono="⚡" color="amber"
              />
            </>
          )}
        </div>
      </Seccion>

      {/* ── Matrículas por mes + Valor ── */}
      <Seccion titulo="Evolución Temporal" subtitulo="Matrículas y valor generado por mes">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          {cargando ? (
            <><SkeletonChart /><SkeletonChart /></>
          ) : (
            <>
              <div className="card">
                <p style={{ margin: '0 0 1rem', fontSize: 12, fontWeight: 600, color: 'var(--muted)', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  📋 Matrículas por mes
                </p>
                <GraficaMatriculasMes datos={datos?.matriculas_por_mes || []} />
              </div>
              <div className="card">
                <p style={{ margin: '0 0 1rem', fontSize: 12, fontWeight: 600, color: 'var(--muted)', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  💵 Valor generado por mes
                </p>
                <GraficaValorMes datos={datos?.matriculas_por_mes || []} />
              </div>
            </>
          )}
        </div>
      </Seccion>

      {/* ── Fuentes ── */}
      <Seccion titulo="Canales de Adquisición" subtitulo="Origen de los clientes y valor por canal">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '1rem', marginBottom: '1rem' }}>
          {cargando ? (
            <><SkeletonChart /><SkeletonChart /></>
          ) : (
            <>
              <div className="card">
                <p style={{ margin: '0 0 1rem', fontSize: 12, fontWeight: 600, color: 'var(--muted)', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  📡 Distribución de leads
                </p>
                <GraficaFuentesPie datos={datos?.distribucion_fuentes || []} />
              </div>
              <div className="card">
                <p style={{ margin: '0 0 1rem', fontSize: 12, fontWeight: 600, color: 'var(--muted)', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  💰 Valor generado por canal
                </p>
                <GraficaValorFuente datos={datos?.distribucion_fuentes || []} />
              </div>
            </>
          )}
        </div>

        {/* Tabla de fuentes */}
        {!cargando && (
          <div className="card">
            <p style={{ margin: '0 0 1rem', fontSize: 12, fontWeight: 600, color: 'var(--muted)', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              📊 Detalle por canal
            </p>
            <TablaFuentes fuentes={datos?.distribucion_fuentes || []} />
          </div>
        )}
      </Seccion>

      {/* ── Embudo de conversión ── */}
      <Seccion titulo="Embudo de Conversión" subtitulo="Flujo de leads a matrículas">
        {cargando ? <SkeletonChart /> : (
          <div className="card">
            <GraficaEmbudo datos={[
              { etapa: 'Total Leads',   cantidad: r?.total_leads,        color: '#3B82F6' },
              { etapa: 'Interesados',   cantidad: r?.total_leads - r?.rechazados, color: '#A855F7' },
              { etapa: 'Matriculados',  cantidad: r?.total_matriculados,  color: '#00D4AA' },
            ]} />
          </div>
        )}
      </Seccion>

      <style>{`@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>
    </div>
  );
}

export default Dashboard;
