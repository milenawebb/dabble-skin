import { describe, expect, it } from 'vitest';
import { PLAYER_KEYS, PAINT_KEYS } from './KeysPanel';

// The landing page Keys card and the in-player Keys panel both read these lists.
describe('shared keyboard shortcut data', () => {
  it('lists every player shortcut', () => {
    expect(PLAYER_KEYS.map(([key]) => key)).toEqual(['Space or K', 'M', 'C', 'F', '← →', '↑ ↓', '?']);
  });
  it('lists every painting shortcut', () => {
    expect(PAINT_KEYS.map(([key]) => key)).toEqual(['P', '1 2 3 4', '[ ]', 'Ctrl or Cmd + Z']);
  });
  it('gives every shortcut an action', () => {
    for (const [key, action] of [...PLAYER_KEYS, ...PAINT_KEYS]) {
      expect(action?.length ?? 0, key).toBeGreaterThan(0);
    }
  });
});
