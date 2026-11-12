import type { Hotkey } from '@videojs/react';

export const DABBLE_HOTKEYS: ReadonlyArray<Hotkey.Props> = [
  { keys: 'Space', action: 'togglePaused' },
  { keys: 'k', action: 'togglePaused' },
  { keys: 'm', action: 'toggleMuted' },
  { keys: 'f', action: 'toggleFullscreen' },
  { keys: 'c', action: 'toggleSubtitles' },
  { keys: 'ArrowLeft', action: 'seekStep', value: -5 },
  { keys: 'ArrowRight', action: 'seekStep', value: 5 },
  { keys: 'ArrowUp', action: 'volumeStep' },
  { keys: 'ArrowDown', action: 'volumeStep', value: -0.1 },
];

export function getControlSize(width: number) {
  return width < 420 ? 'small' : width < 560 ? 'medium' : 'large';
}