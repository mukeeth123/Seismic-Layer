import { useEffect, useRef } from 'react';

export default function AttributeMap({ data, rows = 100, cols = 100, colorFn, style = {} }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!data || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const imgData = ctx.createImageData(canvas.width, canvas.height);

    const defaultColor = (v) => {
      const t = Math.max(0, Math.min(1, (v + 1) / 2));
      return [Math.round(t * 255), Math.round(t * 180), Math.round((1 - t) * 255)];
    };
    const cm = colorFn || defaultColor;

    for (let py = 0; py < canvas.height; py++) {
      for (let px = 0; px < canvas.width; px++) {
        const row = Math.floor((py / canvas.height) * rows);
        const col = Math.floor((px / canvas.width) * cols);
        const idx = row * cols + col;
        const v = data[idx] ?? 0;
        const [r, g, b] = cm(v);
        const pi = (py * canvas.width + px) * 4;
        imgData.data[pi] = r; imgData.data[pi+1] = g; imgData.data[pi+2] = b; imgData.data[pi+3] = 255;
      }
    }
    ctx.putImageData(imgData, 0, 0);
  }, [data, rows, cols, colorFn]);

  return <canvas ref={canvasRef} width={300} height={200} style={{ width: '100%', height: '100%', display: 'block', ...style }} />;
}
