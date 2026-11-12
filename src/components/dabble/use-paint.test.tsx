import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { usePaint } from './use-paint';
import { newPainting, savePainting, loadPainting, type Painting } from './painting-data';

vi.mock('./video-palette', () => ({ sampleSource: () => () => {}, sampleVideo: () => null }));
beforeEach(() => localStorage.clear());

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

describe('viewer starting painting', () => {
  it('uses the owner painting on the first visit and adds strokes without mutating it', () => {
    const supplied = newPainting();
    supplied.strokes[0] = { type: 'auto-cub', seed: 234, pal: [...supplied.palette] };
    const { result } = renderHook(() => usePaint({current:null}, {current:null}, true, 'first-visit', supplied));
    expect(result.current.getPainting()).toEqual(supplied);
    act(() => result.current.automatic());
    expect(result.current.count).toBe(2);
    expect(supplied.strokes).toHaveLength(1);
  });
  it('uses the built-in painting when no owner painting is supplied', () => {
    const { result } = renderHook(() => usePaint({current:null}, {current:null}, true, 'built-in'));
    expect(result.current.getPainting()).toEqual(newPainting());
  });
  it('always restores the viewer save ahead of the owner painting', () => {
    const saved = newPainting(); saved.strokes[0] = { type: 'auto-drip', seed: 987, pal: [...saved.palette] };
    savePainting('return-visit', saved);
    const supplied = newPainting();
    const { result } = renderHook(() => usePaint({current:null}, {current:null}, true, 'return-visit', supplied));
    expect(result.current.getPainting()).toEqual(saved);
  });
  it('start over restores and saves the owner baseline after viewer changes', () => {
    const supplied = newPainting(); supplied.strokes[0] = { type: 'auto-imp', seed: 432, pal: [...supplied.palette] };
    savePainting('reset-owner', newPainting());
    const { result } = renderHook(() => usePaint({current:null}, {current:null}, true, 'reset-owner', supplied));
    act(() => result.current.automatic());
    act(() => result.current.startOver());
    expect(result.current.getPainting()).toEqual(supplied);
    expect(loadPainting('reset-owner')).toEqual(supplied);
  });
  it('start over restores the built-in stroke rather than an empty frame', () => {
    const { result } = renderHook(() => usePaint({current:null}, {current:null}, true, 'reset-built-in'));
    act(() => result.current.automatic());
    act(() => result.current.startOver());
    expect(result.current.getPainting()).toEqual(newPainting());
    expect(loadPainting('reset-built-in')).toEqual(newPainting());
  });
});