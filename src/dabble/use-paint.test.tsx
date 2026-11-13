import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { usePaint } from './use-paint';
import { newPainting, savePainting, loadPainting, type Painting } from './painting-data';

const sampling = vi.hoisted(() => ({ live: vi.fn(), thumbnail: vi.fn() }));
vi.mock('./paint-engine', () => ({ renderStroke: vi.fn() }));
vi.mock('./video-palette', () => ({ sampleSource: () => () => {}, sampleVideo: sampling.live, sampleThumbnails: sampling.thumbnail }));
beforeEach(() => localStorage.clear());

it('sizes the paint backing store from the frame on repeated resizes, never from its previous bitmap', () => {
  let resize = () => {};
  vi.stubGlobal('ResizeObserver', class { constructor(callback: () => void) { resize = callback; } observe() {} disconnect() {} });
  vi.useFakeTimers();
  const context = { save: vi.fn(), restore: vi.fn(), setTransform: vi.fn(), clearRect: vi.fn(), drawImage: vi.fn() };
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context as unknown as CanvasRenderingContext2D);
  const wrapper = document.createElement('div'), canvas = document.createElement('canvas'), video = document.createElement('video');
  wrapper.append(canvas, video);
  let height = 220;
  vi.spyOn(wrapper, 'getBoundingClientRect').mockImplementation(() => ({ width: 340, height, left: 0, top: 0 } as DOMRect));
  vi.spyOn(video, 'getBoundingClientRect').mockReturnValue({ width: 292, height: 164, left: 24, top: 24 } as DOMRect);
  vi.stubGlobal('devicePixelRatio', 2);
  const hook = renderHook(() => usePaint({ current: wrapper }, { current: canvas }, true, 'resize-frame'));
  expect(canvas.height).toBe(440);
  expect(canvas.width).toBe(680);
  height = 180;
  act(() => { resize(); vi.advanceTimersByTime(80); });
  expect(canvas.height).toBe(360);
  act(() => { resize(); vi.advanceTimersByTime(80); });
  expect(canvas.height).toBe(360);
  hook.unmount(); vi.restoreAllMocks(); vi.unstubAllGlobals(); vi.useRealTimers();
});

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

it('refreshes the palette without changing selection or existing stroke colors, and persists it', async () => {
  const next: Painting['palette'] = ['#123456','#234567','#345678','#456789','#56789a','#6789ab'];
  sampling.live.mockReturnValue(next);
  const video = document.createElement('video');
  const wrapper = document.createElement('div'); wrapper.append(video);
  const supplied = newPainting(); const root = {current:wrapper}; const canvas = {current:null};
  const { result } = renderHook(() => usePaint(root, canvas, true, 'scene-refresh', supplied));
  act(() => result.current.setColor(3));
  const before = result.current.getPainting().strokes;
  await act(() => result.current.sampleFrame());
  expect(result.current.color).toBe(3);
  expect(result.current.palette).toEqual(next);
  expect(result.current.getPainting().strokes).toEqual(before);
  expect(loadPainting('scene-refresh')?.palette).toEqual(next);
  act(() => result.current.automatic());
  expect(result.current.getPainting().strokes.at(-1)?.pal).toEqual(next);
});
it('falls back to a thumbnail at the current time without seeking or playing', async () => {
  sampling.live.mockReturnValue(null);
  const next = newPainting().palette;
  sampling.thumbnail.mockResolvedValue(next);
  const video = document.createElement('video'); video.currentTime = 17;
  const play = vi.spyOn(video, 'play'); const pause = vi.spyOn(video, 'pause');
  const wrapper = document.createElement('div'); wrapper.append(video);
  const supplied = newPainting(); const root = {current:wrapper}; const canvas = {current:null};
  const { result } = renderHook(() => usePaint(root, canvas, true, 'scene-fallback', supplied, 'film-id'));
  await act(() => result.current.sampleFrame());
  expect(sampling.thumbnail).toHaveBeenCalledWith('film-id', [17]);
  expect(result.current.palette).toEqual(next);
  expect(video.currentTime).toBe(17);
  expect(play).not.toHaveBeenCalled(); expect(pause).not.toHaveBeenCalled();
});
