import { useEffect, useRef } from 'react';
import { renderStroke, type Brush, type Point } from '@/components/dabble/paint-engine';
import type { Palette } from '@/components/dabble/painting-data';

export function BrushSample({ brush, name, palette, index }: { brush: Brush; name: string; palette: Palette; index: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const draw = () => {
      const width = canvas.clientWidth, height = canvas.clientHeight;
      if (!width || !height) return;
      const ratio = Math.min(devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
      const context = canvas.getContext('2d');
      if (!context) return;
      context.scale(ratio, ratio);
      const pts: Point[] = Array.from({ length: 24 }, (_, i) => [0.14 + i / 23 * .72, .52 + Math.sin(i / 23 * Math.PI * 2) * .12]);
      renderStroke(context, { type: brush, seed: 2026 + index * 137, pal: [...palette], color: palette[index % 6] ?? palette[0], size: .085, pts }, { W: width, H: height, vx: 0, vy: 0, vw: 0, vh: 0 });
    };
    draw();
    const observer = new ResizeObserver(draw); observer.observe(canvas);
    return () => observer.disconnect();
  }, [brush, palette, index]);
  return <canvas ref={canvasRef} className="brush-sample" role="img" aria-label={`Sample of the ${name} brush`} />;
}