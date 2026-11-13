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

export function shouldDockControls(width: number, fullscreen: boolean) {
  return width < 420 && !fullscreen;
}

export function shouldShowVolumePopover(width: number, hoverCapable: boolean) {
  return width >= 420 && hoverCapable;
}

export function getPlaqueSpace(width: number, barHeight: number) {
  return shouldDockControls(width, false) ? barHeight + 12 : 0;
}

export const DABBLE_PLAYBACK_RATES = [0.5, 1, 1.25, 1.5, 2] as const;

export function showCenterPlay(started: boolean, ended: boolean, painting = false, paused = false) {
  return !started || ended || (painting && paused);
}

export function getCaptionLine(overlap: number, videoHeight: number, controlsVisible: boolean) {
  return controlsVisible ? Math.max(0, Math.min(98, (videoHeight - Math.max(0, overlap) - 8) / Math.max(1, videoHeight) * 100)) : 98;
}

export function getPlayerSource(src: string, broken: boolean) {
  return broken ? '/dabble-video-does-not-exist.mp4' : src;
}