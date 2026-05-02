import { useState, useEffect, useRef, useCallback } from 'react';
import { Layers, Sliders, Eye, EyeOff, Play, Pause, RotateCcw } from 'lucide-react';
import { useSeismicData } from '../hooks/useSeismicData';
import { Tabs, Slider, Select, Button, Badge, Spinner, Card } from '../components/ui';
import CopilotBubble from '../components/copilot/CopilotBubble';
import ChartLegend from '../components/ui/ChartLegend';
import { COLORMAPS } from '../components/charts/AmplitudeMap';

const COLORMAPS_LIST = ['seismic', 'grayscale', 'viridis', 'hot'];

function drawSeismicSection(canvas, data, rows, cols, colormap, gain, overlays = {}) {
  if (!canvas || !data) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const imgData = ctx.createImageData(W, H);
  const cm = COLORMAPS[colormap] || COLORMAPS.seismic;

  for (let py = 0; py < H; py++) {
    for (let px = 0; px < W; px++) {
      const row = Math.floor((py / H) * rows);
      const col = Math.floor((px / W) * cols);
      const idx = row * cols + col;
      const v = Math.max(-1, Math.min(1, (data[idx] ?? 0) * gain));
      const [r, g, b] = cm(v);
      const pi = (py * W + px) * 4;
      imgData.data[pi] = r; imgData.data[pi+1] = g; imgData.data[pi+2] = b; imgData.data[pi+3] = 255;
    }
  }
  ctx.putImageData(imgData, 0, 0);

  // Horizon overlays
  if (overlays.horizons) {
    ctx.strokeStyle = 'rgba(255,220,0,0.85)';
    ctx.lineWidth = 1.5;
    [[0.35, 'H1 ~800ms'], [0.55, 'H2 ~1200ms'], [0.78, 'H3 ~1800ms']].forEach(([frac, label]) => {
      const y = Math.round(frac * H);
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      ctx.fillStyle = 'rgba(255,220,0,0.9)'; ctx.font = '10px Inter'; ctx.fillText(label, 4, y - 3);
    });
  }

  // Fault overlays
  if (overlays.faults) {
    ctx.strokeStyle = 'rgba(232,64,64,0.85)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 3]);
    ctx.beginPath(); ctx.moveTo(W * 0.55, 0); ctx.lineTo(W * 0.72, H); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(W * 0.25, H * 0.3); ctx.lineTo(W * 0.4, H); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(232,64,64,0.8)'; ctx.font = '10px Inter';
    ctx.fillText('F-1', W * 0.56, 12); ctx.fillText('F-2', W * 0.26, H * 0.3 - 3);
  }

  // AI prediction overlay
  if (overlays.aiPrediction) {
    ctx.fillStyle = 'rgba(0,200,255,0.15)';
    ctx.fillRect(W * 0.3, H * 0.3, W * 0.25, H * 0.15);
    ctx.strokeStyle = 'rgba(0,200,255,0.7)';
    ctx.lineWidth = 1;
    ctx.strokeRect(W * 0.3, H * 0.3, W * 0.25, H * 0.15);
    ctx.fillStyle = 'rgba(0,200,255,0.9)'; ctx.font = '10px Inter';
    ctx.fillText('AI: DHI 81%', W * 0.31, H * 0.3 + 12);
  }
}

export default function SeismicViewer() {
  const { ready, getInline, getXline, getTimeSlice, config } = useSeismicData();
  const [activeTab, setActiveTab] = useState('inline');
  const [inlinePos, setInlinePos] = useState(49);
  const [xlinePos, setXlinePos] = useState(49);
  const [timePos, setTimePos] = useState(69);
  const [colormap, setColormap] = useState('seismic');
  const [gain, setGain] = useState(1.5);
  const [opacity, setOpacity] = useState(100);
  const [overlays, setOverlays] = useState({ horizons: true, faults: true, aiPrediction: false });
  const [tooltip, setTooltip] = useState(null);
  const [crosshair, setCrosshair] = useState(null);
  const [playing4D, setPlaying4D] = useState(false);
  const [timeStep4D, setTimeStep4D] = useState(0);
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  const tabs = [
    { id: 'inline', label: 'Inline Section', icon: <Layers size={12} /> },
    { id: 'xline', label: 'Crossline Section', icon: <Layers size={12} /> },
    { id: 'timeslice', label: 'Time Slice', icon: <Layers size={12} /> },
    { id: '4d', label: '4D Time-lapse', icon: <Play size={12} /> },
  ];

  const getSliceData = useCallback(() => {
    if (!ready) return null;
    if (activeTab === 'inline') return getInline(inlinePos);
    if (activeTab === 'xline') return getXline(xlinePos);
    if (activeTab === 'timeslice') return getTimeSlice(timePos);
    return getInline(inlinePos);
  }, [ready, activeTab, inlinePos, xlinePos, timePos, getInline, getXline, getTimeSlice]);

  const getSliceDims = useCallback(() => {
    if (activeTab === 'inline') return { rows: config.samples, cols: config.xlines };
    if (activeTab === 'xline') return { rows: config.samples, cols: config.inlines };
    if (activeTab === 'timeslice') return { rows: config.inlines, cols: config.xlines };
    return { rows: config.samples, cols: config.xlines };
  }, [activeTab, config]);

  useEffect(() => {
    if (!ready || !canvasRef.current) return;
    const data = getSliceData();
    const { rows, cols } = getSliceDims();
    drawSeismicSection(canvasRef.current, data, rows, cols, colormap, gain, overlays);
  }, [ready, getSliceData, getSliceDims, colormap, gain, overlays]);

  // 4D animation
  useEffect(() => {
    if (activeTab !== '4d') return;
    if (playing4D) {
      animRef.current = setInterval(() => setTimeStep4D(s => (s + 1) % 5), 600);
    }
    return () => clearInterval(animRef.current);
  }, [playing4D, activeTab]);

  function handleCanvasMouseMove(e) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left, py = e.clientY - rect.top;
    const { rows, cols } = getSliceDims();
    const row = Math.floor((py / rect.height) * rows);
    const col = Math.floor((px / rect.width) * cols);
    const data = getSliceData();
    const val = data ? (data[row * cols + col] ?? 0).toFixed(4) : '—';
    setCrosshair({ x: px, y: py });
    setTooltip({ x: px, y: py, val, row, col });
  }

  function toggleOverlay(key) {
    setOverlays(o => ({ ...o, [key]: !o[key] }));
  }

  const { rows, cols } = getSliceDims();

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 56px)', overflow: 'hidden' }}>
      {/* Left controls */}
      <div style={{ width: 240, background: 'var(--bg-surface)', borderRight: '1px solid var(--border-subtle)', padding: 14, display: 'flex', flexDirection: 'column', gap: 14, overflowY: 'auto', flexShrink: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 12, color: 'var(--text-secondary)', letterSpacing: 1 }}>NAVIGATION</div>

        <Slider label="Inline" value={inlinePos + 1} min={1} max={config.inlines} onChange={v => setInlinePos(v - 1)} />
        <Slider label="Crossline" value={xlinePos + 1} min={1} max={config.xlines} onChange={v => setXlinePos(v - 1)} />
        <Slider label="Time (ms)" value={timePos * config.dt} min={0} max={(config.samples - 1) * config.dt} step={config.dt} unit="ms" onChange={v => setTimePos(Math.round(v / config.dt))} />

        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 14 }}>
          <div style={{ fontWeight: 600, fontSize: 12, color: 'var(--text-secondary)', letterSpacing: 1, marginBottom: 12 }}>DISPLAY</div>
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 6 }}>Colormap</div>
            <Select value={colormap} onChange={setColormap} options={COLORMAPS_LIST.map(c => ({ value: c, label: c.charAt(0).toUpperCase() + c.slice(1) }))} style={{ width: '100%' }} />
          </div>
          <Slider label="Gain" value={gain} min={0.1} max={5} step={0.1} onChange={setGain} unit="×" />
          <Slider label="Opacity" value={opacity} min={0} max={100} onChange={setOpacity} unit="%" style={{ marginTop: 10 }} />
        </div>

        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 14 }}>
          <div style={{ fontWeight: 600, fontSize: 12, color: 'var(--text-secondary)', letterSpacing: 1, marginBottom: 10 }}>OVERLAYS</div>
          {[['horizons', 'Horizons (H1–H3)', 'rgba(255,220,0,0.8)'], ['faults', 'Faults (F-1, F-2)', 'rgba(232,64,64,0.8)'], ['aiPrediction', 'AI Predictions', 'rgba(0,200,255,0.8)']].map(([key, label, color]) => (
            <div key={key} onClick={() => toggleOverlay(key)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', cursor: 'pointer' }}>
              <div style={{ width: 12, height: 12, borderRadius: 2, background: overlays[key] ? color : 'rgba(255,255,255,0.1)', border: `1px solid ${color}`, transition: 'background 0.15s' }} />
              <span style={{ fontSize: 12, color: overlays[key] ? 'var(--text-primary)' : 'var(--text-muted)' }}>{label}</span>
            </div>
          ))}
        </div>

        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 14 }}>
          <div style={{ fontWeight: 600, fontSize: 12, color: 'var(--text-secondary)', letterSpacing: 1, marginBottom: 8 }}>POSITION</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.8 }}>
            <div>IL: <span style={{ color: 'var(--accent-blue)', fontFamily: 'monospace' }}>{inlinePos + 1}</span></div>
            <div>XL: <span style={{ color: 'var(--accent-blue)', fontFamily: 'monospace' }}>{xlinePos + 1}</span></div>
            <div>TWT: <span style={{ color: 'var(--accent-blue)', fontFamily: 'monospace' }}>{timePos * config.dt}ms</span></div>
          </div>
        </div>
      </div>

      {/* Center canvas */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <div style={{ padding: '0 16px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Badge color="blue">{ready ? 'Block 31 v2.1' : 'Loading...'}</Badge>
            <CopilotBubble module="seismic" context={{ activeInline: inlinePos + 1, activeXline: xlinePos + 1, activeTime: timePos * config.dt }} title="Seismic Copilot" />
          </div>
        </div>

        <div style={{ flex: 1, position: 'relative', overflow: 'hidden', background: '#050810' }}>
          {!ready ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12 }}>
              <Spinner size={20} /><span style={{ color: 'var(--text-secondary)' }}>Generating seismic cube...</span>
            </div>
          ) : activeTab === '4d' ? (
            <FourDView getInline={getInline} config={config} timeStep={timeStep4D} playing={playing4D} setPlaying={setPlaying4D} setTimeStep={setTimeStep4D} colormap={colormap} gain={gain} />
          ) : (
            <>
              <canvas
                ref={canvasRef}
                width={800} height={600}
                style={{ width: '100%', height: '100%', display: 'block', cursor: 'crosshair', opacity: opacity / 100 }}
                onMouseMove={handleCanvasMouseMove}
                onMouseLeave={() => { setTooltip(null); setCrosshair(null); }}
              />
              {/* Crosshair */}
              {crosshair && (
                <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                  <line x1={crosshair.x} y1={0} x2={crosshair.x} y2="100%" stroke="rgba(255,255,255,0.3)" strokeWidth={1} strokeDasharray="4 3" />
                  <line x1={0} y1={crosshair.y} x2="100%" y2={crosshair.y} stroke="rgba(255,255,255,0.3)" strokeWidth={1} strokeDasharray="4 3" />
                </svg>
              )}
              {/* Tooltip */}
              {tooltip && (
                <div style={{
                  position: 'absolute', left: tooltip.x + 12, top: tooltip.y - 10,
                  background: 'rgba(15,21,32,0.95)', border: '1px solid var(--border-subtle)',
                  borderRadius: 4, padding: '4px 8px', fontSize: 11, pointerEvents: 'none', zIndex: 10,
                }}>
                  <div style={{ color: 'var(--accent-blue)' }}>Amp: <strong>{tooltip.val}</strong></div>
                  <div style={{ color: 'var(--text-muted)' }}>
                    {activeTab === 'inline' ? `XL ${tooltip.col + 1} · T ${tooltip.row * config.dt}ms` :
                     activeTab === 'xline' ? `IL ${tooltip.col + 1} · T ${tooltip.row * config.dt}ms` :
                     `IL ${tooltip.row + 1} · XL ${tooltip.col + 1}`}
                  </div>
                </div>
              )}
              {/* Colorbar */}
              <div style={{ position: 'absolute', right: 12, top: 12, bottom: 12, width: 14, borderRadius: 3, background: colormap === 'seismic' ? 'linear-gradient(to bottom, #ff4444, #ffffff, #4444ff)' : colormap === 'grayscale' ? 'linear-gradient(to bottom, #fff, #000)' : 'linear-gradient(to bottom, #ff0, #f80, #f00)', border: '1px solid rgba(255,255,255,0.1)' }} />
              <div style={{ position: 'absolute', right: 28, top: 12, fontSize: 9, color: 'rgba(255,255,255,0.6)' }}>+1</div>
              <div style={{ position: 'absolute', right: 28, bottom: 12, fontSize: 9, color: 'rgba(255,255,255,0.6)' }}>-1</div>
              {/* Axis labels */}
              <div style={{ position: 'absolute', bottom: 4, left: 8, fontSize: 9, color: 'rgba(255,255,255,0.4)' }}>
                {activeTab === 'inline' ? 'XL 1' : activeTab === 'xline' ? 'IL 1' : 'IL 1'}
              </div>
              <div style={{ position: 'absolute', bottom: 4, right: 32, fontSize: 9, color: 'rgba(255,255,255,0.4)' }}>
                {activeTab === 'inline' ? `XL ${config.xlines}` : activeTab === 'xline' ? `IL ${config.inlines}` : `XL ${config.xlines}`}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Right attribute panel */}
      <div style={{ width: 280, background: 'var(--bg-surface)', borderLeft: '1px solid var(--border-subtle)', padding: 14, display: 'flex', flexDirection: 'column', gap: 14, overflowY: 'auto', flexShrink: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 12, color: 'var(--text-secondary)', letterSpacing: 1 }}>ATTRIBUTES</div>

        {['Envelope', 'Inst. Frequency', 'Cosine Phase', 'RMS Amplitude', 'Similarity'].map((attr, i) => (
          <div key={attr} style={{ padding: '8px 10px', background: 'rgba(255,255,255,0.02)', borderRadius: 6, border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{attr}</span>
              <Badge color={i === 0 ? 'blue' : i === 4 ? 'green' : 'gray'} style={{ fontSize: 9 }}>{i === 0 ? 'Active' : 'Ready'}</Badge>
            </div>
            <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2 }}>
              <div style={{ width: `${[78, 62, 91, 85, 70][i]}%`, height: '100%', background: ['var(--accent-blue)', 'var(--accent-purple)', 'var(--success)', 'var(--warning)', 'var(--accent-blue)'][i], borderRadius: 2 }} />
            </div>
          </div>
        ))}

        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 14 }}>
          <div style={{ fontWeight: 600, fontSize: 12, color: 'var(--text-secondary)', letterSpacing: 1, marginBottom: 10 }}>STATISTICS</div>
          {[['Min Amplitude', '-0.9847'], ['Max Amplitude', '+0.9923'], ['Mean', '-0.0031'], ['Std Dev', '0.2841'], ['SNR (dB)', '28.4']].map(([l, v]) => (
            <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid rgba(30,42,58,0.4)' }}>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{l}</span>
              <span style={{ fontSize: 11, color: 'var(--text-primary)', fontFamily: 'monospace' }}>{v}</span>
            </div>
          ))}
        </div>

        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 14 }}>
          <div style={{ fontWeight: 600, fontSize: 12, color: 'var(--text-secondary)', letterSpacing: 1, marginBottom: 10 }}>ACTIVE MODEL</div>
          <div style={{ padding: '8px 10px', background: 'rgba(59,127,232,0.06)', borderRadius: 6, border: '1px solid rgba(59,127,232,0.2)' }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--accent-blue)', marginBottom: 4 }}>CNN Feature Extractor v3.1</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>IoU: 0.847 · Acc: 89.1%</div>
            <div style={{ marginTop: 6, height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2 }}>
              <div style={{ width: '89%', height: '100%', background: 'var(--success)', borderRadius: 2 }} />
            </div>
          </div>
        </div>

        {/* Seismic viewer legend */}
        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 14 }}>
          <ChartLegend
            title="Seismic Section"
            description="Vertical cross-section through the 3D seismic volume. Amplitude values represent acoustic reflectivity — the contrast in rock properties at each layer boundary."
            axes={{ x: activeTab === 'timeslice' ? 'Crossline' : activeTab === 'xline' ? 'Inline' : 'Crossline', y: activeTab === 'timeslice' ? 'Inline' : 'TWT (ms)' }}
            items={[
              { color: '#4444ff', shape: 'rect', label: 'Blue — Negative', meaning: 'Soft kick / trough. Impedance decreases downward. Associated with gas sands (DHI).' },
              { color: '#ffffff', shape: 'rect', label: 'White — Zero', meaning: 'No impedance contrast. Homogeneous rock interval.' },
              { color: '#ff4444', shape: 'rect', label: 'Red — Positive', meaning: 'Hard kick / peak. Impedance increases downward. Dense carbonates or tight sands.' },
              { color: 'rgba(255,220,0,0.9)', shape: 'line', label: 'Yellow — Horizons', meaning: 'Interpreted geological boundaries (H1, H2, H3).' },
              { color: 'rgba(232,64,64,0.8)', shape: 'line', dashed: true, label: 'Red dashed — Faults', meaning: 'Fault planes causing reflector discontinuity.' },
              { color: 'rgba(0,200,255,0.7)', shape: 'rect', label: 'Cyan box — AI Prediction', meaning: 'CNN model DHI detection zone with confidence score.' },
            ]}
            insight="Use Gain slider to amplify weak reflections. High-gain reveals subtle DHI anomalies; low-gain shows structural geometry more clearly."
          />
        </div>
      </div>
    </div>
  );
}

function FourDView({ getInline, config, timeStep, playing, setPlaying, setTimeStep, colormap, gain }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    const imgData = ctx.createImageData(W, H);
    const cm = COLORMAPS[colormap] || COLORMAPS.seismic;
    const data = getInline(49);
    if (!data) return;
    const shift = timeStep * 3;

    for (let py = 0; py < H; py++) {
      for (let px = 0; px < W; px++) {
        const xl = Math.floor((px / W) * config.xlines);
        const t = Math.floor((py / H) * config.samples);
        const tShifted = Math.max(0, Math.min(config.samples - 1, t - shift));
        const v = Math.max(-1, Math.min(1, (data[xl * config.samples + tShifted] ?? 0) * gain));
        const [r, g, b] = cm(v);
        const pi = (py * W + px) * 4;
        imgData.data[pi] = r; imgData.data[pi+1] = g; imgData.data[pi+2] = b; imgData.data[pi+3] = 255;
      }
    }
    ctx.putImageData(imgData, 0, 0);
  }, [timeStep, getInline, config, colormap, gain]);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <canvas ref={canvasRef} width={800} height={500} style={{ flex: 1, width: '100%', display: 'block' }} />
      <div style={{ padding: '10px 16px', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 12, background: 'var(--bg-surface)' }}>
        <button onClick={() => setPlaying(p => !p)} style={{ background: 'var(--accent-blue)', border: 'none', borderRadius: 6, padding: '6px 14px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontFamily: 'Inter' }}>
          {playing ? <><Pause size={12} /> Pause</> : <><Play size={12} /> Play</>}
        </button>
        <div style={{ flex: 1 }}>
          <input type="range" min={0} max={4} value={timeStep} onChange={e => setTimeStep(+e.target.value)} style={{ width: '100%', accentColor: 'var(--accent-blue)' }} />
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', minWidth: 80 }}>
          Time Step: <span style={{ color: 'var(--accent-blue)', fontFamily: 'monospace' }}>{timeStep + 1}/5</span>
        </div>
        <Badge color="blue">+{timeStep * 3 * 4}ms shift</Badge>
      </div>
    </div>
  );
}
