export const VIDEO_HINT_MS = 2000;
export function draggedVideo(x: number, y: number, nextX: number, nextY: number) {
  return Math.hypot(nextX - x, nextY - y) > 8;
}
