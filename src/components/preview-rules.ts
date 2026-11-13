import type { HandIconKind } from '@/dabble';

export const PREVIEW_SIZES = [
  { id: 'desktop', label: 'Desktop', icon: 'monitor', width: 1100 },
  { id: 'tablet', label: 'Tablet', icon: 'tablet', width: 768 },
  { id: 'mobile', label: 'Mobile', icon: 'phone', width: 390 },
] as const satisfies ReadonlyArray<{ id: string; label: string; icon: HandIconKind; width: number }>;
export type PreviewSize = typeof PREVIEW_SIZES[number]['id'];

// The preview chooser is only useful on a wide real browser viewport.
export function visiblePreviewSizes(windowWidth: number) {
  return windowWidth >= 900 ? [...PREVIEW_SIZES] : [];
}

export function effectivePreviewSize(selected: PreviewSize, windowWidth: number): PreviewSize {
  return visiblePreviewSizes(windowWidth).some(size => size.id === selected) ? selected : 'desktop';
}
