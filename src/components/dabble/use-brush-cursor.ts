import { useEffect, type RefObject } from 'react';
import type { Brush } from './paint-engine';
import { brushCursor, cursorDiameter } from './tray-rules';

export function useBrushCursor(wrapperRef: RefObject<HTMLDivElement | null>, canvasRef: RefObject<HTMLCanvasElement | null>, size: number, color: string, brush: Brush) {
  useEffect(() => {
    const wrapper = wrapperRef.current, canvas = canvasRef.current;
    if (!wrapper || !canvas) return;
    const update = () => {
      const tokens = getComputedStyle(wrapper);
      canvas.style.setProperty('--dabble-brush-cursor', brushCursor(cursorDiameter(size, wrapper.getBoundingClientRect().width, brush), color, tokens.getPropertyValue('--dabble-ink').trim(), tokens.getPropertyValue('--dabble-paper').trim()));
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(wrapper);
    return () => { observer.disconnect(); canvas.style.removeProperty('--dabble-brush-cursor'); };
  }, [wrapperRef, canvasRef, size, color, brush]);
}