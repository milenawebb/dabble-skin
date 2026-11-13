import { useId, type CSSProperties } from 'react';
import { colorName } from './palette';
import type { Palette } from './painting-data';
import { Button } from '@/components/ui/button';
import './MixPaintInput.css';

export function MixPaintInput({ palette, customColor, selected, picking, onToggle }: { palette: Palette; customColor: string | null; selected: boolean; picking: boolean; onToggle: () => void }) {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const label = customColor ? `Your color, ${colorName(customColor).toLowerCase()}. Pick again` : 'Pick a color from the video';
  return <Button variant="ghost" size="icon" className="mix-paint" data-video-color-toggle aria-label={label} aria-pressed={picking} aria-describedby={selected ? `${id}-selected` : undefined} onClick={onToggle} data-selected={selected || undefined} style={{ '--mix-picked-color': customColor ?? undefined } as CSSProperties}>
    <svg className="mix-paint-art tray-blob" viewBox="-19 -19 38 38" aria-hidden="true">
      <defs><clipPath id={`${id}-blob`}><path d="M-14-3C-13-13-2-16 7-13 15-10 17-1 13 7 9 14-3 15-10 11-15 8-15 2-14-3Z" /></clipPath></defs>
      {selected && <path className="tray-selected-ring" d="M-18-2C-18-14-6-19 6-18 16-16 20-6 18 5 15 15 2 19-9 16-16 13-18 6-18-2Z" fill="none" stroke="currentColor" strokeWidth="1.5" />}
      <g clipPath={`url(#${id}-blob)`}>
        <path d="M-19-19H19V19H-19Z" fill={palette[0]} />
        {palette.slice(1).map((color, index) => <path key={index} d="M0 0C-14-12 14-23 19-5C27 10 8 26-9 17C-22 9-17-5-6-7C3-9 9 3 0 0Z" transform={`rotate(${index * 72})`} fill="none" stroke={color} strokeWidth="5" />)}
      </g>
      <circle className="mix-paint-dot" r="6" />
      <path className="mix-paint-plus" d="M1-3L3-1M2-4L4-2M2-2L-2 2L-3 4L-1 3L3-1" />
    </svg>
    {selected && <span id={`${id}-selected`} className="sr-only">Selected paint</span>}
  </Button>;
}