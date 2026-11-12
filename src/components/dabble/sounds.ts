import type { Brush } from './paint-engine';

let ac: AudioContext | undefined;
export function unlockSound() {
  try {
    ac = ac || new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    if (ac.state === 'suspended') void ac.resume().catch(() => {});
  } catch { /* Optional audio never interrupts a gesture. */ }
}
export function swish(dur: number, f0: number, f1: number, vol: number, type: BiquadFilterType = 'bandpass') {
  try {
    ac = ac || new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    if (ac.state === 'suspended') void ac.resume().catch(() => {});
    const n = Math.floor(ac.sampleRate * dur);
    const buf = ac.createBuffer(1, n, ac.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    const src = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(), t = ac.currentTime;
    src.buffer = buf; f.type = type; f.Q.value = 1.2;
    f.frequency.setValueAtTime(f0, t);
    f.frequency.exponentialRampToValueAtTime(f1, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + dur * 0.25);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f); f.connect(g); g.connect(ac.destination);
    src.start(t); src.stop(t + dur);
  } catch { /* sound is optional, never throw */ }
}

type Sound = [number, number, number, number, BiquadFilterType?];
type SoundName = 'play' | 'pause' | 'mute' | 'scratch' | 'scratchSecond' | 'fullscreen' | 'automatic' | 'dripDown';
export const SOUND: Record<SoundName, Sound> = {
  play: [0.32, 700, 2600, 0.25], pause: [0.14, 1800, 600, 0.20],
  mute: [0.07, 320, 140, 0.40, 'lowpass'],
  scratch: [0.07, 3500, 5000, 0.14, 'highpass'],
  scratchSecond: [0.07, 3800, 5200, 0.12, 'highpass'],
  fullscreen: [0.42, 400, 3200, 0.20], automatic: [0.40, 500, 2800, 0.20],
  dripDown: [0.09, 500, 180, 0.40, 'lowpass'],
};

export function followsGesture(enabled: boolean, muted: boolean, now: number, lastGesture: number) {
  return enabled && !muted && now >= lastGesture && now - lastGesture <= 500;
}
export function dragDue(now: number, last: number, painting: boolean) { return now - last >= (painting ? 70 : 60); }
export function brushSound(brush: Brush): Sound {
  if (brush === 'cub') return [0.04, 3000, 4200, 0.10, 'highpass'];
  if (brush === 'drip') return [0.07, 600, 200, 0.30, 'lowpass'];
  return [0.07, 1200 + Math.random() * 900, 2400, 0.09];
}