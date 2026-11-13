import { Controls, PlayButton, TimeSlider, Time, MuteButton, CaptionsButton, Menu, PlaybackRateRadioGroup, FullscreenButton } from '@videojs/react';
import { usePlayer } from '@videojs/react/video';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { DABBLE_PLAYBACK_RATES } from './skin-rules';
import { HandIcon } from './HandDrawings';
import { phonePlayInStrip, phoneSpeedBounds } from './phone-control-rules';
import { Button } from './Button';

export function PhoneControls() {
  const root = useRef<HTMLDivElement>(null);
  const [shortVideo, setShortVideo] = useState(true);
  const [speedOpen, setSpeedOpen] = useState(false);
  const [speedBounds, setSpeedBounds] = useState({ left: 0, top: 0, width: 0, compact: false });
  const requestControlsLock = usePlayer(state => state.requestControlsLock);
  const toggleControls = usePlayer(state => state.toggleControls);
  useEffect(() => {
    const layer = root.current;
    const player = layer?.closest('.dabble-skin');
    if (!player) return;
    const measure = () => {
      const rect = player.getBoundingClientRect();
      setShortVideo(phonePlayInStrip(rect.height));
      setSpeedBounds(phoneSpeedBounds(player.querySelector('video')?.getBoundingClientRect() ?? rect));
    };
    measure();
    const observer = new ResizeObserver(measure); observer.observe(player);
    window.addEventListener('scroll', measure, true);
    return () => { observer.disconnect(); window.removeEventListener('scroll', measure, true); };
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
  useEffect(() => {
    if (!speedOpen) return;
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); setSpeedOpen(false); } };
    document.addEventListener('keydown', escape, true);
    return () => document.removeEventListener('keydown', escape, true);
  }, [speedOpen]);
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
  return <Controls.Root><Controls.Content ref={root} className="phone-video-controls">
    <span className="phone-video-tint" aria-hidden="true" />
    {!shortVideo && play}
    <Controls.Group className="phone-video-top" data-speed-open={speedOpen || undefined} aria-label="Playback controls">
      <Menu.Root side="bottom" align="end" boundary="viewport" open={speedOpen} onOpenChange={setSpeedOpen}><PlaybackRateRadioGroup.Root rates={DABBLE_PLAYBACK_RATES} formatRate={rate => `${rate}x`}>
        <Menu.Trigger aria-label="Playback speed" className="dabble-button dabble-speed" render={<button type="button" />}><span className="dabble-blob" aria-hidden="true" /><PlaybackRateRadioGroup.Value aria-hidden="true" /></Menu.Trigger>
        <Menu.Popup className="dabble-speed-menu phone-video-speed-menu" data-compact={speedBounds.compact || undefined} style={{ '--phone-speed-left': `${speedBounds.left}px`, '--phone-speed-top': `${speedBounds.top}px`, '--phone-speed-width': `${speedBounds.width}px` } as CSSProperties}><Menu.Content className="phone-speed-content"><Button variant="ghost" size="icon" className="phone-speed-close" aria-label="Close speed" onClick={() => setSpeedOpen(false)}><svg className="dabble-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 5 12 14M18 5 6 19" /></svg></Button><PlaybackRateRadioGroup.Options renderItem={(props, item) => <Menu.RadioItem {...props} key={item.value} className="dabble-speed-item"><span>{item.label}</span></Menu.RadioItem>} /></Menu.Content></Menu.Popup>
      </PlaybackRateRadioGroup.Root></Menu.Root>
      <CaptionsButton label="Captions" className="dabble-button dabble-captions" render={(props, state) => <button {...props} aria-pressed={state.subtitlesShowing}><span className="dabble-blob" aria-hidden="true" /><span aria-hidden="true">CC</span>{state.subtitlesShowing && <HandIcon kind="captions" className="dabble-cc-underline" />}</button>} />
      <MuteButton className="dabble-button dabble-mute" render={(props, state) => <button {...props}><span className="dabble-blob" aria-hidden="true" /><HandIcon kind={state.volumeLevel === 'off' ? 'muted' : 'volume'} /></button>} />
    </Controls.Group>
    <Controls.Group className="dabble-bar phone-video-strip" aria-label="Timeline">
      {shortVideo && play}
      <span className="dabble-time"><Time.Value type="current" /><span aria-hidden="true">/</span><Time.Value type="duration" /></span>
      <TimeSlider.Root className="dabble-slider dabble-seek"><TimeSlider.Track className="dabble-track"><TimeSlider.Buffer className="dabble-buffer" /><TimeSlider.Fill className="dabble-fill" /></TimeSlider.Track><TimeSlider.Thumb className="dabble-thumb" /></TimeSlider.Root>
      <FullscreenButton className="dabble-button dabble-fullscreen" render={(props, state) => <button {...props}><span className="dabble-blob" aria-hidden="true" /><HandIcon kind={state.fullscreen ? 'exit' : 'fullscreen'} /></button>} />
    </Controls.Group>
  </Controls.Content></Controls.Root>;
}