import { Container, Controls, PlayButton, TimeSlider, Time, MuteButton, VolumePopover, VolumeSlider, CaptionsButton, Menu, PlaybackRateRadioGroup, FullscreenButton, Hotkey, StatusAnnouncer, Poster, Gesture, BufferingIndicator, ErrorDialog, Popover } from '@videojs/react';
import { usePlayer } from '@videojs/react/video';
import { useEffect, useId, useRef, useState, type ReactNode, type CSSProperties } from 'react';
import './dabble-skin.css';
import { DABBLE_HOTKEYS, DABBLE_PLAYBACK_RATES, getControlSize, shouldDockControls, shouldShowVolumePopover, showCenterPlay } from './skin-rules';
import { PaintedCaptions } from './PaintedCaptions';
import { tintForInk } from './palette';
import { DEFAULT_PALETTE, type Palette } from './painting-data';
import { HandIcon as Icon } from './HandDrawings';
import { PaintingHotkeys } from './PaintingHotkeys';
import { KeysContent, KeysHotkey } from './KeysPanel';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getHotkeyCoordinator } from '@videojs/core/dom';
import { announceShortcut } from './page-feedback';

function Blob() { return <span className="dabble-blob" aria-hidden="true" />; }

export function DabbleSkin({ children, paintable = false, brushSize = 20, painting = false, palette = DEFAULT_PALETTE, onControlsState }: { children: ReactNode; paintable?: boolean; brushSize?: number; painting?: boolean; palette?: Palette; onControlsState?: (state: { visible: boolean; paused: boolean }) => void }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<'small' | 'medium' | 'large'>('large');
  const [playerWidth, setPlayerWidth] = useState(860);
  const [hoverCapable, setHoverCapable] = useState(false);
  const [volumeOpen, setVolumeOpen] = useState(false);
  const [keysOpen, setKeysOpen] = useState(false);
  const [keysBounds, setKeysBounds] = useState({ left: 0, top: 0, width: 0, height: 0 });
  const keysRef = useRef<HTMLButtonElement>(null);
  const keysPopup = useRef<HTMLDivElement>(null);
  const keysTitleId = useId();
  const closeKeys = () => {
    setKeysOpen(false);
    const button = keysRef.current;
    if (button && button.getClientRects().length && !button.closest('[inert]')) button.focus();
    else rootRef.current?.focus();
  };
  const muteRef = useRef<HTMLButtonElement>(null);
  const volumeEscape = useRef(false);
  const fullscreenActive = usePlayer((state) => state.isFullscreen);
  const docked = shouldDockControls(playerWidth, fullscreenActive);
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
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    return getHotkeyCoordinator(root).subscribe(event => {
      // Custom shortcuts announce only after their own guards and action succeed.
      if (event.action && event.event.isTrusted) announceShortcut(root, event.event.key);
    });
  }, []);

  useEffect(() => {
    if (!keysOpen) return;
    const root = rootRef.current;
    if (!root) return;
    const measure = () => {
      const rect = root.getBoundingClientRect();
      setKeysBounds({ left: rect.left, top: rect.top, width: rect.width, height: rect.height });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    window.addEventListener('scroll', measure, true);
    window.addEventListener('resize', measure);
    return () => { observer.disconnect(); window.removeEventListener('scroll', measure, true); window.removeEventListener('resize', measure); };
  }, [keysOpen]);

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
    return ended || docked || volumeOpen || keysOpen ? requestControlsLock() : undefined;
  }, [ended, docked, volumeOpen, keysOpen, requestControlsLock]);

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
  const keys = <TooltipProvider delayDuration={0}><Tooltip><TooltipTrigger asChild><Popover.Trigger ref={keysRef} aria-label="Keyboard shortcuts" className="dabble-button dabble-keys-button" render={<Button variant="ghost" size="icon" />}><Blob /><Icon kind="keys" /></Popover.Trigger></TooltipTrigger><TooltipContent className="tray-tooltip-label">Keys</TooltipContent></Tooltip></TooltipProvider>;
  const seek = <TimeSlider.Root className="dabble-slider dabble-seek"><TimeSlider.Track className="dabble-track"><TimeSlider.Buffer className="dabble-buffer" /><TimeSlider.Fill className="dabble-fill" /></TimeSlider.Track><TimeSlider.Thumb className="dabble-thumb" /></TimeSlider.Root>;
  const time = <span className="dabble-time"><Time.Value type="current" /><span aria-hidden="true">/</span><Time.Value type="duration" /></span>;
  const colors = { '--dabble-seek':palette[0], '--dabble-b1':tintForInk(palette[4]), '--dabble-b2':tintForInk(palette[3]), '--dabble-b3':tintForInk(palette[2]), '--dabble-b4':tintForInk(palette[5]), '--dabble-b5':tintForInk(palette[1]), '--dabble-keys-tint':tintForInk(palette[0]), '--keys-left': `${keysBounds.left + Math.max(6, keysBounds.width - 306)}px`, '--keys-top': `${keysBounds.top + 6}px`, '--keys-width': `${Math.max(0, Math.min(300, keysBounds.width - 12))}px`, '--keys-height': `${keysBounds.height * .8}px` } as CSSProperties;

  return (
    <Container ref={rootRef} tabIndex={-1} aria-label="Dabble video player" style={colors} className="dabble-skin" data-size={size} data-painting={painting || undefined} data-docked={docked || undefined} data-caption-id={captionId} data-invitation={centerVisible || undefined}>
      {children}
      <Poster.Root className="dabble-poster"><Poster.Image /></Poster.Root>
      <PaintedCaptions rootRef={rootRef} captionId={captionId} docked={docked} barEnabled={!(painting && !docked && !fullscreenActive)} />
      <Gesture type="tap" action="togglePaused" />
      <PlayButton ref={centerRef} hidden={!centerVisible} label={ended ? 'Replay' : 'Play'} className="dabble-button dabble-play dabble-center-play" render={(props) => <button {...props} onFocus={(event) => { props.onFocus?.(event); centerHadFocus.current = event.currentTarget.matches(':focus-visible'); }} onBlur={(event) => { props.onBlur?.(event); if (event.relatedTarget) centerHadFocus.current = false; }}><Blob /><Icon kind={ended ? 'replay' : 'play'} /></button>} />
      <BufferingIndicator className="dabble-loading" render={(props, state) => <div {...props} role="status" aria-live="polite">{state.visible && <><span className="dabble-loading-disc" aria-hidden="true"><span /></span><span className="dabble-loading-label">Loading</span></>}</div>} />
      <Popover.Root side="top" align="end" boundary="container" open={keysOpen} onOpenChange={open => { if (open) setKeysOpen(true); else closeKeys(); }}>
      <Controls.Root>
        <Controls.Content className="dabble-bar" inert={painting && !docked && !fullscreenActive}>
          {size === 'small' ? <><Controls.Group className="dabble-row" aria-label="Timeline">{seek}{time}</Controls.Group><Controls.Group className="dabble-row dabble-buttons-row" aria-label="Playback controls">{play}{mute}{captions}{speed}{keys}{fullscreen}</Controls.Group></> : <Controls.Group className="dabble-row" aria-label="Playback controls">{play}{seek}{time}{mute}{captions}{speed}{keys}{fullscreen}</Controls.Group>}
        </Controls.Content>
      </Controls.Root>
      <Popover.Popup ref={keysPopup} tabIndex={-1} role="dialog" aria-labelledby={keysTitleId} className="dabble-keys-panel" render={props => <div {...props} style={{ ...props.style, ...(size !== 'large' || painting ? { translate: 'none', left: `${keysBounds.left + Math.max(6, keysBounds.width - 306)}px`, top: `${keysBounds.top + 6}px`, positionAnchor: 'none' } : {}) }} />} onKeyDown={event => { if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); closeKeys(); } else if (event.key === '?') { event.preventDefault(); event.stopPropagation(); closeKeys(); } }}>
        <KeysContent paintable={paintable} titleId={keysTitleId} popup={keysPopup} />
      </Popover.Popup>
      </Popover.Root>
      {DABBLE_HOTKEYS.map((binding) => <Hotkey key={binding.keys} {...binding} />)}
      <KeysHotkey root={rootRef} open={keysOpen} toggle={() => { if (keysOpen) closeKeys(); else setKeysOpen(true); }} />
      {paintable && <PaintingHotkeys root={rootRef} painting={painting} size={brushSize} blocked={keysOpen} />}
      <StatusAnnouncer className="dabble-announcer" />
      <ErrorDialog.Root><ErrorDialog.Backdrop className="dabble-error-backdrop" /><ErrorDialog.Popup className="dabble-error"><ErrorDialog.Title className="dabble-error-title">This video can't be played</ErrorDialog.Title><ErrorDialog.Description className="dabble-error-description" /><ErrorDialog.Close className="dabble-button dabble-error-close">Close</ErrorDialog.Close></ErrorDialog.Popup></ErrorDialog.Root>
    </Container>
  );
}