// src/pages/Fuentes.jsx
import { useFetch } from '../hooks/useFetch';
import { getMetricasFuentes, getValorPorFuente } from '../services/api';
import { GraficaFuentesPie, GraficaValorFuente } from '../components/charts/Graficas';
import { SkeletonCard, SkeletonChart, ErrorState } from '../components/LoadingState';

export function Fuentes() {
  const { datos: fuentes, cargando: cF, error: eF } = useFetch(getMetricasFuentes);
  const { datos: valor,   cargando: cV, error: eV } = useFetch(getValorPorFuente);

  if (eF || eV) return <ErrorState mensaje={eF || eV} />;

  const formatCOP = (v) => `$${Number(v).toLocaleString('es-CO')}`;

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-in-out' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ margin: 0, fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 24, color: 'var(--text)' }}>
          Canales de Adquisición
        </h1>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--muted)' }}>
          Análisis por fuente: leads, conversión y valor generado
        </p>
      </div>

      {/* Cards por fuente */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {cF ? Array(4).fill(0).map((_,i) => <SkeletonCard key={i} />) :
          fuentes?.fuentes?.map((f, i) => (
            <div key={i} className="card card-hover" style={{ borderColor: 'rgba(59,130,246,0.2)', background: 'linear-gradient(135deg, #1A2235, rgba(59,130,246,0.05))' }}>
              <p style={{ margin: '0 0 0.5rem', fontSize: 11, color: 'var(--muted)', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                📡 {f.fuente}
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <div>
                  <p style={{ margin: 0, fontSize: 10, color: 'var(--muted)' }}>Leads</p>
                  <p style={{ margin: 0, fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 22, color: '#3B82F6' }}>{f.total_leads}</p>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 10, color: 'var(--muted)' }}>Matriculados</p>
                  <p style={{ margin: 0, fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 22, color: '#00D4AA' }}>{f.matriculados}</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <div style={{ flex: 1, height: 5, background: 'var(--border)', borderRadius: 3 }}>
                  <div style={{ height: '100%', width: `${Math.min(f.tasa_conversion_pct, 100)}%`, background: 'var(--green)', borderRadius: 3, transition: 'width 1s ease' }} />
                </div>
                <span style={{ fontSize: 11, color: 'var(--green)', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>{f.tasa_conversion_pct}%</span>
              </div>
              <p style={{ margin: 0, fontSize: 12, color: '#3B82F6', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>
                {formatCOP(f.valor_total_generado)}
              </p>
            </div>
          ))
        }
      </div>

      {/* Gráficas */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        {cF ? <SkeletonChart /> : (
          <div className="card">
            <p style={{ margin: '0 0 1rem', fontSize: 12, fontWeight: 600, color: 'var(--muted)', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Distribución de leads por canal
            </p>
            <GraficaFuentesPie datos={fuentes?.fuentes || []} />
          </div>
        )}
        {cV ? <SkeletonChart /> : (
          <div className="card">
            <p style={{ margin: '0 0 1rem', fontSize: 12, fontWeight: 600, color: 'var(--muted)', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Valor generado por canal
            </p>
            <GraficaValorFuente datos={valor?.por_fuente || []} />
          </div>
        )}
      </div>
      <style>{`@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>
    </div>
  );
}

// ==============================
// src/pages/Matriculas.jsx
// ==============================
import { useState } from 'react';
import { getMatriculasPorMes } from '../services/api';
import { GraficaMatriculasMes, GraficaValorMes } from '../components/charts/Graficas';

export function Matriculas() {
  const [meses, setMeses] = useState(6);
  const { datos, cargando, error } = useFetch(() => getMatriculasPorMes(meses), [meses]);

  if (error) return <ErrorState mensaje={error} />;

  const formatCOP = (v) => `$${Number(v).toLocaleString('es-CO')}`;

  const totalMats  = datos?.datos?.reduce((s, d) => s + Number(d.total_matriculas), 0) || 0;
  const totalValor = datos?.datos?.reduce((s, d) => s + Number(d.valor_total), 0) || 0;

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-in-out' }}>
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ margin: 0, fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 24, color: 'var(--text)' }}>Matrículas por Mes</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--muted)' }}>Evolución histórica de inscripciones y valor generado</p>
        </div>
        <select value={meses} onChange={(e) => setMeses(Number(e.target.value))} style={{ background: '#111827', border: '1px solid var(--border)', color: 'var(--text)', padding: '8px 12px', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}>
          {[3,6,12].map(m => <option key={m} value={m}>Últimos {m} meses</option>)}
        </select>
      </div>

      {/* Resumen */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Total Matrículas', valor: totalMats, color: '#00D4AA' },
          { label: 'Valor Total', valor: formatCOP(totalValor), color: '#3B82F6' },
          { label: 'Promedio Mensual', valor: datos?.datos?.length ? (totalMats / datos.datos.length).toFixed(1) : 0, color: '#F59E0B' },
        ].map((k) => (
          <div key={k.label} className="card" style={{ textAlign: 'center' }}>
            <p style={{ margin: '0 0 0.5rem', fontSize: 11, color: 'var(--muted)', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase' }}>{k.label}</p>
            <p style={{ margin: 0, fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 28, color: k.color }}>{k.valor}</p>
          </div>
        ))}
      </div>

      {/* Gráficas */}
      {cargando ? <><SkeletonChart /><SkeletonChart /></> : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
          <div className="card">
            <p style={{ margin: '0 0 1rem', fontSize: 12, fontWeight: 600, color: 'var(--muted)', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Matrículas por mes</p>
            <GraficaMatriculasMes datos={datos?.datos || []} />
          </div>
          <div className="card">
            <p style={{ margin: '0 0 1rem', fontSize: 12, fontWeight: 600, color: 'var(--muted)', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Valor generado por mes</p>
            <GraficaValorMes datos={datos?.datos || []} />
          </div>
        </div>
      )}

      {/* Tabla mensual */}
      {!cargando && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid var(--border)' }}>
                {['Mes','Matrículas','Leads ese Mes','Valor Total','Valor Promedio','Crecimiento'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--muted)', fontFamily: 'JetBrains Mono, monospace', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {datos?.datos?.map((d, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(30,58,95,0.4)' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,212,170,0.03)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text)' }}>{d.periodo_label}</td>
                  <td style={{ padding: '12px 16px', fontFamily: 'JetBrains Mono, monospace', color: '#00D4AA', fontWeight: 700 }}>{d.total_matriculas}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--muted)', fontFamily: 'JetBrains Mono, monospace' }}>{d.leads_ese_mes}</td>
                  <td style={{ padding: '12px 16px', color: '#3B82F6', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>{formatCOP(d.valor_total)}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--muted)', fontFamily: 'JetBrains Mono, monospace' }}>{formatCOP(d.valor_promedio)}</td>
                  <td style={{ padding: '12px 16px' }}>
                    {i === 0 ? <span style={{ color: 'var(--muted)', fontSize: 11 }}>—</span> : (
                      <span style={{ color: d.crecimiento_pct >= 0 ? '#00D4AA' : '#EF4444', fontSize: 11, fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>
                        {d.crecimiento_pct >= 0 ? '▲' : '▼'} {Math.abs(d.crecimiento_pct)}%
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <style>{`@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>
    </div>
  );
}

// ==============================
// src/pages/Conversion.jsx
// ==============================
import { getMetricasConversion, getTiempoConversion } from '../services/api';
import { GraficaEmbudo } from '../components/charts/Graficas';

export function Conversion() {
  const { datos: conv, cargando: cC, error: eC } = useFetch(getMetricasConversion);
  const { datos: tiempo, cargando: cT, error: eT } = useFetch(getTiempoConversion);

  if (eC || eT) return <ErrorState mensaje={eC || eT} />;

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-in-out' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ margin: 0, fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 24, color: 'var(--text)' }}>Análisis de Conversión</h1>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--muted)' }}>Tasa de conversión y tiempo promedio de cierre</p>
      </div>

      {/* KPIs conversión */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {cC ? Array(4).fill(0).map((_,i)=><SkeletonCard key={i} />) : [
          { label: 'Tasa Global', val: `${conv?.resumen?.tasa_global}%`, color: '#00D4AA' },
          { label: 'Total Leads', val: conv?.resumen?.total_leads, color: '#3B82F6' },
          { label: 'Matriculados', val: conv?.resumen?.matriculados, color: '#00D4AA' },
          { label: 'Rechazados', val: conv?.resumen?.rechazados, color: '#EF4444' },
        ].map(k => (
          <div key={k.label} className="card">
            <p style={{ margin: '0 0 0.5rem', fontSize: 11, color: 'var(--muted)', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{k.label}</p>
            <p style={{ margin: 0, fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 28, color: k.color, textShadow: `0 0 20px ${k.color}40` }}>{k.val}</p>
          </div>
        ))}
      </div>

      {/* Tiempo de conversión */}
      {!cT && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
          <div className="card">
            <p style={{ margin: '0 0 1rem', fontSize: 12, fontWeight: 600, color: 'var(--muted)', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              ⚡ Tiempo promedio de conversión
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', textAlign: 'center' }}>
              {[
                { label: 'Promedio', val: `${tiempo?.general?.dias_promedio}d`, color: '#F59E0B' },
                { label: 'Mínimo',   val: `${tiempo?.general?.dias_minimo}d`,   color: '#00D4AA' },
                { label: 'Máximo',   val: `${tiempo?.general?.dias_maximo}d`,   color: '#EF4444' },
              ].map(k => (
                <div key={k.label} style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: 8 }}>
                  <p style={{ margin: '0 0 4px', fontSize: 10, color: 'var(--muted)', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase' }}>{k.label}</p>
                  <p style={{ margin: 0, fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 24, color: k.color }}>{k.val}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Embudo */}
          <div className="card">
            <p style={{ margin: '0 0 1rem', fontSize: 12, fontWeight: 600, color: 'var(--muted)', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              🎯 Embudo de conversión
            </p>
            {!cC && <GraficaEmbudo datos={conv?.embudo || []} />}
          </div>
        </div>
      )}

      {/* Tabla por fuente */}
      {!cC && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <p style={{ margin: '0', padding: '1rem 1.25rem', fontSize: 12, fontWeight: 600, color: 'var(--muted)', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid var(--border)' }}>
            Tasa de conversión por canal
          </p>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid var(--border)' }}>
                {['Canal','Leads','Matriculados','Tasa Conversión'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--muted)', fontFamily: 'JetBrains Mono, monospace', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {conv?.por_fuente?.map((f, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(30,58,95,0.4)' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,212,170,0.03)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text)' }}>{f.fuente}</td>
                  <td style={{ padding: '12px 16px', fontFamily: 'JetBrains Mono, monospace', color: 'var(--muted)' }}>{f.leads}</td>
                  <td style={{ padding: '12px 16px' }}><span className="badge badge-green">{f.matriculados}</span></td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ flex: 1, height: 6, background: 'var(--border)', borderRadius: 3, maxWidth: 120 }}>
                        <div style={{ height: '100%', width: `${Math.min(f.tasa_pct, 100)}%`, background: `hsl(${f.tasa_pct * 1.2}, 80%, 60%)`, borderRadius: 3 }} />
                      </div>
                      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: 'var(--text)', fontWeight: 600 }}>{f.tasa_pct}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <style>{`@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>
    </div>
  );
}
