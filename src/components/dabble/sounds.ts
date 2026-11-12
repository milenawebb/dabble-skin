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
export function dragDue(now: number, last: number) { return now - last >= 60; }

let noiseBuf: AudioBuffer | undefined;
export function getNoise(ac: AudioContext) {
  if (!noiseBuf) {
    const n = ac.sampleRate * 2;
    const b = ac.createBuffer(1, n, ac.sampleRate);
    const d = b.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < n; i++) {
      const w = Math.random() * 2 - 1;
      b0 = 0.99765 * b0 + w * 0.099046;
      b1 = 0.963 * b1 + w * 0.2965164;
      b2 = 0.57 * b2 + w * 1.0526913;
      d[i] = (b0 + b1 + b2 + w * 0.1848) * 0.25;
    }
    noiseBuf = b;
  }
  return noiseBuf;
}

export const VOICES = {
  imp: { type: 'bandpass', f: 1300, fs: 1700, q: 0.7, g: 0.55, fl: 0.38, hz: 31 },
  rib: { type: 'lowpass', f: 520, fs: 1100, q: 0.4, g: 0.50, fl: 0.07, hz: 9 },
  cub: { type: 'bandpass', f: 2400, fs: 2200, q: 2.4, g: 0.30, fl: 0.18, hz: 47 },
  drip: { type: 'lowpass', f: 300, fs: 260, q: 0.6, g: 0.22, fl: 0, hz: 5 },
} as const;

export function startBrushVoice(ac: AudioContext, kind: keyof typeof VOICES) {
  const v = VOICES[kind];
  const src = ac.createBufferSource(), f = ac.createBiquadFilter();
  const fg = ac.createGain(), g = ac.createGain();
  const lfo = ac.createOscillator(), lg = ac.createGain();
  src.buffer = getNoise(ac); src.loop = true; src.playbackRate.value = 0.9 + Math.random() * 0.2;
  f.type = v.type; f.frequency.value = v.f; f.Q.value = v.q;
  fg.gain.value = 1; g.gain.value = 0;
  lfo.type = 'triangle'; lfo.frequency.value = v.hz; lg.gain.value = v.fl;
  lfo.connect(lg); lg.connect(fg.gain);
  src.connect(f); f.connect(fg); fg.connect(g); g.connect(ac.destination);
  src.start(0, Math.random() * 1.5); lfo.start();
  return { src, f, g, lfo, v };
}

export function followBrushVoice(ac: AudioContext, o: ReturnType<typeof startBrushVoice>, speed: number) {
  const t = ac.currentTime, k = Math.min(1, speed / 1.5);
  o.g.gain.cancelScheduledValues(t);
  o.g.gain.setTargetAtTime(o.v.g * Math.pow(k, 0.7), t, 0.035);
  o.g.gain.setTargetAtTime(0, t + 0.07, 0.09);
  o.f.frequency.cancelScheduledValues(t);
  o.f.frequency.setTargetAtTime(o.v.f + o.v.fs * k, t, 0.05);
}

export function stopBrushVoice(ac: AudioContext, o: ReturnType<typeof startBrushVoice>) {
  const t = ac.currentTime;
  o.g.gain.cancelScheduledValues(t);
  o.g.gain.setTargetAtTime(0, t, 0.05);
  setTimeout(() => { try { o.src.stop(); o.lfo.stop(); } catch {} }, 450);
}

export function burst(ac: AudioContext, dur: number, f0: number, f1: number, vol: number, type: BiquadFilterType = 'bandpass') {
  const src = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(), t = ac.currentTime;
  src.buffer = getNoise(ac); src.loop = true;
  f.type = type; f.Q.value = 1;
  f.frequency.setValueAtTime(f0, t); f.frequency.exponentialRampToValueAtTime(f1, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + dur * 0.2);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(f); f.connect(g); g.connect(ac.destination);
  src.start(t, Math.random() * 1.5); src.stop(t + dur + 0.02);
}

export function createBrushSound() {
  let voice: ReturnType<typeof startBrushVoice> | undefined;
  let context: AudioContext | undefined;
  let active = false, speed = 0, distance = 0;
  let last = { x: 0, y: 0, time: 0 };
  const stop = (immediate = false) => {
    active = false;
    try {
      if (!voice || !context) return;
      if (immediate) { voice.g.gain.cancelScheduledValues(context.currentTime); voice.g.gain.value = 0; voice.src.stop(); voice.lfo.stop(); voice = undefined; }
      else stopBrushVoice(context, voice);
    } catch { voice = undefined; }
  };
  return {
    start(kind: Brush, x: number, y: number, time: number) {
      stop(true);
      try {
        unlockSound();
        if (!ac) return;
        context = ac;
        voice = startBrushVoice(context, kind); active = true;
        speed = 0; distance = 0; last = { x, y, time };
        if (kind === 'drip') burst(context, 0.11, 480, 150, 0.5, 'lowpass');
        else burst(context, 0.05, 900, 420, 0.1);
      } catch { stop(true); }
    },
    move(x: number, y: number, time: number) {
      try {
        if (!active || !voice || !context) return;
        const moved = Math.hypot(x - last.x, y - last.y), dt = Math.max(1, time - last.time);
        speed = speed * 0.6 + (moved / dt) * 0.4; distance += moved; last = { x, y, time };
        followBrushVoice(context, voice, speed);
        if (voice.v === VOICES.drip) {
          while (distance >= 26) {
            distance -= 26;
            if (Math.random() < 0.6) burst(context, 0.09, 420 + Math.random() * 200, 140, 0.42, 'lowpass');
          }
        } else if (voice.v === VOICES.cub) {
          while (distance >= 34) {
            distance -= 34; burst(context, 0.03, 3800, 2600, 0.12, 'highpass');
          }
        }
      } catch { stop(true); }
    },
    stop,
  };
}