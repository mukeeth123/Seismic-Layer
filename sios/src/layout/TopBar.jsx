import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, Search, Users, ChevronRight, Sun, Moon } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { Badge } from '../components/ui';
import { useTheme } from '../context/ThemeContext';

const ROUTE_LABELS = {
  '/': 'Dashboard', '/seismic': 'Seismic Viewer', '/interpretation': 'Interpretation',
  '/ingestion': 'Data Ingestion', '/datasets': 'Dataset Registry',
  '/models': 'AI Models', '/tracking': 'Experiments',
  '/decision': 'Decision Support', '/reports': 'Reports',
  '/activity': 'Tracking', '/admin': 'Admin',
};

const NOTIFICATIONS = [
  { id: 1, text: 'U-Net Segmenter training reached epoch 28/50', time: '4m ago', type: 'info' },
  { id: 2, text: 'Dataset ODF-7 quality check flagged 63 missing traces', time: '22m ago', type: 'warning' },
  { id: 3, text: 'Fault Detector v1.4 deployed to production by Alexandra Reeves', time: '1h ago', type: 'success' },
];

export default function TopBar() {
  const { auth } = useAuth();
  const location = useLocation();
  const [showNotifs, setShowNotifs] = useState(false);
  const [search, setSearch] = useState('');
  const { theme, setTheme, isDark } = useTheme();

  const pageLabel = ROUTE_LABELS[location.pathname] || 'SIOS';

  return (
    <div style={{
      height: 56, background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-subtle)',
      display: 'flex', alignItems: 'center', padding: '0 20px', gap: 16, flexShrink: 0,
    }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)', minWidth: 0 }}>
        <span style={{ color: 'var(--accent-blue)', fontWeight: 600 }}>SIOS</span>
        <ChevronRight size={12} />
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 120 }}>{auth?.project?.name?.split(' — ')[0] ?? 'Block 31'}</span>
        <ChevronRight size={12} />
        <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{pageLabel}</span>
      </div>

      {/* Search */}
      <div style={{ flex: 1, maxWidth: 360, position: 'relative' }}>
        <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input id="global-search" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search datasets, models, reports... (/)"
          style={{
            width: '100%', padding: '7px 10px 7px 30px',
            background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-subtle)',
            borderRadius: 6, color: 'var(--text-primary)', fontSize: 12,
            fontFamily: 'Inter, sans-serif', outline: 'none',
          }} />
      </div>

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Active sessions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-muted)' }}>
          <Users size={13} />
          <span>4 active</span>
        </div>

        {/* Theme toggle */}
        <button
          onClick={() => setTheme(isDark ? 'light' : 'dark')}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          style={{
            background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(59,127,232,0.1)',
            border: `1px solid ${isDark ? 'var(--border-subtle)' : 'rgba(59,127,232,0.3)'}`,
            borderRadius: 6, width: 30, height: 30, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: isDark ? 'var(--warning)' : 'var(--accent-blue)',
            transition: 'all 0.2s',
          }}
        >
          {isDark ? <Sun size={14} /> : <Moon size={14} />}
        </button>

        {/* Notifications */}
        <div style={{ position: 'relative' }}>
          <button onClick={() => setShowNotifs(s => !s)} style={{
            background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)',
            display: 'flex', alignItems: 'center', position: 'relative', padding: 4,
          }}>
            <Bell size={16} />
            <span style={{
              position: 'absolute', top: 0, right: 0, width: 8, height: 8,
              background: 'var(--danger)', borderRadius: '50%', border: '1px solid var(--bg-surface)',
            }} />
          </button>
          {showNotifs && (
            <div className="card" style={{
              position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: 320, zIndex: 200,
              padding: 0, boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, fontSize: 13 }}>Notifications</span>
                <Badge color="red">3</Badge>
              </div>
              {NOTIFICATIONS.map(n => (
                <div key={n.id} style={{ padding: '10px 16px', borderBottom: '1px solid rgba(30,42,58,0.5)', display: 'flex', gap: 10 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: n.type === 'warning' ? 'var(--warning)' : n.type === 'success' ? 'var(--success)' : 'var(--accent-blue)', marginTop: 5, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--text-primary)', lineHeight: 1.4 }}>{n.text}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{n.time}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* User mini-card */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: 6, border: '1px solid var(--border-subtle)' }}>
          <div style={{
            width: 24, height: 24, borderRadius: '50%',
            background: `${auth?.user?.roleColor}22`, border: `1px solid ${auth?.user?.roleColor}44`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 9, fontWeight: 700, color: auth?.user?.roleColor,
          }}>{auth?.user?.avatar}</div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-primary)' }}>{auth?.user?.name?.split(' ')[0]}</div>
            <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>{auth?.role}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
