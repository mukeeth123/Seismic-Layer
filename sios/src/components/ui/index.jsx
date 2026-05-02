import { useState, useEffect, useRef, createContext, useContext, useCallback } from 'react';
import { X, ChevronUp, ChevronDown } from 'lucide-react';

// ── BUTTON ────────────────────────────────────────────────────────────────
export function Button({ children, variant='primary', size='md', disabled, onClick, style={}, icon }) {
  const variants = {
    primary:   { background:'var(--accent-blue)', color:'#fff', border:'none' },
    secondary: { background:'rgba(59,127,232,0.12)', color:'var(--accent-blue)', border:'1px solid rgba(59,127,232,0.3)' },
    danger:    { background:'rgba(232,64,64,0.12)', color:'var(--danger)', border:'1px solid rgba(232,64,64,0.3)' },
    ghost:     { background:'transparent', color:'var(--text-secondary)', border:'1px solid var(--border-subtle)' },
    success:   { background:'rgba(0,200,150,0.12)', color:'var(--success)', border:'1px solid rgba(0,200,150,0.3)' },
    purple:    { background:'rgba(124,77,255,0.12)', color:'var(--accent-purple)', border:'1px solid rgba(124,77,255,0.3)' },
  };
  const sizes = {
    sm: { padding:'5px 10px', fontSize:11 },
    md: { padding:'8px 16px', fontSize:13 },
    lg: { padding:'11px 22px', fontSize:14 },
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{
      ...variants[variant], ...sizes[size],
      borderRadius:6, cursor: disabled ? 'not-allowed' : 'pointer',
      fontFamily:'Inter, sans-serif', fontWeight:500,
      display:'inline-flex', alignItems:'center', gap:6,
      opacity: disabled ? 0.5 : 1, transition:'all 0.15s',
      whiteSpace:'nowrap', ...style,
    }}>
      {icon && icon}{children}
    </button>
  );
}

// ── BADGE ─────────────────────────────────────────────────────────────────
export function Badge({ children, color='blue', style={} }) {
  const colors = {
    blue:   { bg:'rgba(59,127,232,0.15)',  text:'var(--accent-blue)' },
    purple: { bg:'rgba(124,77,255,0.15)', text:'var(--accent-purple)' },
    green:  { bg:'rgba(0,200,150,0.15)',  text:'var(--success)' },
    yellow: { bg:'rgba(245,166,35,0.15)', text:'var(--warning)' },
    red:    { bg:'rgba(232,64,64,0.15)',  text:'var(--danger)' },
    gray:   { bg:'rgba(74,91,112,0.3)',   text:'var(--text-secondary)' },
  };
  const c = colors[color] || colors.blue;
  return (
    <span style={{ background:c.bg, color:c.text, padding:'2px 8px', borderRadius:4, fontSize:11, fontWeight:500, whiteSpace:'nowrap', ...style }}>
      {children}
    </span>
  );
}

// ── CARD ──────────────────────────────────────────────────────────────────
export function Card({ children, style={}, className='' }) {
  return (
    <div className={`card ${className}`} style={{ padding:16, ...style }}>
      {children}
    </div>
  );
}

// ── SPINNER ───────────────────────────────────────────────────────────────
export function Spinner({ size=16 }) {
  return (
    <span style={{
      width:size, height:size, border:`2px solid rgba(59,127,232,0.2)`,
      borderTopColor:'var(--accent-blue)', borderRadius:'50%',
      display:'inline-block', animation:'spin 0.7s linear infinite',
    }} />
  );
}

// ── PROGRESS BAR ──────────────────────────────────────────────────────────
export function ProgressBar({ value=0, max=100, color='var(--accent-blue)', height=6, style={} }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div style={{ background:'rgba(255,255,255,0.06)', borderRadius:height, overflow:'hidden', height, ...style }}>
      <div style={{ width:`${pct}%`, height:'100%', background:color, borderRadius:height, transition:'width 0.3s ease' }} />
    </div>
  );
}

// ── SLIDER ────────────────────────────────────────────────────────────────
export function Slider({ value, min=0, max=100, step=1, onChange, label, unit='', style={} }) {
  return (
    <div style={{ ...style }}>
      {label && (
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
          <span style={{ fontSize:11, color:'var(--text-secondary)' }}>{label}</span>
          <span style={{ fontSize:11, color:'var(--accent-blue)', fontFamily:'monospace' }}>{value}{unit}</span>
        </div>
      )}
      <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(+e.target.value)}
        style={{ width:'100%', accentColor:'var(--accent-blue)', cursor:'pointer' }} />
    </div>
  );
}

// ── TABS ──────────────────────────────────────────────────────────────────
export function Tabs({ tabs, active, onChange, style={} }) {
  return (
    <div style={{ display:'flex', gap:2, borderBottom:'1px solid var(--border-subtle)', ...style }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => onChange(t.id)} style={{
          padding:'8px 16px', background:'none', border:'none', cursor:'pointer',
          color: active === t.id ? 'var(--accent-blue)' : 'var(--text-secondary)',
          borderBottom: active === t.id ? '2px solid var(--accent-blue)' : '2px solid transparent',
          fontFamily:'Inter, sans-serif', fontSize:13, fontWeight: active === t.id ? 600 : 400,
          transition:'all 0.15s', display:'flex', alignItems:'center', gap:6, whiteSpace:'nowrap',
        }}>
          {t.icon && t.icon}{t.label}
        </button>
      ))}
    </div>
  );
}

// ── TAG ───────────────────────────────────────────────────────────────────
export function Tag({ children, onRemove }) {
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:4, background:'rgba(59,127,232,0.12)', color:'var(--accent-blue)', padding:'2px 8px', borderRadius:4, fontSize:11 }}>
      {children}
      {onRemove && <X size={10} style={{ cursor:'pointer' }} onClick={onRemove} />}
    </span>
  );
}

// ── MODAL ─────────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, width=480 }) {
  useEffect(() => {
    if (!open) return;
    const handler = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="card fade-in" style={{ width, maxWidth:'90vw', maxHeight:'85vh', overflow:'auto', padding:0 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 20px', borderBottom:'1px solid var(--border-subtle)' }}>
          <div style={{ fontWeight:600, fontSize:15 }}>{title}</div>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-secondary)', display:'flex' }}><X size={18} /></button>
        </div>
        <div style={{ padding:20 }}>{children}</div>
      </div>
    </div>
  );
}

// ── TABLE ─────────────────────────────────────────────────────────────────
export function Table({ columns, data, onRowClick, selectable, style={} }) {
  const [sortCol, setSortCol] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [selected, setSelected] = useState(new Set());
  const [search, setSearch] = useState('');

  function handleSort(col) {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('asc'); }
  }

  const filtered = data.filter(row =>
    !search || columns.some(c => String(row[c.key] ?? '').toLowerCase().includes(search.toLowerCase()))
  );

  const sorted = sortCol ? [...filtered].sort((a, b) => {
    const av = a[sortCol], bv = b[sortCol];
    const cmp = typeof av === 'number' ? av - bv : String(av ?? '').localeCompare(String(bv ?? ''));
    return sortDir === 'asc' ? cmp : -cmp;
  }) : filtered;

  function exportCSV() {
    const rows = [columns.map(c => c.label), ...sorted.map(r => columns.map(c => r[c.key] ?? ''))];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type:'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'export.csv'; a.click();
  }

  return (
    <div style={style}>
      <div style={{ display:'flex', gap:8, marginBottom:10, alignItems:'center' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." style={{
          flex:1, padding:'6px 10px', background:'rgba(255,255,255,0.04)', border:'1px solid var(--border-subtle)',
          borderRadius:6, color:'var(--text-primary)', fontSize:12, fontFamily:'Inter, sans-serif', outline:'none',
        }} />
        <Button variant="ghost" size="sm" onClick={exportCSV}>Export CSV</Button>
      </div>
      <div style={{ overflowX:'auto' }}>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
          <thead>
            <tr style={{ borderBottom:'1px solid var(--border-subtle)' }}>
              {selectable && <th style={thStyle}><input type="checkbox" onChange={e => setSelected(e.target.checked ? new Set(sorted.map((_,i)=>i)) : new Set())} /></th>}
              {columns.map(c => (
                <th key={c.key} style={{ ...thStyle, cursor:'pointer', userSelect:'none' }} onClick={() => handleSort(c.key)}>
                  <span style={{ display:'inline-flex', alignItems:'center', gap:4 }}>
                    {c.label}
                    {sortCol === c.key ? (sortDir === 'asc' ? <ChevronUp size={11}/> : <ChevronDown size={11}/>) : null}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, i) => (
              <tr key={i} onClick={() => onRowClick?.(row)} style={{
                borderBottom:'1px solid rgba(30,42,58,0.5)',
                background: selected.has(i) ? 'rgba(59,127,232,0.06)' : 'transparent',
                cursor: onRowClick ? 'pointer' : 'default',
                transition:'background 0.1s',
              }}
              onMouseEnter={e => { if (!selected.has(i)) e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
              onMouseLeave={e => { if (!selected.has(i)) e.currentTarget.style.background = 'transparent'; }}>
                {selectable && <td style={tdStyle}><input type="checkbox" checked={selected.has(i)} onChange={e => { const s = new Set(selected); e.target.checked ? s.add(i) : s.delete(i); setSelected(s); }} onClick={e => e.stopPropagation()} /></td>}
                {columns.map(c => (
                  <td key={c.key} style={{ ...tdStyle, ...c.style }}>
                    {c.render ? c.render(row[c.key], row) : row[c.key]}
                  </td>
                ))}
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr><td colSpan={columns.length + (selectable?1:0)} style={{ ...tdStyle, textAlign:'center', color:'var(--text-muted)', padding:24 }}>No results found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const thStyle = { padding:'8px 12px', textAlign:'left', color:'var(--text-muted)', fontWeight:500, fontSize:11, letterSpacing:0.5, textTransform:'uppercase', whiteSpace:'nowrap' };
const tdStyle = { padding:'9px 12px', color:'var(--text-primary)', verticalAlign:'middle' };

// ── SELECT ────────────────────────────────────────────────────────────────
export function Select({ value, onChange, options, style={} }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} style={{
      padding:'7px 28px 7px 10px',
      backgroundColor:'#0F1520',
      border:'1px solid var(--border-subtle)', borderRadius:6, color:'var(--text-primary)',
      fontSize:12, fontFamily:'Inter, sans-serif', cursor:'pointer', outline:'none',
      backgroundImage:'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'10\' height=\'10\' viewBox=\'0 0 10 10\'%3E%3Cpath fill=\'%238A9BB5\' d=\'M5 7L0 2h10z\'/%3E%3C/svg%3E")',
      backgroundRepeat:'no-repeat', backgroundPosition:'right 8px center',
      appearance:'none', WebkitAppearance:'none', MozAppearance:'none', ...style,
    }}>
      {options.map(o => <option key={o.value ?? o} value={o.value ?? o} style={{ backgroundColor:'#0F1520', color:'#fff' }}>{o.label ?? o}</option>)}
    </select>
  );
}

// ── SKELETON ──────────────────────────────────────────────────────────────
export function Skeleton({ width='100%', height=16, style={} }) {
  return <div className="skeleton" style={{ width, height, borderRadius:4, ...style }} />;
}

export function SkeletonRows({ rows=5, cols=4 }) {
  return (
    <div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ display:'flex', gap:12, padding:'10px 0', borderBottom:'1px solid rgba(30,42,58,0.5)' }}>
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton key={j} height={12} style={{ flex:1, animationDelay:`${(i*cols+j)*0.05}s` }} />
          ))}
        </div>
      ))}
    </div>
  );
}

// ── TOOLTIP ───────────────────────────────────────────────────────────────
export function Tooltip({ children, text }) {
  const [show, setShow] = useState(false);
  const ref = useRef(null);
  return (
    <span ref={ref} style={{ position:'relative', display:'inline-flex' }}
      onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      {show && text && (
        <span style={{
          position:'absolute', bottom:'calc(100% + 6px)', left:'50%', transform:'translateX(-50%)',
          background:'#1E2A3A', border:'1px solid var(--border-subtle)', borderRadius:4,
          padding:'4px 8px', fontSize:11, color:'var(--text-primary)', whiteSpace:'nowrap', zIndex:999,
          pointerEvents:'none',
        }}>{text}</span>
      )}
    </span>
  );
}

// ── TOAST CONTEXT ─────────────────────────────────────────────────────────
const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type='info', duration=3000) => {
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), duration);
  }, []);

  const colors = { success:'var(--success)', error:'var(--danger)', info:'var(--accent-blue)', warning:'var(--warning)' };

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      <div style={{ position:'fixed', bottom:24, right:24, zIndex:9999, display:'flex', flexDirection:'column', gap:8 }}>
        {toasts.map(t => (
          <div key={t.id} style={{
            background:'var(--bg-elevated)', border:`1px solid ${colors[t.type]}40`,
            borderLeft:`3px solid ${colors[t.type]}`, borderRadius:6,
            padding:'10px 16px', minWidth:280, maxWidth:380,
            color:'var(--text-primary)', fontSize:13,
            animation:'toastIn 0.2s ease-out',
            boxShadow:'0 4px 20px rgba(0,0,0,0.4)',
          }}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
