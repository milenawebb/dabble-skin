import { useId } from 'react';
import type { Palette } from './painting-data';
import { Button } from '@/components/ui/button';
import './MixPaintInput.css';

export function MixPaintInput({ palette, onRefresh }: { palette: Palette; onRefresh: () => void }) {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  return <Button variant="ghost" size="icon" className="mix-paint" aria-label="Take new paint colors from the current video scene" onClick={onRefresh}>
    <svg className="mix-paint-art tray-blob" viewBox="-19 -19 38 38" aria-hidden="true">
      <defs><clipPath id={`${id}-blob`}><path d="M-14-3C-13-13-2-16 7-13 15-10 17-1 13 7 9 14-3 15-10 11-15 8-15 2-14-3Z" /></clipPath></defs>
      <g clipPath={`url(#${id}-blob)`}>
        <path d="M-19-19H19V19H-19Z" fill={palette[0]} />
        {palette.slice(1).map((color, index) => <path key={index} d="M0 0C-14-12 14-23 19-5C27 10 8 26-9 17C-22 9-17-5-6-7C3-9 9 3 0 0Z" transform={`rotate(${index * 72})`} fill="none" stroke={color} strokeWidth="5" />)}
      </g>
      <circle className="mix-paint-dot" r="6" />
      <path className="mix-paint-plus" d="M-3 0A3 3 0 0 1 2-2M2-4V-2H0M3 0A3 3 0 0 1-2 2M-2 4V2H0" />
    </svg>
  </Button>;
}