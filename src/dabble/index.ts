import './canvas.css';
// The public entry for the player and the shared demo drawing/shortcut utilities.
export { DabblePlayer, type DabblePlayerProps } from './DabblePlayer';
export { type Painting, type Palette, DEFAULT_PALETTE } from './painting-data';
export { renderStroke, type Brush, type Point, type Stroke, type Geo } from './paint-engine';
export { HandIcon, type HandIconKind } from './HandDrawings';
export { PLAYER_KEYS, PAINT_KEYS } from './KeysPanel';
export { SHORTCUT_EVENT, keycapFor, keycapSoundAllowed } from './page-feedback';
export { SOUND, swish, unlockSound } from './sounds';
