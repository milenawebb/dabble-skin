import { describe, expect, it } from 'vitest';
import { contrast, tintForInk } from './palette';

describe('Dabble accessible contrast', () => {
  const ink = '#1b1b1a';
  it('keeps label text and icons above 4.5:1 on paper', () => {
    expect(contrast(ink, '#fdfcf9')).toBeGreaterThanOrEqual(4.5);
  });
  it('keeps every Oceans control tint above 4.5:1 against ink', () => {
    for (const color of ['#1180c5', '#076acf', '#271ded', '#ed6d1d', '#1dedb2', '#ed1d57']) {
      expect(contrast(ink, tintForInk(color))).toBeGreaterThanOrEqual(4.5);
    }
  });
  it('keeps white captions above 7:1 on ink', () => {
    expect(contrast('#ffffff', ink)).toBeGreaterThanOrEqual(7);
  });
});