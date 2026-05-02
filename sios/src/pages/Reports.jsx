import { useState } from 'react';
import { FileText, Download, Printer } from 'lucide-react';
import { Button, Badge } from '../components/ui';
import { useAuth } from '../auth/AuthContext';

const TEMPLATES = [
  { id: 'seismic', label: 'Seismic Interpretation Report', color: 'var(--accent-blue)' },
  { id: 'model', label: 'AI Model Performance Report', color: 'var(--accent-purple)' },
  { id: 'drilling', label: 'Drilling Decision Recommendation', color: 'var(--success)' },
];

function SeismicReport({ auth }) {
  return `
    <div style="font-family: Georgia, serif; max-width: 800px; margin: 0 auto; padding: 48px; color: #1a1a1a; background: #fff;">
      <div style="text-align:center; border-bottom: 2px solid #1a1a1a; padding-bottom: 24px; margin-bottom: 32px;">
        <div style="font-size:11px; letter-spacing:3px; color:#666; margin-bottom:8px;">CONFIDENTIAL — INTERNAL USE ONLY</div>
        <div style="font-size:28px; font-weight:700; margin-bottom:8px;">Seismic Interpretation Report</div>
        <div style="font-size:14px; color:#444;">Block 31 — Rub' al Khali · Saudi Arabia</div>
        <div style="font-size:12px; color:#666; margin-top:8px;">Prepared by: ${auth?.user?.name} · ${new Date().toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' })} · ${auth?.project?.name}</div>
      </div>
      <h2 style="font-size:16px; border-bottom:1px solid #ddd; padding-bottom:6px; margin-bottom:12px;">Executive Summary</h2>
      <p style="line-height:1.8; margin-bottom:20px; font-size:13px;">Integrated seismic interpretation of the Block 31 3D survey has identified three primary prospects with combined estimated recoverable resources of 108.3 MMbbl. The leading prospect, Location D7, exhibits a confirmed DHI response with 89% AI confidence and a four-way dip-closed anticline with 8.4 km² closure area. Fault Detector v1.4 has mapped seven fault segments, with the dominant NW-SE trending normal fault system providing potential lateral seal for the primary target.</p>
      <h2 style="font-size:16px; border-bottom:1px solid #ddd; padding-bottom:6px; margin-bottom:12px;">Data Summary</h2>
      <table style="width:100%; border-collapse:collapse; font-size:12px; margin-bottom:20px;">
        <tr style="background:#f5f5f5;"><th style="padding:8px; text-align:left; border:1px solid #ddd;">Parameter</th><th style="padding:8px; text-align:left; border:1px solid #ddd;">Value</th></tr>
        ${[['Dataset','Block 31 Full Stack 3D Survey v2.1'],['Inline Range','1 – 480'],['Xline Range','1 – 360'],['Time Range','0 – 2000ms TWT'],['Sample Rate','4ms'],['Total Traces','172,800'],['Quality Score','91/100'],['SNR','28.4 dB']].map(([k,v]) => `<tr><td style="padding:7px 8px; border:1px solid #ddd;">${k}</td><td style="padding:7px 8px; border:1px solid #ddd; font-family:monospace;">${v}</td></tr>`).join('')}
      </table>
      <h2 style="font-size:16px; border-bottom:1px solid #ddd; padding-bottom:6px; margin-bottom:12px;">Interpretation Findings</h2>
      <ul style="font-size:13px; line-height:1.9; margin-bottom:20px; padding-left:20px;">
        <li>Three seismic horizons mapped: H1 (Top Cretaceous Carbonate, ~800ms), H2 (Base Cretaceous Unconformity, ~1200ms), H3 (Top Jurassic Source Rock, ~1800ms)</li>
        <li>Seven fault segments identified; dominant NW-SE normal fault system with maximum throw of ~45ms at H2 level</li>
        <li>DHI anomaly confirmed at IL 42, XL 67 — amplitude conformance to structural closure, AVO Class II-III response</li>
        <li>Anticline closure at D7 location: 8.4 km² area, 180ms structural relief, 4-way dip closure confirmed</li>
        <li>Well-A1 synthetic seismogram calibration confirms H2 as primary reservoir marker</li>
      </ul>
      <h2 style="font-size:16px; border-bottom:1px solid #ddd; padding-bottom:6px; margin-bottom:12px;">AI Model Results</h2>
      <table style="width:100%; border-collapse:collapse; font-size:12px; margin-bottom:20px;">
        <tr style="background:#f5f5f5;"><th style="padding:8px; border:1px solid #ddd;">Model</th><th style="padding:8px; border:1px solid #ddd;">Version</th><th style="padding:8px; border:1px solid #ddd;">Accuracy</th><th style="padding:8px; border:1px solid #ddd;">IoU</th><th style="padding:8px; border:1px solid #ddd;">Dice</th></tr>
        ${[['CNN Feature Extractor','v3.1','89.1%','0.847','0.862'],['Fault Detector','v1.4','92.3%','0.881','0.894'],['U-Net Segmenter','v2.0','74.3%','0.698','0.721']].map(([m,v,a,i,d]) => `<tr><td style="padding:7px 8px; border:1px solid #ddd;">${m}</td><td style="padding:7px 8px; border:1px solid #ddd; font-family:monospace;">${v}</td><td style="padding:7px 8px; border:1px solid #ddd;">${a}</td><td style="padding:7px 8px; border:1px solid #ddd;">${i}</td><td style="padding:7px 8px; border:1px solid #ddd;">${d}</td></tr>`).join('')}
      </table>
      <h2 style="font-size:16px; border-bottom:1px solid #ddd; padding-bottom:6px; margin-bottom:12px;">Recommendations</h2>
      <ul style="font-size:13px; line-height:1.9; padding-left:20px;">
        <li>Prioritise Location D7 for the 2026 drilling campaign (NPV $284M, AI confidence 89%)</li>
        <li>Commission pre-drill risk assessment and well design for D7 and A3</li>
        <li>Perform AVO cross-plot analysis to confirm DHI fluid type</li>
        <li>Run cap rock integrity analysis on the overlying shale unit at D7</li>
        <li>Complete U-Net Segmenter training to improve facies segmentation accuracy</li>
      </ul>
      <div style="margin-top:40px; padding-top:16px; border-top:1px solid #ddd; font-size:11px; color:#888; text-align:center;">
        SIOS v1.0 · ${auth?.project?.name} · CONFIDENTIAL · Generated ${new Date().toISOString()}
      </div>
    </div>
  `;
}

function ModelReport({ auth }) {
  return `
    <div style="font-family: Georgia, serif; max-width: 800px; margin: 0 auto; padding: 48px; color: #1a1a1a; background: #fff;">
      <div style="text-align:center; border-bottom: 2px solid #1a1a1a; padding-bottom: 24px; margin-bottom: 32px;">
        <div style="font-size:11px; letter-spacing:3px; color:#666; margin-bottom:8px;">CONFIDENTIAL — INTERNAL USE ONLY</div>
        <div style="font-size:28px; font-weight:700; margin-bottom:8px;">AI Model Performance Report</div>
        <div style="font-size:14px; color:#444;">SIOS AI System · Q2 2026</div>
        <div style="font-size:12px; color:#666; margin-top:8px;">Prepared by: ${auth?.user?.name} · ${new Date().toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' })}</div>
      </div>
      <h2 style="font-size:16px; border-bottom:1px solid #ddd; padding-bottom:6px; margin-bottom:12px;">Executive Summary</h2>
      <p style="line-height:1.8; margin-bottom:20px; font-size:13px;">The SIOS AI system currently operates four models across seismic interpretation tasks. The CNN Feature Extractor v3.1 and Fault Detector v1.4 are deployed in production with accuracy scores of 89.1% and 92.3% respectively. The U-Net Segmenter v2.0 is currently in training. All production models exceed the 85% accuracy threshold required for operational deployment.</p>
      <h2 style="font-size:16px; border-bottom:1px solid #ddd; padding-bottom:6px; margin-bottom:12px;">Model Performance Summary</h2>
      <table style="width:100%; border-collapse:collapse; font-size:12px; margin-bottom:20px;">
        <tr style="background:#f5f5f5;"><th style="padding:8px; border:1px solid #ddd;">Model</th><th style="padding:8px; border:1px solid #ddd;">Status</th><th style="padding:8px; border:1px solid #ddd;">Accuracy</th><th style="padding:8px; border:1px solid #ddd;">IoU</th><th style="padding:8px; border:1px solid #ddd;">F1</th><th style="padding:8px; border:1px solid #ddd;">Dataset</th></tr>
        ${[['CNN Feature Extractor v3.1','Production','89.1%','0.847','0.890','Block 31 v2.1'],['Fault Detector v1.4','Production','92.3%','0.881','0.924','NS-22 v3.0'],['U-Net Segmenter v2.0','Training','74.3%','0.698','0.746','ODF-7 v1.3'],['Horizon Tracker v1.0','Ready','—','—','—','Block 31 v2.1']].map(([m,s,a,i,f,d]) => `<tr><td style="padding:7px 8px; border:1px solid #ddd;">${m}</td><td style="padding:7px 8px; border:1px solid #ddd;">${s}</td><td style="padding:7px 8px; border:1px solid #ddd;">${a}</td><td style="padding:7px 8px; border:1px solid #ddd;">${i}</td><td style="padding:7px 8px; border:1px solid #ddd;">${f}</td><td style="padding:7px 8px; border:1px solid #ddd;">${d}</td></tr>`).join('')}
      </table>
      <h2 style="font-size:16px; border-bottom:1px solid #ddd; padding-bottom:6px; margin-bottom:12px;">Recommendations</h2>
      <ul style="font-size:13px; line-height:1.9; padding-left:20px;">
        <li>Complete U-Net Segmenter training and evaluate against Block 31 dataset</li>
        <li>Initiate Horizon Tracker training run using Block 31 v2.1 as primary dataset</li>
        <li>Schedule quarterly retraining of CNN Feature Extractor with new data</li>
        <li>Investigate U-Net validation loss plateau at epoch 20–25 — consider learning rate reduction</li>
      </ul>
    </div>
  `;
}

function DrillingReport({ auth }) {
  return `
    <div style="font-family: Georgia, serif; max-width: 800px; margin: 0 auto; padding: 48px; color: #1a1a1a; background: #fff;">
      <div style="text-align:center; border-bottom: 2px solid #1a1a1a; padding-bottom: 24px; margin-bottom: 32px;">
        <div style="font-size:11px; letter-spacing:3px; color:#666; margin-bottom:8px;">CONFIDENTIAL — MANAGEMENT REVIEW</div>
        <div style="font-size:28px; font-weight:700; margin-bottom:8px;">Drilling Decision Recommendation</div>
        <div style="font-size:14px; color:#444;">Block 31 — Rub' al Khali · 2026 Campaign</div>
        <div style="font-size:12px; color:#666; margin-top:8px;">Prepared by: ${auth?.user?.name} · ${new Date().toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' })}</div>
      </div>
      <h2 style="font-size:16px; border-bottom:1px solid #ddd; padding-bottom:6px; margin-bottom:12px;">Executive Summary</h2>
      <p style="line-height:1.8; margin-bottom:20px; font-size:13px;">Based on integrated seismic interpretation and AI-assisted analysis of 15 drilling candidates, this report recommends Location D7 as the primary drilling target for the 2026 campaign, with Location A3 as the secondary target. The combined two-well programme has an estimated NPV of $525M at $85/bbl oil price and remains NPV-positive at $60/bbl.</p>
      <h2 style="font-size:16px; border-bottom:1px solid #ddd; padding-bottom:6px; margin-bottom:12px;">Primary Recommendation: Location D7</h2>
      <table style="width:100%; border-collapse:collapse; font-size:12px; margin-bottom:20px;">
        <tr style="background:#f5f5f5;"><th style="padding:8px; border:1px solid #ddd;">Parameter</th><th style="padding:8px; border:1px solid #ddd;">Value</th></tr>
        ${[['Location ID','D7'],['Inline / Xline','312 / 187'],['Target Depth','2,840m MD'],['AI Confidence','89%'],['Risk Score','28 (Low)'],['NPV Estimate','$284M'],['Reservoir Volume','38.4 MMbbl'],['Estimated Porosity','22.1%'],['Water Saturation','31%'],['Net-to-Gross','0.68']].map(([k,v]) => `<tr><td style="padding:7px 8px; border:1px solid #ddd;">${k}</td><td style="padding:7px 8px; border:1px solid #ddd; font-family:monospace;">${v}</td></tr>`).join('')}
      </table>
      <h2 style="font-size:16px; border-bottom:1px solid #ddd; padding-bottom:6px; margin-bottom:12px;">Key Risks</h2>
      <ul style="font-size:13px; line-height:1.9; padding-left:20px; margin-bottom:20px;">
        <li><strong>Top Seal:</strong> Cap rock integrity at D7 requires pre-drill analysis. Overlying shale unit shows minor lateral variation in seismic character.</li>
        <li><strong>Fault Proximity (A3):</strong> Location A3 is within 500m of Fault F-2. Fault seal analysis recommended before spudding.</li>
        <li><strong>Oil Price Sensitivity:</strong> NPV remains positive at $60/bbl for both D7 and A3. Breakeven price for D7 estimated at $42/bbl.</li>
      </ul>
      <h2 style="font-size:16px; border-bottom:1px solid #ddd; padding-bottom:6px; margin-bottom:12px;">Next Steps</h2>
      <ul style="font-size:13px; line-height:1.9; padding-left:20px;">
        <li>Obtain management approval for 2026 two-well drilling programme</li>
        <li>Commission pre-drill risk assessment for D7 and A3</li>
        <li>Initiate well design and regulatory submission process</li>
        <li>Schedule AVO analysis and cap rock integrity study for D7</li>
        <li>Perform fault seal analysis for A3 location</li>
      </ul>
      <div style="margin-top:40px; padding-top:16px; border-top:1px solid #ddd; font-size:11px; color:#888; text-align:center;">
        SIOS v1.0 · ${auth?.project?.name} · CONFIDENTIAL · Generated ${new Date().toISOString()}
      </div>
    </div>
  `;
}

export default function Reports() {
  const [selected, setSelected] = useState('seismic');
  const { auth } = useAuth();

  const reportHTML = selected === 'seismic' ? SeismicReport({ auth }) : selected === 'model' ? ModelReport({ auth }) : DrillingReport({ auth });

  function handlePrint() {
    const win = window.open('', '_blank');
    win.document.write(`<html><head><title>SIOS Report</title></head><body>${reportHTML}</body></html>`);
    win.document.close();
    win.print();
  }

  function handleExport() {
    const blob = new Blob([`<html><head><title>SIOS Report</title></head><body>${reportHTML}</body></html>`], { type: 'text/html' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `sios-report-${selected}-${Date.now()}.html`; a.click();
  }

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 56px)', overflow: 'hidden' }}>
      {/* Template selector */}
      <div style={{ width: 240, background: 'var(--bg-surface)', borderRight: '1px solid var(--border-subtle)', padding: 14, flexShrink: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 12, color: 'var(--text-secondary)', letterSpacing: 1, marginBottom: 12 }}>REPORT TEMPLATES</div>
        {TEMPLATES.map(t => (
          <div key={t.id} onClick={() => setSelected(t.id)} style={{
            padding: '10px 12px', borderRadius: 6, cursor: 'pointer', marginBottom: 6,
            background: selected === t.id ? 'rgba(59,127,232,0.08)' : 'rgba(255,255,255,0.02)',
            border: `1px solid ${selected === t.id ? 'rgba(59,127,232,0.3)' : 'var(--border-subtle)'}`,
            borderLeft: `3px solid ${selected === t.id ? t.color : 'transparent'}`,
          }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <FileText size={13} color={t.color} />
              <span style={{ fontSize: 12, fontWeight: selected === t.id ? 500 : 400, color: selected === t.id ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{t.label}</span>
            </div>
          </div>
        ))}
        <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Button variant="primary" size="sm" icon={<Printer size={12} />} onClick={handlePrint} style={{ width: '100%', justifyContent: 'center' }}>Print / PDF</Button>
          <Button variant="ghost" size="sm" icon={<Download size={12} />} onClick={handleExport} style={{ width: '100%', justifyContent: 'center' }}>Export HTML</Button>
        </div>
      </div>

      {/* Preview */}
      <div style={{ flex: 1, overflow: 'auto', background: '#e8e8e8', padding: 24 }}>
        <div dangerouslySetInnerHTML={{ __html: reportHTML }} style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.3)', borderRadius: 4 }} />
      </div>
    </div>
  );
}
