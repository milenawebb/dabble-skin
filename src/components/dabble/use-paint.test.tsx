import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { usePaint } from './use-paint';
import { newPainting, savePainting, loadPainting, type Painting } from './painting-data';

vi.mock('./video-palette', () => ({ sampleSource: () => () => {}, sampleVideo: () => null }));
beforeEach(() => localStorage.clear());

describe('paint hook lifecycle', () => {
  it('restores saved viewer strokes after a preview remount and keeps clear and undo usable', () => {
    const supplied = newPainting();
    const wrapper = {current:null}, canvas = {current:null};
    const first = renderHook(() => usePaint(wrapper, canvas, true, 'refresh-video', supplied));
    act(() => first.result.current.automatic());
    const saved = first.result.current.getPainting();
    first.unmount();
    const next = renderHook(() => usePaint(wrapper, canvas, true, 'refresh-video', supplied));
    expect(next.result.current.getPainting()).toEqual(saved);
    act(() => next.result.current.setPainting(true));
    expect(next.result.current.painting).toBe(true);
    act(() => next.result.current.clear());
    expect(next.result.current.count).toBe(0); act(() => next.result.current.undo()); expect(next.result.current.getPainting()).toEqual(saved);
  });
  it('keeps hook order stable when tools and supplied paintings change', () => {
    const wrapper = {current:null}, canvas = {current:null};
    const initialProps: {enabled:boolean;supplied:Painting|undefined} = {enabled:true,supplied:undefined};
    const {result,rerender} = renderHook(({enabled,supplied}: typeof initialProps) => usePaint(wrapper,canvas,enabled,'hook-test-video',supplied), {initialProps});
    act(() => result.current.setPainting(true));
    expect(result.current.painting).toBe(true);
    rerender({enabled:false,supplied:newPainting()});
    expect(result.current.painting).toBe(false);
    expect(result.current.count).toBe(6);
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
    expect(result.current.count).toBe(7);
    expect(supplied.strokes).toHaveLength(6);
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
  it('clears and saves an empty painting after owner and viewer strokes', () => {
    const supplied = newPainting(); supplied.strokes[0] = { type: 'auto-imp', seed: 432, pal: [...supplied.palette] };
    savePainting('reset-owner', newPainting());
    const { result } = renderHook(() => usePaint({current:null}, {current:null}, true, 'reset-owner', supplied));
    act(() => result.current.automatic());
    act(() => result.current.clear());
    expect(result.current.count).toBe(0); expect(loadPainting('reset-owner')?.strokes).toEqual([]);
  });
  it('one undo restores all built-in and added strokes after clearing', () => {
    const { result } = renderHook(() => usePaint({current:null}, {current:null}, true, 'reset-built-in'));
    act(() => result.current.automatic());
    act(() => result.current.clear());
    expect(result.current.count).toBe(0); expect(loadPainting('reset-built-in')?.strokes).toEqual([]); act(() => result.current.undo()); expect(result.current.count).toBe(7);
  });
});
it('saves blank canvas and does not restore clear history after reload', () => { const first=renderHook(()=>usePaint({current:null},{current:null},true,'blank-reload')); act(()=>first.result.current.clear()); first.unmount(); const next=renderHook(()=>usePaint({current:null},{current:null},true,'blank-reload')); expect(next.result.current.count).toBe(0); expect(next.result.current.canUndo).toBe(false); act(()=>next.result.current.undo()); expect(next.result.current.count).toBe(0); });
