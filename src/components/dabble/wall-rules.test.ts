import { describe, expect, it } from 'vitest';
import { readWall } from './wall-rules';

describe('demo wall choice', () => {
  it('defaults to Gallery gray without a saved choice', () => {
    expect(readWall(null)).toBe('gallery');
    expect(readWall('unknown')).toBe('gallery');
  });
  it.each(['gallery', 'white', 'charcoal', 'blue', 'coral'])('restores the saved %s wall', wall => {
    expect(readWall(wall)).toBe(wall);
  });
});