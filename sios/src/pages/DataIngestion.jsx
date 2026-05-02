import { useState, useRef } from 'react';
import { Upload, CheckCircle, Circle, Loader, AlertCircle, ArrowRight } from 'lucide-react';
import { Button, Badge, ProgressBar } from '../components/ui';
import { useToast } from '../components/ui';
import { useNavigate } from 'react-router-dom';

const PIPELINE_STAGES = [
  'File parsing',
  'Schema validation',
  'Seismic cube construction',
  'Attribute extraction',
  'Quality control check',
  'Dataset registration',
];

const REQUIRED_COLS = ['inline', 'crossline', 'time', 'amplitude'];

export default function DataIngestion() {
  const [step, setStep] = useState(1);
  const [file, setFile] = useState(null);
  const [schema, setSchema] = useState(null);
  const [config, setConfig] = useState({ project: "Block 31 - Rub' al Khali", operator: 'Saudi Aramco', block: '31', country: 'Saudi Arabia', crs: 'UTM Zone 38N', sampleRate: '4', amplitudeScaling: 'Auto', coordinateSystem: 'time' });
  const [stages, setStages] = useState(PIPELINE_STAGES.map(() => ({ status: 'pending', progress: 0, elapsed: 0 })));
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  function loadSample() {
    setFile({ name: 'block31_full_stack_3d.segy', size: '142.7 GB', rows: 172800, type: 'SEG-Y' });
    setSchema({ valid: true, columns: ['inline', 'crossline', 'time', 'amplitude', 'x_coord', 'y_coord'], missing: [] });
    toast('Sample dataset loaded', 'success');
  }

  function handleDrop(e) {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) {
      setFile({ name: f.name, size: (f.size / 1e9).toFixed(2) + ' GB', rows: Math.floor(Math.random() * 200000 + 50000), type: f.name.split('.').pop().toUpperCase() });
      const cols = ['inline', 'crossline', 'time', 'amplitude'];
      const missing = REQUIRED_COLS.filter(c => !cols.includes(c));
      setSchema({ valid: missing.length === 0, columns: cols, missing });
    }
  }

  async function runPipeline() {
    setProcessing(true);
    const durations = [800, 600, 2200, 1800, 1000, 500];
    for (let i = 0; i < PIPELINE_STAGES.length; i++) {
      setStages(s => s.map((st, j) => j === i ? { ...st, status: 'running', progress: 0 } : st));
      const start = Date.now();
      const dur = durations[i];
      await new Promise(resolve => {
        let p = 0;
        const iv = setInterval(() => {
          p = Math.min(100, p + Math.random() * 15 + 5);
          const elapsed = ((Date.now() - start) / 1000).toFixed(1);
          setStages(s => s.map((st, j) => j === i ? { ...st, progress: p, elapsed } : st));
          if (p >= 100) { clearInterval(iv); resolve(); }
        }, dur / 15);
      });
      setStages(s => s.map((st, j) => j === i ? { ...st, status: 'done', progress: 100 } : st));
    }
    setProcessing(false); setDone(true);
    toast('Dataset registered successfully!', 'success');
  }

  return (
    <div style={{ padding: 24, maxWidth: 860, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Data Ingestion Pipeline</div>
        <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Import and process seismic datasets into the SIOS platform</div>
      </div>

      {/* Step indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 28 }}>
        {['Upload', 'Configure', 'Process', 'Summary'].map((s, i) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600,
                background: step > i + 1 ? 'var(--success)' : step === i + 1 ? 'var(--accent-blue)' : 'rgba(255,255,255,0.06)',
                color: step >= i + 1 ? '#fff' : 'var(--text-muted)',
                border: step === i + 1 ? '2px solid rgba(59,127,232,0.5)' : 'none',
              }}>{step > i + 1 ? '✓' : i + 1}</div>
              <span style={{ fontSize: 12, color: step === i + 1 ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: step === i + 1 ? 500 : 400 }}>{s}</span>
            </div>
            {i < 3 && <div style={{ width: 40, height: 1, background: step > i + 1 ? 'var(--success)' : 'var(--border-subtle)', margin: '0 8px' }} />}
          </div>
        ))}
      </div>

      {/* Step 1: Upload */}
      {step === 1 && (
        <div className="card" style={{ padding: 24 }}>
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 16 }}>Step 1 — Upload Dataset</div>
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            style={{
              border: `2px dashed ${dragOver ? 'var(--accent-blue)' : 'var(--border-subtle)'}`,
              borderRadius: 8, padding: '40px 24px', textAlign: 'center', marginBottom: 16,
              background: dragOver ? 'rgba(59,127,232,0.05)' : 'rgba(255,255,255,0.01)',
              transition: 'all 0.2s', cursor: 'pointer',
            }}>
            <Upload size={32} color="var(--text-muted)" style={{ marginBottom: 12 }} />
            <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 6 }}>Drop SEG-Y, CSV, or XLSX file here</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>Supported: .segy, .csv, .xlsx · Max 500 GB</div>
            <Button variant="ghost" size="sm">Browse Files</Button>
          </div>

          <div style={{ textAlign: 'center', marginBottom: 16, color: 'var(--text-muted)', fontSize: 12 }}>— or —</div>
          <Button variant="secondary" onClick={loadSample} style={{ width: '100%', justifyContent: 'center' }}>Load Sample Dataset (Block 31 Full Stack 3D)</Button>

          {file && (
            <div style={{ marginTop: 16, padding: '12px 16px', background: 'rgba(0,200,150,0.06)', border: '1px solid rgba(0,200,150,0.2)', borderRadius: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontWeight: 500, fontSize: 13 }}>{file.name}</span>
                <Badge color="green">{file.type}</Badge>
              </div>
              <div style={{ display: 'flex', gap: 16, fontSize: 11, color: 'var(--text-secondary)' }}>
                <span>Size: {file.size}</span>
                <span>Traces: {file.rows?.toLocaleString()}</span>
              </div>
              {schema && (
                <div style={{ marginTop: 10 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>Schema validation:</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {REQUIRED_COLS.map(c => (
                      <span key={c} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: schema.missing.includes(c) ? 'rgba(232,64,64,0.15)' : 'rgba(0,200,150,0.15)', color: schema.missing.includes(c) ? 'var(--danger)' : 'var(--success)' }}>
                        {schema.missing.includes(c) ? '✗' : '✓'} {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="primary" disabled={!file || !schema?.valid} onClick={() => setStep(2)} icon={<ArrowRight size={13} />}>Next: Configure</Button>
          </div>
        </div>
      )}

      {/* Step 2: Configure */}
      {step === 2 && (
        <div className="card" style={{ padding: 24 }}>
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 16 }}>Step 2 — Configuration</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {[
              ['Project Name', 'project', 'text'],
              ['Operator', 'operator', 'text'],
              ['Block', 'block', 'text'],
              ['Country', 'country', 'text'],
            ].map(([label, key, type]) => (
              <div key={key}>
                <label style={{ display: 'block', fontSize: 11, color: 'var(--text-secondary)', marginBottom: 5, letterSpacing: 0.5 }}>{label.toUpperCase()}</label>
                <input type={type} value={config[key]} onChange={e => setConfig(c => ({ ...c, [key]: e.target.value }))}
                  style={{ width: '100%', padding: '8px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-subtle)', borderRadius: 6, color: 'var(--text-primary)', fontSize: 13, fontFamily: 'Inter', outline: 'none' }} />
              </div>
            ))}
            {[
              ['CRS', 'crs', ['UTM Zone 38N', 'UTM Zone 32N', 'UTM Zone 31N', 'WGS84']],
              ['Sample Rate (ms)', 'sampleRate', ['2', '4', '8']],
              ['Amplitude Scaling', 'amplitudeScaling', ['Auto', 'Manual']],
              ['Coordinate System', 'coordinateSystem', ['time', 'depth']],
            ].map(([label, key, opts]) => (
              <div key={key}>
                <label style={{ display: 'block', fontSize: 11, color: 'var(--text-secondary)', marginBottom: 5, letterSpacing: 0.5 }}>{label.toUpperCase()}</label>
                <select value={config[key]} onChange={e => setConfig(c => ({ ...c, [key]: e.target.value }))}
                  style={{ width: '100%', padding: '8px 12px', backgroundColor: '#0F1520', border: '1px solid var(--border-subtle)', borderRadius: 6, color: 'var(--text-primary)', fontSize: 13, fontFamily: 'Inter', outline: 'none', cursor: 'pointer', appearance: 'none', WebkitAppearance: 'none' }}>
                  {opts.map(o => <option key={o} value={o} style={{ backgroundColor: '#0F1520', color: '#fff' }}>{o}</option>)}
                </select>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 20, display: 'flex', justifyContent: 'space-between' }}>
            <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
            <Button variant="primary" onClick={() => setStep(3)} icon={<ArrowRight size={13} />}>Next: Process</Button>
          </div>
        </div>
      )}

      {/* Step 3: Processing */}
      {step === 3 && (
        <div className="card" style={{ padding: 24 }}>
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 16 }}>Step 3 — Processing Pipeline</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
            {PIPELINE_STAGES.map((stage, i) => {
              const s = stages[i];
              return (
                <div key={stage} style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: 6, border: `1px solid ${s.status === 'done' ? 'rgba(0,200,150,0.2)' : s.status === 'running' ? 'rgba(59,127,232,0.2)' : 'var(--border-subtle)'}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: s.status === 'running' ? 8 : 0 }}>
                    {s.status === 'done' ? <CheckCircle size={14} color="var(--success)" /> :
                     s.status === 'running' ? <Loader size={14} color="var(--accent-blue)" style={{ animation: 'spin 1s linear infinite' }} /> :
                     <Circle size={14} color="var(--text-muted)" />}
                    <span style={{ fontSize: 13, color: s.status === 'done' ? 'var(--success)' : s.status === 'running' ? 'var(--text-primary)' : 'var(--text-muted)', flex: 1 }}>{stage}</span>
                    {s.status !== 'pending' && <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'monospace' }}>{s.elapsed}s</span>}
                    {s.status === 'done' && <Badge color="green" style={{ fontSize: 9 }}>Done</Badge>}
                  </div>
                  {s.status === 'running' && <ProgressBar value={s.progress} color="var(--accent-blue)" height={3} />}
                </div>
              );
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button variant="ghost" onClick={() => setStep(2)} disabled={processing}>Back</Button>
            {!done ? (
              <Button variant="primary" onClick={runPipeline} disabled={processing}>
                {processing ? 'Processing...' : 'Run Pipeline'}
              </Button>
            ) : (
              <Button variant="success" onClick={() => setStep(4)} icon={<ArrowRight size={13} />}>View Summary</Button>
            )}
          </div>
        </div>
      )}

      {/* Step 4: Summary */}
      {step === 4 && (
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <CheckCircle size={20} color="var(--success)" />
            <div style={{ fontWeight: 600, fontSize: 14 }}>Dataset Registered Successfully</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
            {[
              ['Inline Range', '1 – 480'], ['Xline Range', '1 – 360'],
              ['Time Range', '0 – 2000ms'], ['Total Traces', '172,800'],
              ['Quality Score', '91 / 100'], ['Detected Horizons', '3'],
              ['Fault Indicators', '7'], ['Sample Rate', '4ms'],
              ['SNR', '28.4 dB'], ['Missing Traces', '14 (0.008%)'],
            ].map(([l, v]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 10px', background: 'rgba(255,255,255,0.02)', borderRadius: 4 }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{l}</span>
                <span style={{ fontSize: 12, color: 'var(--text-primary)', fontFamily: 'monospace' }}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Button variant="primary" onClick={() => navigate('/seismic')}>Open in Seismic Viewer</Button>
            <Button variant="ghost" onClick={() => { setStep(1); setFile(null); setSchema(null); setDone(false); setStages(PIPELINE_STAGES.map(() => ({ status: 'pending', progress: 0, elapsed: 0 }))); }}>Ingest Another Dataset</Button>
          </div>
        </div>
      )}
    </div>
  );
}
