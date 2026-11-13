export const DISCOVERY_KEY = 'dabble-painted-once';
export const BORDER_HINT_MS = 3000;
export const VIDEO_HINT_MS = 2000;
export function hasPaintedBefore() {
  try { return localStorage.getItem(DISCOVERY_KEY) === 'yes'; } catch { return false; }
}
export function rememberFirstStroke() {
  try { localStorage.setItem(DISCOVERY_KEY, 'yes'); } catch { /* Optional storage. */ }
}
export function draggedVideo(x: number, y: number, nextX: number, nextY: number) {
  return Math.hypot(nextX - x, nextY - y) > 8;
}