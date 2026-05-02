import { useState } from 'react';
import { useAuth } from './AuthContext';
import { PROJECTS } from '../mock/users';

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [project, setProject] = useState(PROJECTS[0].id);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    await new Promise(r => setTimeout(r, 900));
    const ok = login(username, password, project);
    if (!ok) {
      setError('Invalid credentials. Please try again.');
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
    setLoading(false);
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg-base)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backgroundImage: 'radial-gradient(ellipse at 20% 50%, rgba(59,127,232,0.06) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(124,77,255,0.05) 0%, transparent 50%)',
    }}>
      {/* Grid lines background */}
      <div style={{ position:'fixed', inset:0, backgroundImage:'linear-gradient(rgba(30,42,58,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(30,42,58,0.3) 1px, transparent 1px)', backgroundSize:'40px 40px', pointerEvents:'none' }} />

      <div className={shake ? 'shake' : ''} style={{ width: 420, position:'relative', zIndex:1 }}>
        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:40 }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:12, marginBottom:12 }}>
            <svg width="40" height="40" viewBox="0 0 40 40">
              <defs>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="2" result="blur"/>
                  <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
              </defs>
              <rect x="2" y="2" width="36" height="36" rx="8" fill="none" stroke="#3B7FE8" strokeWidth="1.5" filter="url(#glow)"/>
              <path d="M8 28 L14 16 L20 22 L26 12 L32 20" stroke="#3B7FE8" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" filter="url(#glow)"/>
              <circle cx="20" cy="22" r="2" fill="#3B7FE8"/>
              <circle cx="26" cy="12" r="2" fill="#7C4DFF"/>
            </svg>
            <div>
              <div className="glow-text" style={{ fontSize:28, fontWeight:800, letterSpacing:2, color:'var(--accent-blue)' }}>SIOS</div>
              <div style={{ fontSize:10, color:'var(--text-muted)', letterSpacing:3, marginTop:-2 }}>SEISMIC INTELLIGENCE OS</div>
            </div>
          </div>
          <div style={{ color:'var(--text-secondary)', fontSize:13 }}>Enterprise Seismic AI Platform — v1.0</div>
        </div>

        {/* Card */}
        <div className="glass" style={{ borderRadius:12, padding:'36px 40px' }}>
          <div style={{ fontSize:16, fontWeight:600, marginBottom:24, color:'var(--text-primary)' }}>Sign in to your workspace</div>

          <form onSubmit={handleSubmit}>
            {/* Project selector */}
            <div style={{ marginBottom:16 }}>
              <label style={{ display:'block', fontSize:11, color:'var(--text-secondary)', marginBottom:6, letterSpacing:1, textTransform:'uppercase' }}>Active Project</label>
              <select value={project} onChange={e => setProject(e.target.value)} style={selectStyle}>
                {PROJECTS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>

            {/* Username */}
            <div style={{ marginBottom:16 }}>
              <label style={{ display:'block', fontSize:11, color:'var(--text-secondary)', marginBottom:6, letterSpacing:1, textTransform:'uppercase' }}>Username</label>
              <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Enter username" autoComplete="username" style={inputStyle} required />
            </div>

            {/* Password */}
            <div style={{ marginBottom:24 }}>
              <label style={{ display:'block', fontSize:11, color:'var(--text-secondary)', marginBottom:6, letterSpacing:1, textTransform:'uppercase' }}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password" autoComplete="current-password" style={inputStyle} required />
            </div>

            {error && (
              <div style={{ background:'rgba(232,64,64,0.1)', border:'1px solid rgba(232,64,64,0.3)', borderRadius:6, padding:'10px 14px', marginBottom:16, color:'var(--danger)', fontSize:13 }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              width:'100%', padding:'12px', borderRadius:8, border:'none', cursor: loading ? 'not-allowed' : 'pointer',
              background: loading ? 'rgba(59,127,232,0.4)' : 'var(--accent-blue)',
              color:'#fff', fontWeight:600, fontSize:14, fontFamily:'Inter, sans-serif',
              transition:'all 0.2s', display:'flex', alignItems:'center', justifyContent:'center', gap:8,
            }}>
              {loading ? (
                <>
                  <span style={{ width:14, height:14, border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', borderRadius:'50%', display:'inline-block', animation:'spin 0.7s linear infinite' }} />
                  Authenticating...
                </>
              ) : 'Sign In'}
            </button>
          </form>

          <div style={{ marginTop:24, paddingTop:20, borderTop:'1px solid var(--border-subtle)' }}>
            <div style={{ fontSize:11, color:'var(--text-muted)', marginBottom:8 }}>Demo credentials:</div>
            {[['admin','admin123','Admin'],['geo','geo123','Geophysicist'],['ds','ds123','Data Scientist'],['view','view123','Viewer']].map(([u,p,r]) => (
              <div key={u} style={{ display:'flex', gap:8, marginBottom:4, fontSize:11 }}>
                <span style={{ color:'var(--accent-blue)', fontFamily:'monospace', minWidth:40 }}>{u}</span>
                <span style={{ color:'var(--text-muted)', fontFamily:'monospace', minWidth:60 }}>{p}</span>
                <span style={{ color:'var(--text-secondary)' }}>{r}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ textAlign:'center', marginTop:20, color:'var(--text-muted)', fontSize:11 }}>
          SIOS v1.0 · CONFIDENTIAL · Authorized Access Only
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

const inputStyle = {
  width:'100%', padding:'10px 14px', background:'rgba(255,255,255,0.04)',
  border:'1px solid var(--border-subtle)', borderRadius:6, color:'var(--text-primary)',
  fontSize:13, fontFamily:'Inter, sans-serif', outline:'none',
  transition:'border-color 0.2s',
};
const selectStyle = {
  ...inputStyle, cursor:'pointer',
  backgroundColor:'#0F1520',
  backgroundImage:'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'%3E%3Cpath fill=\'%238A9BB5\' d=\'M6 8L1 3h10z\'/%3E%3C/svg%3E")',
  backgroundRepeat:'no-repeat', backgroundPosition:'right 12px center', appearance:'none',
  WebkitAppearance:'none', MozAppearance:'none',
};
