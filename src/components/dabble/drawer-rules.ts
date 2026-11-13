export function paintingHeight(phone: boolean, canvasHeight: number, videoBottom: number) {
  return phone ? videoBottom + 24 : canvasHeight;
}