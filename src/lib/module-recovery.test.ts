import { describe, expect, it, vi } from 'vitest';
import { recoverModuleLoad } from './module-recovery';

describe('page module recovery', () => {
  const error = new TypeError('Failed to fetch dynamically imported module: /src/routes/index.tsx?t=1794600290413&tsr-split=component');
  function storage() {
    const values = new Map<string, string>();
    return { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); } };
  }
  it('reloads the reported stale page module once, but prevents a reload loop', () => {
    const saved = storage();
    const reload = vi.fn();
    expect(recoverModuleLoad(error, saved, reload, 100_000)).toBe(true);
    expect(recoverModuleLoad(error, saved, reload, 101_000)).toBe(false);
    expect(reload).toHaveBeenCalledTimes(1);
  });
  it('does not reload unrelated errors or when storage is unavailable', () => {
    const reload = vi.fn();
    expect(recoverModuleLoad(new Error('Painting failed'), storage(), reload)).toBe(false);
    expect(recoverModuleLoad(error, { getItem: () => { throw new Error('Blocked'); }, setItem: vi.fn() }, reload)).toBe(false);
    expect(reload).not.toHaveBeenCalled();
  });
});