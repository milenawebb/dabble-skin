import type { Brush, Stroke } from './paint-engine';

export const PAINT_PALETTE: [string, string, string, string, string, string] = ['#0057FF', '#00B7FF', '#00D1B2', '#FFB800', '#FF5A1F', '#FF2E93'];
export const INITIAL_SEED = 1729;
export const DEFAULT_BRUSH: Brush = 'rib';
export const DEFAULT_SIZE = 20;
export function initialPainting(palette: readonly string[] = PAINT_PALETTE): Stroke[] {
  const colors = [palette[0] ?? PAINT_PALETTE[0], palette[2] ?? PAINT_PALETTE[2], palette[4] ?? PAINT_PALETTE[4]];
  const pal = [...colors, ...colors];
  return [
    { type: 'rib', seed: INITIAL_SEED, pal: [...pal], color: colors[1] ?? '', size: .025, pts: [[-.07,.4],[.045,.32],[.008,.23],[.04,.16],[.005,.095],[.06,.018],[.13,.055],[.21,.014],[.27,.028],[.34,-.08]] },
    { type: 'rib', seed: INITIAL_SEED + 1, pal: [...pal], color: colors[2] ?? '', size: .012, pts: [[-.07,.16],[.025,.13],[.08,.045],[.12,.015],[.16,.10],[.23,.19]] },
    { type: 'rib', seed: INITIAL_SEED + 2, pal: [...pal], color: colors[1] ?? '', size: .027, pts: [[.6,1.08],[.69,.965],[.77,.99],[.83,.953],[.9,.983],[.974,.944],[.944,.865],[.986,.78],[.965,.705],[1.08,.62]] },
    { type: 'drip', seed: INITIAL_SEED + 3, pal: [...pal], color: colors[2] ?? '', size: .022, pts: [[.095,.04],[.13,.045],[.155,.035]] },
    { type: 'drip', seed: INITIAL_SEED + 4, pal: [...pal], color: colors[0] ?? '', size: .023, pts: [[.967,.84],[.965,.885],[.957,.91]] },
    { type: 'drip', seed: INITIAL_SEED + 5, pal: [...pal], color: colors[2] ?? '', size: .022, pts: [[.84,.966],[.805,.957],[.77,.965]] },
  ];
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