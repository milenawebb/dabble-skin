import type { Brush } from './paint-engine';

export function activeBrushLabel(selected: Brush, hovered: Brush | null, focused: Brush | null): Brush {
  return focused ?? hovered ?? selected;
}

type Rect = { left: number; top: number; right: number; bottom: number; width: number };
export function brushLabelPosition(tray: Rect, drawing: Rect, obstacles: Rect[], width: number, height: number) {
  const centered = Math.max(tray.left + 4, Math.min(tray.right - width - 4, (drawing.left + drawing.right - width) / 2));
  const fits = (left: number, top: number) => left >= tray.left + 4 && left + width <= tray.right - 4 && top >= tray.top + 4 && top + height <= tray.bottom - 4 && !obstacles.some(r => left < r.right + 3 && left + width > r.left - 3 && top < r.bottom + 3 && top + height > r.top - 3);
  const candidates = [
    { left: centered, top: drawing.top - height - 6 },
    { left: centered, top: drawing.bottom + 6 },
    { left: drawing.right + 6, top: drawing.top },
    { left: drawing.left - width - 6, top: drawing.top },
  ];
  let spot = candidates.find(p => fits(p.left, p.top));
  if (!spot) {
    const free: { left: number; top: number; distance: number }[] = [];
    for (let top = tray.top + 4; top + height <= tray.bottom - 4; top += 2) {
      for (let left = tray.left + 4; left + width <= tray.right - 4; left += 2) {
        if (fits(left, top)) free.push({ left, top, distance: Math.hypot(left - centered, top - (drawing.top - height - 6)) });
      }
    }
    spot = free.sort((a, b) => a.distance - b.distance)[0];
  }
  return spot ? { left: spot.left - tray.left, top: spot.top - tray.top } : null;
}