import { Container, Controls, PlayButton, TimeSlider, Time, MuteButton, VolumePopover, VolumeSlider, CaptionsButton, Menu, PlaybackRateRadioGroup, FullscreenButton, Hotkey, StatusAnnouncer, Poster, Gesture, BufferingIndicator, ErrorDialog } from '@videojs/react';
import { usePlayer } from '@videojs/react/video';
import { useEffect, useId, useRef, useState, type ReactNode, type CSSProperties } from 'react';
import './dabble-skin.css';
import { DABBLE_HOTKEYS, DABBLE_PLAYBACK_RATES, getCaptionLine, getControlSize, shouldDockControls, shouldShowVolumePopover, showCenterPlay } from './skin-rules';
import { tintForInk } from './palette';
import { DEFAULT_PALETTE, type Palette } from './painting-data';
import { HandIcon as Icon } from './HandDrawings';

function Blob() { return <span className="dabble-blob" aria-hidden="true" />; }

export function DabbleSkin({ children, painting = false, palette = DEFAULT_PALETTE, onControlsState }: { children: ReactNode; painting?: boolean; palette?: Palette; onControlsState?: (state: { visible: boolean; paused: boolean }) => void }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<'small' | 'medium' | 'large'>('large');
  const [playerWidth, setPlayerWidth] = useState(860);
  const [hoverCapable, setHoverCapable] = useState(false);
  const [volumeOpen, setVolumeOpen] = useState(false);
  const muteRef = useRef<HTMLButtonElement>(null);
  const volumeEscape = useRef(false);
  const fullscreenActive = usePlayer((state) => state.isFullscreen);
  const docked = shouldDockControls(playerWidth, fullscreenActive);
  const progress = usePlayer((state) => state.duration > 0 ? Math.min(100, Math.max(0, state.currentTime / state.duration * 100)) : 0);
  const started = usePlayer((state) => state.started);
  const ended = usePlayer((state) => state.ended);
  const controlsVisible = usePlayer((state) => state.controlsVisible);
  const paused = usePlayer((state) => state.paused);
  const hasError = usePlayer((state) => Boolean(state.error));
  const requestControlsLock = usePlayer((state) => state.requestControlsLock);
  const centerVisible = showCenterPlay(started, ended) && !hasError;
  const centerRef = useRef<HTMLButtonElement>(null);
  const playRef = useRef<HTMLButtonElement>(null);
  const centerHadFocus = useRef(false);
  const captionId = useId().replace(/[^a-zA-Z0-9_-]/g, '');

  useEffect(() => { onControlsState?.({ visible: controlsVisible, paused }); }, [controlsVisible, paused, onControlsState]);
  useEffect(() => {
    const canvas = rootRef.current?.closest('.dabble-canvas');
    if (!canvas) return;
    let release: (() => void) | undefined;
    const activity = (event: Event) => {
      const active = (event as CustomEvent<boolean>).detail;
      if (active) release ??= requestControlsLock();
      else { release?.(); release = undefined; }
    };
    canvas.addEventListener('dabble-tray-activity', activity);
    return () => { canvas.removeEventListener('dabble-tray-activity', activity); release?.(); };
  }, [requestControlsLock]);

  useEffect(() => {
    return ended || docked || volumeOpen ? requestControlsLock() : undefined;
  }, [ended, docked, volumeOpen, requestControlsLock]);

  useEffect(() => {
    const query = window.matchMedia('(any-hover: hover) and (any-pointer: fine)');
    const update = () => setHoverCapable(query.matches);
    update(); query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  const showVolume = shouldShowVolumePopover(playerWidth, hoverCapable);
  useEffect(() => { if (!showVolume) setVolumeOpen(false); }, [showVolume]);

  useEffect(() => {
    if (!centerVisible && centerHadFocus.current) {
      playRef.current?.focus();
      centerHadFocus.current = false;
    }
  }, [centerVisible]);

  useEffect(() => {
    const root = rootRef.current;
    const video = root?.querySelector('video');
    const bar = root?.querySelector<HTMLElement>('.dabble-bar');
    if (!root || !video || !bar) return;
    const originalLines = new Map<VTTCue, { line: number | 'auto'; snap: boolean; align: LineAlignSetting }>();
    // Native cue boxes do not inherit custom properties from the video in Chromium.
    // Resolve the existing semantic tokens, leaving rendering entirely to the browser.
    const cueStyle = document.createElement('style');
    root.append(cueStyle);
    const positionCues = () => {
      const visible = !(painting && !docked && !fullscreenActive) && (controlsVisible || Boolean(root.querySelector(':focus-visible')));
      const overlap = Math.max(0, video.getBoundingClientRect().bottom - bar.getBoundingClientRect().top);
      const lineHeight = Math.min(20, Math.max(14, root.clientWidth * 0.022)) * 1.35;
      const tokens = getComputedStyle(root);
      cueStyle.textContent = `[data-caption-id="${captionId}"] video::cue { color: ${tokens.getPropertyValue('--dabble-caption-text')}; background-color: ${tokens.getPropertyValue('--dabble-ink')}; font-family: ${tokens.getPropertyValue('--dabble-ui-font')}; font-weight: 500; font-size: ${lineHeight / 1.35}px; line-height: 1.35; text-shadow: none; }`;
      for (const track of Array.from(video.textTracks)) {
        for (const cue of Array.from(track.cues ?? [])) {
          if (!(cue instanceof VTTCue)) continue;
          if (!originalLines.has(cue)) originalLines.set(cue, { line: cue.line, snap: cue.snapToLines, align: cue.lineAlign });
          const line = getCaptionLine(overlap, video.getBoundingClientRect().height, visible);
          if (cue.snapToLines) cue.snapToLines = false;
          cue.lineAlign = 'end';
          if (cue.line !== line) cue.line = line;
        }
      }
    };
    positionCues();
    const observer = new ResizeObserver(positionCues);
    observer.observe(root);
    observer.observe(bar);
    const tracks = Array.from(video.textTracks);
    tracks.forEach((track) => track.addEventListener('cuechange', positionCues));
    video.textTracks.addEventListener('change', positionCues);
    video.addEventListener('loadeddata', positionCues);
    video.addEventListener('timeupdate', positionCues);
    // Capture track load, which doesn't bubble, including asynchronously loaded cues.
    video.addEventListener('load', positionCues, true);
    root.addEventListener('focusin', positionCues);
    root.addEventListener('focusout', positionCues);
    return () => {
      observer.disconnect();
      cueStyle.remove();
      tracks.forEach((track) => track.removeEventListener('cuechange', positionCues));
      video.textTracks.removeEventListener('change', positionCues);
      video.removeEventListener('loadeddata', positionCues);
      video.removeEventListener('timeupdate', positionCues);
      video.removeEventListener('load', positionCues, true);
      root.removeEventListener('focusin', positionCues);
      root.removeEventListener('focusout', positionCues);
      originalLines.forEach((original, cue) => { cue.line = original.line; cue.snapToLines = original.snap; cue.lineAlign = original.align; });
    };
  }, [controlsVisible, size, captionId, painting, docked, fullscreenActive]);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = root?.closest('.dabble-canvas');
    if (!root || !canvas) return;
    const measure = () => {
      const width = (document.fullscreenElement === root ? root : canvas).getBoundingClientRect().width;
      setSize(getControlSize(width));
      setPlayerWidth(width);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(canvas);
    observer.observe(root);
    document.addEventListener('fullscreenchange', measure);
    return () => { observer.disconnect(); document.removeEventListener('fullscreenchange', measure); };
  }, []);

  const play = <PlayButton ref={playRef} label={(state) => state.ended ? 'Replay' : state.paused ? 'Play' : 'Pause'} className="dabble-button dabble-play" render={(props, state) => <button {...props} tabIndex={centerVisible ? -1 : props.tabIndex} aria-hidden={centerVisible || undefined}><Blob /><Icon kind={state.ended ? 'replay' : state.paused ? 'play' : 'pause'} /></button>} />;
  const muteButton = <MuteButton ref={muteRef} className="dabble-button dabble-mute" render={(props, state) => <button {...props} data-on={state.muted}><Blob /><Icon kind={state.volumeLevel === 'off' ? 'muted' : 'volume'} /></button>} />;
  const mute = showVolume ? <VolumePopover.Root openOnHover closeDelay={150} side="top" align="center" boundary="container" open={volumeOpen} onOpenChange={(open, details) => {
    if (!open && details.reason === 'click') return;
    if (open && volumeEscape.current) return;
    setVolumeOpen(open);
  }}>
    <VolumePopover.Trigger render={(triggerProps) => {
      // Hover/focus owns popup visibility; clicks belong only to MuteButton.
      const { onClick: _togglePopup, ref: triggerRef, ...props } = triggerProps;
      return <MuteButton {...props} ref={(element) => {
        muteRef.current = element;
        if (typeof triggerRef === 'function') return triggerRef(element);
        if (triggerRef) triggerRef.current = element;
      }} className="dabble-button dabble-mute" render={(buttonProps, state) => <button {...buttonProps} data-on={state.muted}><Blob /><Icon kind={state.volumeLevel === 'off' ? 'muted' : 'volume'} /></button>} />;
    }} onFocus={() => { if (!volumeEscape.current) setVolumeOpen(true); }} onBlur={() => { volumeEscape.current = false; }} onPointerEnter={() => { volumeEscape.current = false; setVolumeOpen(true); }} onKeyDown={event => { if (event.key === 'Escape') { volumeEscape.current = true; setVolumeOpen(false); } }} />
    <VolumePopover.Popup className="dabble-volume-popup" onKeyDown={event => { if (event.key === 'Escape') { volumeEscape.current = true; setVolumeOpen(false); muteRef.current?.focus(); } }}>
      <VolumeSlider.Root orientation="vertical" className="dabble-volume-vertical"><VolumeSlider.Track className="dabble-volume-track"><VolumeSlider.Fill className="dabble-volume-fill" /></VolumeSlider.Track><VolumeSlider.Thumb className="dabble-volume-thumb" /></VolumeSlider.Root>
    </VolumePopover.Popup>
  </VolumePopover.Root> : muteButton;
  const captions = <CaptionsButton label="Captions" className="dabble-button dabble-captions" render={(props, state) => <button {...props} aria-pressed={state.subtitlesShowing} data-on={state.subtitlesShowing}><Blob /><span aria-hidden="true">CC</span>{state.subtitlesShowing && <Icon kind="captions" className="dabble-cc-underline" />}</button>} />;
  const speed = <Menu.Root side="top" align="end" boundary="container"><PlaybackRateRadioGroup.Root rates={DABBLE_PLAYBACK_RATES} formatRate={(rate) => `${rate}x`}><Menu.Trigger aria-label="Playback speed" className="dabble-button dabble-speed" render={<button type="button" />}><Blob /><PlaybackRateRadioGroup.Value aria-hidden="true" /></Menu.Trigger><Menu.Popup className="dabble-speed-menu"><Menu.Content><PlaybackRateRadioGroup.Options renderItem={(props, item) => <Menu.RadioItem {...props} key={item.value} className="dabble-speed-item"><Blob />{item.label}</Menu.RadioItem>} /></Menu.Content></Menu.Popup></PlaybackRateRadioGroup.Root></Menu.Root>;
  const fullscreen = <FullscreenButton className="dabble-button dabble-fullscreen" render={(props, state) => <button {...props}><Blob /><Icon kind={state.fullscreen ? 'exit' : 'fullscreen'} /></button>} />;
  const seek = <TimeSlider.Root className="dabble-slider dabble-seek"><TimeSlider.Track className="dabble-track"><TimeSlider.Buffer className="dabble-buffer" /><TimeSlider.Fill className="dabble-fill" /></TimeSlider.Track><TimeSlider.Thumb className="dabble-thumb" /></TimeSlider.Root>;
  const time = <span className="dabble-time"><Time.Value type="current" /><span aria-hidden="true">/</span><Time.Value type="duration" /></span>;
  const colors = { '--dabble-seek':palette[0], '--dabble-b1':tintForInk(palette[4]), '--dabble-b2':tintForInk(palette[3]), '--dabble-b3':tintForInk(palette[2]), '--dabble-b4':tintForInk(palette[5]), '--dabble-b5':tintForInk(palette[1]) } as CSSProperties;

  return (
    <Container ref={rootRef} aria-label="Dabble video player" style={colors} className="dabble-skin" data-size={size} data-painting={painting || undefined} data-docked={docked || undefined} data-caption-id={captionId} data-invitation={centerVisible || undefined}>
      {children}
      <Poster.Root className="dabble-poster"><Poster.Image /></Poster.Root>
      <Gesture type="tap" action="togglePaused" />
      <PlayButton ref={centerRef} hidden={!centerVisible} label={ended ? 'Replay' : 'Play'} className="dabble-button dabble-play dabble-center-play" render={(props) => <button {...props} onFocus={(event) => { props.onFocus?.(event); centerHadFocus.current = event.currentTarget.matches(':focus-visible'); }} onBlur={(event) => { props.onBlur?.(event); if (event.relatedTarget) centerHadFocus.current = false; }}><Blob /><Icon kind={ended ? 'replay' : 'play'} /></button>} />
      <BufferingIndicator className="dabble-loading" render={(props, state) => <div {...props} role="status" aria-live="polite">{state.visible && <><span className="dabble-loading-disc" aria-hidden="true"><span /></span><span className="dabble-loading-label">Loading</span></>}</div>} />
      <Controls.Root>
        <Controls.Content className="dabble-bar" inert={painting && !docked && !fullscreenActive}>
          {size === 'small' ? <><Controls.Group className="dabble-row" aria-label="Timeline">{seek}{time}</Controls.Group><Controls.Group className="dabble-row dabble-buttons-row" aria-label="Playback controls">{play}{mute}{captions}{speed}{fullscreen}</Controls.Group></> : <Controls.Group className="dabble-row" aria-label="Playback controls">{play}{seek}{time}{mute}{captions}{speed}{fullscreen}</Controls.Group>}
        </Controls.Content>
      </Controls.Root>
      <div className="dabble-progress" aria-hidden="true" style={{ '--dabble-progress': `${progress}%` } as CSSProperties}><span className="dabble-progress-fill" /></div>
      {DABBLE_HOTKEYS.map((binding) => <Hotkey key={binding.keys} {...binding} />)}
      <StatusAnnouncer className="dabble-announcer" />
      <ErrorDialog.Root><ErrorDialog.Backdrop className="dabble-error-backdrop" /><ErrorDialog.Popup className="dabble-error"><ErrorDialog.Title className="dabble-error-title">This video can't be played</ErrorDialog.Title><ErrorDialog.Description className="dabble-error-description" /><ErrorDialog.Close className="dabble-button dabble-error-close">Close</ErrorDialog.Close></ErrorDialog.Popup></ErrorDialog.Root>
    </Container>
  );
}