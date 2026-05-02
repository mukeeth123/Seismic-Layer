// AI Engine — simulates model training and inference

export const AI_MODELS = [
  {
    id: 'm1',
    name: 'CNN Feature Extractor',
    status: 'Trained',
    version: 'v3.1',
    architecture: 'CNN',
    dataset: 'Block 31 — Full Stack 3D Survey',
    hyperparams: {
      learning_rate: 0.0003,
      batch_size: 32,
      optimizer: 'Adam',
      epochs: 50,
      dropout: 0.25,
      loss_function: 'BinaryCrossEntropy',
      kernel_size: '3×3',
      filters: [32, 64, 128, 256],
    },
    metrics: { accuracy: 0.891, iou: 0.847, dice: 0.862, precision: 0.903, recall: 0.878, f1: 0.890 },
    trainedAt: '2026-04-20T14:30:00Z',
    duration: '2h 14m',
    gpuSimulated: 'NVIDIA A100 (simulated)',
    description: 'Extracts multi-scale seismic features for downstream segmentation tasks.',
  },
  {
    id: 'm2',
    name: 'U-Net Segmenter',
    status: 'Training',
    version: 'v2.0',
    architecture: 'U-Net',
    dataset: 'Offshore Delta — ODF-7 Partial Stack',
    hyperparams: {
      learning_rate: 0.0001,
      batch_size: 16,
      optimizer: 'AdamW',
      epochs: 50,
      dropout: 0.3,
      loss_function: 'DiceLoss + BCE',
      kernel_size: '3×3',
      filters: [64, 128, 256, 512],
    },
    metrics: { accuracy: 0.743, iou: 0.698, dice: 0.721, precision: 0.762, recall: 0.731, f1: 0.746 },
    trainedAt: null,
    duration: 'In progress',
    gpuSimulated: 'NVIDIA V100 (simulated)',
    description: 'Encoder-decoder architecture for pixel-wise seismic facies segmentation.',
  },
  {
    id: 'm3',
    name: 'Fault Detector',
    status: 'Trained',
    version: 'v1.4',
    architecture: 'ResNet-34',
    dataset: 'North Sea NS-22 — Pre-Stack Depth',
    hyperparams: {
      learning_rate: 0.0005,
      batch_size: 24,
      optimizer: 'SGD + Momentum',
      epochs: 50,
      dropout: 0.2,
      loss_function: 'FocalLoss',
      kernel_size: '5×5',
      filters: [16, 32, 64, 128],
    },
    metrics: { accuracy: 0.923, iou: 0.881, dice: 0.894, precision: 0.941, recall: 0.908, f1: 0.924 },
    trainedAt: '2026-04-10T09:15:00Z',
    duration: '3h 42m',
    gpuSimulated: 'NVIDIA A100 (simulated)',
    description: 'Detects and delineates fault planes from 3D seismic amplitude volumes.',
  },
  {
    id: 'm4',
    name: 'Horizon Tracker',
    status: 'Ready',
    version: 'v1.0',
    architecture: 'LSTM + Attention',
    dataset: 'Block 31 — Full Stack 3D Survey',
    hyperparams: {
      learning_rate: 0.001,
      batch_size: 64,
      optimizer: 'Adam',
      epochs: 50,
      dropout: 0.15,
      loss_function: 'MSELoss',
      kernel_size: '1×1',
      filters: [128, 256],
    },
    metrics: { accuracy: 0.0, iou: 0.0, dice: 0.0, precision: 0.0, recall: 0.0, f1: 0.0 },
    trainedAt: null,
    duration: 'Not started',
    gpuSimulated: 'NVIDIA V100 (simulated)',
    description: 'Tracks seismic horizons across inlines using sequential attention mechanism.',
  },
];

export const MODEL_VERSIONS = {
  m1: [
    { version: 'v3.1', date: '2026-04-20', trainedBy: 'Dr. Khalid Al-Mansouri', dataset: 'Block 31 v2.1', accuracy: 0.891, notes: 'Best performing. Deployed to production.' },
    { version: 'v3.0', date: '2026-04-12', trainedBy: 'Priya Nair', dataset: 'Block 31 v2.0', accuracy: 0.874, notes: 'Improved kernel size from 5×5 to 3×3.' },
    { version: 'v2.1', date: '2026-03-28', trainedBy: 'Dr. Khalid Al-Mansouri', dataset: 'Block 31 v1.3', accuracy: 0.851, notes: 'Added dropout regularization.' },
  ],
  m2: [
    { version: 'v2.0', date: 'In progress', trainedBy: 'Priya Nair', dataset: 'ODF-7 v1.3', accuracy: null, notes: 'Training in progress.' },
    { version: 'v1.2', date: '2026-03-15', trainedBy: 'Priya Nair', dataset: 'ODF-7 v1.0', accuracy: 0.712, notes: 'Baseline U-Net.' },
  ],
  m3: [
    { version: 'v1.4', date: '2026-04-10', trainedBy: 'Alexandra Reeves', dataset: 'NS-22 v3.0', accuracy: 0.923, notes: 'FocalLoss improved minority class detection.' },
    { version: 'v1.3', date: '2026-03-22', trainedBy: 'Dr. Khalid Al-Mansouri', dataset: 'NS-22 v2.1', accuracy: 0.897, notes: 'Switched to ResNet-34 backbone.' },
    { version: 'v1.0', date: '2026-02-14', trainedBy: 'Priya Nair', dataset: 'NS-22 v1.0', accuracy: 0.831, notes: 'Initial release.' },
  ],
  m4: [
    { version: 'v1.0', date: 'Not trained', trainedBy: '—', dataset: 'Block 31 v2.1', accuracy: null, notes: 'Architecture defined. Awaiting training run.' },
  ],
};

// Generate training loss curves
export function generateTrainingCurves(epochs = 50, modelId = 'm1') {
  const curves = [];
  const seeds = { m1: { initLoss: 0.72, finalLoss: 0.08, noise: 0.015 },
                  m2: { initLoss: 0.85, finalLoss: 0.22, noise: 0.025 },
                  m3: { initLoss: 0.68, finalLoss: 0.06, noise: 0.012 },
                  m4: { initLoss: 0.90, finalLoss: 0.15, noise: 0.020 } };
  const s = seeds[modelId] || seeds.m1;

  for (let e = 1; e <= epochs; e++) {
    const progress = e / epochs;
    const decay = Math.exp(-4 * progress);
    const trainLoss = s.finalLoss + (s.initLoss - s.finalLoss) * decay + (Math.random() - 0.5) * s.noise;
    const valLoss = trainLoss + 0.03 + (Math.random() - 0.5) * s.noise * 1.5 + (progress > 0.7 ? (progress - 0.7) * 0.08 : 0);
    const acc = 1 - valLoss * 0.85;
    const iou = acc * 0.94;
    const dice = acc * 0.96;
    curves.push({
      epoch: e,
      trainLoss: Math.max(0.01, +trainLoss.toFixed(4)),
      valLoss: Math.max(0.02, +valLoss.toFixed(4)),
      accuracy: Math.min(0.99, +acc.toFixed(4)),
      iou: Math.min(0.97, +iou.toFixed(4)),
      dice: Math.min(0.98, +dice.toFixed(4)),
    });
  }
  return curves;
}

export const EXPERIMENTS = [
  { id: 'run-001', model: 'CNN Feature Extractor', dataset: 'Block 31 v2.1', lr: 0.0003, batch: 32, epochs: 50, accuracy: 0.891, iou: 0.847, dice: 0.862, duration: '2h 14m', user: 'Dr. Khalid Al-Mansouri', status: 'Completed', date: '2026-04-20' },
  { id: 'run-002', model: 'CNN Feature Extractor', dataset: 'Block 31 v2.0', lr: 0.0005, batch: 32, epochs: 50, accuracy: 0.874, iou: 0.831, dice: 0.848, duration: '2h 08m', user: 'Priya Nair', status: 'Completed', date: '2026-04-12' },
  { id: 'run-003', model: 'U-Net Segmenter', dataset: 'ODF-7 v1.0', lr: 0.0001, batch: 16, epochs: 40, accuracy: 0.712, iou: 0.678, dice: 0.701, duration: '3h 22m', user: 'Priya Nair', status: 'Completed', date: '2026-03-15' },
  { id: 'run-004', model: 'Fault Detector', dataset: 'NS-22 v3.0', lr: 0.0005, batch: 24, epochs: 50, accuracy: 0.923, iou: 0.881, dice: 0.894, duration: '3h 42m', user: 'Alexandra Reeves', status: 'Completed', date: '2026-04-10' },
  { id: 'run-005', model: 'Fault Detector', dataset: 'NS-22 v2.1', lr: 0.001, batch: 24, epochs: 50, accuracy: 0.897, iou: 0.854, dice: 0.871, duration: '3h 15m', user: 'Dr. Khalid Al-Mansouri', status: 'Completed', date: '2026-03-22' },
  { id: 'run-006', model: 'CNN Feature Extractor', dataset: 'Block 31 v1.3', lr: 0.0003, batch: 64, epochs: 30, accuracy: 0.851, iou: 0.812, dice: 0.829, duration: '1h 44m', user: 'Dr. Khalid Al-Mansouri', status: 'Completed', date: '2026-03-28' },
  { id: 'run-007', model: 'U-Net Segmenter', dataset: 'ODF-7 v1.3', lr: 0.0001, batch: 16, epochs: 50, accuracy: 0.743, iou: 0.698, dice: 0.721, duration: 'In progress', user: 'Priya Nair', status: 'Running', date: '2026-05-02' },
  { id: 'run-008', model: 'Fault Detector', dataset: 'NS-22 v1.0', lr: 0.0005, batch: 32, epochs: 50, accuracy: 0.831, iou: 0.789, dice: 0.808, duration: '3h 01m', user: 'Priya Nair', status: 'Completed', date: '2026-02-14' },
  { id: 'run-009', model: 'CNN Feature Extractor', dataset: 'ODF-7 v1.0', lr: 0.001, batch: 32, epochs: 25, accuracy: 0.798, iou: 0.754, dice: 0.771, duration: '1h 12m', user: 'James Thornton', status: 'Completed', date: '2026-04-05' },
  { id: 'run-010', model: 'Horizon Tracker', dataset: 'Block 31 v2.1', lr: 0.001, batch: 64, epochs: 0, accuracy: null, iou: null, dice: null, duration: '—', user: 'Dr. Khalid Al-Mansouri', status: 'Pending', date: '2026-05-02' },
  { id: 'run-011', model: 'Fault Detector', dataset: 'Block 31 v2.1', lr: 0.0003, batch: 24, epochs: 50, accuracy: 0.911, iou: 0.869, dice: 0.883, duration: '3h 28m', user: 'Alexandra Reeves', status: 'Completed', date: '2026-04-28' },
  { id: 'run-012', model: 'CNN Feature Extractor', dataset: 'NS-22 v3.0', lr: 0.0003, batch: 32, epochs: 50, accuracy: 0.887, iou: 0.843, dice: 0.858, duration: '2h 19m', user: 'Priya Nair', status: 'Completed', date: '2026-04-25' },
];
