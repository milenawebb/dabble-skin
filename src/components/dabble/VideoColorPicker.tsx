import type { CSSProperties } from 'react';
import type { useVideoColorPicker } from './use-video-color-picker';
import './video-color-picker.css';

export function VideoColorPicker({ picker }: { picker: ReturnType<typeof useVideoColorPicker> }) {
  const { picking, bounds, point, preview, showPreview, keyboard } = picker;
  return <>
    {picking && <div className="video-pick-guide" aria-hidden="true">
      <span className="video-pick-tag" style={{ left: bounds.left + bounds.width / 2, top: bounds.top / 2 }}>{bounds.phone ? 'Tap the video' : 'Tap the video to pick a color'}</span>
      {showPreview && <span className="video-pick-preview" data-keyboard={keyboard || undefined} style={{ left: bounds.left + point.x * bounds.width, top: bounds.top + point.y * bounds.height, '--pick-preview-color': preview ?? 'var(--dabble-paper)' } as CSSProperties}><svg viewBox="0 0 24 24"><path d="M12 1V8M12 16V23M1 12H8M16 12H23" /></svg></span>}
    </div>}
    <span className="sr-only" role="status" aria-live="polite">{picker.message}</span>
  </>;
}