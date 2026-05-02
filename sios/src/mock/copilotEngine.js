// Copilot Engine — context-aware AI response generator

export function generateResponse(context = {}, query = '') {
  const q = query.toLowerCase().trim();
  const { module, activeInline, activeXline, activeTime, modelActive, datasetName, candidates } = context;

  // ── INTERPRETATION / SEISMIC VIEWER COPILOT ──────────────────────────────
  if (module === 'interpretation' || module === 'seismic') {
    if (matches(q, ['bright spot', 'bright amplitude', 'high amplitude', 'dhi'])) {
      return {
        observation: `Anomalously high amplitude detected at Inline ${activeInline ?? 42}, Xline ${activeXline ?? 67}, TWT ~${activeTime ?? 1240}ms.`,
        interpretation: 'This bright spot is consistent with a Direct Hydrocarbon Indicator (DHI). The amplitude-versus-offset (AVO) response suggests Class II-III behaviour, indicative of gas-charged sands. The lateral extent (~3.2 km²) and conformance to structural closure support a viable trap geometry.',
        confidence: 81,
        recommendation: 'Perform AVO cross-plot analysis and extract near/far stack amplitude ratios. Cross-reference with Well-B3 log data to calibrate the fluid response.',
        followUp: ['What is the estimated reservoir volume?', 'Show AVO class analysis', 'Compare with Well-B3 response'],
        sources: ['Amplitude analysis', 'U-Net v3.1 prediction', 'Block 31 v2.1 dataset'],
      };
    }
    if (matches(q, ['structure', 'anticline', 'dome', 'closure', 'trap'])) {
      return {
        observation: `Structural closure identified centred near Inline ${activeInline ?? 55}, Xline ${activeXline ?? 48}.`,
        interpretation: 'The seismic data reveals a four-way dip-closed anticline with approximately 180ms of structural relief. The crest is at ~1180ms TWT. Fault-bounded to the northeast (Fault F-3), which may act as a lateral seal. Closure area estimated at 8.4 km².',
        confidence: 87,
        recommendation: 'Map the full closure using horizon auto-tracking. Verify seal integrity along the F-3 fault plane using fault attribute analysis.',
        followUp: ['Is the fault sealing?', 'What is the spill point depth?', 'Estimate trap volume'],
        sources: ['Horizon interpretation', 'Fault Detector v1.4', 'Structural mapping'],
      };
    }
    if (matches(q, ['fault', 'discontinuity', 'break', 'offset'])) {
      return {
        observation: `Fault discontinuity detected crossing Inline ${activeInline ?? 38}–${(activeInline ?? 38) + 22}, with apparent throw of ~45ms TWT.`,
        interpretation: 'A NW-SE trending normal fault with ~45ms throw at the target horizon level. The fault appears to be growth-related, with increased throw at depth. Juxtaposition analysis suggests sand-on-shale contact across the fault plane — potential sealing configuration.',
        confidence: 79,
        recommendation: 'Extract fault attribute (similarity/coherence) volume to map full fault geometry. Run fault seal analysis using Shale Gouge Ratio (SGR) estimation.',
        followUp: ['Is this fault sealing or leaking?', 'Map the full fault network', 'What is the fault throw at reservoir level?'],
        sources: ['Fault Detector v1.4', 'Similarity attribute', 'Coherence volume'],
      };
    }
    if (matches(q, ['confidence', 'certainty', 'reliable', 'accuracy'])) {
      return {
        observation: `Model confidence at Inline ${activeInline ?? 42}, Xline ${activeXline ?? 67}: 81%.`,
        interpretation: 'Confidence is moderate-high. The U-Net segmenter shows strong agreement with the amplitude envelope in this zone. Lower confidence regions (< 60%) are present near the fault edges where trace quality degrades. The CNN feature extractor IoU of 0.847 supports reliable facies delineation in this area.',
        confidence: 81,
        recommendation: 'Review low-confidence zones manually. Consider retraining with additional labelled examples near fault boundaries.',
        followUp: ['Where are the low-confidence zones?', 'How can I improve model confidence?', 'Show confidence heatmap'],
        sources: ['CNN Feature Extractor v3.1', 'U-Net Segmenter v2.0', 'Validation dataset metrics'],
      };
    }
    if (matches(q, ['horizon', 'reflector', 'layer', 'pick'])) {
      return {
        observation: `Three primary horizons identified in the active section. H1 at ~800ms, H2 at ~1200ms, H3 at ~1800ms TWT.`,
        interpretation: 'H1 corresponds to the top of the Upper Cretaceous carbonate unit. H2 marks the base Cretaceous unconformity — a regionally mappable marker. H3 is interpreted as the top of the Jurassic source rock interval. All three show good lateral continuity with minor disruption at fault intersections.',
        confidence: 88,
        recommendation: 'Auto-track H2 across the full survey volume as a reference datum. Use H1–H2 interval for reservoir characterisation.',
        followUp: ['Auto-track Horizon H2', 'What is the H1-H2 isochron?', 'Are there sub-seismic features between H1 and H2?'],
        sources: ['Horizon Tracker v1.0', 'Well-A1 synthetic seismogram', 'Regional stratigraphy'],
      };
    }
    return {
      observation: `Analysing seismic section at Inline ${activeInline ?? 50}, Xline ${activeXline ?? 50}, TWT ${activeTime ?? 1000}ms.`,
      interpretation: 'The amplitude pattern in this zone shows moderate reflectivity with subtle lateral variation. No immediate anomalies flagged by the active AI model, though the similarity attribute indicates a minor discontinuity ~8 traces to the northeast.',
      confidence: 72,
      recommendation: 'Zoom into the discontinuity zone and run the Fault Detector model for a detailed assessment.',
      followUp: ['Explain the amplitude variation here', 'Run fault detection on this section', 'What horizons are present?'],
      sources: ['Amplitude analysis', 'Similarity attribute', 'Block 31 v2.1'],
    };
  }

  // ── DATA COPILOT ──────────────────────────────────────────────────────────
  if (module === 'data') {
    if (matches(q, ['quality', 'score', 'low quality', 'snr', 'noise'])) {
      return {
        observation: `Dataset "${datasetName ?? 'ODF-7 Partial Stack'}" quality score: 78/100. SNR: 21.7 dB.`,
        interpretation: 'The below-average quality score is primarily driven by 63 missing traces (0.07% of total) and a relatively low SNR of 21.7 dB. The missing traces are clustered in the northwest corner of the survey, likely due to acquisition geometry gaps. SNR below 25 dB can affect attribute reliability.',
        confidence: 85,
        recommendation: 'Apply trace interpolation (POCS or Fourier-based) to fill missing traces. Consider a pre-processing noise attenuation pass (FX deconvolution) to improve SNR before running AI models.',
        followUp: ['How do I fix missing traces?', 'Will this affect model accuracy?', 'Compare with Block 31 dataset quality'],
        sources: ['QC report', 'Trace header analysis', 'SNR computation'],
      };
    }
    if (matches(q, ['ready', 'valid', 'use', 'process'])) {
      return {
        observation: `Dataset status: Ready. All 6 pipeline stages completed successfully.`,
        interpretation: 'The dataset has passed schema validation, cube construction, attribute extraction, and QC checks. Quality score of 91/100 (Block 31) indicates high data integrity. 3 horizons and 7 fault indicators were automatically detected during ingestion.',
        confidence: 91,
        recommendation: 'Dataset is ready for AI model training and interpretation. Recommend starting with the CNN Feature Extractor for initial facies mapping.',
        followUp: ['Which model should I run first?', 'Open in Seismic Viewer', 'Show attribute summary'],
        sources: ['Ingestion pipeline', 'QC engine', 'Auto-detection results'],
      };
    }
    if (matches(q, ['compare', 'difference', 'vs', 'versus', 'datasets'])) {
      return {
        observation: 'Comparing all 3 registered datasets.',
        interpretation: 'Block 31 (91 QC, 28.4 dB SNR) is the highest quality dataset — ideal for model training. NS-22 (94 QC, 33.1 dB SNR) has the best signal quality but is depth-domain, requiring additional processing for time-domain models. ODF-7 (78 QC, 21.7 dB SNR) has the most missing traces and lowest SNR — use with caution for quantitative interpretation.',
        confidence: 88,
        recommendation: 'Use Block 31 or NS-22 for primary model training. ODF-7 can be used for transfer learning validation after noise attenuation.',
        followUp: ['Which dataset is best for fault detection?', 'Can I merge datasets?', 'Show SNR comparison chart'],
        sources: ['Dataset registry', 'QC metrics', 'Ingestion logs'],
      };
    }
    return {
      observation: `Dataset "${datasetName ?? 'Block 31'}" loaded and registered.`,
      interpretation: 'The dataset is in good standing with no critical issues flagged. All required columns (inline, crossline, time, amplitude) are present and validated.',
      confidence: 88,
      recommendation: 'Proceed to the Seismic Viewer to inspect the data visually before running AI models.',
      followUp: ['What is the quality score?', 'Are there missing traces?', 'Open in Seismic Viewer'],
      sources: ['Dataset registry', 'Schema validator'],
    };
  }

  // ── MODEL COPILOT ─────────────────────────────────────────────────────────
  if (module === 'models') {
    if (matches(q, ['loss', 'high loss', 'not converging', 'diverging'])) {
      return {
        observation: `Current training loss is elevated. Model: ${modelActive ?? 'U-Net Segmenter'}.`,
        interpretation: 'The validation loss is tracking above training loss by >0.05, which is an early sign of overfitting. This is common with the ODF-7 dataset due to its lower SNR (21.7 dB). The loss curve shows a plateau around epoch 20–25, suggesting the learning rate may be too high for fine-grained convergence.',
        confidence: 76,
        recommendation: 'Reduce learning rate by 50% (try 5e-5). Add L2 regularisation (weight_decay=1e-4). Consider early stopping with patience=8 epochs.',
        followUp: ['Should I reduce the learning rate?', 'Is the model overfitting?', 'What regularisation should I add?'],
        sources: ['Training log', 'Loss curve analysis', 'Hyperparameter history'],
      };
    }
    if (matches(q, ['converging', 'good', 'progress', 'training well'])) {
      return {
        observation: `Model ${modelActive ?? 'CNN Feature Extractor'} is converging normally.`,
        interpretation: 'Both training and validation loss are decreasing smoothly. The gap between train and val loss is within acceptable bounds (<0.04). IoU has improved from 0.51 at epoch 1 to the current value, consistent with expected learning dynamics for this architecture.',
        confidence: 83,
        recommendation: 'Continue training. Consider reducing learning rate by 10× after epoch 40 for fine-tuning (cosine annealing schedule).',
        followUp: ['When will training complete?', 'What is the expected final accuracy?', 'Should I add data augmentation?'],
        sources: ['Training metrics', 'Loss curve', 'Benchmark comparisons'],
      };
    }
    if (matches(q, ['compare version', 'version', 'best version', 'which version'])) {
      return {
        observation: `Comparing versions for ${modelActive ?? 'CNN Feature Extractor'}.`,
        interpretation: 'v3.1 outperforms all previous versions: Accuracy 89.1% (+1.7% vs v3.0), IoU 0.847 (+0.016). The improvement is attributed to the kernel size reduction from 5×5 to 3×3 and the addition of dropout (0.25). v2.1 remains a viable fallback with 85.1% accuracy.',
        confidence: 91,
        recommendation: 'Deploy v3.1 to production. Archive v2.1 as a fallback. Deprecate v3.0.',
        followUp: ['Deploy v3.1 to production', 'What changed between v3.0 and v3.1?', 'Show metric comparison table'],
        sources: ['Version registry', 'Training logs', 'Validation metrics'],
      };
    }
    return {
      observation: `Model ${modelActive ?? 'CNN Feature Extractor'} — status overview.`,
      interpretation: 'The model is performing within expected parameters. Current metrics are consistent with the training dataset characteristics.',
      confidence: 78,
      recommendation: 'Review the training curves and consider running inference on the full Block 31 dataset.',
      followUp: ['Show training loss curve', 'Run inference now', 'Compare with other models'],
      sources: ['Model registry', 'Training metrics'],
    };
  }

  // ── DECISION COPILOT ─────────────────────────────────────────────────────
  if (module === 'decision') {
    if (matches(q, ['best', 'top', 'recommend', 'highest', 'risk-adjusted'])) {
      return {
        observation: 'Analysing all 15 drilling candidates by risk-adjusted NPV.',
        interpretation: 'Location D7 ranks #1 with NPV $284M, AI confidence 89%, and a low-medium risk score of 34. It sits in the structural sweet spot with confirmed DHI response and good reservoir quality indicators (porosity ~22%, net-to-gross 0.68). Location A3 is the runner-up at NPV $241M with slightly higher technical risk due to fault proximity.',
        confidence: 89,
        recommendation: 'Prioritise D7 for the next drilling campaign. Commission a full pre-drill risk assessment and well design. A3 should be included in the same campaign as a secondary target.',
        followUp: ['Explain why D7 has high confidence', 'Compare D7 and A3', 'Generate drilling recommendation memo'],
        sources: ['AI confidence model', 'NPV calculator', 'Risk matrix analysis'],
      };
    }
    if (matches(q, ['explain', 'd7', 'location d7', 'why d7', 'confidence d7'])) {
      return {
        observation: 'Location D7 — detailed analysis. Inline 312, Xline 187, Depth 2840m.',
        interpretation: 'D7 confidence (89%) is driven by: (1) Strong DHI response — amplitude anomaly conforming to structural closure, (2) Fault Detector v1.4 shows no through-going faults within 500m radius, (3) Reservoir quality: estimated porosity 22.1%, water saturation 31%, net-to-gross 0.68 from seismic inversion, (4) Structural closure of 8.4 km² with 4-way dip closure confirmed.',
        confidence: 89,
        recommendation: 'D7 is a Tier-1 drilling candidate. Recommend fast-tracking to well planning. Key risk: top seal integrity — run cap rock analysis on the overlying shale unit.',
        followUp: ['What is the cap rock risk?', 'Estimate reservoir volume for D7', 'What is the NPV sensitivity to oil price?'],
        sources: ['Fault Detector v1.4', 'CNN Feature Extractor v3.1', 'Structural interpretation', 'AVO analysis'],
      };
    }
    if (matches(q, ['compare top', 'top 3', 'compare candidates', 'top three'])) {
      return {
        observation: 'Top 3 candidates: D7 (NPV $284M), A3 (NPV $241M), F12 (NPV $198M).',
        interpretation: 'D7 leads on NPV and confidence. A3 has the largest estimated reservoir volume (42 MMbbl) but higher technical risk due to a nearby fault. F12 has the lowest risk score (28) but smaller closure area limits upside. All three have AI confidence >80% and are in the "Sweet Spot" quadrant of the risk matrix.',
        confidence: 86,
        recommendation: 'D7 + A3 as a two-well campaign maximises risk-adjusted portfolio value. F12 as a low-risk appraisal well if budget allows a third well.',
        followUp: ['Generate a drilling memo for D7 and A3', 'What is the combined NPV of D7+A3?', 'Show risk matrix for top 3'],
        sources: ['Portfolio analysis', 'Risk matrix', 'NPV model'],
      };
    }
    if (matches(q, ['oil price', '$60', 'price drop', 'sensitivity', 'scenario'])) {
      return {
        observation: 'NPV sensitivity analysis at $60/bbl oil price.',
        interpretation: 'At $60/bbl (vs base case $85/bbl), NPV across all candidates decreases by 28–35%. D7 NPV drops from $284M to ~$189M — still strongly positive. A3 drops to ~$156M. Three lower-ranked candidates (K9, M2, H5) become NPV-negative at $60/bbl and should be deferred. The portfolio remains viable with 9 of 15 candidates NPV-positive at $60/bbl.',
        confidence: 82,
        recommendation: 'The top 5 candidates are robust to a $60/bbl scenario. Recommend proceeding with D7 and A3 even under downside price assumptions. Defer candidates ranked 8–15.',
        followUp: ['Show NPV waterfall at $60/bbl', 'Which candidates are NPV-negative at $60?', 'What is the breakeven oil price for D7?'],
        sources: ['NPV model', 'Scenario engine', 'Economic parameters'],
      };
    }
    if (matches(q, ['memo', 'recommendation memo', 'generate memo', 'report'])) {
      return {
        observation: 'Generating drilling recommendation memo.',
        interpretation: `DRILLING RECOMMENDATION MEMO\nProject: Block 31 — Rub' al Khali | Date: May 2026\n\nEXECUTIVE SUMMARY: Based on integrated seismic interpretation and AI-assisted analysis, Location D7 is recommended as the primary drilling target for the 2026 campaign. The location exhibits a confirmed DHI response, 4-way structural closure, and an AI confidence score of 89%.\n\nPRIMARY TARGET: D7 (IL 312, XL 187) — NPV $284M, Risk: Low-Medium\nSECONDARY TARGET: A3 (IL 156, XL 203) — NPV $241M, Risk: Medium\n\nKEY RISKS: Top seal integrity at D7; fault proximity at A3.\nNEXT STEPS: Pre-drill risk assessment, well design, regulatory submission.`,
        confidence: 88,
        recommendation: 'Review memo with the project team and submit for management approval. Attach seismic interpretation report and AI model outputs as supporting documentation.',
        followUp: ['Export this memo as PDF', 'Add economic assumptions to memo', 'Include risk matrix in memo'],
        sources: ['Integrated interpretation', 'AI confidence model', 'Economic model'],
      };
    }
    return {
      observation: 'Decision Support — 15 drilling candidates loaded.',
      interpretation: 'The current candidate list spans a confidence range of 61–89% with NPV estimates from $47M to $284M. 4 candidates are classified as low risk, 8 as medium risk, and 3 as high risk.',
      confidence: 84,
      recommendation: 'Focus on the top 5 candidates for the next drilling campaign. Use the What-If panel to stress-test NPV assumptions.',
      followUp: ['Which location has the best risk-adjusted return?', 'Compare top 3 candidates', 'What happens if oil price drops to $60?'],
      sources: ['Candidate database', 'Risk matrix', 'NPV model'],
    };
  }

  // ── FALLBACK ──────────────────────────────────────────────────────────────
  return {
    observation: 'Query received. Analysing available context.',
    interpretation: 'I can help you interpret seismic data, analyse AI model performance, evaluate drilling candidates, and assess dataset quality. Please provide more specific context or try one of the suggested questions below.',
    confidence: 70,
    recommendation: 'Navigate to a specific module and ask a context-specific question for the most accurate analysis.',
    followUp: ['Explain the current seismic section', 'What is the model confidence here?', 'Which drilling candidate is best?'],
    sources: ['SIOS Knowledge Base'],
  };
}

function matches(query, keywords) {
  return keywords.some(k => query.includes(k));
}
