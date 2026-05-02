import { useState } from 'react';
import { Database, Eye } from 'lucide-react';
import { DATASETS } from '../mock/datasets';
import { Table, Badge, Card, Button } from '../components/ui';
import CopilotBubble from '../components/copilot/CopilotBubble';

export default function DatasetRegistry() {
  const [selected, setSelected] = useState(DATASETS[0]);

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 56px)', overflow: 'hidden' }}>
      {/* List */}
      <div style={{ width: 260, background: 'var(--bg-surface)', borderRight: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border-subtle)', fontWeight: 600, fontSize: 12, color: 'var(--text-secondary)', letterSpacing: 1 }}>DATASET REGISTRY</div>
        {DATASETS.map(ds => (
          <div key={ds.id} onClick={() => setSelected(ds)} style={{
            padding: '12px 14px', cursor: 'pointer', borderBottom: '1px solid rgba(30,42,58,0.4)',
            background: selected?.id === ds.id ? 'rgba(59,127,232,0.08)' : 'transparent',
            borderLeft: selected?.id === ds.id ? '2px solid var(--accent-blue)' : '2px solid transparent',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 12, fontWeight: 500, color: selected?.id === ds.id ? 'var(--accent-blue)' : 'var(--text-primary)' }}>{ds.name.split('—')[0].trim()}</span>
              <Badge color="green" style={{ fontSize: 9 }}>{ds.status}</Badge>
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{ds.operator} · {ds.version}</div>
            <div style={{ marginTop: 6, height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2 }}>
              <div style={{ width: `${ds.qualityScore}%`, height: '100%', background: ds.qualityScore > 85 ? 'var(--success)' : ds.qualityScore > 70 ? 'var(--warning)' : 'var(--danger)', borderRadius: 2 }} />
            </div>
            <div style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 2 }}>QC: {ds.qualityScore}/100</div>
          </div>
        ))}
      </div>

      {/* Detail */}
      {selected && (
        <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{selected.name}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{selected.operator} · {selected.country} · Block {selected.block}</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <CopilotBubble module="data" context={{ datasetName: selected.name }} title="Data Copilot" />
              <Badge color="green">{selected.status}</Badge>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
            {[
              ['Quality Score', `${selected.qualityScore}/100`, selected.qualityScore > 85 ? 'var(--success)' : 'var(--warning)'],
              ['SNR', `${selected.snrDb} dB`, 'var(--accent-blue)'],
              ['Missing Traces', selected.missingTraces, selected.missingTraces < 20 ? 'var(--success)' : 'var(--warning)'],
              ['Total Traces', selected.totalTraces.toLocaleString(), 'var(--text-primary)'],
              ['Size', `${selected.sizeGB} GB`, 'var(--text-primary)'],
              ['Version', selected.version, 'var(--accent-purple)'],
            ].map(([l, v, c]) => (
              <div key={l} className="card" style={{ padding: '12px 14px' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{l}</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: c }}>{v}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="card" style={{ padding: 14 }}>
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 10 }}>Survey Parameters</div>
              {[
                ['Inline Range', `${selected.inlineRange[0]} – ${selected.inlineRange[1]}`],
                ['Xline Range', `${selected.xlineRange[0]} – ${selected.xlineRange[1]}`],
                ['Time Range', `${selected.timeRange[0]} – ${selected.timeRange[1]}ms`],
                ['Sample Rate', `${selected.sampleRate}ms`],
                ['Inlines', selected.inlines],
                ['Xlines', selected.xlines],
                ['Samples', selected.samples],
                ['CRS', selected.crs],
                ['Coordinate System', selected.coordinateSystem],
              ].map(([l, v]) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid rgba(30,42,58,0.4)' }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{l}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-primary)', fontFamily: 'monospace' }}>{v}</span>
                </div>
              ))}
            </div>
            <div className="card" style={{ padding: 14 }}>
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 10 }}>Provenance</div>
              {[
                ['Uploaded By', selected.uploadedBy],
                ['Uploaded At', new Date(selected.uploadedAt).toLocaleString()],
                ['Operator', selected.operator],
                ['Block', selected.block],
                ['Country', selected.country],
                ['Horizons Detected', selected.horizons],
                ['Fault Indicators', selected.faultIndicators],
              ].map(([l, v]) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid rgba(30,42,58,0.4)' }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{l}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-primary)' }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
