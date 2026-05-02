import { useState } from 'react';
import { DATASETS } from '../mock/datasets';
import { AI_MODELS, EXPERIMENTS } from '../mock/aiEngine';
import { USERS } from '../mock/users';
import { Tabs, Table, Badge, Button } from '../components/ui';
import { useRBAC } from '../hooks/useRBAC';
import { useToast } from '../components/ui';

const USER_ACTIVITY = [
  { ts: '2026-05-02 08:14', user: 'Alexandra Reeves', action: 'Login', module: 'Auth', details: 'Successful login', result: 'success' },
  { ts: '2026-05-02 08:16', user: 'Dr. Khalid Al-Mansouri', action: 'View Seismic', module: 'Seismic Viewer', details: 'Inline 42, Block 31', result: 'success' },
  { ts: '2026-05-02 08:22', user: 'Priya Nair', action: 'Start Training', module: 'AI Models', details: 'U-Net Segmenter v2.0', result: 'running' },
  { ts: '2026-05-02 08:35', user: 'Dr. Khalid Al-Mansouri', action: 'Add Annotation', module: 'Interpretation', details: 'Horizon pick IL 42', result: 'success' },
  { ts: '2026-05-02 08:41', user: 'James Thornton', action: 'View Report', module: 'Reports', details: 'Drilling Decision Report', result: 'success' },
  { ts: '2026-05-02 09:02', user: 'Alexandra Reeves', action: 'Deploy Model', module: 'AI Models', details: 'Fault Detector v1.4', result: 'success' },
  { ts: '2026-05-02 09:15', user: 'Priya Nair', action: 'Upload Dataset', module: 'Data Ingestion', details: 'ODF-7 Partial Stack', result: 'success' },
  { ts: '2026-05-02 09:28', user: 'Dr. Khalid Al-Mansouri', action: 'Run Inference', module: 'AI Models', details: 'CNN v3.1 on Block 31', result: 'success' },
  { ts: '2026-05-02 09:44', user: 'James Thornton', action: 'Export CSV', module: 'Decision Support', details: 'Drilling candidates', result: 'success' },
  { ts: '2026-05-02 10:01', user: 'Alexandra Reeves', action: 'Add User', module: 'Admin', details: 'New Viewer account', result: 'success' },
  { ts: '2026-05-02 10:12', user: 'Priya Nair', action: 'View Dashboard', module: 'Dashboard', details: 'Block 31 project', result: 'success' },
  { ts: '2026-05-02 10:18', user: 'Dr. Khalid Al-Mansouri', action: 'Pick Fault', module: 'Interpretation', details: 'Fault F-1 trace', result: 'success' },
  { ts: '2026-05-02 10:25', user: 'James Thornton', action: 'View Seismic', module: 'Seismic Viewer', details: 'Time slice 1200ms', result: 'success' },
  { ts: '2026-05-02 10:33', user: 'Alexandra Reeves', action: 'Change Role', module: 'Admin', details: 'User role updated', result: 'success' },
  { ts: '2026-05-02 10:45', user: 'Priya Nair', action: 'Compare Experiments', module: 'Tracking', details: 'run-001 vs run-002', result: 'success' },
  { ts: '2026-05-02 11:02', user: 'Dr. Khalid Al-Mansouri', action: 'Generate Report', module: 'Reports', details: 'Seismic Interpretation Report', result: 'success' },
  { ts: '2026-05-02 11:14', user: 'James Thornton', action: 'View Decision Support', module: 'Decision Support', details: 'Reviewed top 5 candidates', result: 'success' },
  { ts: '2026-05-02 11:28', user: 'Alexandra Reeves', action: 'Logout', module: 'Auth', details: 'Session ended', result: 'success' },
  { ts: '2026-05-02 11:35', user: 'Priya Nair', action: 'View Dataset', module: 'Dataset Registry', details: 'NS-22 v3.0', result: 'success' },
  { ts: '2026-05-02 11:48', user: 'Dr. Khalid Al-Mansouri', action: 'Run Scenario', module: 'Decision Support', details: 'Oil price $60/bbl', result: 'success' },
  ...Array.from({ length: 10 }, (_, i) => ({
    ts: `2026-05-01 ${String(8 + i).padStart(2,'0')}:${String(Math.floor(Math.random()*60)).padStart(2,'0')}`,
    user: USERS[i % 4].name,
    action: ['View Seismic', 'Run Inference', 'Export CSV', 'View Report', 'Add Annotation'][i % 5],
    module: ['Seismic Viewer', 'AI Models', 'Decision Support', 'Reports', 'Interpretation'][i % 5],
    details: 'Routine operation',
    result: 'success',
  })),
];

export default function Tracking() {
  const [tab, setTab] = useState('datasets');
  const [compareRuns, setCompareRuns] = useState([]);
  const { can } = useRBAC();
  const toast = useToast();

  return (
    <div style={{ padding: 20 }}>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Tracking & Experiments</div>
        <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Dataset versions, model experiments, and user activity</div>
      </div>

      <Tabs
        tabs={[
          { id: 'datasets', label: 'Datasets' },
          { id: 'models', label: 'Models' },
          { id: 'experiments', label: 'Experiments' },
          ...(can('canAccessAdmin') ? [{ id: 'activity', label: 'User Activity' }] : []),
        ]}
        active={tab}
        onChange={setTab}
        style={{ marginBottom: 16 }}
      />

      {tab === 'datasets' && (
        <div>
          <Table
            columns={[
              { key: 'name', label: 'Dataset', render: v => <span style={{ color: 'var(--accent-blue)' }}>{v.split('—')[0].trim()}</span> },
              { key: 'version', label: 'Version', render: v => <span style={{ fontFamily: 'monospace' }}>{v}</span> },
              { key: 'uploadedAt', label: 'Date', render: v => new Date(v).toLocaleDateString() },
              { key: 'operator', label: 'Operator' },
              { key: 'qualityScore', label: 'Quality', render: v => <Badge color={v > 85 ? 'green' : v > 70 ? 'yellow' : 'red'}>{v}/100</Badge> },
              { key: 'totalTraces', label: 'Traces', render: v => v.toLocaleString() },
              { key: 'status', label: 'Status', render: v => <Badge color="green">{v}</Badge> },
            ]}
            data={DATASETS}
          />
        </div>
      )}

      {tab === 'models' && (
        <div>
          <Table
            columns={[
              { key: 'name', label: 'Model', render: v => <span style={{ color: 'var(--accent-blue)' }}>{v}</span> },
              { key: 'version', label: 'Version', render: v => <span style={{ fontFamily: 'monospace' }}>{v}</span> },
              { key: 'status', label: 'Status', render: v => <Badge color={{ Trained: 'green', Training: 'blue', Ready: 'yellow' }[v] || 'gray'}>{v}</Badge> },
              { key: 'architecture', label: 'Architecture' },
              { key: 'dataset', label: 'Dataset' },
              { key: 'metrics', label: 'Accuracy', render: v => v.accuracy > 0 ? <span style={{ color: 'var(--success)' }}>{(v.accuracy * 100).toFixed(1)}%</span> : '—' },
              { key: 'duration', label: 'Duration' },
              { key: 'id', label: 'Action', render: (v, row) => (
                <Button variant="secondary" size="sm" disabled={!can('canAccessAdmin')} onClick={e => { e.stopPropagation(); toast(`${row.name} promoted to production`, 'success'); }}>Promote</Button>
              )},
            ]}
            data={AI_MODELS}
          />
        </div>
      )}

      {tab === 'experiments' && (
        <div>
          {compareRuns.length === 2 && (
            <div className="card" style={{ padding: 14, marginBottom: 14 }}>
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 10 }}>Comparing: {compareRuns[0].id} vs {compareRuns[1].id}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                {['accuracy', 'iou', 'dice'].map(m => {
                  const a = compareRuns[0][m], b = compareRuns[1][m];
                  const better = a > b ? 0 : 1;
                  return (
                    <div key={m} style={{ padding: '8px 10px', background: 'rgba(255,255,255,0.02)', borderRadius: 4 }}>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase' }}>{m}</div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <span style={{ color: better === 0 ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>{a ? (a * 100).toFixed(1) + '%' : '—'}</span>
                        <span style={{ color: 'var(--text-muted)' }}>vs</span>
                        <span style={{ color: better === 1 ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>{b ? (b * 100).toFixed(1) + '%' : '—'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <Button variant="ghost" size="sm" onClick={() => setCompareRuns([])} style={{ marginTop: 8 }}>Clear Comparison</Button>
            </div>
          )}
          <Table
            columns={[
              { key: 'id', label: 'Run ID', render: v => <span style={{ fontFamily: 'monospace', color: 'var(--accent-blue)', fontSize: 11 }}>{v}</span> },
              { key: 'model', label: 'Model' },
              { key: 'dataset', label: 'Dataset' },
              { key: 'lr', label: 'LR', render: v => <span style={{ fontFamily: 'monospace', fontSize: 11 }}>{v}</span> },
              { key: 'batch', label: 'Batch' },
              { key: 'epochs', label: 'Epochs' },
              { key: 'accuracy', label: 'Accuracy', render: v => v ? <span style={{ color: 'var(--success)' }}>{(v * 100).toFixed(1)}%</span> : '—' },
              { key: 'iou', label: 'IoU', render: v => v ? (v).toFixed(3) : '—' },
              { key: 'dice', label: 'Dice', render: v => v ? (v).toFixed(3) : '—' },
              { key: 'duration', label: 'Duration' },
              { key: 'user', label: 'User', render: v => v.split(' ').map(w => w[0]).join('') },
              { key: 'status', label: 'Status', render: v => <Badge color={{ Completed: 'green', Running: 'blue', Pending: 'yellow', Failed: 'red' }[v] || 'gray'}>{v}</Badge> },
              { key: 'id', label: 'Compare', render: (v, row) => (
                <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); setCompareRuns(prev => prev.length < 2 && !prev.find(r => r.id === row.id) ? [...prev, row] : prev); }}>
                  {compareRuns.find(r => r.id === row.id) ? '✓' : '+'}
                </Button>
              )},
            ]}
            data={EXPERIMENTS}
          />
        </div>
      )}

      {tab === 'activity' && can('canAccessAdmin') && (
        <div>
          <Table
            columns={[
              { key: 'ts', label: 'Timestamp', render: v => <span style={{ fontFamily: 'monospace', fontSize: 11 }}>{v}</span> },
              { key: 'user', label: 'User' },
              { key: 'action', label: 'Action' },
              { key: 'module', label: 'Module', render: v => <Badge color="blue" style={{ fontSize: 9 }}>{v}</Badge> },
              { key: 'details', label: 'Details', style: { color: 'var(--text-secondary)' } },
              { key: 'result', label: 'Result', render: v => <Badge color={{ success: 'green', running: 'blue', warning: 'yellow', error: 'red' }[v] || 'gray'}>{v}</Badge> },
            ]}
            data={USER_ACTIVITY}
          />
        </div>
      )}
    </div>
  );
}
