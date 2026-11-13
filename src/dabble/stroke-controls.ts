export const STROKE_RETURN_DELAY = 1000;
export function suppressPaintingControls(width: number, fullscreen: boolean, phonePainting: boolean, strokeHold: boolean) {
  return !fullscreen && (width < 420 ? phonePainting : strokeHold);
}