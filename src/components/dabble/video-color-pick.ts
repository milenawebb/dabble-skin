import { fittedVideoRect } from './caption-rules';

export type PickPoint = { x: number; y: number };
export function pickPoint(video: HTMLVideoElement, clientX: number, clientY: number): PickPoint | null {
  const box = fittedVideoRect(video.getBoundingClientRect(), video.videoWidth, video.videoHeight);
  if (!box.width || !box.height || clientX < box.left || clientX > box.left + box.width || clientY < box.top || clientY > box.top + box.height) return null;
  return { x: (clientX - box.left) / box.width, y: (clientY - box.top) / box.height };
}
export function movePickPoint(point: PickPoint, key: string, shift: boolean, width: number, height: number): PickPoint {
  const step = shift ? 40 : 10;
  return { x: Math.max(0, Math.min(1, point.x + (key === 'ArrowRight' ? step : key === 'ArrowLeft' ? -step : 0) / Math.max(1, width))), y: Math.max(0, Math.min(1, point.y + (key === 'ArrowDown' ? step : key === 'ArrowUp' ? -step : 0) / Math.max(1, height))) };
}
export function averagePick(pixels: Uint8ClampedArray): string {
  const sums = [0, 0, 0];
  for (let i = 0; i < pixels.length; i += 4) for (let channel = 0; channel < 3; channel++) sums[channel] = (sums[channel] ?? 0) + (pixels[i + channel] ?? 0);
  const count = Math.max(1, pixels.length / 4);
  return `#${sums.map(sum => Math.round(sum / count).toString(16).padStart(2, '0')).join('')}`;
}
function readPixel(source: CanvasImageSource, width: number, height: number, point: PickPoint): string {
  const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Pixel reading unavailable');
  ctx.drawImage(source, 0, 0, width, height);
  const x = Math.max(0, Math.min(width - 1, Math.round(point.x * (width - 1))));
  const y = Math.max(0, Math.min(height - 1, Math.round(point.y * (height - 1))));
  const left = Math.max(0, x - 2), top = Math.max(0, y - 2);
  return averagePick(ctx.getImageData(left, top, Math.min(5, width - left), Math.min(5, height - top)).data);
}
export function liveVideoColor(video: HTMLVideoElement, point: PickPoint): string | null {
  try { return video.readyState >= 2 && video.videoWidth && video.videoHeight ? readPixel(video, video.videoWidth, video.videoHeight, point) : null; } catch { return null; }
}
export function pickThumbnailUrl(playbackId: string, time: number): string {
  return `https://image.mux.com/${encodeURIComponent(playbackId)}/thumbnail.jpg?time=${Math.max(0, time)}&width=640`;
}
export async function readVideoColor(video: HTMLVideoElement, point: PickPoint, playbackId?: string): Promise<{ color: string; source: 'live' | 'thumbnail' } | null> {
  const live = liveVideoColor(video, point);
  if (live) return { color: live, source: 'live' };
  if (!playbackId) return null;
  const image = new Image(); image.crossOrigin = 'anonymous';
  return new Promise(resolve => {
    const finish = (result: { color: string; source: 'thumbnail' } | null) => { clearTimeout(timer); image.onload = null; image.onerror = null; resolve(result); };
    const timer = setTimeout(() => finish(null), 15000);
    image.onerror = () => finish(null);
    image.onload = () => { try { finish({ color: readPixel(image, image.naturalWidth, image.naturalHeight, point), source: 'thumbnail' }); } catch { finish(null); } };
    image.src = pickThumbnailUrl(playbackId, video.currentTime);
  });
}