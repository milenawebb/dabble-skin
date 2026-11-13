import { BRUSH_SIZES } from './tray-rules';

export function paintingShortcutLabel(key: string, painting: boolean, size: number, trayOpen = painting): string | undefined {
  if (key === 'shift+backspace' || key === 'shift+delete') return trayOpen ? 'Blank canvas' : undefined;
  if (key === 'p') return painting ? 'Stop painting' : 'Start painting';
  if (key === 'ctrl+z' || key === 'meta+z') return 'Undo';
  if (!painting) return;
  const brushes: Record<string, string> = { '1': 'Impressionist brush', '2': 'Cubist brush', '3': 'Drip brush', '4': 'Ribbon brush' };
  if (brushes[key]) return brushes[key];
  if (key !== '[' && key !== ']') return;
  const index = BRUSH_SIZES.findIndex(option => option.value === size);
  return BRUSH_SIZES[Math.max(0, Math.min(2, index + (key === '[' ? -1 : 1)))]?.label;
}

export function blocksPaintingShortcut(target: Element | null, popupOpen: boolean) {
  return popupOpen || Boolean(target?.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="textbox"], [role="menu"], [role="dialog"]'));
}