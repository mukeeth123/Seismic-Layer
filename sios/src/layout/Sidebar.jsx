import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Layers, Eye, Upload, Database, Cpu, GitBranch, FlaskConical,
  Target, FileText, Activity, Shield, ChevronLeft, ChevronRight, LogOut, Zap
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { useRBAC } from '../hooks/useRBAC';
import { Badge } from '../components/ui';

const NAV = [
  { group: 'WORKSPACE', items: [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/seismic', label: 'Seismic Viewer', icon: Layers },
    { path: '/interpretation', label: 'Interpretation', icon: Eye },
  ]},
  { group: 'DATA', items: [
    { path: '/ingestion', label: 'Data Ingestion', icon: Upload },
    { path: '/datasets', label: 'Dataset Registry', icon: Database },
  ]},
  { group: 'AI SYSTEM', items: [
    { path: '/models', label: 'AI Models', icon: Cpu },
    { path: '/tracking', label: 'Experiments', icon: FlaskConical },
  ]},
  { group: 'ANALYTICS', items: [
    { path: '/decision', label: 'Decision Support', icon: Target },
    { path: '/reports', label: 'Reports', icon: FileText },
  ]},
  { group: 'SYSTEM', items: [
    { path: '/activity', label: 'Tracking', icon: Activity },
    { path: '/admin', label: 'Admin', icon: Shield, adminOnly: true },
  ]},
];

export default function Sidebar({ collapsed, onToggle }) {
  const { auth, logout } = useAuth();
  const { role } = useRBAC();
  const location = useLocation();

  return (
    <div style={{
      width: collapsed ? 56 : 220, minWidth: collapsed ? 56 : 220,
      height: '100vh', background: 'var(--bg-surface)',
      borderRight: '1px solid var(--border-subtle)',
      display: 'flex', flexDirection: 'column',
      transition: 'width 0.2s ease, min-width 0.2s ease',
      overflow: 'hidden', flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{ padding: collapsed ? '16px 12px' : '16px 16px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 10, minHeight: 56 }}>
        <div style={{ width: 28, height: 28, borderRadius: 6, background: 'rgba(59,127,232,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Zap size={15} color="var(--accent-blue)" />
        </div>
        {!collapsed && (
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontWeight: 800, fontSize: 14, letterSpacing: 1.5, color: 'var(--accent-blue)' }}>SIOS</div>
            <div style={{ fontSize: 9, color: 'var(--text-muted)', letterSpacing: 1 }}>v1.0</div>
          </div>
        )}
        <button onClick={onToggle} style={{
          marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--text-muted)', display: 'flex', padding: 2, flexShrink: 0,
        }}>
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* Project badge */}
      {!collapsed && auth?.project && (
        <div style={{ padding: '8px 14px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: 9, color: 'var(--text-muted)', letterSpacing: 1, marginBottom: 3 }}>ACTIVE PROJECT</div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 500, lineHeight: 1.3 }}>{auth.project.name}</div>
        </div>
      )}

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
        {NAV.map(group => (
          <div key={group.group}>
            {!collapsed && (
              <div style={{ padding: '10px 14px 4px', fontSize: 9, color: 'var(--text-muted)', letterSpacing: 1.5, fontWeight: 600 }}>
                {group.group}
              </div>
            )}
            {group.items.map(item => {
              if (item.adminOnly && role !== 'Admin') return null;
              const Icon = item.icon;
              const active = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
              return (
                <NavLink key={item.path} to={item.path} style={{ textDecoration: 'none' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: collapsed ? '9px 14px' : '8px 14px',
                    margin: '1px 6px', borderRadius: 6,
                    background: active ? 'rgba(59,127,232,0.12)' : 'transparent',
                    color: active ? 'var(--accent-blue)' : 'var(--text-secondary)',
                    transition: 'all 0.15s', cursor: 'pointer',
                  }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}>
                    <Icon size={15} style={{ flexShrink: 0 }} />
                    {!collapsed && <span style={{ fontSize: 13, fontWeight: active ? 500 : 400, whiteSpace: 'nowrap' }}>{item.label}</span>}
                    {active && !collapsed && <div style={{ marginLeft: 'auto', width: 4, height: 4, borderRadius: '50%', background: 'var(--accent-blue)' }} />}
                  </div>
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User */}
      <div style={{ borderTop: '1px solid var(--border-subtle)', padding: collapsed ? '12px 10px' : '12px 14px' }}>
        {!collapsed ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
              background: `${auth?.user?.roleColor}22`, border: `1px solid ${auth?.user?.roleColor}44`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 700, color: auth?.user?.roleColor,
            }}>{auth?.user?.avatar}</div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{auth?.user?.name}</div>
              <Badge color={roleColor(role)} style={{ fontSize: 9, padding: '1px 5px' }}>{role}</Badge>
            </div>
            <button onClick={logout} title="Sign out" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: 2 }}>
              <LogOut size={14} />
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 30, height: 30, borderRadius: '50%',
              background: `${auth?.user?.roleColor}22`, border: `1px solid ${auth?.user?.roleColor}44`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 700, color: auth?.user?.roleColor,
            }}>{auth?.user?.avatar}</div>
            <button onClick={logout} title="Sign out" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
              <LogOut size={13} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function roleColor(role) {
  return { Admin: 'red', Geophysicist: 'blue', 'Data Scientist': 'purple', Viewer: 'yellow' }[role] || 'gray';
}
