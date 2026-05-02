import { useState, useRef, useEffect, useCallback } from 'react';
import { MousePointer, Minus, Type, Eraser, Circle, ChevronDown, ChevronUp } from 'lucide-react';
import { useSeismicData } from '../hooks/useSeismicData';
import { Button, Badge, Select, Spinner } from '../components/ui';
import CopilotBubble from '../components/copilot/CopilotBubble';
import { COLORMAPS } from '../components/charts/AmplitudeMap';

const TOOLS = [
  { id: 'select', label: 'Select', icon: MousePointer },
  { id: 'horizon', label: 'Horizon Pick', icon: Minus },
  { id: 'fault', label: 'Fault Pick', icon: Minus },
  { id: 'text', label: 'Text Note', icon: Type },
  { id: 'eraser', label: 'Eraser', icon: Eraser },
];

const WELLS = [
  { id: 'w1', name: 'Well-A1', inline: 42, xline: 67, depth: 2840, lithology: ['Shale', 'Sandstone', 'Carbonate', 'Shale'] },
  { id: 'w2', name: 'Well-B3', inline: 156, xline: 203, depth: 3120, lithology: ['Sandstone', 'Shale', 'Carbonate', 'Sandstone'] },
  { id: 'w3', name: 'Well-C7', inline: 312, xline: 187, depth: 2650, lithology: ['Carbonate', 'Shale', 'Sandstone', 'Carbonate'] },
];

export default function Interpretation() {
  const { ready, getInline, config } = useSeismicData();
  const [inlinePos, setInlinePos] = useState(41);
  const [activeTool, setActiveTool] = useState('select');
  const [annotColor, setAnnotColor] = useState('#FFD700');
  const [annotations, setAnnotations] = useState([]);
  const [selectedAnnot, setSelectedAnnot] = useState(null);
  const [wellsOpen, setWellsOpen] = useState(true);
  const [noteText, setNoteText] = useState('');
  const canvasRef = useRef(null);
  const drawingRef = useRef(false);
  const currentPathRef = useRef([]);

  useEffect(() => {
    if (!ready || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    const data = getInline(inlinePos);
    if (!data) return;
    const imgData = ctx.createImageData(W, H);
    const cm = COLORMAPS.seismic;
    for (let py = 0; py < H; py++) {
      for (let px = 0; px < W; px++) {
        const xl = Math.floor((px / W) * config.xlines);
        const t = Math.floor((py / H) * config.samples);
        const v = Math.max(-1, Math.min(1, (data[xl * config.samples + t] ?? 0) * 1.5));
        const [r, g, b] = cm(v);
        const pi = (py * W + px) * 4;
        imgData.data[pi] = r; imgData.data[pi+1] = g; imgData.data[pi+2] = b; imgData.data[pi+3] = 255;
      }
    }
    ctx.putImageData(imgData, 0, 0);

    // Draw annotations
    annotations.forEach(a => {
      ctx.strokeStyle = a.color;
      ctx.lineWidth = 2;
      if (a.type === 'horizon' || a.type === 'fault') {
        ctx.setLineDash(a.type === 'fault' ? [5, 3] : []);
        ctx.beginPath();
        a.points.forEach((p, i) => i === 0 ? ctx.moveTo(p.x * W, p.y * H) : ctx.lineTo(p.x * W, p.y * H));
        ctx.stroke();
        ctx.setLineDash([]);
      }
      if (a.type === 'text' && a.text) {
        ctx.fillStyle = a.color;
        ctx.font = '12px Inter';
        ctx.fillText(a.text, a.points[0]?.x * W, a.points[0]?.y * H);
      }
    });

    // Well markers
    WELLS.forEach(w => {
      const x = (w.xline / config.xlines) * W;
      ctx.strokeStyle = '#00C896'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      ctx.fillStyle = '#00C896'; ctx.font = 'bold 10px Inter';
      ctx.fillText(w.name, x + 3, 14);
    });
  }, [ready, getInline, config, inlinePos, annotations]);

  function handleMouseDown(e) {
    if (activeTool === 'select') return;
    drawingRef.current = true;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    currentPathRef.current = [{ x, y }];
  }

  function handleMouseMove(e) {
    if (!drawingRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    currentPathRef.current.push({ x, y });
  }

  function handleMouseUp(e) {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const pts = [...currentPathRef.current, { x, y }];
    if (pts.length < 2 && activeTool !== 'text') return;

    const newAnnot = {
      id: Date.now(),
      type: activeTool === 'text' ? 'text' : activeTool,
      points: pts,
      color: annotColor,
      time: Math.round(pts[0].y * config.samples * config.dt),
      confidence: activeTool === 'horizon' ? 'High' : activeTool === 'fault' ? 'Medium' : 'N/A',
      createdBy: 'Dr. Khalid Al-Mansouri',
      notes: '',
      text: activeTool === 'text' ? 'Annotation' : '',
    };
    setAnnotations(a => [...a, newAnnot]);
    setSelectedAnnot(newAnnot);
    currentPathRef.current = [];
  }

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 56px)', overflow: 'hidden' }}>
      {/* Canvas area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        {/* Toolbar */}
        <div style={{ padding: '8px 14px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-surface)', flexWrap: 'wrap' }}>
          {TOOLS.map(t => {
            const Icon = t.icon;
            return (
              <button key={t.id} onClick={() => setActiveTool(t.id)} title={t.label} style={{
                padding: '5px 10px', borderRadius: 5, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
                background: activeTool === t.id ? 'rgba(59,127,232,0.2)' : 'rgba(255,255,255,0.04)',
                color: activeTool === t.id ? 'var(--accent-blue)' : 'var(--text-secondary)',
                fontSize: 11, fontFamily: 'Inter',
              }}>
                <Icon size={12} />{t.label}
              </button>
            );
          })}
          <div style={{ width: 1, height: 20, background: 'var(--border-subtle)', margin: '0 4px' }} />
          <input type="color" value={annotColor} onChange={e => setAnnotColor(e.target.value)} style={{ width: 28, height: 28, border: 'none', borderRadius: 4, cursor: 'pointer', background: 'none', padding: 0 }} title="Annotation color" />
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>IL: <span style={{ color: 'var(--accent-blue)', fontFamily: 'monospace' }}>{inlinePos + 1}</span></div>
            <input type="range" min={0} max={config.inlines - 1} value={inlinePos} onChange={e => setInlinePos(+e.target.value)} style={{ width: 100, accentColor: 'var(--accent-blue)' }} />
            <CopilotBubble module="interpretation" context={{ activeInline: inlinePos + 1 }} title="Interpretation Copilot" />
          </div>
        </div>

        {/* Canvas */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden', background: '#050810' }}>
          {!ready ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12 }}>
              <Spinner size={20} /><span style={{ color: 'var(--text-secondary)' }}>Loading seismic data...</span>
            </div>
          ) : (
            <canvas ref={canvasRef} width={900} height={600}
              style={{ width: '100%', height: '100%', display: 'block', cursor: activeTool === 'select' ? 'default' : 'crosshair' }}
              onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} />
          )}
        </div>
      </div>

      {/* Right annotation panel */}
      <div style={{ width: 300, background: 'var(--bg-surface)', borderLeft: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0 }}>
        <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border-subtle)', fontWeight: 600, fontSize: 12, color: 'var(--text-secondary)', letterSpacing: 1 }}>ANNOTATIONS ({annotations.length})</div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 10 }}>
          {annotations.length === 0 && (
            <div style={{ textAlign: 'center', padding: '24px 12px', color: 'var(--text-muted)', fontSize: 12 }}>
              Use the drawing tools to add horizon picks, fault traces, and text annotations.
            </div>
          )}
          {annotations.map(a => (
            <div key={a.id} onClick={() => setSelectedAnnot(a)} style={{
              padding: '8px 10px', marginBottom: 6, borderRadius: 6, cursor: 'pointer',
              background: selectedAnnot?.id === a.id ? 'rgba(59,127,232,0.08)' : 'rgba(255,255,255,0.02)',
              border: `1px solid ${selectedAnnot?.id === a.id ? 'rgba(59,127,232,0.3)' : 'var(--border-subtle)'}`,
              borderLeft: `3px solid ${a.color}`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                <span style={{ fontSize: 12, fontWeight: 500, textTransform: 'capitalize' }}>{a.type}</span>
                <Badge color={a.confidence === 'High' ? 'green' : a.confidence === 'Medium' ? 'yellow' : 'gray'} style={{ fontSize: 9 }}>{a.confidence}</Badge>
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>TWT: {a.time}ms · {a.createdBy.split(' ')[0]}</div>
            </div>
          ))}

          {selectedAnnot && (
            <div style={{ marginTop: 10, padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: 6, border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>NOTES</div>
              <textarea value={selectedAnnot.notes} onChange={e => setAnnotations(a => a.map(x => x.id === selectedAnnot.id ? { ...x, notes: e.target.value } : x))}
                placeholder="Add interpretation notes..."
                style={{ width: '100%', height: 70, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)', borderRadius: 4, color: 'var(--text-primary)', fontSize: 11, fontFamily: 'Inter', padding: '6px 8px', resize: 'none', outline: 'none' }} />
              <div style={{ marginTop: 8 }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>LINK TO WELL</div>
                <select style={{ width: '100%', padding: '5px 8px', backgroundColor: '#0F1520', border: '1px solid var(--border-subtle)', borderRadius: 4, color: 'var(--text-primary)', fontSize: 11, fontFamily: 'Inter', outline: 'none', appearance: 'none', WebkitAppearance: 'none' }}>
                  <option value="" style={{ backgroundColor: '#0F1520', color: '#fff' }}>— Select well —</option>
                  {WELLS.map(w => <option key={w.id} value={w.id} style={{ backgroundColor: '#0F1520', color: '#fff' }}>{w.name} (IL {w.inline}, XL {w.xline})</option>)}
                </select>
              </div>
            </div>
          )}

          {/* Structural summary */}
          <div style={{ marginTop: 12, padding: '10px', background: 'rgba(59,127,232,0.05)', borderRadius: 6, border: '1px solid rgba(59,127,232,0.15)' }}>
            <div style={{ fontSize: 11, color: 'var(--accent-blue)', fontWeight: 600, marginBottom: 6 }}>AI STRUCTURAL SUMMARY</div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Anticline identified at IL 42–78. Fault throw ~45ms at H2 level. DHI response at IL 42, XL 67 — possible gas-charged sand. Closure area ~8.4 km².
            </div>
            <div style={{ marginTop: 6, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              <Badge color="yellow" style={{ fontSize: 9 }}>DHI Flag</Badge>
              <Badge color="blue" style={{ fontSize: 9 }}>Anticline</Badge>
              <Badge color="red" style={{ fontSize: 9 }}>Fault F-1</Badge>
            </div>
          </div>

          {/* Wells panel */}
          <div style={{ marginTop: 12 }}>
            <div onClick={() => setWellsOpen(o => !o)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', padding: '6px 0', borderTop: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: 1 }}>WELLS (3)</span>
              {wellsOpen ? <ChevronUp size={12} color="var(--text-muted)" /> : <ChevronDown size={12} color="var(--text-muted)" />}
            </div>
            {wellsOpen && WELLS.map(w => (
              <div key={w.id} style={{ padding: '8px 0', borderBottom: '1px solid rgba(30,42,58,0.4)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--success)' }}>{w.name}</span>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>TD: {w.depth}m</span>
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>IL {w.inline} · XL {w.xline}</div>
                <div style={{ display: 'flex', gap: 3 }}>
                  {w.lithology.map((l, i) => (
                    <div key={i} style={{ flex: 1, height: 8, borderRadius: 2, background: l === 'Shale' ? '#4A5B70' : l === 'Sandstone' ? '#F5A623' : '#7C4DFF', title: l }} title={l} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
