import { useAuth } from './AuthContext';

export default function ProtectedRoute({ permission, children }) {
  const { auth } = useAuth();
  if (!permission) return children;
  if (auth?.permissions?.[permission]) return children;
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%' }}>
      <div className="card" style={{ padding:'48px', textAlign:'center', maxWidth:480 }}>
        <div style={{ fontSize:48, marginBottom:16 }}>🔒</div>
        <div style={{ fontSize:22, fontWeight:700, color:'var(--danger)', marginBottom:8 }}>403 — Insufficient Permissions</div>
        <div style={{ color:'var(--text-secondary)', lineHeight:1.7 }}>
          Your role (<strong style={{ color:'var(--text-primary)' }}>{auth?.role}</strong>) does not have access to this module.
          Contact your system administrator to request elevated permissions.
        </div>
      </div>
    </div>
  );
}
