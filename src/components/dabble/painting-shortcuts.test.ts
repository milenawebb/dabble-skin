import { describe, expect, it } from 'vitest';
import { paintingShortcutLabel, blocksPaintingShortcut } from './painting-shortcuts';

describe('painting shortcuts', () => {
  it('P toggles painting and undo works even when painting is off', () => {
    expect(paintingShortcutLabel('p', false, 20)).toBe('Start painting');
    expect(paintingShortcutLabel('p', true, 20)).toBe('Stop painting');
    expect(paintingShortcutLabel('ctrl+z', false, 20)).toBe('Undo');
    expect(paintingShortcutLabel('meta+z', false, 20)).toBe('Undo');
  });
  it.each(['1', '2', '3', '4', '[', ']'])('%s does nothing while painting is off', key => {
    expect(paintingShortcutLabel(key, false, 20)).toBeUndefined();
  });
  it.each(['Impressionist brush', 'Cubist brush', 'Drip brush', 'Ribbon brush'])('selects %s', (label) => {
    const index = ['Impressionist brush', 'Cubist brush', 'Drip brush', 'Ribbon brush'].indexOf(label);
    expect(paintingShortcutLabel(String(index + 1), true, 20)).toBe(label);
  });
  it('brackets step through Small, Medium, Large without leaving the range', () => {
    expect(paintingShortcutLabel('[', true, 20)).toBe('Small brush');
    expect(paintingShortcutLabel(']', true, 10)).toBe('Medium brush');
    expect(paintingShortcutLabel(']', true, 20)).toBe('Large brush');
    expect(paintingShortcutLabel('[', true, 10)).toBe('Small brush');
    expect(paintingShortcutLabel(']', true, 34)).toBe('Large brush');
  });
  it('blocks text fields and open panels', () => {
    expect(blocksPaintingShortcut(document.createElement('textarea'), false)).toBe(true);
    expect(blocksPaintingShortcut(document.createElement('input'), false)).toBe(true);
    expect(blocksPaintingShortcut(document.createElement('button'), true)).toBe(true);
    expect(blocksPaintingShortcut(document.createElement('button'), false)).toBe(false);
  });
});
it.each(['shift+backspace','shift+delete'])('%s clears only with an open tray', key=>{ expect(paintingShortcutLabel(key,false,20,true)).toBe('Blank canvas'); expect(paintingShortcutLabel(key,true,20,false)).toBeUndefined(); });
