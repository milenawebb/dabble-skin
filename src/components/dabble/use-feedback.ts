import { useEffect, useRef, type RefObject } from 'react';
import type { Brush } from './paint-engine';
import { SOUND, brushSound, dragDue, followsGesture, swish, unlockSound } from './sounds';

export function useFeedback(ref: RefObject<HTMLDivElement | null>, enabled: boolean, painting: boolean, brush: Brush) {
  const options = useRef({enabled, painting, brush});
  options.current = {enabled, painting, brush};
  useEffect(() => {
    const root = ref.current, video = root?.querySelector('video');
    if (!root || !video) return;
    let lastGesture = -Infinity, lastDrag = -Infinity;
    let dragging: {id:number; paint:boolean} | undefined;
    let muted = video.muted, fullscreen = Boolean(document.fullscreenElement);
    let captions = Array.from(video.textTracks).some(track => track.mode === 'showing');
    let speedOpen = false;
    const timers = new Set<ReturnType<typeof setTimeout>>();
    const allowed = () => followsGesture(options.current.enabled, video.muted, performance.now(), lastGesture);
    const sound = (kind: keyof typeof SOUND) => { if (allowed()) swish(...SOUND[kind]); };
    const scratches = () => {
      if (!allowed()) return;
      sound('scratch');
      const timer = setTimeout(() => { timers.delete(timer); sound('scratchSecond'); }, 80);
      timers.add(timer);
    };
    const sweep = (target: Element) => {
      if (target.getAttribute('aria-disabled') === 'true') return;
      target.removeAttribute('data-stroking');
      // Restart the CSS animation even on a second press during the first sweep.
      void target.getBoundingClientRect();
      target.setAttribute('data-stroking', '');
      const timer = setTimeout(() => { timers.delete(timer); target.removeAttribute('data-stroking'); }, 340);
      // Old completion must not clear a restarted sweep.
      const previous = sweepTimers.get(target);
      if (previous) { clearTimeout(previous); timers.delete(previous); }
      sweepTimers.set(target, timer); timers.add(timer);
    };
    const sweepTimers = new Map<Element, ReturnType<typeof setTimeout>>();
    const targetElement = (event: Event) => event.target instanceof Element ? event.target : null;
    const gesture = (event: Event) => {
      if (!event.isTrusted) return;
      lastGesture = performance.now();
      if (options.current.enabled) unlockSound();
      const target = targetElement(event);
      if (event instanceof KeyboardEvent && (event.key === 'Enter' || event.key === ' ')) {
        const item = target?.closest('.dabble-speed-item');
        if (item) { sweep(item); if (item.getAttribute('aria-checked') === 'true') scratches(); }
      }
      if (!(event instanceof PointerEvent) || event.button !== 0) return;
      const paint = Boolean(target?.closest('.dabble-paint')) && options.current.painting;
      const seek = Boolean(target?.closest('.dabble-seek'));
      if (paint || seek) {
        dragging = {id:event.pointerId,paint}; lastDrag = -Infinity;
        if (paint && options.current.brush === 'drip') sound('dripDown');
      }
      if (event.pointerType === 'touch' && target?.closest('.dabble-bar .dabble-button') && options.current.enabled && !video.muted) {
        try { if (typeof navigator.vibrate === 'function') navigator.vibrate(8); } catch { /* Optional touch feedback. */ }
      }
    };
    const activate = (event: Event) => {
      if (!event.isTrusted) return;
      const target = targetElement(event)?.closest('.dabble-button, .dabble-speed-item');
      if (target) {
        sweep(target);
        if (target.matches('.dabble-speed-item[aria-checked="true"]')) scratches();
      }
    };
    const move = (event: PointerEvent) => {
      if (!event.isTrusted || !dragging || event.pointerId !== dragging.id) return;
      lastGesture = performance.now();
      if (!allowed() || !dragDue(lastGesture, lastDrag, dragging.paint)) return;
      lastDrag = lastGesture;
      swish(...(dragging.paint ? brushSound(options.current.brush) : [0.06, 1400 + Math.random() * 900, 2600, 0.07] as [number,number,number,number]));
    };
    const end = (event: PointerEvent) => { if (event.pointerId === dragging?.id) dragging = undefined; };
    const stateSweep = (selector: string) => {
      if (performance.now() - lastGesture > 500) return;
      const button = root.querySelector(selector);
      if (button && !button.hasAttribute('data-stroking')) sweep(button);
    };
    const played = () => { sound('play'); stateSweep('.dabble-play:not(.dabble-center-play)'); };
    const paused = () => { if (!video.ended) { sound('pause'); stateSweep('.dabble-play:not(.dabble-center-play)'); } };
    const volume = () => { if (muted !== video.muted) { muted = video.muted; sound('mute'); stateSweep('.dabble-mute'); } };
    const rate = () => { scratches(); stateSweep('.dabble-speed-item[aria-checked="true"]'); };
    const captionChange = () => {
      const next = Array.from(video.textTracks).some(track => track.mode === 'showing');
      if (next !== captions) { captions = next; scratches(); stateSweep('.dabble-captions'); }
    };
    const fullscreenChange = () => {
      const next = Boolean(document.fullscreenElement);
      if (next !== fullscreen) { fullscreen = next; sound('fullscreen'); stateSweep('.dabble-fullscreen'); }
    };
    const observer = new MutationObserver(() => {
      const next = root.querySelector('.dabble-speed')?.getAttribute('aria-expanded') === 'true';
      if (next && !speedOpen) scratches();
      speedOpen = next;
    });
    observer.observe(root, {subtree:true, attributes:true, attributeFilter:['aria-expanded']});
    root.addEventListener('pointerdown', gesture, true); root.addEventListener('keydown', gesture, true);
    root.addEventListener('click', activate, true); root.addEventListener('pointermove', move, true);
    root.addEventListener('pointerup', end, true); root.addEventListener('pointercancel', end, true);
    video.addEventListener('play', played); video.addEventListener('pause', paused);
    video.addEventListener('volumechange', volume); video.addEventListener('ratechange', rate);
    video.textTracks.addEventListener('change', captionChange); document.addEventListener('fullscreenchange', fullscreenChange);
    return () => {
      observer.disconnect(); timers.forEach(clearTimeout);
      root.querySelectorAll('[data-stroking]').forEach(node => node.removeAttribute('data-stroking'));
      root.removeEventListener('pointerdown', gesture, true); root.removeEventListener('keydown', gesture, true);
      root.removeEventListener('click', activate, true); root.removeEventListener('pointermove', move, true);
      root.removeEventListener('pointerup', end, true); root.removeEventListener('pointercancel', end, true);
      video.removeEventListener('play', played); video.removeEventListener('pause', paused);
      video.removeEventListener('volumechange', volume); video.removeEventListener('ratechange', rate);
      video.textTracks.removeEventListener('change', captionChange); document.removeEventListener('fullscreenchange', fullscreenChange);
    };
  }, [ref]);
  return () => {
    const video = ref.current?.querySelector('video');
    if (options.current.enabled && video && !video.muted) { unlockSound(); swish(...SOUND.automatic); }
  };
}