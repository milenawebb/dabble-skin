import { paletteFromPixels } from './palette';
import { isPalette, type Palette } from './painting-data';

export function thumbnailTimes(duration: number): number[] {
  return Number.isFinite(duration) && duration > 0 ? [0.15, 0.35, 0.55, 0.75].map(fraction => duration * fraction) : [];
}

export function muxThumbnail(playbackId: string, time: number): string {
  return `https://image.mux.com/${encodeURIComponent(playbackId)}/thumbnail.jpg?time=${Math.max(0, time)}&width=64&height=36&fit_mode=crop`;
}

async function thumbnailPixels(url: string): Promise<Uint8ClampedArray | null> {
  const image = new Image();
  image.crossOrigin = 'anonymous';
  return new Promise(resolve => {
    const timeout = setTimeout(() => finish(null), 15000);
    const finish = (pixels: Uint8ClampedArray | null) => { clearTimeout(timeout); image.onload = null; image.onerror = null; resolve(pixels); };
    image.onerror = () => finish(null);
    image.onload = () => {
      try {
        const canvas = document.createElement('canvas'); canvas.width = 64; canvas.height = 36;
        const ctx = canvas.getContext('2d');
        if (!ctx) { finish(null); return; }
        ctx.drawImage(image, 0, 0, 64, 36);
        finish(ctx.getImageData(0, 0, 64, 36).data);
      } catch { finish(null); }
    };
    image.src = url;
  });
}

export async function sampleThumbnails(playbackId: string, times: readonly number[]): Promise<Palette | null> {
  const images = (await Promise.all(times.map(time => thumbnailPixels(muxThumbnail(playbackId, time))))).filter((pixels): pixels is Uint8ClampedArray => pixels !== null);
  if (!images.length) return null;
  const pixels = new Uint8ClampedArray(images.reduce((length, image) => length + image.length, 0));
  let offset = 0;
  for (const image of images) { pixels.set(image, offset); offset += image.length; }
  const palette = paletteFromPixels(pixels);
  return isPalette(palette) ? palette : null;
}

export function sampleMux(video: HTMLVideoElement, playbackId: string, times: readonly number[] | undefined, receive: (palette: Palette) => void) {
  let disposed = false, started = false;
  const sample = () => {
    const frames = times ?? thumbnailTimes(video.duration);
    if (started || !frames.length) return;
    started = true;
    void sampleThumbnails(playbackId, frames).then(palette => { if (palette && !disposed) receive(palette); });
  };
  video.addEventListener('durationchange', sample); video.addEventListener('loadedmetadata', sample); sample();
  return () => { disposed = true; video.removeEventListener('durationchange', sample); video.removeEventListener('loadedmetadata', sample); };
}

export function sampleVideo(video: HTMLVideoElement): Palette | null {
  try {
    if (video.readyState < 2 || !video.videoWidth || !video.videoHeight) return null;
    const canvas = document.createElement('canvas'); canvas.width = 64; canvas.height = 36;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0, 64, 36);
    const palette = paletteFromPixels(ctx.getImageData(0, 0, 64, 36).data);
    return isPalette(palette) ? palette : null;
  } catch { return null; }
}
export function sampleSource(src: string, receive: (palette: Palette) => void) {
  const video = document.createElement('video');
  video.crossOrigin = 'anonymous'; video.muted = true; video.preload = 'metadata';
  video.tabIndex = -1; video.setAttribute('aria-hidden','true'); video.hidden = true;
  let disposed = false;
  const cleanup = () => {
    if (disposed) return;
    disposed = true; clearTimeout(timeout);
    video.removeEventListener('loadedmetadata', metadata); video.removeEventListener('seeked', read); video.removeEventListener('error', cleanup);
    video.removeAttribute('src'); video.load(); video.remove();
  };
  const read = () => { const palette = sampleVideo(video); if (palette && !disposed) receive(palette); cleanup(); };
  const metadata = () => {
    try { if (!Number.isFinite(video.duration) || video.duration <= 0) { cleanup(); return; } video.currentTime = Math.min(3, video.duration * 0.1); } catch { cleanup(); }
  };
  const timeout = setTimeout(cleanup, 15000);
  video.addEventListener('loadedmetadata', metadata); video.addEventListener('seeked', read); video.addEventListener('error', cleanup);
  document.body.append(video); video.src = src;
  return cleanup;
}