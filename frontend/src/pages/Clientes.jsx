// src/pages/Clientes.jsx
import { useState, useEffect, useCallback, useRef } from 'react';
import { getClientes, importarExcel } from '../services/api';
import { LoadingSpinner, ErrorState } from '../components/LoadingState';

const FUENTES = ['Facebook Lead Ads: DIR_CAL_FORM - WSP', 'Instagram', 'Pagina Web', 'Referido', 'Google Ads', 'Email Marketing', 'WhatsApp', 'Otro'];
const ESTADOS = ['Contactado', 'No contactado', 'Equivocado/Errado', 'Cerrado', 'Matriculado'];
const COLOR_EST = {
  'Contactado': 'blue',
  'No contactado': 'amber',
  'Equivocado/Errado': 'red',
  'Cerrado': 'red',
  'Matriculado': 'green'
};

function BadgeEstado({ estado }) {
  const c = COLOR_EST[estado] || 'blue';
  return <span className={`badge badge-${c}`}>{estado}</span>;
}

function Clientes() {
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [buscar, setBuscar] = useState('');
  const [estado, setEstado] = useState('');
  const [fuente, setFuente] = useState('');
  const [pagina, setPagina] = useState(1);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [importando, setImportando] = useState(false);
  const fileInputRef = useRef(null);

  const handleImportar = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportando(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('mode', 'upsert');

    try {
      const res = await importarExcel(formData);
      const c = res.summary?.clientes || { inserted: 0, updated: 0 };
      alert(`✅ Importación exitosa:\n\nClientes: ${c.inserted} insertados, ${c.updated} actualizados.`);
      cargar(); // Recargar tabla
    } catch (err) {
      alert(`❌ Error en importación:\n${err.message}`);
    } finally {
      setImportando(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const res = await getClientes({ buscar, estado, fuente, pagina, limite: 15 });
      setDatos(res);
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  }, [buscar, estado, fuente, pagina]);

  useEffect(() => { cargar(); }, [cargar]);
  // Reset pagina al cambiar filtros
  useEffect(() => { setPagina(1); }, [buscar, estado, fuente]);

  const formatFecha = (f) =>
    new Date(f).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: '2-digit' });

  if (error) return <ErrorState mensaje={error} onReintentar={cargar} />;

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-in-out' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ margin: 0, fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 24, color: 'var(--text)' }}>
            Clientes / Leads
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--muted)' }}>
            {datos ? `${datos.paginacion.total} registros encontrados` : 'Cargando...'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportar}
            accept=".xlsx, .xls"
            style={{ display: 'none' }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={importando}
            style={{
              background: 'rgba(59,130,246,0.1)',
              color: '#3B82F6', border: '1px solid rgba(59,130,246,0.3)', borderRadius: 8,
              padding: '10px 20px', cursor: importando ? 'not-allowed' : 'pointer', fontSize: 13,
              fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => { if (!importando) e.target.style.background = 'rgba(59,130,246,0.2)'; }}
            onMouseLeave={(e) => { if (!importando) e.target.style.background = 'rgba(59,130,246,0.1)'; }}
          >
            {importando ? '⏳ Importando...' : '📥 Importar Excel'}
          </button>
          <button
            onClick={() => setMostrarForm(!mostrarForm)}
            style={{
              background: 'linear-gradient(135deg, #00D4AA, #3B82F6)',
              color: '#0A0F1E', border: 'none', borderRadius: 8,
              padding: '10px 20px', cursor: 'pointer', fontSize: 13,
              fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif',
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={(e) => e.target.style.opacity = '0.85'}
            onMouseLeave={(e) => e.target.style.opacity = '1'}
          >
            + Nuevo Lead
          </button>
        </div>
      </div>

      {/* Formulario nuevo lead */}
      {mostrarForm && <FormNuevoLead onGuardado={() => { setMostrarForm(false); cargar(); }} onCancelar={() => setMostrarForm(false)} />}

      {/* Filtros */}
      <div className="card" style={{ marginBottom: '1rem', padding: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="🔍  Buscar por nombre o email..."
            value={buscar}
            onChange={(e) => setBuscar(e.target.value)}
            style={inputStyle}
          />
          <select value={estado} onChange={(e) => setEstado(e.target.value)} style={selectStyle}>
            <option value="">Todos los estados</option>
            {ESTADOS.map((e) => <option key={e} value={e}>{e.charAt(0).toUpperCase() + e.slice(1)}</option>)}
          </select>
          <select value={fuente} onChange={(e) => setFuente(e.target.value)} style={selectStyle}>
            <option value="">Todas las fuentes</option>
            {FUENTES.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
          {(buscar || estado || fuente) && (
            <button onClick={() => { setBuscar(''); setEstado(''); setFuente(''); }} style={{ ...selectStyle, cursor: 'pointer', color: '#EF4444', borderColor: 'rgba(239,68,68,0.3)' }}>
              ✕ Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Tabla */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {cargando ? (
          <div style={{ padding: '2rem' }}><LoadingSpinner texto="Cargando clientes..." /></div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(0,0,0,0.2)' }}>
                  {['HubSpot ID', 'Cliente', 'Ciudad', 'Estado', 'Sede', 'Programa', 'Propietario', 'Conversión', 'Contactado', 'Acciones', 'Última Actividad'].map((h) => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--muted)', fontFamily: 'JetBrains Mono, monospace', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {datos?.datos?.length === 0 && (
                  <tr>
                    <td colSpan={11} style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted)' }}>
                      No se encontraron clientes con esos filtros
                    </td>
                  </tr>
                )}
                {datos?.datos?.map((c) => (
                  <tr key={c.id}
                    style={{ borderBottom: '1px solid rgba(30,58,95,0.4)', transition: 'background 0.15s', cursor: 'default' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,212,170,0.03)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '12px 16px', fontFamily: 'JetBrains Mono, monospace', color: 'var(--muted)', fontSize: 11 }}>{c.hubspot_id || `#${c.id}`}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap' }}>{c.nombre_completo}</div>
                      <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{c.email}</div>
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--muted)', fontSize: 11 }}>
                      {c.ciudad || '—'}
                    </td>
                    <td style={{ padding: '12px 16px' }}><BadgeEstado estado={c.estado_lead || 'Nuevo'} /></td>
                    <td style={{ padding: '12px 16px', color: 'var(--muted)', fontSize: 11 }}>
                      {c.sede || '—'}
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--muted)', fontSize: 11, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={c.programa}>
                      {c.programa || <span style={{ opacity: 0.4 }}>—</span>}
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text)', fontWeight: 600, fontSize: 11 }}>
                      {c.propietario || '—'}
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--muted)', fontSize: 11, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={c.conversion_reciente}>
                      {c.conversion_reciente || '—'}
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--amber)', fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fontWeight: 600 }}>
                      {c.veces_contactado !== null && c.veces_contactado !== undefined ? `${c.veces_contactado} veces` : '—'}
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--muted)', fontSize: 11, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={c.acciones}>
                      {c.acciones || '—'}
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--muted)', fontFamily: 'JetBrains Mono, monospace', fontSize: 11 }}>
                      {c.ultima_actividad ? formatFecha(c.ultima_actividad) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Paginación */}
        {datos && datos.paginacion.total_paginas > 1 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderTop: '1px solid var(--border)' }}>
            <span style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'JetBrains Mono, monospace' }}>
              Pág. {datos.paginacion.pagina} / {datos.paginacion.total_paginas}
            </span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <BtnPagina label="← Anterior" disabled={pagina === 1} onClick={() => setPagina(p => p - 1)} />
              <BtnPagina label="Siguiente →" disabled={pagina === datos.paginacion.total_paginas} onClick={() => setPagina(p => p + 1)} />
            </div>
          </div>
        )}
      </div>
      <style>{`@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>
    </div>
  );
}

// ── Botón de paginación ──────────────────────────────────────
function BtnPagina({ label, disabled, onClick }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      background: disabled ? 'transparent' : 'rgba(0,212,170,0.08)',
      color: disabled ? 'var(--muted)' : 'var(--green)',
      border: `1px solid ${disabled ? 'var(--border)' : 'rgba(0,212,170,0.2)'}`,
      borderRadius: 6, padding: '6px 14px', cursor: disabled ? 'not-allowed' : 'pointer',
      fontSize: 12, fontFamily: 'JetBrains Mono, monospace', transition: 'all 0.2s',
    }}>
      {label}
    </button>
  );
}

// ── Formulario nuevo lead ────────────────────────────────────
function FormNuevoLead({ onGuardado, onCancelar }) {
  const [form, setForm] = useState({ nombre: '', apellido: '', email: '', telefono: '', fuente: 'Facebook', campaña: '', valor_potencial: '' });
  const [guardando, setGuardando] = useState(false);
  const [errorForm, setErrorForm] = useState('');

  const { crearCliente: crearClienteAPI } = require('../services/api');

  const guardar = async () => {
    if (!form.nombre || !form.apellido || !form.email) {
      setErrorForm('Nombre, apellido y email son obligatorios');
      return;
    }
    setGuardando(true);
    try {
      const { crearCliente } = await import('../services/api');
      await crearCliente(form);
      onGuardado();
    } catch (e) {
      setErrorForm(e.response?.data?.error || 'Error al guardar');
    } finally {
      setGuardando(false);
    }
  };

  const campo = (k, label, type = 'text') => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</label>
      <input type={type} value={form[k]} onChange={(e) => setForm(f => ({ ...f, [k]: e.target.value }))} style={inputStyle} />
    </div>
  );

  return (
    <div className="card" style={{ marginBottom: '1rem', border: '1px solid rgba(0,212,170,0.2)' }}>
      <p style={{ margin: '0 0 1rem', fontFamily: 'Syne, sans-serif', fontWeight: 700, color: 'var(--green)' }}>
        Registrar nuevo lead
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
        {campo('nombre', 'Nombre')}
        {campo('apellido', 'Apellido')}
        {campo('email', 'Email', 'email')}
        {campo('telefono', 'Teléfono')}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Fuente</label>
          <select value={form.fuente} onChange={(e) => setForm(f => ({ ...f, fuente: e.target.value }))} style={selectStyle}>
            {FUENTES.map(f => <option key={f}>{f}</option>)}
          </select>
        </div>
        {campo('campaña', 'Campaña')}
        {campo('valor_potencial', 'Valor Potencial', 'number')}
      </div>
      {errorForm && <p style={{ color: '#EF4444', fontSize: 12, marginBottom: '0.75rem' }}>{errorForm}</p>}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button onClick={guardar} disabled={guardando} style={{ background: 'linear-gradient(135deg, #00D4AA, #3B82F6)', color: '#0A0F1E', border: 'none', borderRadius: 8, padding: '8px 20px', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
          {guardando ? 'Guardando...' : '✓ Guardar Lead'}
        </button>
        <button onClick={onCancelar} style={{ background: 'transparent', color: 'var(--muted)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 20px', cursor: 'pointer', fontSize: 13 }}>
          Cancelar
        </button>
      </div>
    </div>
  );
}

// ── Estilos reutilizables ────────────────────────────────────
const inputStyle = {
  background: '#111827', border: '1px solid var(--border)', borderRadius: 8,
  color: 'var(--text)', padding: '8px 12px', fontSize: 13, outline: 'none',
  fontFamily: 'Space Grotesk, sans-serif', minWidth: 200, width: '100%',
  transition: 'border-color 0.2s',
};

const selectStyle = {
  ...inputStyle, cursor: 'pointer', minWidth: 160, width: 'auto',
};

export default Clientes;
