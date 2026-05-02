import { useEffect, useRef } from 'react';

export default function ConfidenceHeatmap({ data, rows, cols, style = {} }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!data || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const imgData = ctx.createImageData(canvas.width, canvas.height);
    const numRows = rows || 100;
    const numCols = cols || 100;

    for (let py = 0; py < canvas.height; py++) {
      for (let px = 0; px < canvas.width; px++) {
        const row = Math.floor((py / canvas.height) * numRows);
        const col = Math.floor((px / canvas.width) * numCols);
        const idx = row * numCols + col;
        const v = Math.max(0, Math.min(1, data[idx] ?? 0));
        // yellow → orange → red
        const r = 255;
        const g = Math.round((1 - v) * 200);
        const b = 0;
        const pi = (py * canvas.width + px) * 4;
        imgData.data[pi] = r; imgData.data[pi+1] = g; imgData.data[pi+2] = b; imgData.data[pi+3] = Math.round(v * 200 + 55);
      }
    }
    ctx.putImageData(imgData, 0, 0);
  }, [data, rows, cols]);

  return <canvas ref={canvasRef} width={200} height={200} style={{ width: '100%', height: '100%', display: 'block', ...style }} />;
}
