import type { Brush } from './paint-engine';

export function twoZoneTray(width: number) { return width >= 670 && width <= 1000; }

export const BRUSH_SIZES = [{ label: 'Small brush', value: 10, scale: 0.45 }, { label: 'Medium brush', value: 20, scale: 0.72 }, { label: 'Large brush', value: 34, scale: 1.05 }] as const;
export function cursorDiameter(size: number, width: number, brush: Brush) {
  // Match the engine's normalized size and nominal brush footprint, not its random outlying marks.
  const footprint = { rib: 1.6, cub: 1.5, drip: 0.6, imp: 0.4 }[brush];
  return Math.min(64, Math.max(8, size / 680 * width * footprint));
}
export function brushCursor(diameter: number, color: string, ink: string, paper: string) {
  const extent = Math.ceil(diameter + 6), center = extent / 2, radius = diameter / 2;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${extent}" height="${extent}" viewBox="0 0 ${extent} ${extent}"><circle cx="${center}" cy="${center}" r="${radius + 1.25}" fill="none" stroke="${paper}" stroke-width="1"/><circle cx="${center}" cy="${center}" r="${radius}" fill="${color}" fill-opacity=".35" stroke="${ink}" stroke-width="1.5"/></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}") ${Math.floor(center)} ${Math.floor(center)}, crosshair`;
}