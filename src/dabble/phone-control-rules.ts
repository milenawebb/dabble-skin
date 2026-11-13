export function usesPhoneOverlay(width: number, fullscreen: boolean) {
  return width > 0 && width < 420 && !fullscreen;
}
export function phonePlayInStrip(videoHeight: number) {
  return videoHeight < 180;
}
export function phoneCaptionBottom(video: { top: number; height: number }, stripTop: number, showing: boolean) {
  return showing ? Math.min(stripTop - 2, video.top + video.height - 8) : video.top + video.height - 8;
}