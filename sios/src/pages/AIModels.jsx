import { useState, useEffect, useRef } from 'react';
import { Play, CheckCircle, Clock, Cpu, ChevronRight } from 'lucide-react';
import { AI_MODELS, MODEL_VERSIONS, generateTrainingCurves } from '../mock/aiEngine';
import { Tabs, Button, Badge, ProgressBar, Table, Modal } from '../components/ui';
import LossCurveChart from '../components/charts/LossCurveChart';
import CopilotBubble from '../components/copilot/CopilotBubble';
import ChartLegend from '../components/ui/ChartLegend';
import { useRBAC } from '../hooks/useRBAC';
import { useToast } from '../components/ui';

const STATUS_COLOR = { Trained: 'green', Training: 'blue', Ready: 'yellow', Failed: 'red' };

export default function AIModels() {
  const [selectedModel, setSelectedModel] = useState(AI_MODELS[0]);
  const [activeTab, setActiveTab] = useState('overview');
  const { can } = useRBAC();
  const toast = useToast();

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 56px)', overflow: 'hidden' }}>
      {/* Model list sidebar */}
      <div style={{ width: 220, background: 'var(--bg-surface)', borderRight: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border-subtle)', fontWeight: 600, fontSize: 12, color: 'var(--text-secondary)', letterSpacing: 1 }}>AI MODELS</div>
        {AI_MODELS.map(m => (
          <div key={m.id} onClick={() => { setSelectedModel(m); setActiveTab('overview'); }}
            style={{
              padding: '12px 14px', cursor: 'pointer', borderBottom: '1px solid rgba(30,42,58,0.4)',
              background: selectedModel.id === m.id ? 'rgba(59,127,232,0.08)' : 'transparent',
              borderLeft: selectedModel.id === m.id ? '2px solid var(--accent-blue)' : '2px solid transparent',
              transition: 'all 0.15s',
            }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
              <span style={{ fontSize: 12, fontWeight: 500, color: selectedModel.id === m.id ? 'var(--accent-blue)' : 'var(--text-primary)' }}>{m.name}</span>
              <Badge color={STATUS_COLOR[m.status]} style={{ fontSize: 9 }}>{m.status}</Badge>
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{m.version} · {m.architecture}</div>
          </div>
        ))}
      </div>

      {/* Detail panel */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <div style={{ padding: '0 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Tabs
            tabs={[
              { id: 'overview', label: 'Overview' },
              { id: 'training', label: 'Training' },
              { id: 'predictions', label: 'Predictions' },
              { id: 'versions', label: 'Versions' },
            ]}
            active={activeTab}
            onChange={setActiveTab}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Badge color={STATUS_COLOR[selectedModel.status]}>{selectedModel.status}</Badge>
            <CopilotBubble module="models" context={{ modelActive: selectedModel.name }} title="Model Copilot" />
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
          {activeTab === 'overview' && <ModelOverview model={selectedModel} />}
          {activeTab === 'training' && <ModelTraining model={selectedModel} can={can} toast={toast} />}
          {activeTab === 'predictions' && <ModelPredictions model={selectedModel} can={can} />}
          {activeTab === 'versions' && <ModelVersions model={selectedModel} can={can} toast={toast} />}
        </div>
      </div>
    </div>
  );
}

function ModelOverview({ model }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
      {/* Architecture */}
      <div className="card" style={{ padding: 16 }}>
        <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 14 }}>Architecture</div>
        <ArchDiagram arch={model.architecture} />
      </div>

      {/* Hyperparams */}
      <div className="card" style={{ padding: 16 }}>
        <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 12 }}>Hyperparameters</div>
        {Object.entries(model.hyperparams).map(([k, v]) => (
          <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid rgba(30,42,58,0.5)' }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'capitalize' }}>{k.replace(/_/g, ' ')}</span>
            <span style={{ fontSize: 11, color: 'var(--text-primary)', fontFamily: 'monospace' }}>{Array.isArray(v) ? v.join(', ') : String(v)}</span>
          </div>
        ))}
      </div>

      {/* Metrics */}
      <div className="card" style={{ padding: 16 }}>
        <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 12 }}>Performance Metrics</div>
        {model.metrics.accuracy > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            {Object.entries(model.metrics).map(([k, v]) => (
              <div key={k} style={{ textAlign: 'center', padding: '10px 8px', background: 'rgba(255,255,255,0.02)', borderRadius: 6 }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--success)' }}>{(v * 100).toFixed(1)}%</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'capitalize', marginTop: 2 }}>{k}</div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ color: 'var(--text-muted)', fontSize: 12, textAlign: 'center', padding: 20 }}>Not yet trained</div>
        )}
      </div>

      {/* Training metadata */}
      <div className="card" style={{ padding: 16 }}>
        <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 12 }}>Training Metadata</div>
        {[
          ['Dataset', model.dataset],
          ['Started', model.trainedAt ? new Date(model.trainedAt).toLocaleString() : '—'],
          ['Duration', model.duration],
          ['GPU', model.gpuSimulated],
          ['Architecture', model.architecture],
        ].map(([l, v]) => (
          <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid rgba(30,42,58,0.5)' }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{l}</span>
            <span style={{ fontSize: 11, color: 'var(--text-primary)', maxWidth: 200, textAlign: 'right' }}>{v}</span>
          </div>
        ))}
        <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{model.description}</div>
      </div>
    </div>
  );
}

function ArchDiagram({ arch }) {
  const layers = {
    CNN: ['Input (100×100)', 'Conv2D 32', 'Conv2D 64', 'Conv2D 128', 'Conv2D 256', 'GlobalAvgPool', 'Dense 512', 'Output'],
    'U-Net': ['Input', 'Encoder ×4', 'Bottleneck', 'Decoder ×4', 'Skip Connections', 'Output Mask'],
    'ResNet-34': ['Input', 'Conv 7×7', 'ResBlock ×3', 'ResBlock ×4', 'ResBlock ×6', 'ResBlock ×3', 'AvgPool', 'Output'],
    'LSTM + Attention': ['Input Sequence', 'Embedding', 'LSTM ×2', 'Attention', 'Dense', 'Output'],
  };
  const items = layers[arch] || layers.CNN;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
      {items.map((l, i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
          <div style={{
            padding: '5px 12px', background: i === 0 ? 'rgba(59,127,232,0.15)' : i === items.length - 1 ? 'rgba(0,200,150,0.15)' : 'rgba(124,77,255,0.1)',
            border: `1px solid ${i === 0 ? 'rgba(59,127,232,0.3)' : i === items.length - 1 ? 'rgba(0,200,150,0.3)' : 'rgba(124,77,255,0.2)'}`,
            borderRadius: 4, fontSize: 11, color: 'var(--text-primary)', width: '80%', textAlign: 'center',
          }}>{l}</div>
          {i < items.length - 1 && <div style={{ width: 1, height: 8, background: 'var(--border-subtle)' }} />}
        </div>
      ))}
    </div>
  );
}

function ModelTraining({ model, can, toast }) {
  const [training, setTraining] = useState(false);
  const [epoch, setEpoch] = useState(0);
  const [curves, setCurves] = useState([]);
  const [log, setLog] = useState('');
  const logRef = useRef(null);
  const intervalRef = useRef(null);
  const allCurves = useRef(generateTrainingCurves(50, model.id));

  function startTraining() {
    if (!can('canRunModels')) { toast('Insufficient permissions to run models', 'error'); return; }
    setTraining(true); setEpoch(0); setCurves([]); setLog('');
    let e = 0;
    intervalRef.current = setInterval(() => {
      e++;
      const pt = allCurves.current[e - 1];
      setCurves(c => [...c, pt]);
      setEpoch(e);
      setLog(l => l + `Epoch ${e}/50 — loss: ${pt.trainLoss.toFixed(4)} — val_loss: ${pt.valLoss.toFixed(4)} — acc: ${pt.accuracy.toFixed(4)} — iou: ${pt.iou.toFixed(4)}\n`);
      if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
      if (e >= 50) { clearInterval(intervalRef.current); setTraining(false); toast('Training complete! CNN Feature Extractor v3.1', 'success'); }
    }, 180);
  }

  function stopTraining() {
    clearInterval(intervalRef.current);
    setTraining(false);
    toast('Training stopped at epoch ' + epoch, 'warning');
  }

  const currentMetrics = curves[curves.length - 1];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        {!training ? (
          <Button variant="primary" icon={<Play size={13} />} onClick={startTraining} disabled={!can('canRunModels')}>
            Start Training
          </Button>
        ) : (
          <Button variant="danger" onClick={stopTraining}>Stop Training</Button>
        )}
        {training && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)', animation: 'dotPulse 1s ease-in-out infinite' }} />
            <span style={{ fontSize: 12, color: 'var(--success)' }}>Training — Epoch {epoch}/50</span>
          </div>
        )}
      </div>

      {/* Progress */}
      <div className="card" style={{ padding: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Progress</span>
          <span style={{ fontSize: 12, color: 'var(--accent-blue)', fontFamily: 'monospace' }}>{epoch}/50 epochs</span>
        </div>
        <ProgressBar value={epoch} max={50} />
        {currentMetrics && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, marginTop: 12 }}>
            {[['Accuracy', (currentMetrics.accuracy * 100).toFixed(1) + '%', 'var(--success)'],
              ['IoU', currentMetrics.iou.toFixed(3), 'var(--accent-blue)'],
              ['Dice', currentMetrics.dice.toFixed(3), 'var(--accent-purple)'],
              ['Train Loss', currentMetrics.trainLoss.toFixed(4), 'var(--warning)'],
              ['Val Loss', currentMetrics.valLoss.toFixed(4), 'var(--danger)']].map(([l, v, c]) => (
              <div key={l} style={{ textAlign: 'center', padding: '8px 4px', background: 'rgba(255,255,255,0.02)', borderRadius: 4 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: c }}>{v}</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{l}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Live loss curve */}
      <div className="card" style={{ padding: 14 }}>
        <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 10 }}>Live Loss Curve</div>
        <LossCurveChart data={curves.length > 0 ? curves : allCurves.current} height={200} />
        <ChartLegend
          title="Training Loss Curve"
          description="Real-time visualisation of model learning progress. The loss function measures how wrong the model's predictions are — it should decrease as training progresses."
          axes={{ x: 'Epoch (each = one complete pass through all training seismic patches)', y: 'Loss value (0 = perfect, higher = more error)' }}
          items={[
            { color: '#3B7FE8', shape: 'line', label: 'Blue — Training Loss', meaning: 'Error on data the model is actively learning from. Should decrease smoothly epoch by epoch.' },
            { color: '#E84040', shape: 'line', dashed: true, label: 'Red dashed — Validation Loss', meaning: 'Error on held-out seismic patches never seen during training. Measures true generalisation ability. If this rises while train loss falls, overfitting is occurring.' },
          ]}
          insight="Ideal convergence: both curves decrease together and plateau near the same value. A gap > 0.05 between train and val loss after epoch 30 suggests overfitting — reduce learning rate or add regularisation."
        />
      </div>

      {/* Training log */}
      <div className="card" style={{ padding: 14 }}>
        <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8 }}>Training Log</div>
        <textarea ref={logRef} readOnly value={log || allCurves.current.map(p => `Epoch ${p.epoch}/50 — loss: ${p.trainLoss.toFixed(4)} — val_loss: ${p.valLoss.toFixed(4)} — acc: ${p.accuracy.toFixed(4)}`).join('\n')}
          style={{
            width: '100%', height: 180, background: '#050810', border: '1px solid var(--border-subtle)',
            borderRadius: 4, color: 'var(--success)', fontFamily: 'monospace', fontSize: 11,
            padding: '8px 10px', resize: 'none', outline: 'none',
          }} />
      </div>
    </div>
  );
}

function ModelPredictions({ model, can }) {
  const [ran, setRan] = useState(false);
  const [running, setRunning] = useState(false);
  const canvasRef = useRef(null);
  const confRef = useRef(null);

  async function runInference() {
    setRunning(true);
    await new Promise(r => setTimeout(r, 1400));
    setRan(true); setRunning(false);
    // Draw prediction canvas
    setTimeout(() => {
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        const W = canvasRef.current.width, H = canvasRef.current.height;
        const imgData = ctx.createImageData(W, H);
        for (let py = 0; py < H; py++) {
          for (let px = 0; px < W; px++) {
            const v = Math.sin(px / 20) * Math.cos(py / 15) * 0.5 + 0.5;
            const pi = (py * W + px) * 4;
            imgData.data[pi] = Math.round(v * 100); imgData.data[pi+1] = Math.round(v * 200); imgData.data[pi+2] = Math.round(v * 255); imgData.data[pi+3] = 255;
          }
        }
        ctx.putImageData(imgData, 0, 0);
      }
      if (confRef.current) {
        const ctx = confRef.current.getContext('2d');
        const W = confRef.current.width, H = confRef.current.height;
        const imgData = ctx.createImageData(W, H);
        for (let py = 0; py < H; py++) {
          for (let px = 0; px < W; px++) {
            const v = Math.max(0, Math.min(1, 0.5 + 0.4 * Math.sin(px / 18) * Math.cos(py / 14)));
            const pi = (py * W + px) * 4;
            imgData.data[pi] = 255; imgData.data[pi+1] = Math.round((1 - v) * 200); imgData.data[pi+2] = 0; imgData.data[pi+3] = Math.round(v * 220 + 35);
          }
        }
        ctx.putImageData(imgData, 0, 0);
      }
    }, 50);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <Button variant="primary" icon={<Play size={13} />} onClick={runInference} disabled={running || !can('canRunModels')}>
          {running ? 'Running Inference...' : 'Run Inference'}
        </Button>
        {ran && <Badge color="green">Inference complete · 1.24s</Badge>}
      </div>

      {ran && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            {[['Input Amplitude', canvasRef, '#3B7FE8'], ['Prediction Mask', null, '#7C4DFF'], ['Confidence Map', confRef, '#F5A623']].map(([label, ref, color], i) => (
              <div key={label} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-subtle)', fontSize: 11, fontWeight: 500, color }}>{label}</div>
                {i === 1 ? (
                  <div style={{ height: 160, background: 'linear-gradient(135deg, rgba(124,77,255,0.3) 0%, rgba(59,127,232,0.1) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Segmentation mask</div>
                  </div>
                ) : (
                  <canvas ref={ref} width={200} height={160} style={{ width: '100%', height: 160, display: 'block' }} />
                )}
              </div>
            ))}
          </div>

          <div className="card" style={{ padding: 14 }}>
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 12 }}>Inference Metrics</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              {[['Final IoU', '0.847', 'var(--accent-blue)'], ['Dice Score', '0.862', 'var(--accent-purple)'], ['Accuracy', '89.1%', 'var(--success)'], ['F1 Score', '0.890', 'var(--warning)']].map(([l, v, c]) => (
                <div key={l} style={{ textAlign: 'center', padding: '12px 8px', background: 'rgba(255,255,255,0.02)', borderRadius: 6 }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: c }}>{v}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function ModelVersions({ model, can, toast }) {
  const [deployModal, setDeployModal] = useState(null);
  const versions = MODEL_VERSIONS[model.id] || [];

  return (
    <div>
      <Table
        columns={[
          { key: 'version', label: 'Version', render: v => <span style={{ fontFamily: 'monospace', color: 'var(--accent-blue)' }}>{v}</span> },
          { key: 'date', label: 'Date' },
          { key: 'trainedBy', label: 'Trained By' },
          { key: 'dataset', label: 'Dataset' },
          { key: 'accuracy', label: 'Accuracy', render: v => v ? <span style={{ color: 'var(--success)' }}>{(v * 100).toFixed(1)}%</span> : '—' },
          { key: 'notes', label: 'Notes' },
          { key: 'version', label: 'Action', render: (v, row) => (
            <Button variant="secondary" size="sm" disabled={!can('canRunModels')} onClick={e => { e.stopPropagation(); setDeployModal(row); }}>Deploy</Button>
          )},
        ]}
        data={versions}
      />
      <Modal open={!!deployModal} onClose={() => setDeployModal(null)} title="Deploy Model Version">
        <div style={{ marginBottom: 16, color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.6 }}>
          Deploy <strong style={{ color: 'var(--accent-blue)' }}>{model.name} {deployModal?.version}</strong> to production?
          This will replace the currently active version and affect all live inference requests.
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <Button variant="ghost" onClick={() => setDeployModal(null)}>Cancel</Button>
          <Button variant="primary" onClick={() => { toast(`${model.name} ${deployModal?.version} deployed to production`, 'success'); setDeployModal(null); }}>Confirm Deploy</Button>
        </div>
      </Modal>
    </div>
  );
}
