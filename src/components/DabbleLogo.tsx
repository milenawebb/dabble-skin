import type { CSSProperties } from 'react';
import './DabbleLogo.css';

const BLOB_PATH = 'M-14-3C-13-13-2-16 7-13 15-10 17-1 13 7 9 14-3 15-10 11-15 8-15 2-14-3Z';

interface BlobSpec {
  color: string;
  rotate: number;
  x: number;
  y: number;
}

const LETTERS: Array<{ ch: string; blob: BlobSpec | null }> = [
  { ch: 'd', blob: { color: '#2B5FC2', rotate: 0, x: 0.46, y: 0.7 } },
  { ch: 'a', blob: { color: '#E8973A', rotate: 40, x: 0.52, y: 0.75 } },
  { ch: 'b', blob: { color: '#6FE3D2', rotate: 110, x: 0.57, y: 0.71 } },
  { ch: 'b', blob: { color: '#5B2BE0', rotate: 200, x: 0.45, y: 0.77 } },
  { ch: 'l', blob: null },
  { ch: 'e', blob: { color: '#E6B84F', rotate: 290, x: 0.5, y: 0.73 } },
];

const DOTS = [
  { color: '#2B5FC2', x: 0.16, y: -0.42 },
  { color: '#6FE3D2', x: 0.34, y: 0.08 },
  { color: '#E6B84F', x: 0.1, y: 0.5 },
];

export function DabbleLogo({ size = 40, tone = 'ink', animate = false }: { size?: number; tone?: 'ink' | 'paper'; animate?: boolean }) {
  let blobIndex = 0;
  return (
    <span
      className={`dabble-logo dabble-logo--${tone}${animate ? ' dabble-logo--animate' : ''}`}
      style={{ fontSize: size }}
      role="img"
      aria-label="Dabble"
    >
      {LETTERS.map((letter, i) => {
        const blob = letter.blob ? { ...letter.blob, delay: blobIndex++ * 80 } : null;
        return (
          <span key={i} className="dabble-logo-letter" aria-hidden="true">
            {blob && (
              <svg
                className="dabble-logo-blob"
                viewBox="-17 -17 34 34"
                style={
                  {
                    left: `${blob.x}em`,
                    top: `${blob.y}em`,
                    '--dabble-rot': `${blob.rotate}deg`,
                    '--dabble-delay': `${blob.delay}ms`,
                  } as CSSProperties
                }
                aria-hidden="true"
              >
                <path d={BLOB_PATH} fill={blob.color} />
              </svg>
            )}
            <span className="dabble-logo-glyph">{letter.ch}</span>
          </span>
        );
      })}
      <span className="dabble-logo-dots" aria-hidden="true">
        {DOTS.map((dot, i) => (
          <span key={i} className="dabble-logo-dot" style={{ backgroundColor: dot.color, left: `${dot.x}em`, top: `${dot.y}em` }} />
        ))}
      </span>
    </span>
  );
}
