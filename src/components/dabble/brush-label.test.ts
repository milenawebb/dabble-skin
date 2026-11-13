import { expect, it } from 'vitest';
import { activeBrushLabel, brushLabelPosition } from './brush-label';

it('shows the selected brush until another brush is hovered or focused', () => {
  expect(activeBrushLabel('rib', null, null)).toBe('rib');
  expect(activeBrushLabel('rib', 'cub', null)).toBe('cub');
  expect(activeBrushLabel('rib', 'cub', 'imp')).toBe('imp');
  expect(activeBrushLabel('rib', null, 'drip')).toBe('drip');
});
it('keeps tags above brush tips, within the tray and clear of paint blobs', () => {
  const tray = { left: 0, top: 100, right: 350, bottom: 300, width: 350 };
  const drawing = { left: 10, right: 40, top: 170, bottom: 260, width: 30 };
  const colors = { left: 40, right: 330, top: 110, bottom: 154, width: 290 };
  expect(brushLabelPosition(tray, drawing, colors, 100, 24)).toEqual({ left: 4, top: -20 });
  expect(brushLabelPosition(tray, { ...drawing, left: 320, right: 350 }, { ...colors, right: 200 }, 100, 24)).toEqual({ left: 246, top: 40 });
});