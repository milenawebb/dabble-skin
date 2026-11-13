import type { HandIconKind } from './HandDrawings';

export const PREVIEW_SIZES = [
  { id: 'desktop', label: 'Desktop', icon: 'monitor', width: 860 },
  { id: 'tablet', label: 'Tablet', icon: 'tablet', width: 768 },
  { id: 'mobile', label: 'Mobile', icon: 'phone', width: 390 },
] as const satisfies ReadonlyArray<{ id: string; label: string; icon: HandIconKind; width: number }>;
export type PreviewSize = typeof PREVIEW_SIZES[number]['id'];

// Only offer sizes that fit the visitor's window: under 820px the Tablet tab
// cannot show its 768px column, and under 440px the visitor is already on a phone.
export function visiblePreviewSizes(windowWidth: number) {
  if (windowWidth < 440) return [];
  return PREVIEW_SIZES.filter(size => size.id !== 'tablet' || windowWidth >= 820);
}

export function effectivePreviewSize(selected: PreviewSize, windowWidth: number): PreviewSize {
  return visiblePreviewSizes(windowWidth).some(size => size.id === selected) ? selected : 'desktop';
}
