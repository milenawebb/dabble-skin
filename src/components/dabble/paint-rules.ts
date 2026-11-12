import type { Brush, Stroke } from './paint-engine';

export const PAINT_PALETTE = ['#0057FF', '#00B7FF', '#00D1B2', '#FFB800', '#FF5A1F', '#FF2E93'];
export const INITIAL_SEED = 1729;
export const DEFAULT_BRUSH: Brush = 'rib';
export const DEFAULT_SIZE = 20;
export function initialPainting(): Stroke[] {
  return [{ type: 'auto-rib', seed: INITIAL_SEED, pal: [...PAINT_PALETTE] }];
}
export function paintFrameWidth(normal: number, painting: boolean) {
  return painting ? Math.max(30, normal) : normal;
}
export function pointSpacing(brush: Brush) { return brush === 'rib' ? 7 : 5; }
export function strokeSize(size: number, pointerType: string, pressure: number) {
  return size / 680 * (pointerType === 'pen' ? 0.6 + Math.min(1, Math.max(0, pressure)) * 0.8 : 1);
}
export function backingRatio(ratio: number) { return Math.min(2, ratio || 1); }
export function undoPainting(strokes: Stroke[]) { return strokes.slice(0, -1); }