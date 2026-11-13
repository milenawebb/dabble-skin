export function phonePanelWidth(canvasWidth: number, viewportWidth: number) {
  return Math.max(canvasWidth, Math.min(332, viewportWidth));
}
export function phonePanelPadding(width: number) {
  return Math.min(12, Math.max(0, (width - 7 * 44) / 2));
}
export function nextBrushSize(size: number) {
  return size === 10 ? 20 : size === 20 ? 34 : 10;
}