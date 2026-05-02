import { useState, useRef, useEffect } from 'react';
import { Badge, Table, Button, Slider, Card } from '../components/ui';
import CopilotPanel from '../components/copilot/CopilotPanel';
import { useCopilot } from '../hooks/useCopilot';
import { Send, Bot, User } from 'lucide-react';
import { ProgressBar } from '../components/ui';
import ChartLegend from '../components/ui/ChartLegend';

const BASE_CANDIDATES = [
  { rank: 1,  id: 'D7',  inline: 312, xline: 187, depth: 2840, confidence: 89, risk: 28,  npv: 284, vol: 38.4, status: 'Approved' },
  { rank: 2,  id: 'A3',  inline: 156, xline: 203, depth: 3120, confidence: 84, risk: 41,  npv: 241, vol: 42.1, status: 'Under Review' },
  { rank: 3,  id: 'F12', inline: 428, xline: 91,  depth: 2560, confidence: 81, risk: 28,  npv: 198, vol: 27.8, status: 'Approved' },
  { rank: 4,  id: 'B9',  inline: 87,  xline: 334, depth: 3450, confidence: 78, risk: 52,  npv: 176, vol: 31.2, status: 'Pending' },
  { rank: 5,  id: 'G4',  inline: 241, xline: 156, depth: 2980, confidence: 76, risk: 48,  npv: 163, vol: 24.5, status: 'Pending' },
  { rank: 6,  id: 'K9',  inline: 178, xline: 289, depth: 3210, confidence: 73, risk: 61,  npv: 142, vol: 19.8, status: 'Deferred' },
  { rank: 7,  id: 'C2',  inline: 389, xline: 112, depth: 2720, confidence: 71, risk: 55,  npv: 128, vol: 22.3, status: 'Pending' },
  { rank: 8,  id: 'H5',  inline: 134, xline: 267, depth: 3680, confidence: 69, risk: 67,  npv: 115, vol: 17.6, status: 'Deferred' },
  { rank: 9,  id: 'E11', inline: 267, xline: 198, depth: 2890, confidence: 67, risk: 63,  npv: 98,  vol: 15.4, status: 'Pending' },
  { rank: 10, id: 'M2',  inline: 412, xline: 78,  depth: 3340, confidence: 65, risk: 72,  npv: 87,  vol: 13.2, status: 'Deferred' },
  { rank: 11, id: 'J7',  inline: 56,  xline: 312, depth: 3890, confidence: 63, risk: 78,  npv: 74,  vol: 11.8, status: 'Deferred' },
  { rank: 12, id: 'N3',  inline: 198, xline: 445, depth: 2640, confidence: 62, risk: 69,  npv: 68,  vol: 10.4, status: 'Deferred' },
  { rank: 13, id: 'P8',  inline: 334, xline: 223, depth: 4120, confidence: 61, risk: 81,  npv: 58,  vol: 9.1,  status: 'Deferred' },
  { rank: 14, id: 'L6',  inline: 445, xline: 167, depth: 3560, confidence: 61, risk: 76,  npv: 52,  vol: 8.7,  status: 'Deferred' },
  { rank: 15, id: 'Q1',  inline: 78,  xline: 389, depth: 4380, confidence: 61, risk: 84,  npv: 47,  vol: 7.9,  status: 'Deferred' },
];

function calcNPV(base, porosity, sw, ntg, oilPrice) {
  const factor = (porosity / 18) * ((1 - sw) / 0.65) * (ntg / 0.6) * (oilPrice / 85);
  return Math.round(base * factor);
}

function calcRisk(baseRisk, porosity, sw) {
  return Math.min(99, Math.round(baseRisk * (1 + (0.25 - porosity / 100) + (sw - 0.3) * 0.5)));
}

export default function DecisionSupport() {
  const [porosity, setPorosity] = useState(18);
  const [sw, setSw] = useState(30);
  const [ntg, setNtg] = useState(60);
  const [oilPrice, setOilPrice] = useState(85);
  const [selectedId, setSelectedId] = useState(null);
  const [copilotInput, setCopilotInput] = useState('');
  const { messages, thinking, ask } = useCopilot('decision', {});
  const mapRef = useRef(null);
  const bottomRef = useRef(null);

  const candidates = BASE_CANDIDATES.map(c => ({
    ...c,
    npv: calcNPV(c.npv, porosity, sw / 100, ntg / 100, oilPrice),
    risk: calcRisk(c.risk, porosity, sw / 100),
  })).sort((a, b) => b.npv - a.npv).map((c, i) => ({ ...c, rank: i + 1 }));

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, thinking]);

  useEffect(() => {
    if (!mapRef.current) return;
    const canvas = mapRef.current;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // Background grid
    ctx.fillStyle = '#0A0D14';
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(30,42,58,0.6)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 10; i++) {
      ctx.beginPath(); ctx.moveTo(i * W / 10, 0); ctx.lineTo(i * W / 10, H); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i * H / 10); ctx.lineTo(W, i * H / 10); ctx.stroke();
    }

    // Survey boundary
    ctx.strokeStyle = 'rgba(59,127,232,0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(20, 20, W - 40, H - 40);

    // Candidates
    candidates.forEach(c => {
      const x = 20 + ((c.inline - 50) / 430) * (W - 40);
      const y = 20 + ((c.xline - 50) / 400) * (H - 40);
      const r = Math.max(5, Math.min(18, c.npv / 20));
      const color = c.risk < 40 ? '#00C896' : c.risk < 65 ? '#F5A623' : '#E84040';
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = selectedId === c.id ? color : color + '88';
      ctx.fill();
      ctx.strokeStyle = selectedId === c.id ? '#fff' : color;
      ctx.lineWidth = selectedId === c.id ? 2 : 1;
      ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.font = `${selectedId === c.id ? 'bold ' : ''}9px Inter`;
      ctx.textAlign = 'center';
      ctx.fillText(c.id, x, y + 3);
    });
    ctx.textAlign = 'left';
  }, [candidates, selectedId]);

  function handleMapClick(e) {
    const rect = mapRef.current.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (mapRef.current.width / rect.width);
    const my = (e.clientY - rect.top) * (mapRef.current.height / rect.height);
    const W = mapRef.current.width, H = mapRef.current.height;
    for (const c of candidates) {
      const x = 20 + ((c.inline - 50) / 430) * (W - 40);
      const y = 20 + ((c.xline - 50) / 400) * (H - 40);
      const r = Math.max(5, Math.min(18, c.npv / 20));
      if (Math.hypot(mx - x, my - y) <= r + 4) {
        setSelectedId(c.id);
        return;
      }
    }
    setSelectedId(null);
  }

  const riskColor = r => r < 40 ? 'green' : r < 65 ? 'yellow' : 'red';

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 56px)', overflow: 'hidden' }}>
      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
          {/* Top row: map + what-if */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 12, marginBottom: 12 }}>
            {/* Map */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>Survey Map — Drilling Candidates</div>
                <div style={{ display: 'flex', gap: 8, fontSize: 11, color: 'var(--text-muted)' }}>
                  <span style={{ color: 'var(--success)' }}>● Low</span>
                  <span style={{ color: 'var(--warning)' }}>● Medium</span>
                  <span style={{ color: 'var(--danger)' }}>● High</span>
                  <span style={{ color: 'var(--text-muted)' }}>· Size = NPV</span>
                </div>
              </div>
              <canvas ref={mapRef} width={600} height={220} style={{ width: '100%', height: 220, display: 'block', cursor: 'pointer' }} onClick={handleMapClick} />
              <ChartLegend
                title="Survey Map — Drilling Candidates"
                description="Top-down spatial view of the seismic survey area. Each circle represents a potential drilling location. Circle size encodes NPV (larger = higher value). Circle colour encodes risk level. Click any circle to select and view its details."
                axes={{ x: 'Inline position (west → east across survey)', y: 'Crossline position (south → north across survey)' }}
                items={[
                  { color: '#00C896', shape: 'circle', border: '#00C896', label: 'Green circles — Low Risk (score < 40)', meaning: 'High AI confidence, good structural position, minimal geological uncertainty. Priority drilling targets.' },
                  { color: '#F5A623', shape: 'circle', border: '#F5A623', label: 'Amber circles — Medium Risk (40–65)', meaning: 'Viable targets with some uncertainty. May require additional seismic analysis or well data before commitment.' },
                  { color: '#E84040', shape: 'circle', border: '#E84040', label: 'Red circles — High Risk (> 65)', meaning: 'Significant geological or commercial uncertainty. Defer until risk can be reduced through further data acquisition.' },
                  { color: 'rgba(59,127,232,0.3)', shape: 'rect', label: 'Blue border — Survey boundary', meaning: 'Extent of the 3D seismic acquisition area. Candidates outside this boundary have lower data quality.' },
                ]}
                insight="Larger green circles in the centre of the survey area represent the best risk-adjusted drilling opportunities. D7 (top-right cluster) is the current #1 ranked candidate."
              />
            </div>

            {/* What-if */}
            <div className="card" style={{ padding: 14 }}>
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 12 }}>What-If Scenario</div>
              <Slider label="Porosity" value={porosity} min={8} max={28} step={0.5} unit="%" onChange={setPorosity} style={{ marginBottom: 10 }} />
              <Slider label="Water Saturation" value={sw} min={15} max={75} step={1} unit="%" onChange={setSw} style={{ marginBottom: 10 }} />
              <Slider label="Net-to-Gross" value={ntg} min={20} max={90} step={1} unit="%" onChange={setNtg} style={{ marginBottom: 10 }} />
              <Slider label="Oil Price" value={oilPrice} min={40} max={140} step={1} unit="$/bbl" onChange={setOilPrice} style={{ marginBottom: 12 }} />
              <div style={{ padding: '8px 10px', background: 'rgba(59,127,232,0.06)', borderRadius: 6, border: '1px solid rgba(59,127,232,0.15)', fontSize: 11 }}>
                <div style={{ color: 'var(--text-muted)', marginBottom: 4 }}>Top candidate NPV at current params:</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--success)' }}>${candidates[0]?.npv}M</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{candidates[0]?.id} · Risk: {candidates[0]?.risk}</div>
              </div>
            </div>
          </div>

          {/* Risk matrix */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div className="card" style={{ padding: 14 }}>
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 10 }}>Risk Matrix</div>
              <div style={{ position: 'relative', height: 200, background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-subtle)', borderRadius: 4 }}>
                {/* Quadrant labels */}
                {[['Sweet Spot', 0, 0, 'var(--success)'], ['High Potential', '50%', 0, 'var(--accent-blue)'], ['Monitor', 0, '50%', 'var(--warning)'], ['Avoid', '50%', '50%', 'var(--danger)']].map(([l, left, top, c]) => (
                  <div key={l} style={{ position: 'absolute', left: left || 4, top: top || 4, fontSize: 9, color: c, opacity: 0.6, padding: '2px 4px' }}>{l}</div>
                ))}
                <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1, background: 'rgba(255,255,255,0.08)' }} />
                <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1, background: 'rgba(255,255,255,0.08)' }} />
                {candidates.slice(0, 10).map(c => {
                  const x = (c.risk / 100) * 100;
                  const y = 100 - (c.npv / 300) * 100;
                  const color = c.risk < 40 ? 'var(--success)' : c.risk < 65 ? 'var(--warning)' : 'var(--danger)';
                  return (
                    <div key={c.id} onClick={() => setSelectedId(c.id)} style={{
                      position: 'absolute', left: `${x}%`, top: `${Math.max(2, Math.min(92, y))}%`,
                      transform: 'translate(-50%, -50%)', width: 20, height: 20, borderRadius: '50%',
                      background: color + '33', border: `1.5px solid ${color}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 8, color: '#fff', cursor: 'pointer', fontWeight: 600,
                    }}>{c.id}</div>
                  );
                })}
                <div style={{ position: 'absolute', bottom: -18, left: 0, right: 0, textAlign: 'center', fontSize: 9, color: 'var(--text-muted)' }}>Technical Risk →</div>
                <div style={{ position: 'absolute', left: -18, top: 0, bottom: 0, display: 'flex', alignItems: 'center', fontSize: 9, color: 'var(--text-muted)', writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>Commercial Risk →</div>
              </div>
              <ChartLegend
                title="Risk Matrix"
                description="A 2×2 portfolio decision tool plotting each drilling candidate by its technical risk (geological uncertainty) against commercial risk (economic uncertainty). Quadrant position guides investment priority."
                axes={{ x: 'Technical Risk → (left = low geological uncertainty, right = high)', y: 'Commercial Risk → (bottom = low economic risk, top = high)' }}
                items={[
                  { color: '#00C896', shape: 'rect', label: 'Bottom-left — Sweet Spot', meaning: 'Low technical AND low commercial risk. Best candidates for immediate drilling. D7 and F12 sit here.' },
                  { color: '#3B7FE8', shape: 'rect', label: 'Bottom-right — High Potential', meaning: 'High technical risk but low commercial risk. Large upside if geological uncertainty resolves positively. Worth further study.' },
                  { color: '#F5A623', shape: 'rect', label: 'Top-left — Monitor', meaning: 'Low technical risk but high commercial risk. Geologically sound but economics are marginal. Watch oil price sensitivity.' },
                  { color: '#E84040', shape: 'rect', label: 'Top-right — Avoid', meaning: 'High technical AND commercial risk. Do not drill without significant additional data. Defer or drop.' },
                  { color: '#00C896', shape: 'circle', border: '#00C896', label: 'Green dots', meaning: 'Individual candidates with risk score < 40.' },
                  { color: '#F5A623', shape: 'circle', border: '#F5A623', label: 'Amber dots', meaning: 'Individual candidates with risk score 40–65.' },
                  { color: '#E84040', shape: 'circle', border: '#E84040', label: 'Red dots', meaning: 'Individual candidates with risk score > 65.' },
                ]}
                insight="Use the What-If sliders to see how changing porosity or oil price shifts candidates across quadrant boundaries in real time."
              />
            </div>

            {/* Selected candidate detail */}
            <div className="card" style={{ padding: 14 }}>
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 10 }}>
                {selectedId ? `Location ${selectedId} — Detail` : 'Select a candidate'}
              </div>
              {selectedId ? (() => {
                const c = candidates.find(x => x.id === selectedId);
                if (!c) return null;
                return (
                  <div>
                    {[['Rank', `#${c.rank}`], ['Inline', c.inline], ['Xline', c.xline], ['Depth', `${c.depth}m`], ['AI Confidence', `${c.confidence}%`], ['Risk Score', c.risk], ['NPV Estimate', `$${c.npv}M`], ['Reservoir Vol', `${c.vol} MMbbl`], ['Status', c.status]].map(([l, v]) => (
                      <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid rgba(30,42,58,0.4)' }}>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{l}</span>
                        <span style={{ fontSize: 11, color: 'var(--text-primary)', fontFamily: 'monospace' }}>{v}</span>
                      </div>
                    ))}
                    <div style={{ marginTop: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>AI Confidence</span>
                        <span style={{ fontSize: 10, color: 'var(--success)' }}>{c.confidence}%</span>
                      </div>
                      <ProgressBar value={c.confidence} color="var(--success)" height={4} />
                    </div>
                    <Badge color={riskColor(c.risk)} style={{ marginTop: 8 }}>Risk: {c.risk < 40 ? 'Low' : c.risk < 65 ? 'Medium' : 'High'} ({c.risk})</Badge>
                  </div>
                );
              })() : (
                <div style={{ color: 'var(--text-muted)', fontSize: 12, textAlign: 'center', padding: 20 }}>Click a candidate on the map or table to view details</div>
              )}
            </div>
          </div>

          {/* Candidates table */}
          <div className="card" style={{ padding: 0 }}>
            <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border-subtle)', fontWeight: 600, fontSize: 13 }}>Drilling Candidates — {candidates.length} locations</div>
            <div style={{ padding: '0 14px 14px' }}>
              <Table
                columns={[
                  { key: 'rank', label: '#', render: v => <span style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>{v}</span> },
                  { key: 'id', label: 'Location', render: v => <span style={{ fontFamily: 'monospace', color: 'var(--accent-blue)', fontWeight: 600 }}>{v}</span> },
                  { key: 'inline', label: 'Inline' },
                  { key: 'xline', label: 'Xline' },
                  { key: 'depth', label: 'Depth (m)', render: v => `${v.toLocaleString()}m` },
                  { key: 'confidence', label: 'AI Conf %', render: v => <span style={{ color: v > 80 ? 'var(--success)' : v > 65 ? 'var(--warning)' : 'var(--danger)', fontWeight: 600 }}>{v}%</span> },
                  { key: 'risk', label: 'Risk Score', render: v => <Badge color={v < 40 ? 'green' : v < 65 ? 'yellow' : 'red'}>{v}</Badge> },
                  { key: 'npv', label: 'NPV ($M)', render: v => <span style={{ color: 'var(--success)', fontWeight: 600 }}>${v}M</span> },
                  { key: 'vol', label: 'Res Vol (MMbbl)', render: v => `${v}` },
                  { key: 'status', label: 'Status', render: v => <Badge color={v === 'Approved' ? 'green' : v === 'Under Review' ? 'blue' : v === 'Pending' ? 'yellow' : 'gray'}>{v}</Badge> },
                ]}
                data={candidates}
                onRowClick={row => setSelectedId(row.id)}
              />
            </div>
          </div>
        </div>

        {/* Embedded Decision Copilot */}
        <div style={{ height: 260, borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '8px 14px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Bot size={14} color="var(--accent-blue)" />
            <span style={{ fontWeight: 600, fontSize: 12 }}>Decision Copilot</span>
            <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>15 candidates · {candidates.length} ranked</span>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '8px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {messages.length === 0 && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {['Which location has the best risk-adjusted return?', 'Compare top 3 candidates', 'What happens if oil price drops to $60?', 'Generate a drilling recommendation memo'].map(q => (
                  <button key={q} onClick={() => ask(q)} style={{ background: 'rgba(59,127,232,0.06)', border: '1px solid rgba(59,127,232,0.15)', borderRadius: 6, padding: '4px 10px', color: 'var(--text-secondary)', fontSize: 11, cursor: 'pointer', fontFamily: 'Inter' }}>{q}</button>
                ))}
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, flexDirection: m.role === 'user' ? 'row-reverse' : 'row' }}>
                <div style={{ width: 22, height: 22, borderRadius: '50%', background: m.role === 'user' ? 'rgba(124,77,255,0.2)' : 'rgba(59,127,232,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {m.role === 'user' ? <User size={11} color="var(--accent-purple)" /> : <Bot size={11} color="var(--accent-blue)" />}
                </div>
                <div style={{ maxWidth: '80%', background: m.role === 'user' ? 'rgba(124,77,255,0.1)' : 'rgba(15,21,32,0.8)', border: '1px solid var(--border-subtle)', borderRadius: 6, padding: '6px 10px', fontSize: 11, color: 'var(--text-primary)', lineHeight: 1.5 }}>
                  {m.role === 'user' ? m.content : (typeof m.content === 'string' ? m.content : m.content.interpretation || m.content.observation)}
                </div>
              </div>
            ))}
            {thinking && (
              <div style={{ display: 'flex', gap: 6, padding: '6px 10px', background: 'rgba(15,21,32,0.8)', border: '1px solid var(--border-subtle)', borderRadius: 6, width: 60 }}>
                {[0,1,2].map(i => <span key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--accent-blue)', display: 'inline-block', animation: `dotPulse 1.2s ease-in-out ${i*0.2}s infinite` }} />)}
              </div>
            )}
            <div ref={bottomRef} />
          </div>
          <div style={{ padding: '8px 14px', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: 8 }}>
            <input value={copilotInput} onChange={e => setCopilotInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { ask(copilotInput); setCopilotInput(''); } }}
              placeholder="Ask about drilling candidates, risk, NPV..."
              style={{ flex: 1, padding: '6px 10px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-subtle)', borderRadius: 6, color: 'var(--text-primary)', fontSize: 12, fontFamily: 'Inter', outline: 'none' }} />
            <button onClick={() => { ask(copilotInput); setCopilotInput(''); }} style={{ width: 30, height: 30, borderRadius: 6, background: 'var(--accent-blue)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Send size={12} color="#fff" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
