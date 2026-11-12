export function getFrameWidth(playerWidth: number): number {
  if (playerWidth >= 560) return playerWidth * 0.05;
  if (playerWidth >= 420) return 20;
  return 12;
}

export function getVideoLayout(width: number, height: number) {
  if (width <= 0 || height <= 0) {
    return { aspectRatio: 16 / 9, portrait: false };
  }
  return { aspectRatio: width / height, portrait: height > width };
}