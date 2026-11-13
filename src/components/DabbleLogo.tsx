import { useEffect, useRef, useState } from 'react';
import inkLogo from '@/assets/dabble-logo-ink.svg?raw';
import paperLogo from '@/assets/dabble-logo-paper.svg?raw';
import './DabbleLogo.css';

export const BLOB_PATH = 'M-14-3C-13-13-2-16 7-13 15-10 17-1 13 7 9 14-3 15-10 11-15 8-15 2-14-3Z';

// Only the trusted, source-controlled supplied artwork is inserted as SVG markup.
const artwork = {
  ink: inkLogo.slice(inkLogo.indexOf('>') + 1, inkLogo.lastIndexOf('</svg>')),
  paper: paperLogo.slice(paperLogo.indexOf('>') + 1, paperLogo.lastIndexOf('</svg>')),
};

export function canReplayLogo(now: number, lastPlay: number) {
  return now - lastPlay >= 2000;
}

export function DabbleLogo({ size = 40, tone = 'ink', animate = false }: { size?: number; tone?: 'ink' | 'paper'; animate?: boolean }) {
  const [replay, setReplay] = useState(0);
  const lastPlay = useRef(0);
  useEffect(() => { lastPlay.current = performance.now(); }, []);

  function replayOnHover() {
    if (!animate || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const now = performance.now();
    if (!canReplayLogo(now, lastPlay.current)) return;
    lastPlay.current = now;
    setReplay(value => value + 1);
  }

  return (
    <svg
      className={`dabble-logo${animate ? ' dabble-logo--animate' : ''}`}
      viewBox="42 22 524 144"
      width={size * 524 / 144}
      height={size}
      role="img"
      aria-label="Dabble"
      onPointerEnter={replayOnHover}
    >
      <g key={replay} dangerouslySetInnerHTML={{ __html: artwork[tone] }} />
    </svg>
  );
}
