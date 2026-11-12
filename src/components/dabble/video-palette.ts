import { paletteFromPixels } from './palette';
import { isPalette, type Palette } from './painting-data';

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