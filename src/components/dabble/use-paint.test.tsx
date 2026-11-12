import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { usePaint } from './use-paint';
import { newPainting, type Painting } from './painting-data';

vi.mock('./video-palette', () => ({ sampleSource: () => () => {}, sampleVideo: () => null }));

describe('paint hook lifecycle', () => {
  it('keeps hook order stable when tools and supplied paintings change', () => {
    const wrapper = {current:null}, canvas = {current:null};
    const initialProps: {enabled:boolean;supplied:Painting|undefined} = {enabled:true,supplied:undefined};
    const {result,rerender} = renderHook(({enabled,supplied}: typeof initialProps) => usePaint(wrapper,canvas,enabled,'hook-test-video',supplied), {initialProps});
    act(() => result.current.setPainting(true));
    expect(result.current.painting).toBe(true);
    rerender({enabled:false,supplied:newPainting()});
    expect(result.current.painting).toBe(false);
    expect(result.current.count).toBe(1);
    rerender({enabled:true,supplied:undefined});
    expect(result.current.brush).toBe('rib');
    expect(result.current.palette).toHaveLength(6);
  });
});