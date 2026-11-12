import type { Stroke } from './paint-engine';
import { PAINT_PALETTE, INITIAL_SEED } from './paint-rules';

export type Palette = [string, string, string, string, string, string];
export type Painting = { version: 1; palette: Palette; strokes: Stroke[] };
export function isPalette(value: unknown): value is Palette {
  return Array.isArray(value) && value.length === 6 && value.every(c => typeof c === 'string' && /^#[0-9a-f]{6}$/i.test(c));
}
export const DEFAULT_PALETTE: Palette = [PAINT_PALETTE[0] ?? '', PAINT_PALETTE[1] ?? '', PAINT_PALETTE[2] ?? '', PAINT_PALETTE[3] ?? '', PAINT_PALETTE[4] ?? '', PAINT_PALETTE[5] ?? ''];
export function newPainting(): Painting { return {version:1, palette:[...DEFAULT_PALETTE], strokes:[{type:'auto-rib',seed:INITIAL_SEED,pal:[...DEFAULT_PALETTE]}]}; }
export function roundStroke(stroke: Stroke): Stroke {
  if (!('pts' in stroke)) return {...stroke, pal:[...stroke.pal]};
  const round = (n: number) => Math.round(n * 10000) / 10000;
  return {...stroke, pal:[...stroke.pal], size:round(stroke.size), pts:stroke.pts.map(([x,y]) => [round(x),round(y)])};
}
export function storageKey(src: string) { return `dabble-painting:v1:${src}`; }
export function parsePainting(value: unknown): Painting | null {
  if (!value || typeof value !== 'object') return null;
  const p = value as Record<string, unknown>;
  if (p['version'] !== 1 || !isPalette(p['palette']) || !Array.isArray(p['strokes'])) return null;
  for (const value of p['strokes']) {
    if (!value || typeof value !== 'object') return null;
    const s = value as Record<string, unknown>;
    if (!['imp','cub','drip','rib','auto-imp','auto-cub','auto-drip','auto-rib'].includes(String(s['type'])) || !Number.isInteger(s['seed']) || !isPalette(s['pal'])) return null;
    if (!String(s['type']).startsWith('auto-')) {
      if (typeof s['color'] !== 'string' || !/^#[0-9a-f]{6}$/i.test(s['color']) || typeof s['size'] !== 'number' || !Number.isFinite(s['size']) || s['size'] <= 0 || !Array.isArray(s['pts']) || s['pts'].length === 0) return null;
      if (!s['pts'].every(point => Array.isArray(point) && point.length === 2 && point.every(n => typeof n === 'number' && Number.isFinite(n)))) return null;
    }
  }
  return value as Painting;
}
export function loadPainting(src: string): Painting | null {
  try { const saved = localStorage.getItem(storageKey(src)); return saved ? parsePainting(JSON.parse(saved)) : null; } catch { return null; }
}
export function savePainting(src: string, painting: Painting) {
  try { localStorage.setItem(storageKey(src), JSON.stringify(painting)); } catch { /* Browser storage is optional. */ }
}
export function paintingCode(src: string, painting: Painting) {
  return `<DabblePlayer src={${JSON.stringify(src)}} painting={${JSON.stringify(painting)}} />`;
}