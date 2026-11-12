import { afterEach, describe, expect, it, vi } from 'vitest';
import { createBrushSound, followBrushVoice, getNoise, startBrushVoice, stopBrushVoice, unlockSound } from './sounds';

function audioMock() {
  const param = () => ({ value: 0, cancelScheduledValues: vi.fn(), setTargetAtTime: vi.fn(), setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() });
  const sources: Array<ReturnType<typeof source>> = [];
  const oscillators: Array<ReturnType<typeof oscillator>> = [];
  const gains: Array<ReturnType<typeof gain>> = [];
  const source = () => ({ buffer: null, loop: false, playbackRate: param(), connect: vi.fn(), start: vi.fn(), stop: vi.fn() });
  const oscillator = () => ({ type: '', frequency: param(), connect: vi.fn(), start: vi.fn(), stop: vi.fn() });
  const gain = () => ({ gain: param(), connect: vi.fn() });
  const context = {
    sampleRate: 100, currentTime: 4, destination: {}, state: 'running',
    createBuffer: vi.fn((_channels: number, length: number) => ({ getChannelData: () => new Float32Array(length) })),
    createBufferSource: () => { const node = source(); sources.push(node); return node; },
    createBiquadFilter: () => ({ type: '', frequency: param(), Q: param(), connect: vi.fn() }),
    createGain: () => { const node = gain(); gains.push(node); return node; },
    createOscillator: () => { const node = oscillator(); oscillators.push(node); return node; },
  };
  return { context: context as unknown as AudioContext, sources, oscillators, gains };
}
afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

describe('continuous brush sound', () => {
  it('creates and reuses one two-second pink noise buffer', () => {
    const { context } = audioMock();
    const first = getNoise(context);
    expect(getNoise(context)).toBe(first);
    expect(context.createBuffer).toHaveBeenCalledExactlyOnceWith(1, 200, 100);
  });
  it('follows speed with the exact gain, frequency and idle fade envelopes', () => {
    const { context } = audioMock();
    const voice = startBrushVoice(context, 'imp');
    followBrushVoice(context, voice, 1.5);
    expect(voice.g.gain.setTargetAtTime).toHaveBeenNthCalledWith(1, .55, 4, .035);
    expect(voice.g.gain.setTargetAtTime).toHaveBeenNthCalledWith(2, 0, 4.07, .09);
    expect(voice.f.frequency.setTargetAtTime).toHaveBeenCalledWith(3000, 4, .05);
  });
  it('stops both looping sources after the requested 450ms release', () => {
    vi.useFakeTimers();
    const { context, sources, oscillators } = audioMock();
    const voice = startBrushVoice(context, 'rib');
    stopBrushVoice(context, voice);
    expect(voice.g.gain.setTargetAtTime).toHaveBeenCalledWith(0, 4, .05);
    vi.advanceTimersByTime(449); expect(sources[0]?.stop).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1); expect(sources[0]?.stop).toHaveBeenCalledOnce(); expect(oscillators[0]?.stop).toHaveBeenCalledOnce();
  });
  it('uses every movement, soft landing, and replaces the fading voice before starting another', () => {
    vi.useFakeTimers();
    const mock = audioMock();
    vi.stubGlobal('AudioContext', class { constructor() { return mock.context; } });
    unlockSound();
    const sound = createBrushSound();
    sound.start('imp', 0, 0, 0);
    expect(mock.sources).toHaveLength(2); // One looping voice and one landing burst.
    expect(mock.sources[1]?.stop.mock.calls[0]?.[0]).toBeCloseTo(4.07);
    sound.move(15, 0, 10); sound.move(30, 0, 20);
    expect(mock.gains[1]?.gain.setTargetAtTime).toHaveBeenCalledTimes(4);
    expect(mock.sources).toHaveLength(2); // No per-movement bursts for Impressionist.
    sound.stop(); sound.start('cub', 0, 0, 30);
    expect(mock.sources[0]?.stop).toHaveBeenCalled(); expect(mock.oscillators[0]?.stop).toHaveBeenCalled();
    sound.move(34, 0, 40); expect(mock.sources).toHaveLength(5);
    sound.stop(true); expect(mock.oscillators[1]?.stop).toHaveBeenCalled();
    sound.move(68, 0, 50); expect(mock.sources).toHaveLength(5);
    vi.runAllTimers();
  });
});