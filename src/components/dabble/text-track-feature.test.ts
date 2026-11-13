import { expect, it } from 'vitest';
import { textTrackFeature } from '@videojs/core/dom';

it('library CC toggles hidden painted tracks off and on without losing its state', () => {
  const track = { id: 'english', kind: 'captions', language: 'en', label: 'English', mode: 'hidden', __dabblePaintedCaption: true, __dabbleCaptionOn: true };
  const media = { textTracks: [track] };
  const feature = textTrackFeature as unknown as { state: (context: { target: () => { media: typeof media } }) => { toggleSubtitles: () => boolean } };
  const state = feature.state({ target: () => ({ media }) });
  expect(state.toggleSubtitles()).toBe(false);
  expect(track.mode).toBe('disabled');
  expect(track.__dabbleCaptionOn).toBe(false);
  expect(state.toggleSubtitles()).toBe(true);
  expect(track.__dabbleCaptionOn).toBe(true);
});