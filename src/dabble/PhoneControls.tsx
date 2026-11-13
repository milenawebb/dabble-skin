import { Controls, PlayButton, TimeSlider, Time, MuteButton, CaptionsButton, FullscreenButton } from '@videojs/react';
import { usePlayer } from '@videojs/react/video';
import { useEffect, useRef, useState } from 'react';
import { DABBLE_PLAYBACK_RATES } from './skin-rules';
import { HandIcon } from './HandDrawings';
import { phonePlayInStrip } from './phone-control-rules';
import { Button } from './Button';

export function PhoneControls() {
  const root = useRef<HTMLDivElement>(null);
  const [shortVideo, setShortVideo] = useState(true);
  const [speedOpen, setSpeedOpen] = useState(false);
  const speedTrigger = useRef<HTMLButtonElement>(null);
  const speedRow = useRef<HTMLDivElement>(null);
  const playbackRate = usePlayer(state => state.playbackRate);
  const setPlaybackRate = usePlayer(state => state.setPlaybackRate);
  const requestControlsLock = usePlayer(state => state.requestControlsLock);
  const toggleControls = usePlayer(state => state.toggleControls);
  useEffect(() => {
    const layer = root.current;
    const player = layer?.closest('.dabble-skin');
    if (!player) return;
    const measure = () => {
      const rect = player.getBoundingClientRect();
      setShortVideo(phonePlayInStrip(rect.height));

    };
    measure();
    const observer = new ResizeObserver(measure); observer.observe(player);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const player = root.current?.closest<HTMLElement>('.dabble-skin');
    if (!player) return;
    const pointer = () => { player.dataset['phonePointerFocus'] = ''; };
    const keyboard = () => { delete player.dataset['phonePointerFocus']; };
    player.addEventListener('pointerdown', pointer, true);
    player.addEventListener('keydown', keyboard, true);
    return () => { delete player.dataset['phonePointerFocus']; player.removeEventListener('pointerdown', pointer, true); player.removeEventListener('keydown', keyboard, true); };
  }, []);
  const closeSpeed = (keyboard = false) => {
    setSpeedOpen(false);
    if (keyboard) requestAnimationFrame(() => speedTrigger.current?.focus());
  };
  useEffect(() => {
    if (!speedOpen) return;
    const release = requestControlsLock();
    speedRow.current?.querySelector<HTMLButtonElement>('[aria-checked="true"]')?.focus({ preventScroll: true });
    const outside = (event: PointerEvent) => { if (event.target instanceof Node && !speedRow.current?.contains(event.target)) setSpeedOpen(false); };
    document.addEventListener('pointerdown', outside, true);
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); closeSpeed(true); } };
    document.addEventListener('keydown', escape, true);
    return () => { release(); document.removeEventListener('pointerdown', outside, true); document.removeEventListener('keydown', escape, true); };
  }, [speedOpen, requestControlsLock]);
  useEffect(() => {
    const layer = root.current;
    if (!layer) return;
    let releaseFocus: (() => void) | undefined;
    let releaseSeek: (() => void) | undefined;
    const focus = (event: FocusEvent) => {
      if (event.target instanceof Element && event.target.matches(':focus-visible')) releaseFocus ??= requestControlsLock();
      toggleControls(true);
    };
    const blur = (event: FocusEvent) => { if (!(event.relatedTarget instanceof Node) || !layer.contains(event.relatedTarget)) { releaseFocus?.(); releaseFocus = undefined; } };
    const down = (event: PointerEvent) => { if (event.target instanceof Element && event.target.closest('.dabble-seek')) releaseSeek ??= requestControlsLock(); };
    const end = () => { releaseSeek?.(); releaseSeek = undefined; };
    layer.addEventListener('focusin', focus); layer.addEventListener('focusout', blur); layer.addEventListener('pointerdown', down);
    window.addEventListener('pointerup', end); window.addEventListener('pointercancel', end);
    return () => { releaseFocus?.(); end(); layer.removeEventListener('focusin', focus); layer.removeEventListener('focusout', blur); layer.removeEventListener('pointerdown', down); window.removeEventListener('pointerup', end); window.removeEventListener('pointercancel', end); };
  }, [requestControlsLock, toggleControls]);
  const play = <PlayButton className={`dabble-button dabble-play ${shortVideo ? 'phone-strip-play' : 'phone-video-play'}`} label={state => state.ended ? 'Replay' : state.paused ? 'Play' : 'Pause'} render={(props, state) => <button {...props}><span className="dabble-blob" aria-hidden="true" /><HandIcon kind={state.ended ? 'replay' : state.paused ? 'play' : 'pause'} /></button>} />;
  return <div className="phone-control-root"><Controls.Root><Controls.Content ref={root} className="phone-video-controls">
    <span className="phone-video-tint" aria-hidden="true" />
    {!shortVideo && play}
    <Controls.Group className="phone-video-top" data-speed-open={speedOpen || undefined} aria-label="Playback controls">
      <Button ref={speedTrigger} variant="ghost" size="icon" aria-label="Playback speed" aria-expanded={speedOpen} className="dabble-button dabble-speed" onClick={() => setSpeedOpen(true)}><span className="dabble-blob" aria-hidden="true" />{playbackRate}x</Button>
      <CaptionsButton label="Captions" className="dabble-button dabble-captions" render={(props, state) => <button {...props} aria-pressed={state.subtitlesShowing}><span className="dabble-blob" aria-hidden="true" /><span aria-hidden="true">CC</span>{state.subtitlesShowing && <HandIcon kind="captions" className="dabble-cc-underline" />}</button>} />
      <MuteButton className="dabble-button dabble-mute" render={(props, state) => <button {...props}><span className="dabble-blob" aria-hidden="true" /><HandIcon kind={state.volumeLevel === 'off' ? 'muted' : 'volume'} /></button>} />
    </Controls.Group>
    {speedOpen && <div ref={speedRow} className="phone-speed-row" role="radiogroup" aria-label="Playback speed">
      {DABBLE_PLAYBACK_RATES.map((rate, index) => <Button key={rate} variant="ghost" role="radio" aria-checked={playbackRate === rate} tabIndex={playbackRate === rate ? 0 : -1} className="phone-speed-pill" onClick={event => { setPlaybackRate(rate); closeSpeed(event.detail === 0); }} onKeyDown={event => {
        if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault(); event.stopPropagation();
        const next = event.key === 'Home' ? 0 : event.key === 'End' ? 4 : (index + (['ArrowRight', 'ArrowDown'].includes(event.key) ? 1 : 4)) % 5;
        const rate = DABBLE_PLAYBACK_RATES[next]; if (rate !== undefined) setPlaybackRate(rate);
        speedRow.current?.querySelectorAll<HTMLButtonElement>('[role="radio"]')[next]?.focus();
      }}>{rate}x</Button>)}
    </div>}
    <Controls.Group className="dabble-bar phone-video-strip" aria-label="Timeline">
      {shortVideo && play}
      <span className="dabble-time"><Time.Value type="current" /><span aria-hidden="true">/</span><Time.Value type="duration" /></span>
      <TimeSlider.Root className="dabble-slider dabble-seek"><TimeSlider.Track className="dabble-track"><TimeSlider.Buffer className="dabble-buffer" /><TimeSlider.Fill className="dabble-fill" /></TimeSlider.Track><TimeSlider.Thumb className="dabble-thumb" /></TimeSlider.Root>
      <FullscreenButton className="dabble-button dabble-fullscreen" render={(props, state) => <button {...props}><span className="dabble-blob" aria-hidden="true" /><HandIcon kind={state.fullscreen ? 'exit' : 'fullscreen'} /></button>} />
    </Controls.Group>
  </Controls.Content></Controls.Root></div>;
}