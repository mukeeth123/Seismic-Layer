import { useState, useEffect, useRef } from 'react';
import { TrendingUp, TrendingDown, Database, Cpu, AlertTriangle, Eye, Activity, FileText, MessageSquare } from 'lucide-react';
import { useSeismicData } from '../hooks/useSeismicData';
import { generateTrainingCurves } from '../mock/aiEngine';
import { Card, Badge, Skeleton, Table } from '../components/ui';
import LossCurveChart from '../components/charts/LossCurveChart';
import CopilotBubble from '../components/copilot/CopilotBubble';
import ChartLegend from '../components/ui/ChartLegend';
import { COLORMAPS } from '../components/charts/AmplitudeMap';

const KPI = [
  { label: 'Active Datasets', value: 3, delta: +1, icon: Database, color: 'var(--accent-blue)' },
  { label: 'Models Trained', value: 12, delta: +3, icon: Cpu, color: 'var(--accent-purple)' },
  { label: 'Anomalies Detected', value: 47, delta: +8, icon: AlertTriangle, color: 'var(--warning)' },
  { label: 'Interpretations Done', value: 8, delta: +2, icon: Eye, color: 'var(--success)' },
  { label: 'Active AI Runs', value: 2, delta: 0, icon: Activity, color: 'var(--accent-blue)' },
  { label: 'Reports Generated', value: 5, delta: +1, icon: FileText, color: 'var(--text-secondary)' },
];

const ACTIVITY = [
  { user: 'KM', action: 'Ran inference on Block 31 inline 42', result: 'success', time: '2m ago', module: 'Seismic Viewer' },
  { user: 'PN', action: 'Started U-Net Segmenter training run', result: 'running', time: '8m ago', module: 'AI Models' },
  { user: 'AR', action: 'Deployed Fault Detector v1.4 to production', result: 'success', time: '1h ago', module: 'AI Models' },
  { user: 'KM', action: 'Picked horizon H2 on inline 55–78', result: 'success', time: '1h ago', module: 'Interpretation' },
  { user: 'JT', action: 'Exported drilling recommendation report', result: 'success', time: '2h ago', module: 'Reports' },
  { user: 'PN', action: 'Uploaded ODF-7 partial stack dataset', result: 'success', time: '3h ago', module: 'Data Ingestion' },
  { user: 'AR', action: 'Added user Priya Nair to Block 31 project', result: 'success', time: '4h ago', module: 'Admin' },
  { user: 'KM', action: 'Flagged DHI anomaly at IL 42, XL 67', result: 'warning', time: '5h ago', module: 'Interpretation' },
  { user: 'PN', action: 'Completed CNN Feature Extractor v3.1 training', result: 'success', time: '6h ago', module: 'AI Models' },
  { user: 'JT', action: 'Viewed Decision Support dashboard', result: 'info', time: '7h ago', module: 'Decision Support' },
];

const DRILLING = [
  { id: 'D7',  inline: 312, xline: 187, confidence: 89, risk: 'Low',    status: 'Approved' },
  { id: 'A3',  inline: 156, xline: 203, confidence: 84, risk: 'Medium', status: 'Under Review' },
  { id: 'F12', inline: 428, xline: 91,  confidence: 81, risk: 'Low',    status: 'Approved' },
  { id: 'K9',  inline: 87,  xline: 334, confidence: 73, risk: 'Medium', status: 'Pending' },
  { id: 'M2',  inline: 241, xline: 156, confidence: 68, risk: 'High',   status: 'Deferred' },
];

const lossCurves = generateTrainingCurves(50, 'm1');

export default function Dashboard() {
  const { ready, getInline, config } = useSeismicData();
  const canvasRef = useRef(null);
  const faultCanvasRef = useRef(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (ready) setTimeout(() => setLoading(false), 300);
  }, [ready]);

  // Draw inline 50 amplitude section — depends on loading so canvas is mounted
  useEffect(() => {
    if (loading || !canvasRef.current) return;
    const slice = getInline(49);
    if (!slice) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    const imgData = ctx.createImageData(W, H);
    const xlines = config.xlines, samples = config.samples;
    const cm = COLORMAPS.seismic;

    for (let py = 0; py < H; py++) {
      for (let px = 0; px < W; px++) {
        const xl = Math.floor((px / W) * xlines);
        const t = Math.floor((py / H) * samples);
        const v = Math.max(-1, Math.min(1, slice[xl * samples + t] * 1.5));
        const [r, g, b] = cm(v);
        const pi = (py * W + px) * 4;
        imgData.data[pi] = r; imgData.data[pi+1] = g; imgData.data[pi+2] = b; imgData.data[pi+3] = 255;
      }
    }
    ctx.putImageData(imgData, 0, 0);

    // Horizon overlays
    ctx.strokeStyle = 'rgba(255,220,0,0.7)';
    ctx.lineWidth = 1.5;
    [[0.35, 'H1'], [0.55, 'H2'], [0.78, 'H3']].forEach(([frac, label]) => {
      const y = Math.round(frac * H);
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      ctx.fillStyle = 'rgba(255,220,0,0.9)'; ctx.font = '10px Inter'; ctx.fillText(label, 4, y - 3);
    });

    // Fault line
    ctx.strokeStyle = 'rgba(232,64,64,0.8)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 3]);
    ctx.beginPath(); ctx.moveTo(W * 0.55, 0); ctx.lineTo(W * 0.7, H); ctx.stroke();
    ctx.setLineDash([]);
  }, [loading, getInline, config]); // re-runs when canvas mounts

  // Fault/horizon map — depends on loading (canvas only mounts after loading=false)
  useEffect(() => {
    if (loading || !faultCanvasRef.current) return;

    // rAF ensures the canvas is fully painted in the DOM before we draw
    const raf = requestAnimationFrame(() => {
      const canvas = faultCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const W = canvas.width, H = canvas.height;
      const imgData = ctx.createImageData(W, H);
      const cm = COLORMAPS.seismic;

      // Synthetic top-down amplitude map
      for (let py = 0; py < H; py++) {
        for (let px = 0; px < W; px++) {
          const il = px / W, xl = py / H;
          const v = 0.4 * Math.sin(il * 12) * Math.cos(xl * 10) + 0.3 * Math.sin((il + xl) * 8) - 0.1;
          const [r, g, b] = cm(Math.max(-1, Math.min(1, v)));
          const pi = (py * W + px) * 4;
          imgData.data[pi] = r; imgData.data[pi + 1] = g; imgData.data[pi + 2] = b; imgData.data[pi + 3] = 255;
        }
      }
      ctx.putImageData(imgData, 0, 0);

      // Fault lines
      ctx.strokeStyle = 'rgba(232,64,64,0.85)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 3]);
      [[0.3, 0.1, 0.6, 0.5], [0.55, 0.2, 0.8, 0.7], [0.1, 0.6, 0.4, 0.9]].forEach(([x1, y1, x2, y2]) => {
        ctx.beginPath(); ctx.moveTo(x1 * W, y1 * H); ctx.lineTo(x2 * W, y2 * H); ctx.stroke();
      });
      ctx.setLineDash([]);

      // Horizon contours
      ctx.strokeStyle = 'rgba(255,220,0,0.6)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.ellipse(W * (0.3 + i * 0.2), H * 0.5, W * (0.15 + i * 0.05), H * (0.12 + i * 0.04), 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Drilling candidates
      DRILLING.forEach(d => {
        const x = (d.inline / 480) * W;
        const y = (d.xline / 360) * H;
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fillStyle = d.risk === 'Low' ? 'rgba(0,200,150,0.8)' : d.risk === 'Medium' ? 'rgba(245,166,35,0.8)' : 'rgba(232,64,64,0.8)';
        ctx.fill();
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 1; ctx.stroke();
        ctx.fillStyle = '#fff'; ctx.font = '9px Inter'; ctx.fillText(d.id, x + 7, y + 3);
      });
    });

    return () => cancelAnimationFrame(raf);
  }, [loading]); // re-runs when loading flips false and canvas mounts

  return (
    <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12 }}>
        {KPI.map((k, i) => {
          const Icon = k.icon;
          return (
            <div key={i} className="card" style={{ padding: '14px 16px' }}>
              {loading ? (
                <><Skeleton height={12} style={{ marginBottom: 8 }} /><Skeleton height={28} width="60%" /></>
              ) : (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{k.label}</div>
                    <Icon size={14} color={k.color} />
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>{k.value}</div>
                  <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }}>
                    {k.delta > 0 ? <TrendingUp size={11} color="var(--success)" /> : k.delta < 0 ? <TrendingDown size={11} color="var(--danger)" /> : null}
                    <span style={{ color: k.delta > 0 ? 'var(--success)' : k.delta < 0 ? 'var(--danger)' : 'var(--text-muted)' }}>
                      {k.delta > 0 ? `+${k.delta}` : k.delta < 0 ? k.delta : '—'} vs last week
                    </span>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Row 2 */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
        {/* Amplitude overview */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 13 }}>Seismic Amplitude Overview</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Inline 50 · Block 31 · Crosslines 1–100 · TWT 0–800ms</div>
            </div>
            <CopilotBubble module="seismic" context={{ activeInline: 50 }} title="Seismic Copilot" />
          </div>
          {loading ? (
            <Skeleton height={220} style={{ margin: 12, borderRadius: 4 }} />
          ) : (
            <div style={{ position: 'relative' }}>
              <canvas ref={canvasRef} width={700} height={220} style={{ width: '100%', height: 220, display: 'block' }} />
              {/* Colorbar */}
              <div style={{ position: 'absolute', right: 8, top: 8, bottom: 8, width: 12, borderRadius: 3, background: 'linear-gradient(to bottom, #ff4444, #ffffff, #4444ff)', border: '1px solid rgba(255,255,255,0.1)' }} />
              <div style={{ position: 'absolute', right: 22, top: 8, fontSize: 9, color: 'rgba(255,255,255,0.7)' }}>+1</div>
              <div style={{ position: 'absolute', right: 22, bottom: 8, fontSize: 9, color: 'rgba(255,255,255,0.7)' }}>-1</div>
              <div style={{ position: 'absolute', bottom: 4, left: 8, fontSize: 9, color: 'rgba(255,255,255,0.5)' }}>XL 1</div>
              <div style={{ position: 'absolute', bottom: 4, right: 30, fontSize: 9, color: 'rgba(255,255,255,0.5)' }}>XL 100</div>
            </div>
          )}
          <ChartLegend
            title="Seismic Amplitude Overview"
            description="A 2D cross-section (inline 50) through the seismic volume. Each pixel represents the acoustic reflectivity at a given crossline position and two-way travel time (TWT). Strong reflections indicate boundaries between rock layers with contrasting acoustic impedance."
            axes={{ x: 'Crossline number (1–100)', y: 'Two-way travel time — TWT (0–800ms, top=shallow)' }}
            items={[
              { color: '#4444ff', shape: 'rect', label: 'Blue (negative amplitude)', meaning: 'Trough — acoustic impedance decreases downward (e.g. soft kick, gas effect). Negative reflection coefficient.' },
              { color: '#ffffff', shape: 'rect', label: 'White (near-zero amplitude)', meaning: 'Transition zone — minimal impedance contrast between adjacent layers.' },
              { color: '#ff4444', shape: 'rect', label: 'Red (positive amplitude)', meaning: 'Peak — acoustic impedance increases downward (e.g. hard kick, dense carbonate). Positive reflection coefficient.' },
              { color: 'rgba(255,220,0,0.9)', shape: 'line', label: 'Yellow lines (H1, H2, H3)', meaning: 'Interpreted seismic horizons — geological layer boundaries. H1 ≈ Top Cretaceous Carbonate (~800ms), H2 ≈ Base Cretaceous Unconformity (~1200ms), H3 ≈ Top Jurassic Source Rock (~1800ms).' },
              { color: 'rgba(232,64,64,0.8)', shape: 'line', dashed: true, label: 'Red dashed line (F-1)', meaning: 'Fault trace — a discontinuity in the rock layers caused by tectonic movement. The offset in reflectors across this line indicates fault throw.' },
            ]}
            insight="Bright red/blue anomalies that conform to structural closure (follow the horizon shape) are Direct Hydrocarbon Indicators (DHIs) — potential reservoir targets."
          />
        </div>

        {/* Loss curve */}
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 13 }}>AI Model Performance</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>CNN Feature Extractor v3.1 · 50 epochs</div>
            </div>
            <CopilotBubble module="models" context={{ modelActive: 'CNN Feature Extractor' }} title="Model Copilot" />
          </div>
          <div style={{ padding: '12px 8px' }}>
            {loading ? <Skeleton height={200} /> : <LossCurveChart data={lossCurves} height={200} />}
          </div>
          {!loading && (
            <div style={{ display: 'flex', gap: 12, padding: '0 16px 12px', justifyContent: 'center' }}>
              {[['Accuracy', '89.1%', 'var(--success)'], ['IoU', '0.847', 'var(--accent-blue)'], ['Dice', '0.862', 'var(--accent-purple)']].map(([l, v, c]) => (
                <div key={l} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: c }}>{v}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{l}</div>
                </div>
              ))}
            </div>
          )}
          <ChartLegend
            title="AI Model Performance — Loss Curve"
            description="Tracks how well the CNN Feature Extractor is learning over 50 training epochs. Loss measures prediction error — lower is better. Two lines are shown: training loss (how well the model fits training data) and validation loss (how well it generalises to unseen data)."
            axes={{ x: 'Epoch (1–50, each = one full pass through training data)', y: 'Loss value (lower = better predictions)' }}
            items={[
              { color: '#3B7FE8', shape: 'line', label: 'Blue solid — Train Loss', meaning: 'Error on the training dataset. Should decrease steadily as the model learns patterns in seismic data.' },
              { color: '#E84040', shape: 'line', dashed: true, label: 'Red dashed — Validation Loss', meaning: 'Error on held-out data the model has never seen. If this rises while train loss falls, the model is overfitting (memorising rather than generalising).' },
              { color: '#00C896', shape: 'rect', label: 'Accuracy (teal)', meaning: 'Percentage of seismic pixels correctly classified. 89.1% means 9 in 10 pixels are correctly labelled.' },
              { color: '#3B7FE8', shape: 'rect', label: 'IoU (blue)', meaning: 'Intersection over Union — measures overlap between predicted and true fault/horizon regions. 0.847 = 84.7% overlap.' },
              { color: '#7C4DFF', shape: 'rect', label: 'Dice (purple)', meaning: 'Dice coefficient — similar to IoU but weights partial overlaps more generously. 0.862 is excellent for seismic segmentation.' },
            ]}
            insight="A healthy training run shows both curves decreasing together. A widening gap between train and val loss after epoch 35+ indicates overfitting — consider adding dropout or reducing learning rate."
          />
        </div>
      </div>

      {/* Row 3 */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
        {/* Fault map */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 13 }}>Fault & Horizon Map</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Top-down amplitude · Block 31 · Faults (red) · Horizons (yellow) · Candidates (circles)</div>
            </div>
            <CopilotBubble module="seismic" context={{ activeInline: 50 }} title="Seismic Copilot" />
          </div>
          {loading ? <Skeleton height={200} style={{ margin: 12 }} /> : (
            <canvas ref={faultCanvasRef} width={700} height={200} style={{ width: '100%', height: 200, display: 'block' }} />
          )}
          <ChartLegend
            title="Fault & Horizon Map"
            description="A top-down (map view) display of seismic amplitude at a fixed time slice, showing the spatial distribution of geological features across the survey area. This is the geophysicist's primary structural map."
            axes={{ x: 'Inline direction (west → east)', y: 'Crossline direction (south → north)' }}
            items={[
              { color: '#4444ff', shape: 'rect', label: 'Blue tones', meaning: 'Negative amplitude zones — troughs in the seismic wavelet. May indicate gas-charged sands or low-impedance lithologies.' },
              { color: '#ff4444', shape: 'rect', label: 'Red tones', meaning: 'Positive amplitude zones — peaks in the seismic wavelet. Typically hard reflectors such as carbonates or tight sands.' },
              { color: 'rgba(232,64,64,0.85)', shape: 'line', dashed: true, label: 'Red dashed lines — Faults', meaning: 'Mapped fault traces at this time level. Faults compartmentalise reservoirs and can act as seals or migration pathways.' },
              { color: 'rgba(255,220,0,0.6)', shape: 'circle', border: 'rgba(255,220,0,0.6)', label: 'Yellow ellipses — Horizon contours', meaning: 'Structural contours of the mapped horizon surface. Closed contours indicate structural highs (anticlines) — prime drilling targets.' },
              { color: '#00C896', shape: 'circle', border: '#00C896', label: 'Green circles — Low-risk candidates', meaning: 'Drilling locations with risk score < 40. High AI confidence, good structural position.' },
              { color: '#F5A623', shape: 'circle', border: '#F5A623', label: 'Amber circles — Medium-risk candidates', meaning: 'Drilling locations with risk score 40–65. Viable targets requiring additional risk mitigation.' },
              { color: '#E84040', shape: 'circle', border: '#E84040', label: 'Red circles — High-risk candidates', meaning: 'Drilling locations with risk score > 65. Significant geological or commercial uncertainty.' },
            ]}
            insight="Drilling candidates positioned inside closed yellow contours (structural highs) with green colour coding represent the highest-value targets — structural closure + low risk + high AI confidence."
          />
        </div>

        {/* Activity feed */}
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)', fontWeight: 600, fontSize: 13 }}>Recent Activity</div>
          <div style={{ overflowY: 'auto', maxHeight: 220 }}>
            {ACTIVITY.map((a, i) => (
              <div key={i} style={{ padding: '8px 14px', borderBottom: '1px solid rgba(30,42,58,0.4)', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(59,127,232,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: 'var(--accent-blue)', flexShrink: 0 }}>{a.user}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-primary)', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.action}</div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 2, alignItems: 'center' }}>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{a.time}</span>
                    <Badge color={a.result === 'success' ? 'green' : a.result === 'running' ? 'blue' : a.result === 'warning' ? 'yellow' : 'gray'} style={{ fontSize: 9, padding: '1px 5px' }}>{a.result}</Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 4: Drilling table */}
      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13 }}>Recommended Drilling Locations</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>AI-ranked candidates · Block 31 · Sortable by confidence</div>
          </div>
          <CopilotBubble module="decision" title="Decision Copilot" />
        </div>
        <div style={{ padding: '0 16px 16px' }}>
          <Table
            columns={[
              { key: 'id', label: 'Location ID', render: v => <span style={{ fontFamily: 'monospace', color: 'var(--accent-blue)', fontWeight: 600 }}>{v}</span> },
              { key: 'inline', label: 'Inline' },
              { key: 'xline', label: 'Xline' },
              { key: 'confidence', label: 'Confidence %', render: v => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 50, height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2 }}>
                    <div style={{ width: `${v}%`, height: '100%', background: v > 80 ? 'var(--success)' : v > 65 ? 'var(--warning)' : 'var(--danger)', borderRadius: 2 }} />
                  </div>
                  <span style={{ color: v > 80 ? 'var(--success)' : v > 65 ? 'var(--warning)' : 'var(--danger)', fontWeight: 600 }}>{v}%</span>
                </div>
              )},
              { key: 'risk', label: 'Risk Level', render: v => <Badge color={v === 'Low' ? 'green' : v === 'Medium' ? 'yellow' : 'red'}>{v}</Badge> },
              { key: 'status', label: 'Status', render: v => <Badge color={v === 'Approved' ? 'green' : v === 'Under Review' ? 'blue' : v === 'Pending' ? 'yellow' : 'gray'}>{v}</Badge> },
            ]}
            data={DRILLING}
          />
        </div>
      </div>
    </div>
  );
}
