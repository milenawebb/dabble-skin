export function usesPhoneOverlay(width: number, fullscreen: boolean) {
  return width > 0 && width < 420 && !fullscreen;
}
export function phonePlayInStrip(videoHeight: number) {
  return videoHeight < 180;
}
export function phoneSpeedBounds(video: { left: number; top: number; width: number }) {
  const width = Math.max(0, video.width - 16);
  return { left: video.left + 8, top: video.top + 8, width, compact: (width - 44) / 5 < 40 };
}
export function phoneCaptionBottom(video: { top: number; height: number }, stripTop: number, showing: boolean) {
  return showing ? Math.min(stripTop - 2, video.top + video.height - 8) : video.top + video.height - 8;
}