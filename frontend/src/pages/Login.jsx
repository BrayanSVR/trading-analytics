import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/'); // Redirigir al dashboard después de iniciar sesión
    } catch (err) {
      setError(err.response?.data?.error || 'Credenciales inválidas. Por favor intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0D1424',
      padding: '1rem',
      fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{
        background: '#1A233A',
        padding: '3rem',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '400px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        border: '1px solid var(--border)'
      }}>
        
        {/* Logo/Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '16px',
            background: 'linear-gradient(135deg, #00D4AA, #3B82F6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '32px', margin: '0 auto 1rem auto'
          }}>
            📈
          </div>
          <h1 style={{ margin: 0, fontSize: '24px', color: '#fff', fontWeight: 700 }}>
            Trading Analytics
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '14px', marginTop: '0.5rem' }}>
            Inicia sesión para continuar
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            borderLeft: '4px solid #EF4444',
            color: '#FCA5A5',
            padding: '1rem',
            borderRadius: '4px',
            marginBottom: '1.5rem',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', color: '#9CA3AF', fontSize: '14px', marginBottom: '0.5rem' }}>
              Correo electrónico
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%', padding: '0.75rem 1rem', borderRadius: '8px',
                background: '#0D1424', border: '1px solid var(--border)',
                color: '#fff', outline: 'none', transition: 'border-color 0.2s',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#3B82F6'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
              placeholder="admin@empresa.com"
            />
          </div>

          <div>
            <label style={{ display: 'block', color: '#9CA3AF', fontSize: '14px', marginBottom: '0.5rem' }}>
              Contraseña
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%', padding: '0.75rem 1rem', borderRadius: '8px',
                background: '#0D1424', border: '1px solid var(--border)',
                color: '#fff', outline: 'none', transition: 'border-color 0.2s',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#3B82F6'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              marginTop: '1rem',
              width: '100%',
              padding: '0.875rem',
              borderRadius: '8px',
              background: isLoading ? '#374151' : 'linear-gradient(135deg, #00D4AA, #3B82F6)',
              color: '#fff',
              border: 'none',
              fontWeight: 600,
              fontSize: '16px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'opacity 0.2s',
              opacity: isLoading ? 0.7 : 1
            }}
            onMouseOver={(e) => { if (!isLoading) e.target.style.opacity = 0.9 }}
            onMouseOut={(e) => { if (!isLoading) e.target.style.opacity = 1 }}
          >
            {isLoading ? 'Verificando...' : 'Entrar al Sistema'}
          </button>
        </form>

        <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '12px', color: 'var(--muted)' }}>
          Seguridad Interna - Trading Company © {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
}

export default Login;
