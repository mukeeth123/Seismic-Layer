import { useState } from 'react';
import { Info, ChevronDown, ChevronUp } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

/**
 * ChartLegend — collapsible legend + explanation panel shown below every chart.
 * Props:
 *   title       string   — chart name
 *   description string   — what the chart shows overall
 *   items       array    — [{ color, label, meaning }]
 *   axes        object   — { x: string, y: string }  (optional)
 *   insight     string   — key takeaway sentence
 */
export default function ChartLegend({ title, description, items = [], axes, insight }) {
  const [open, setOpen] = useState(false);
  const { isDark } = useTheme();

  const bg = isDark ? 'rgba(15,21,32,0.7)' : 'rgba(240,242,247,0.9)';
  const border = isDark ? '1px solid rgba(30,42,58,0.8)' : '1px solid rgba(208,216,232,0.9)';
  const textPrimary = isDark ? '#FFFFFF' : '#0A0D14';
  const textSecondary = isDark ? '#8A9BB5' : '#3A4A6B';
  const textMuted = isDark ? '#4A5B70' : '#7A8BA8';

  return (
    <div style={{ background: bg, border, borderTop: 'none', borderRadius: '0 0 6px 6px', overflow: 'hidden' }}>
      {/* Toggle row */}
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px',
          cursor: 'pointer', borderTop: `1px solid ${isDark ? 'rgba(30,42,58,0.5)' : 'rgba(208,216,232,0.6)'}`,
        }}
      >
        <Info size={11} color="var(--accent-blue)" />
        <span style={{ fontSize: 10, color: 'var(--accent-blue)', fontWeight: 500, flex: 1 }}>
          How to read this chart
        </span>
        {open ? <ChevronUp size={11} color={textMuted} /> : <ChevronDown size={11} color={textMuted} />}
      </div>

      {open && (
        <div style={{ padding: '10px 14px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {/* Description */}
          {description && (
            <p style={{ fontSize: 11, color: textSecondary, lineHeight: 1.6, margin: 0 }}>{description}</p>
          )}

          {/* Axes */}
          {axes && (
            <div style={{ display: 'flex', gap: 16 }}>
              {axes.x && (
                <div style={{ fontSize: 10, color: textMuted }}>
                  <span style={{ fontWeight: 600, color: textSecondary }}>X-axis: </span>{axes.x}
                </div>
              )}
              {axes.y && (
                <div style={{ fontSize: 10, color: textMuted }}>
                  <span style={{ fontWeight: 600, color: textSecondary }}>Y-axis: </span>{axes.y}
                </div>
              )}
            </div>
          )}

          {/* Color legend items */}
          {items.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: textMuted, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 2 }}>Colour Key</div>
              {items.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <div style={{
                    width: item.shape === 'line' ? 18 : 10,
                    height: item.shape === 'line' ? 2 : 10,
                    borderRadius: item.shape === 'circle' ? '50%' : item.shape === 'line' ? 0 : 2,
                    background: item.color,
                    flexShrink: 0,
                    marginTop: item.shape === 'line' ? 5 : 0,
                    border: item.border ? `1px solid ${item.border}` : 'none',
                    ...(item.dashed ? { backgroundImage: `repeating-linear-gradient(90deg, ${item.color} 0, ${item.color} 4px, transparent 4px, transparent 7px)`, background: 'none' } : {}),
                  }} />
                  <div>
                    <span style={{ fontSize: 11, fontWeight: 600, color: textPrimary }}>{item.label}: </span>
                    <span style={{ fontSize: 11, color: textSecondary }}>{item.meaning}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Insight */}
          {insight && (
            <div style={{
              padding: '6px 10px', borderRadius: 4,
              background: isDark ? 'rgba(0,200,150,0.06)' : 'rgba(0,200,150,0.08)',
              border: '1px solid rgba(0,200,150,0.2)',
              fontSize: 11, color: 'var(--success)', lineHeight: 1.5,
            }}>
              💡 {insight}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
