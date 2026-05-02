import { useEffect, useRef } from 'react';

const COLORMAPS = {
  seismic: (v) => {
    // blue(-1) → white(0) → red(+1)
    const t = (v + 1) / 2;
    if (t < 0.5) {
      const s = t * 2;
      return [Math.round(s * 255), Math.round(s * 255), 255];
    } else {
      const s = (t - 0.5) * 2;
      return [255, Math.round((1 - s) * 255), Math.round((1 - s) * 255)];
    }
  },
  grayscale: (v) => {
    const g = Math.round(((v + 1) / 2) * 255);
    return [g, g, g];
  },
  viridis: (v) => {
    const t = (v + 1) / 2;
    const r = Math.round(68 + t * (253 - 68));
    const g = Math.round(1 + t * (231 - 1));
    const b = Math.round(84 + (1 - t) * (84));
    return [r, g, b];
  },
  hot: (v) => {
    const t = (v + 1) / 2;
    return [Math.min(255, Math.round(t * 3 * 255)), Math.min(255, Math.round((t * 3 - 1) * 255)), Math.min(255, Math.round((t * 3 - 2) * 255))];
  },
};

export default function AmplitudeMap({ data, width: w, height: h, rows, cols, colormap = 'seismic', gain = 1.0, style = {} }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!data || !canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.width = w || canvas.offsetWidth || 400;
    canvas.height = h || canvas.offsetHeight || 200;
    const ctx = canvas.getContext('2d');
    const imgData = ctx.createImageData(canvas.width, canvas.height);
    const cm = COLORMAPS[colormap] || COLORMAPS.seismic;
    const numRows = rows || Math.sqrt(data.length) | 0;
    const numCols = cols || Math.ceil(data.length / numRows);

    for (let py = 0; py < canvas.height; py++) {
      for (let px = 0; px < canvas.width; px++) {
        const row = Math.floor((py / canvas.height) * numRows);
        const col = Math.floor((px / canvas.width) * numCols);
        const idx = row * numCols + col;
        const v = Math.max(-1, Math.min(1, (data[idx] ?? 0) * gain));
        const [r, g, b] = cm(v);
        const pi = (py * canvas.width + px) * 4;
        imgData.data[pi] = r; imgData.data[pi+1] = g; imgData.data[pi+2] = b; imgData.data[pi+3] = 255;
      }
    }
    ctx.putImageData(imgData, 0, 0);
  }, [data, w, h, rows, cols, colormap, gain]);

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block', ...style }} />;
}

export { COLORMAPS };
