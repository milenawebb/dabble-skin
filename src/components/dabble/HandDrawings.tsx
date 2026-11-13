import type { Brush } from './paint-engine';

const paths = {
  play: ['M9 6.4c.4 3.1-.2 7.6.2 11.3l9.2-5.5Z'],
  pause: ['M9.2 6.2c-.2 3.8.2 7.8-.1 11.6', 'M15.1 6c.2 4-.3 8 .1 12'],
  replay: ['M6.1 12.6a6.2 6.1 0 1 0 2.3-5', 'M5.6 4.7 8 8.1l3.4-1.3'],
  volume: ['M4.5 9.8l3.3-.2L12 6.2c.3 3.8-.2 8.3.1 11.8l-4.2-3.4-3.3-.1Z', 'M15.2 9.3c1.4 1.5 1.5 4.1.1 5.6', 'M17.6 7.2c2.6 2.6 2.7 7.4.2 9.8'],
  muted: ['M4.5 9.8l3.3-.2L12 6.2c.3 3.8-.2 8.3.1 11.8l-4.2-3.4-3.3-.1Z', 'M15.5 9.6l4.5 5', 'M20.2 9.4l-4.6 5.4'],
  fullscreen: ['M5 9.2 5.2 5.2l4.1-.2', 'M15 5.1l4 .2.1 3.9', 'M19 15l-.2 4-3.9.1', 'M9.2 19l-4.1-.2L5 14.9'],
  exit: ['M5.2 9.1l3.9-.2.2-3.9', 'M15 5l.2 4 3.9.1', 'M18.9 15.1l-3.9.2-.2 3.8', 'M9.1 19.1l-.2-4-3.8-.1'],
  captions: ['M4.5 19.4c4-.9 10.5.4 15-.5'],
  brush: ['M18.5 4.5c1.2 1.1.9 2.4-.2 3.6l-6.6 7-2.9-2.8 6.8-6.9c1-1 2-1.7 2.9-.9Z', 'M8.8 12.4c-2.3.2-3.3 1.7-3.5 3.6-.1 1.3-.7 2-1.8 2.5 2.8 1.3 6.8.6 7.700-2.2.3-1.2.2-2.1-.5-2.7'],
  eyedropper: ['M14.5 5.5C16 3.8 19.8 6.5 18.3 8.8L16.5 10.8 13.2 7.5Z', 'M14 9 6.5 16.5 5.5 19 8 18 15.5 10.5'],
  undo: ['M8.6 6.1 5 9.6l3.9 3.3', 'M5.5 9.6c4.6-.6 11.5 0 12 3.9.4 3-3.5 4.4-7 4'],
  wand: ['M5 19.2 14.4 9.6', 'M16.5 4.4l.8 2.6 2.4.6-2.3.8-.7 2.5-.8-2.4-2.3-.7 2.3-.8Z', 'M7.2 6.8v2.4M6 8h2.4'],
  clear: ['M8 18.6 4.8 15.1 13.6 6l5.5 5.5-7 7.2Z', 'M9.5 10.3l5.4 5.4', 'M12.2 18.7l7.8-.2'],
  copy: ['M9.1 8 5 12.1 9 16', 'M15 7.9l4.1 4.2L15 16.1'],
  'sounds-on': ['M9.5 17.5V7l8-1.8v10.3'],
  'sounds-off': ['M9.5 17.5V7l8-1.8v10.3', 'M5 4.5 19.5 19.5'],
  keys: ['M4.2 7.3c5.2-.4 10.4-.2 15.6 0 .5 3.1.4 6.3 0 9.4-5.2.3-10.4.3-15.6 0-.4-3.1-.4-6.3 0-9.4Z', 'M7.5 10.3h.01', 'M10.5 10.3h.01', 'M13.5 10.3h.01', 'M16.5 10.3h.01', 'M8 13.7c2.7.2 5.3.2 8 0'],
  monitor: ['M4 5.5c5.3-.4 10.7-.4 16 0 .4 2.6.4 5.3 0 7.9-5.3.4-10.7.4-16 0-.4-2.6-.4-5.3 0-7.9Z', 'M12 13.6v2.9', 'M8.4 17.6c2.4-.3 4.8-.3 7.2 0'],
  tablet: ['M7 4.2c3.3-.3 6.7-.3 10 0 .3 5.2.3 10.4 0 15.6-3.3.3-6.7.3-10 0-.3-5.2-.3-10.4 0-15.6Z', 'M12 16.9h.01'],
  phone: ['M9 4.2c2-.2 4-.2 6 0 .2 5.2.2 10.4 0 15.6-2 .2-4 .2-6 0-.2-5.2-.2-10.4 0-15.6Z', 'M12 16.9h.01'],
};
export type HandIconKind = keyof typeof paths;
export function HandIcon({ kind, className = 'dabble-icon' }: { kind: HandIconKind; className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={kind === 'captions' ? 1.5 : 1.9} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {paths[kind].map((d, i) => <path key={i} d={d} strokeWidth={kind === 'keys' && i > 0 && i < 5 ? 2.2 : undefined} />)}
    {(kind === 'sounds-on' || kind === 'sounds-off') && <><ellipse cx="7.3" cy="17.6" rx="2.3" ry="1.8" /><ellipse cx="15.3" cy="15.6" rx="2.3" ry="1.8" /></>}
  </svg>;
}
export const BLOB_ROTATIONS = [-20, 12, -8, 16, -14, 24];
export function PaintBlob({ selected = false, angle = 0, scale = 1 }: { selected?: boolean; angle?: number; scale?: number }) {
  return <svg className="tray-blob" viewBox="-19 -19 38 38" aria-hidden="true">
    {selected && <path className="tray-selected-ring" d="M-18-2C-18-14-6-19 6-18 16-16 20-6 18 5 15 15 2 19-9 16-16 13-18 6-18-2Z" fill="none" stroke="currentColor" strokeWidth="1.5" />}
    <g transform={`rotate(${angle}) scale(${scale})`}>
      <path className="tray-blob-body" d="M-14-3C-13-13-2-16 7-13 15-10 17-1 13 7 9 14-3 15-10 11-15 8-15 2-14-3Z" />
      <path className="tray-blob-highlight" d="M-7-6C-3-10 4-9 7-6" fill="none" strokeWidth="2.4" strokeLinecap="round" />
      <path className="tray-blob-shade" d="M-6 4C-1 8 6 6 9 1" fill="none" strokeWidth="2" strokeLinecap="round" />
    </g>
  </svg>;
}
export function BrushDrawing({ brush }: { brush: Brush }) {
  const handle = (y: number, h: number) => <rect className="tray-handle" x="14" y={y} width="7" height={h} rx="3.5" />;
  return <svg className="tray-brush-drawing" viewBox="0 0 35 96" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {brush === 'imp' && <>{handle(40, 52)}<rect className="tray-metal" x="13" y="28" width="9" height="13" /><path className="tray-tip" d="M13 28C11 18 15 8 17.5 3 20 8 24 18 22 28Z" /></>}
    {brush === 'cub' && <>{handle(48, 44)}<path d="M17.5 48V38" strokeWidth="1.6" /><path className="tray-blade" d="M17.5 4 25 24 17.5 38 10 24Z" /><path className="tray-tip" stroke="none" d="M17.5 4 25 24 17.5 15Z" /></>}
    {brush === 'drip' && <>{handle(44, 48)}<rect className="tray-metal" x="13" y="33" width="9" height="12" /><path className="tray-tip" d="M12 33C10 26 13 20 17.5 17 22 20 25 26 23 33Z" /><path className="tray-tip" stroke="none" d="M17.5 13C15.5 10 15.8 7 17.5 4 19.2 7 19.5 10 17.5 13Z" /><circle className="tray-tip" stroke="none" cx="25" cy="9" r="1.8" /><circle className="tray-tip" stroke="none" cx="9" cy="14" r="1.3" /></>}
    {brush === 'rib' && <>{handle(44, 48)}<rect className="tray-metal" x="6" y="30" width="23" height="15" rx="2" /><path className="tray-tip" d="M6 30 5 8C9 6 12 9 15 7 19 5 24 9 30 6L29 30Z" /></>}
  </svg>;
}