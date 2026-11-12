import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useFeedback } from './use-feedback';

describe('feedback hook lifecycle', () => {
  it('keeps hook slots stable through sound, painting and brush changes', () => {
    const ref = { current: null };
    const { result, rerender } = renderHook(({ enabled, painting, brush }: { enabled: boolean; painting: boolean; brush: 'rib' | 'cub' }) => useFeedback(ref, enabled, painting, brush), {
      initialProps: { enabled: true, painting: false, brush: 'rib' },
    });
    expect(result.current).toBeTypeOf('function');
    rerender({ enabled: true, painting: true, brush: 'cub' });
    expect(() => result.current()).not.toThrow();
    rerender({ enabled: false, painting: false, brush: 'rib' });
    expect(() => result.current()).not.toThrow();
  });
});