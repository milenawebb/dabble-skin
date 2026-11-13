import type { Brush } from './paint-engine';

export function activeBrushLabel(selected: Brush, hovered: Brush | null, focused: Brush | null): Brush {
  return focused ?? hovered ?? selected;
}

type Rect = { left: number; top: number; right: number; bottom: number; width: number };
export function brushLabelPosition(tray: Rect, drawing: Rect, colors: Rect, width: number, height: number) {
  const left = Math.max(4, Math.min(tray.width - width - 4, (drawing.left + drawing.right) / 2 - tray.left - width / 2));
  let top = drawing.top - tray.top - height - 6;
  if (left + tray.left < colors.right && left + tray.left + width > colors.left && top + tray.top + height > colors.top && top + tray.top < colors.bottom) {
    top = colors.top - tray.top - height - 6;
  }
  return { left, top };
}