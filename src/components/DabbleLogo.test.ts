import { describe, expect, it } from 'vitest';
import { canReplayLogo } from './DabbleLogo';

describe('logo hover replay cooldown', () => {
  it('allows a replay only after two seconds since the preceding play', () => {
    expect(canReplayLogo(2499, 500)).toBe(false);
    expect(canReplayLogo(2500, 500)).toBe(true);
    expect(canReplayLogo(4499, 2500)).toBe(false);
    expect(canReplayLogo(4500, 2500)).toBe(true);
  });
});