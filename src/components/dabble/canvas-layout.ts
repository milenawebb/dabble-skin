export function getFrameWidth(playerWidth: number): number {
  if (playerWidth >= 560) return playerWidth * 0.05;
  return 24;
}

export function getVideoLayout(width: number, height: number, stage?: { canvasWidth: number; canvasLeft: number; canvasTop: number; frame: number }): { aspectRatio: number; portrait: boolean; stage?: { width: number; height: number; left: number; top: number } } {
  const aspectRatio = width > 0 && height > 0 ? width / height : 16 / 9;
  const shape = { aspectRatio, portrait: width > 0 && height > width };
  if (!stage) return shape;
  const stageWidth = Math.max(1, Math.round(stage.canvasWidth - stage.frame * 2));
  // Match the browser's 1/64px layout units before snapping screen coordinates.
  const renderedFrame = Math.floor(stage.frame * 64) / 64;
  const left = stage.canvasLeft + renderedFrame;
  const top = stage.canvasTop + renderedFrame;
  return { ...shape, stage: { width: stageWidth, height: Math.max(1, Math.round(stageWidth / aspectRatio)), left: Math.round(left) - left, top: Math.round(top) - top } };
}