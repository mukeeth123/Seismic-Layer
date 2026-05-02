// Seismic data engine — generates synthetic 3D seismic cube data

function gaussianRandom(mean = 0, std = 1) {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return mean + std * Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

export function generateSeismicCube(config = {}) {
  const { inlines = 100, xlines = 100, samples = 200, dt = 4 } = config;
  const total = inlines * xlines * samples;
  const cube = new Float32Array(total);

  // Horizon time centers (in sample index)
  const horizons = [
    { center: Math.floor(samples * 0.35), sigma: 8, amp: 0.6 },  // ~800ms
    { center: Math.floor(samples * 0.55), sigma: 6, amp: 0.45 }, // ~1200ms
    { center: Math.floor(samples * 0.78), sigma: 10, amp: 0.5 }, // ~1800ms
  ];

  for (let il = 0; il < inlines; il++) {
    for (let xl = 0; xl < xlines; xl++) {
      // Fault offset: diagonal plane il + xl > 120 shifts by ~15 samples
      const faultOffset = (il + xl > 120) ? 15 : 0;
      // Structural dip: slight tilt
      const dip = Math.floor((il * 0.05) + (xl * 0.03));

      for (let t = 0; t < samples; t++) {
        const tEff = t - faultOffset - dip;

        // Base signal: 3 sine waves
        let val = 0;
        val += 0.25 * Math.sin(2 * Math.PI * tEff / 18 + il * 0.08);
        val += 0.15 * Math.sin(2 * Math.PI * tEff / 9  + xl * 0.06);
        val += 0.10 * Math.sin(2 * Math.PI * tEff / 35 + (il + xl) * 0.04);

        // Horizon reflections (Gaussian bumps)
        for (const h of horizons) {
          const dt2 = tEff - h.center;
          val += h.amp * Math.exp(-(dt2 * dt2) / (2 * h.sigma * h.sigma));
          // Ricker-like: subtract a smaller wider Gaussian
          val -= h.amp * 0.4 * Math.exp(-(dt2 * dt2) / (2 * (h.sigma * 2.5) * (h.sigma * 2.5)));
        }

        // Noise
        val += gaussianRandom(0, 0.12);

        // Clamp
        cube[il * xlines * samples + xl * samples + t] = Math.max(-1, Math.min(1, val));
      }
    }
  }
  return { cube, inlines, xlines, samples, dt };
}

export function extractInline(cubeData, il) {
  const { cube, xlines, samples } = cubeData;
  const slice = new Float32Array(xlines * samples);
  for (let xl = 0; xl < xlines; xl++) {
    for (let t = 0; t < samples; t++) {
      slice[xl * samples + t] = cube[il * xlines * samples + xl * samples + t];
    }
  }
  return slice;
}

export function extractXline(cubeData, xl) {
  const { cube, inlines, xlines, samples } = cubeData;
  const slice = new Float32Array(inlines * samples);
  for (let il = 0; il < inlines; il++) {
    for (let t = 0; t < samples; t++) {
      slice[il * samples + t] = cube[il * xlines * samples + xl * samples + t];
    }
  }
  return slice;
}

export function extractTimeSlice(cubeData, t) {
  const { cube, inlines, xlines, samples } = cubeData;
  const slice = new Float32Array(inlines * xlines);
  for (let il = 0; il < inlines; il++) {
    for (let xl = 0; xl < xlines; xl++) {
      slice[il * xlines + xl] = cube[il * xlines * samples + xl * samples + t];
    }
  }
  return slice;
}

export function generateAttributes(cubeData) {
  const { cube, inlines, xlines, samples } = cubeData;
  const n = inlines * xlines * samples;

  // Envelope (instantaneous amplitude) — simple abs smoothed
  const envelope = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    envelope[i] = Math.abs(cube[i]);
  }

  // RMS amplitude (window = 12 samples)
  const rms = new Float32Array(n);
  const win = 12;
  for (let il = 0; il < inlines; il++) {
    for (let xl = 0; xl < xlines; xl++) {
      for (let t = 0; t < samples; t++) {
        let sum = 0, cnt = 0;
        for (let w = -win; w <= win; w++) {
          const tt = t + w;
          if (tt >= 0 && tt < samples) {
            const v = cube[il * xlines * samples + xl * samples + tt];
            sum += v * v;
            cnt++;
          }
        }
        rms[il * xlines * samples + xl * samples + t] = Math.sqrt(sum / cnt);
      }
    }
  }

  // Cosine phase (simplified: sign-based)
  const cosPhase = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    cosPhase[i] = cube[i] >= 0 ? 1 : -1;
  }

  // Similarity / coherence (compare adjacent traces)
  const similarity = new Float32Array(n);
  for (let il = 1; il < inlines - 1; il++) {
    for (let xl = 1; xl < xlines - 1; xl++) {
      for (let t = 0; t < samples; t++) {
        const c = cube[il * xlines * samples + xl * samples + t];
        const n1 = cube[(il+1) * xlines * samples + xl * samples + t];
        const n2 = cube[(il-1) * xlines * samples + xl * samples + t];
        const n3 = cube[il * xlines * samples + (xl+1) * samples + t];
        const n4 = cube[il * xlines * samples + (xl-1) * samples + t];
        const avg = (n1 + n2 + n3 + n4) / 4;
        similarity[il * xlines * samples + xl * samples + t] = 1 - Math.abs(c - avg);
      }
    }
  }

  return { envelope, rms, cosPhase, similarity };
}

// Generate 4D time-lapse versions (5 time steps)
export function generate4DTimeLapse(baseConfig) {
  const steps = [];
  for (let step = 0; step < 5; step++) {
    const cfg = { ...baseConfig };
    // Shift horizon peaks slightly per time step
    const data = generateSeismicCubeWithShift(cfg, step * 3);
    steps.push(data);
  }
  return steps;
}

function generateSeismicCubeWithShift(config, shift) {
  const { inlines = 100, xlines = 100, samples = 200, dt = 4 } = config;
  const total = inlines * xlines * samples;
  const cube = new Float32Array(total);

  const horizons = [
    { center: Math.floor(samples * 0.35) + shift, sigma: 8, amp: 0.6 - shift * 0.02 },
    { center: Math.floor(samples * 0.55) + shift, sigma: 6, amp: 0.45 },
    { center: Math.floor(samples * 0.78) + shift, sigma: 10, amp: 0.5 + shift * 0.01 },
  ];

  for (let il = 0; il < inlines; il++) {
    for (let xl = 0; xl < xlines; xl++) {
      const faultOffset = (il + xl > 120) ? 15 : 0;
      const dip = Math.floor((il * 0.05) + (xl * 0.03));
      for (let t = 0; t < samples; t++) {
        const tEff = t - faultOffset - dip;
        let val = 0;
        val += 0.25 * Math.sin(2 * Math.PI * tEff / 18 + il * 0.08);
        val += 0.15 * Math.sin(2 * Math.PI * tEff / 9  + xl * 0.06);
        val += 0.10 * Math.sin(2 * Math.PI * tEff / 35 + (il + xl) * 0.04);
        for (const h of horizons) {
          const dt2 = tEff - h.center;
          val += h.amp * Math.exp(-(dt2 * dt2) / (2 * h.sigma * h.sigma));
          val -= h.amp * 0.4 * Math.exp(-(dt2 * dt2) / (2 * (h.sigma * 2.5) * (h.sigma * 2.5)));
        }
        val += gaussianRandom(0, 0.12);
        cube[il * xlines * samples + xl * samples + t] = Math.max(-1, Math.min(1, val));
      }
    }
  }
  return { cube, inlines, xlines, samples, dt };
}
