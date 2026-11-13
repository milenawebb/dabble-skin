import { useEffect, useRef, useState, type ReactNode } from 'react';

export function PaintedTitle({ children }: { children: ReactNode }) {
  const root = useRef<HTMLSpanElement>(null);
  const [drawn, setDrawn] = useState(false);
  const [replay, setReplay] = useState(0);
  useEffect(() => {
    const title = root.current;
    if (!title) return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    if (reduced.matches) { setDrawn(true); return; }
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting && entry.intersectionRatio >= .6)) {
        setDrawn(true); observer.disconnect();
      }
    }, { threshold: .6 });
    observer.observe(title);
    return () => observer.disconnect();
  }, []);
  return <span ref={root} className="painted-title" data-drawn={drawn || undefined} onPointerEnter={event => {
    if (event.pointerType === 'mouse' && matchMedia('(hover: hover)').matches && drawn) setReplay(value => value + 1);
  }}>{children}<svg key={replay} aria-hidden="true" viewBox="0 0 100 12" preserveAspectRatio="none"><path pathLength="1" d="M3 7C22 4 43 8 60 6S82 6 97 5" /></svg></span>;
}
