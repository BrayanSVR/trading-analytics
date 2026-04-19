// src/components/charts/Graficas.jsx
// ============================================================
// Componentes de gráficas reutilizables usando Recharts.
// Todos usan el tema oscuro del proyecto.
// ============================================================
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend, AreaChart, Area,
} from 'recharts';

// ── Estilos comunes ──────────────────────────────────────────
const TOOLTIP_STYLE = {
  background: '#1A2235',
  border: '1px solid #1E3A5F',
  borderRadius: 8,
  color: '#E2E8F0',
  fontSize: 12,
  fontFamily: 'JetBrains Mono, monospace',
};

const AXIS_STYLE = {
  fill: '#64748B',
  fontSize: 11,
  fontFamily: 'JetBrains Mono, monospace',
};

const COLORS_PIE = ['#00D4AA', '#3B82F6', '#F59E0B', '#EF4444', '#A855F7', '#EC4899', '#14B8A6', '#F97316'];

// ── Formateador de pesos colombianos ─────────────────────────
const formatCOP = (v) => {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000)     return `$${(v / 1_000).toFixed(0)}K`;
  return `$${v}`;
};

// ============================================================
// GRÁFICA DE BARRAS: Matrículas por mes
// ============================================================
export function GraficaMatriculasMes({ datos = [] }) {
  if (!datos.length) return <SinDatos />;

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={datos} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="barGradGreen" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#00D4AA" stopOpacity={0.9} />
            <stop offset="100%" stopColor="#00D4AA" stopOpacity={0.3} />
          </linearGradient>
          <linearGradient id="barGradBlue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#3B82F6" stopOpacity={0.9} />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.3} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="#1E3A5F" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="mes_label" tick={AXIS_STYLE} axisLine={false} tickLine={false} />
        <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={TOOLTIP_STYLE}
          formatter={(val, name) => [
            name === 'valor_mes' ? formatCOP(val) : val,
            name === 'total_matriculas' ? 'Matrículas' : 'Valor generado',
          ]}
        />
        <Bar dataKey="total_matriculas" fill="url(#barGradGreen)" radius={[4,4,0,0]} name="Matrículas" />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ============================================================
// GRÁFICA DE ÁREA: Valor generado por mes
// ============================================================
export function GraficaValorMes({ datos = [] }) {
  if (!datos.length) return <SinDatos />;

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={datos} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"   stopColor="#3B82F6" stopOpacity={0.3} />
            <stop offset="95%"  stopColor="#3B82F6" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="#1E3A5F" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="mes_label" tick={AXIS_STYLE} axisLine={false} tickLine={false} />
        <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false} tickFormatter={formatCOP} />
        <Tooltip
          contentStyle={TOOLTIP_STYLE}
          formatter={(val) => [formatCOP(val), 'Valor generado']}
        />
        <Area
          type="monotone" dataKey="valor_mes"
          stroke="#3B82F6" strokeWidth={2}
          fill="url(#areaGrad)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ============================================================
// GRÁFICA DE PIE: Distribución de leads por fuente
// ============================================================
export function GraficaFuentesPie({ datos = [] }) {
  if (!datos.length) return <SinDatos />;

  const dataPie = datos.map((f) => ({
    name:  f.fuente,
    value: Number(f.total_leads),
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={dataPie}
          cx="50%" cy="50%"
          innerRadius={60} outerRadius={100}
          paddingAngle={3}
          dataKey="value"
        >
          {dataPie.map((_, idx) => (
            <Cell
              key={idx}
              fill={COLORS_PIE[idx % COLORS_PIE.length]}
              stroke="transparent"
            />
          ))}
        </Pie>
        <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [v, 'Leads']} />
        <Legend
          formatter={(val) => (
            <span style={{ color: '#94A3B8', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}>{val}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

// ============================================================
// GRÁFICA DE BARRAS HORIZONTALES: Valor por fuente
// ============================================================
export function GraficaValorFuente({ datos = [] }) {
  if (!datos.length) return <SinDatos />;

  const data = datos.map((f) => ({
    fuente:        f.fuente,
    valor_total:   Number(f.valor_total),
    matriculados:  Number(f.matriculados || f.total_matriculas || 0),
  }));

  return (
    <ResponsiveContainer width="100%" height={Math.max(datos.length * 48, 200)}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
        <CartesianGrid stroke="#1E3A5F" strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" tick={AXIS_STYLE} axisLine={false} tickLine={false} tickFormatter={formatCOP} />
        <YAxis type="category" dataKey="fuente" tick={AXIS_STYLE} axisLine={false} tickLine={false} width={100} />
        <Tooltip
          contentStyle={TOOLTIP_STYLE}
          formatter={(v) => [formatCOP(v), 'Valor generado']}
        />
        <Bar dataKey="valor_total" radius={[0,4,4,0]}>
          {data.map((_, idx) => (
            <Cell key={idx} fill={COLORS_PIE[idx % COLORS_PIE.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ============================================================
// GRÁFICA EMBUDO DE CONVERSIÓN (barras decrecientes)
// ============================================================
export function GraficaEmbudo({ datos = [] }) {
  if (!datos.length) return <SinDatos />;

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={datos} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid stroke="#1E3A5F" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="etapa" tick={AXIS_STYLE} axisLine={false} tickLine={false} />
        <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [v, 'Personas']} />
        <Bar dataKey="cantidad" radius={[6,6,0,0]}>
          {datos.map((entry, idx) => (
            <Cell key={idx} fill={entry.color || COLORS_PIE[idx]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── Helper: sin datos ────────────────────────────────────────
function SinDatos() {
  return (
    <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: 13 }}>
      Sin datos suficientes para mostrar la gráfica
    </div>
  );
}
