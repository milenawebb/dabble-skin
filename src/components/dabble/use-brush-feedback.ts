import { useEffect, useRef, type RefObject } from 'react';
import type { Brush } from './paint-engine';
import { createBrushSound } from './sounds';

export function useBrushFeedback(ref: RefObject<HTMLDivElement | null>, enabled: boolean, painting: boolean, brush: Brush) {
  const options = useRef({ enabled, painting, brush });
  options.current = { enabled, painting, brush };
  const stop = useRef<() => void>(() => {});
  useEffect(() => { if (!enabled || !painting) stop.current(); }, [enabled, painting]);
  useEffect(() => {
    const root = ref.current, video = root?.querySelector('video');
    if (!root || !video) return;
    const sound = createBrushSound();
    let pointer: number | undefined;
    const halt = () => { pointer = undefined; sound.stop(true); };
    stop.current = halt;
    const allowed = () => options.current.enabled && options.current.painting && !video.muted && !document.hidden;
    const down = (event: PointerEvent) => {
      try {
        if (!event.isTrusted || event.button !== 0 || pointer !== undefined || !allowed() || !(event.target instanceof Element) || !event.target.closest('.dabble-paint')) return;
        pointer = event.pointerId;
        sound.start(options.current.brush, event.clientX, event.clientY, event.timeStamp);
      } catch { halt(); }
    };
    const move = (event: PointerEvent) => {
      try {
        if (!event.isTrusted || event.pointerId !== pointer) return;
        if (!allowed()) { halt(); return; }
        sound.move(event.clientX, event.clientY, event.timeStamp);
      } catch { halt(); }
    };
    const end = (event: PointerEvent) => {
      if (event.pointerId !== pointer) return;
      pointer = undefined; sound.stop();
    };
    const volume = () => { if (video.muted) halt(); };
    const visibility = () => { if (document.hidden) halt(); };
    root.addEventListener('pointerdown', down, true);
    root.addEventListener('pointermove', move, true);
    window.addEventListener('pointerup', end, true);
    window.addEventListener('pointercancel', end, true);
    root.addEventListener('lostpointercapture', end, true);
    video.addEventListener('volumechange', volume);
    document.addEventListener('visibilitychange', visibility);
    window.addEventListener('blur', halt);
    return () => {
      halt(); stop.current = () => {};
      root.removeEventListener('pointerdown', down, true);
      root.removeEventListener('pointermove', move, true);
      window.removeEventListener('pointerup', end, true);
      window.removeEventListener('pointercancel', end, true);
      root.removeEventListener('lostpointercapture', end, true);
      video.removeEventListener('volumechange', volume);
      document.removeEventListener('visibilitychange', visibility);
      window.removeEventListener('blur', halt);
    };
  }, [ref]);
}