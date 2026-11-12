import { useEffect, useRef, useState, type RefObject } from 'react';
import { renderStroke, type Brush, type Geo, type Point, type Stroke } from './paint-engine';
import { backingRatio, initialPainting, pointSpacing, strokeSize, undoPainting } from './paint-rules';
import { DEFAULT_PALETTE, loadPainting, savePainting, roundStroke, newPainting, type Painting, type Palette } from './painting-data';
import { sampleMux, sampleSource, sampleThumbnails, sampleVideo } from './video-palette';

export function usePaint(wrapperRef: RefObject<HTMLDivElement | null>, paintRef: RefObject<HTMLCanvasElement | null>, enabled: boolean, src: string, supplied?: Painting, playbackId?: string, thumbnailSampleTimes?: readonly number[]) {
  const [painting, setPainting] = useState(false);
  const [brush, setBrush] = useState<Brush>('rib');
  const [size, setSize] = useState(20);
  const [color, setColor] = useState(0);
  const strokes = useRef<Stroke[]>(supplied?.strokes ?? (enabled ? initialPainting() : []));
  const [palette, setPalette] = useState<Palette>(supplied?.palette ?? DEFAULT_PALETTE);
  const paletteRef = useRef<Palette>(palette);
  const touched = useRef(Boolean(supplied));
  const starting = useRef<Painting>(supplied ?? newPainting());
  const persist = useRef<() => void>(() => {});
  const stopSampling = useRef<() => void>(() => {});
  const [sampleMessage, setSampleMessage] = useState('');
  const [count, setCount] = useState(strokes.current.length);
  const geo = useRef<Geo | null>(null);
  const finished = useRef<HTMLCanvasElement | null>(null);
  const active = useRef<Extract<Stroke, { type: Brush }> | null>(null);
  const pointer = useRef<number | null>(null);
  const redraw = useRef<() => void>(() => {});
  const replay = useRef<() => void>(() => {});
  const settings = useRef({ painting, brush, size, color });
  settings.current = { painting: enabled && painting, brush, size, color };

  useEffect(() => {
    const identity = playbackId ?? src;
    const restored = loadPainting(identity) ?? supplied;
    const baseline = supplied ?? newPainting();
    if (!supplied && restored) {
      baseline.palette = [...restored.palette];
      baseline.strokes = baseline.strokes.map(stroke => ({ ...stroke, pal: [...restored.palette] }));
    }
    starting.current = { ...baseline, palette: [...baseline.palette], strokes: baseline.strokes.map(roundStroke) };
    touched.current = Boolean(restored);
    strokes.current = restored?.strokes ?? (enabled ? initialPainting() : []);
    paletteRef.current = restored?.palette ?? [...DEFAULT_PALETTE];
    setPalette(paletteRef.current); setCount(strokes.current.length); replay.current();
    persist.current = () => savePainting(identity, {version:1,palette:paletteRef.current,strokes:strokes.current});
    if (restored) return;
    const receive = (next: Palette) => {
      starting.current = { version: 1, palette: [...next], strokes: starting.current.strokes.map(stroke => ({ ...stroke, pal: [...next] })) };
      paletteRef.current = next; setPalette(next);
      if (!touched.current) {
        strokes.current = strokes.current.map(stroke => ({...stroke,pal:[...next]}));
        replay.current();
      }
      persist.current();
    };
    const video = wrapperRef.current?.querySelector('video');
    const cancel = playbackId ? (video ? sampleMux(video, playbackId, thumbnailSampleTimes, receive) : () => {}) : sampleSource(src, receive);
    stopSampling.current = cancel;
    return cancel;
  }, [src, supplied, enabled, playbackId, thumbnailSampleTimes]);

  useEffect(() => {
    const wrapper = wrapperRef.current, canvas = paintRef.current;
    const video = wrapper?.querySelector('video');
    if (!wrapper || !canvas || !video) return;
    const cache = document.createElement('canvas');
    finished.current = cache;
    const visibleCtx = canvas.getContext('2d'), cacheCtx = cache.getContext('2d');
    if (!visibleCtx || !cacheCtx) return;
    const clear = (ctx: CanvasRenderingContext2D) => {
      ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.restore();
    };
    const display = () => {
      const g = geo.current;
      if (!g) return;
      clear(visibleCtx);
      visibleCtx.drawImage(cache, 0, 0, cache.width, cache.height, 0, 0, g.W, g.H);
      if (active.current) renderStroke(visibleCtx, active.current, g);
    };
    redraw.current = display;
    const rebuild = () => {
      // Fullscreen belongs to the inner player, not the painted page frame.
      if (wrapper.querySelector('.dabble-skin:fullscreen')) return;
      const rect = wrapper.getBoundingClientRect(), v = video.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      const g = { W: rect.width, H: rect.height, vx: v.left - rect.left, vy: v.top - rect.top, vw: v.width, vh: v.height };
      geo.current = g;
      const ratio = backingRatio(window.devicePixelRatio);
      for (const surface of [canvas, cache]) {
        surface.width = Math.round(g.W * ratio); surface.height = Math.round(g.H * ratio);
      }
      visibleCtx.setTransform(ratio, 0, 0, ratio, 0, 0);
      cacheCtx.setTransform(ratio, 0, 0, ratio, 0, 0);
      strokes.current.forEach((stroke) => renderStroke(cacheCtx, stroke, g));
      display();
    };
    replay.current = rebuild;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const schedule = () => { clearTimeout(timer); timer = setTimeout(rebuild, 80); };
    const observer = new ResizeObserver(schedule);
    observer.observe(wrapper); observer.observe(video);
    window.addEventListener('resize', schedule);
    document.addEventListener('fullscreenchange', schedule);
    rebuild();
    const point = (event: PointerEvent, g: Geo): Point => {
      const r = canvas.getBoundingClientRect();
      return [(event.clientX - r.left) / g.W, (event.clientY - r.top) / g.H];
    };
    const start = (event: PointerEvent) => {
      const g = geo.current, options = settings.current;
      if (!options.painting || !g || pointer.current !== null || event.button !== 0) return;
      const selected = paletteRef.current[options.color];
      if (!selected) return;
      event.preventDefault();
      touched.current = true;
      pointer.current = event.pointerId;
      canvas.setPointerCapture(event.pointerId);
      active.current = { type: options.brush, seed: Math.floor(Math.random() * 2147483647), pal: [...paletteRef.current], color: selected, size: strokeSize(options.size, event.pointerType, event.pressure), pts: [point(event, g)] };
      display();
    };
    const move = (event: PointerEvent) => {
      const g = geo.current, stroke = active.current;
      if (!g || !stroke || event.pointerId !== pointer.current) return;
      const next = point(event, g), last = stroke.pts.at(-1);
      if (!last || Math.hypot((next[0] - last[0]) * g.W, (next[1] - last[1]) * g.H) < pointSpacing(stroke.type)) return;
      stroke.pts.push(next);
      stroke.size = strokeSize(settings.current.size, event.pointerType, event.pressure);
      display();
    };
    const end = (event: PointerEvent) => {
      if (pointer.current !== event.pointerId) return;
      const stroke = active.current, g = geo.current;
      if (stroke && g) {
        const rounded = roundStroke(stroke);
        renderStroke(cacheCtx, rounded, g);
        strokes.current = [...strokes.current, rounded]; setCount(strokes.current.length);
        persist.current();
      }
      active.current = null; pointer.current = null;
      if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
      display();
    };
    canvas.addEventListener('pointerdown', start); canvas.addEventListener('pointermove', move);
    canvas.addEventListener('pointerup', end); canvas.addEventListener('pointercancel', end);
    canvas.addEventListener('lostpointercapture', end);
    return () => {
      clearTimeout(timer); observer.disconnect();
      window.removeEventListener('resize', schedule); document.removeEventListener('fullscreenchange', schedule);
      canvas.removeEventListener('pointerdown', start); canvas.removeEventListener('pointermove', move);
      canvas.removeEventListener('pointerup', end); canvas.removeEventListener('pointercancel', end);
      canvas.removeEventListener('lostpointercapture', end);
      active.current = null; pointer.current = null; finished.current = null;
    };
  }, [wrapperRef, paintRef]);

  const replace = (next: Stroke[]) => {
    touched.current = true;
    strokes.current = next; setCount(next.length); replay.current(); persist.current();
  };
  return {
    painting: enabled && painting, setPainting, brush, setBrush, size, setSize, color, setColor, count, palette, sampleMessage,
    getPainting: (): Painting => ({version:1,palette:[...paletteRef.current],strokes:strokes.current.map(roundStroke)}),
    sampleFrame: async () => {
      const video = wrapperRef.current?.querySelector('video');
      if (!video || video.readyState < 2) { setSampleMessage('Play or scrub to a frame first.'); return; }
      stopSampling.current();
      const next = sampleVideo(video) ?? (playbackId ? await sampleThumbnails(playbackId, [video.currentTime]) : null);
      if (!next) return;
      touched.current = true; paletteRef.current = next; setPalette(next); setSampleMessage(''); persist.current();
    },
    undo: () => replace(undoPainting(strokes.current)),
    startOver: () => {
      stopSampling.current();
      active.current = null;
      if (pointer.current !== null && paintRef.current?.hasPointerCapture(pointer.current)) paintRef.current.releasePointerCapture(pointer.current);
      pointer.current = null;
      paletteRef.current = [...starting.current.palette];
      setPalette(paletteRef.current);
      replace(starting.current.strokes.map(roundStroke));
    },
    automatic: () => replace([...strokes.current, { type: `auto-${brush}`, seed: Math.floor(Math.random() * 2147483647), pal: [...paletteRef.current] }]),
  };
}