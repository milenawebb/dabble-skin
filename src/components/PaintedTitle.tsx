import type { ReactNode } from 'react';

export function PaintedTitle({ children }: { children: ReactNode }) {
  return <span className="painted-title">{children}<svg aria-hidden="true" viewBox="0 0 100 12" preserveAspectRatio="none"><path pathLength="1" d="M3 7C22 4 43 8 60 6S82 6 97 5" /></svg></span>;
}