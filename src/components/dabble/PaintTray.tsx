import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { paintingCode } from './painting-data';
import { colorName, paintColorNames } from './palette';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { Brush } from './paint-engine';
import type { usePaint } from './use-paint';
import { BLOB_ROTATIONS, BrushDrawing, HandIcon, PaintBlob, type HandIconKind } from './HandDrawings';
import { BRUSH_SIZES, TRAY_HIDE_DELAY, trayState } from './tray-rules';
import './paint-tray.css';

const brushes: { label: string; type: Brush }[] = [
  { label: 'Impressionist brush', type: 'imp' }, { label: 'Cubist brush', type: 'cub' },
  { label: 'Drip brush', type: 'drip' }, { label: 'Ribbon brush', type: 'rib' },
];
function Tool({ label, children, className = '', pressed, expanded, disabled, onClick, modeRef, hidden = false, style, note }: { label: string; children: ReactNode; className?: string; pressed?: boolean; expanded?: boolean; disabled?: boolean; onClick: () => void; modeRef?: React.Ref<HTMLButtonElement>; hidden?: boolean; style?: CSSProperties; note?: string }) {
  return <span className={`tray-item ${className}`} inert={hidden || undefined}>
    <Tooltip><TooltipTrigger asChild><Button ref={modeRef} variant="ghost" size="icon" aria-label={label} aria-pressed={pressed} aria-expanded={expanded} disabled={disabled} onClick={onClick} style={style}>{children}</Button></TooltipTrigger>
      {!note && <TooltipContent className="tray-tooltip-label" side="top" collisionPadding={8}>{label}</TooltipContent>}
    </Tooltip>
    {note && <span className="tray-note" role="status">{note}</span>}
  </span>;
}
export function PaintTray({ paint, src, playbackId, ownerTools = false, sounds, toggleSounds, automaticSound, controlsState, onActivity }: { paint: ReturnType<typeof usePaint>; src: string; playbackId?: string; ownerTools?: boolean; sounds: boolean; toggleSounds: () => void; automaticSound: () => void; controlsState: { visible: boolean; paused: boolean }; onActivity: (active: boolean) => void }) {
  const id = useId();
  const [copied, setCopied] = useState(false);
  const [snippet, setSnippet] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);
  const keepPainting = useRef<HTMLButtonElement>(null);
  const resetButton = useRef<HTMLButtonElement>(null);
  const resetTitle = useId();
  const closeReset = () => { setConfirmReset(false); resetButton.current?.focus(); };
  useEffect(() => { if (confirmReset) keepPainting.current?.focus(); }, [confirmReset]);
  const [peeking, setPeeking] = useState(false);
  const [hoverCapable, setHoverCapable] = useState(false);
  const root = useRef<HTMLElement>(null);
  const mode = useRef<HTMLButtonElement>(null);
  const hovering = useRef(false);
  const suppressPeek = useRef(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const state = trayState(paint.painting, peeking);
  const open = state !== 'tucked';
  useEffect(() => {
    const query = matchMedia('(hover: hover) and (pointer: fine)');
    const update = () => setHoverCapable(query.matches);
    update(); query.addEventListener('change', update);
    return () => { query.removeEventListener('change', update); clearTimeout(hideTimer.current); clearTimeout(copyTimer.current); onActivity(false); };
  }, [onActivity]);
  const reveal = () => { clearTimeout(hideTimer.current); if (hoverCapable && !suppressPeek.current) setPeeking(true); };
  const scheduleTuck = () => {
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      if (!hovering.current && !root.current?.contains(document.activeElement)) setPeeking(false);
    }, TRAY_HIDE_DELAY);
  };
  const tuck = () => {
    suppressPeek.current = true;
    clearTimeout(hideTimer.current); setPeeking(false); paint.setPainting(false);
    // Focus returns before the next render makes the other tools inert.
    mode.current?.focus();
  };
  const pin = (action: () => void) => { suppressPeek.current = false; clearTimeout(hideTimer.current); setPeeking(false); paint.setPainting(true); action(); };
  const copy = async () => {
    const code = paintingCode(src, paint.getPainting(), playbackId);
    try {
      await navigator.clipboard.writeText(code); setSnippet(''); setCopied(true);
      clearTimeout(copyTimer.current); copyTimer.current = setTimeout(() => setCopied(false), 2000);
    } catch { setSnippet(code); }
  };
  const color = paint.palette[paint.color] ?? paint.palette[0];
  const colorNames = paintColorNames(paint.palette);
  const iconTool = (label: string, icon: HandIconKind, action: () => void, disabled = false) => <Tool label={label} className="tray-reveal tray-circle" hidden={!open} disabled={disabled} onClick={action}><HandIcon kind={icon} /></Tool>;
  return <TooltipProvider delayDuration={0}><section ref={root} className="paint-tray" aria-label="Paint tools" data-state={state} data-visible={controlsState.visible || undefined} data-paused={controlsState.paused || undefined} style={{ '--tray-color': color } as CSSProperties}
    onPointerEnter={() => { hovering.current = true; suppressPeek.current = false; reveal(); onActivity(true); }}
    onPointerMove={() => { onActivity(true); }}
    onPointerLeave={() => { hovering.current = false; suppressPeek.current = false; scheduleTuck(); if (!root.current?.contains(document.activeElement)) onActivity(false); }}
    onFocusCapture={() => { reveal(); onActivity(true); }}
    onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) { suppressPeek.current = false; scheduleTuck(); if (!hovering.current) onActivity(false); } }}
    onKeyDown={event => { if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); if (confirmReset) closeReset(); else tuck(); } }}>
    <div className="tray-shelf">
      <Tool modeRef={mode} label={paint.painting ? 'Put the paints away' : 'Start painting'} className="tray-mode tray-circle" expanded={open} onClick={() => { if (paint.painting) tuck(); else pin(() => {}); }}><HandIcon kind="brush" /></Tool>
      <span className="tray-divider tray-divider-one tray-reveal" aria-hidden="true"><svg viewBox="0 0 4 32"><path d="M2 1c-1 9 1 20-.5 30" /></svg></span>
      <div className="tray-colors tray-reveal" role="group" aria-label="Paint color" inert={!open || undefined}>
        {paint.palette.map((hex, index) => <Tool key={index} label={colorNames[index] ?? `${colorName(hex)} paint`} pressed={paint.color === index} className="tray-color" style={{ '--pot-color': hex } as CSSProperties} onClick={() => pin(() => paint.setColor(index))}><PaintBlob selected={paint.color === index} angle={BLOB_ROTATIONS[index] ?? 0} scale={paint.color === index ? 1.18 : 1} /></Tool>)}
      </div>
      <Tool label="Colors from this frame" className="tray-sample tray-circle tray-reveal" hidden={!open} onClick={paint.sampleFrame} note={paint.sampleMessage}><HandIcon kind="eyedropper" /></Tool>
      <span className="tray-divider tray-divider-two tray-reveal" aria-hidden="true"><svg viewBox="0 0 4 32"><path d="M2 1c-1 9 1 20-.5 30" /></svg></span>
      <div className="tray-equipment">
      <div className="tray-brushes tray-reveal" role="group" aria-label="Brush" inert={!open || undefined}>
        {brushes.map(({ label, type }) => <Tool key={type} label={label} className="tray-brush" pressed={paint.brush === type} onClick={() => pin(() => paint.setBrush(type))}><BrushDrawing brush={type} /></Tool>)}
      </div>
      <span className="tray-divider tray-divider-three tray-reveal" aria-hidden="true"><svg viewBox="0 0 4 32"><path d="M2 1c-1 9 1 20-.5 30" /></svg></span>
      <div className="tray-sizes tray-reveal" role="group" aria-label="Brush size" inert={!open || undefined}>
        {BRUSH_SIZES.map(({ label, value, scale }) => <Tool key={value} label={label} className="tray-size" pressed={paint.size === value} onClick={() => pin(() => paint.setSize(value))}><PaintBlob selected={paint.size === value} scale={scale} /></Tool>)}
      </div>
      <div className="tray-actions">
        {iconTool('Undo', 'undo', paint.undo, paint.count === 0)}
        {iconTool('Paint it for me', 'wand', () => { paint.automatic(); automaticSound(); })}
        <Tool modeRef={resetButton} label="Start over" className="tray-reveal tray-circle" hidden={!open} onClick={() => setConfirmReset(true)}><HandIcon kind="clear" /></Tool>
        {ownerTools && iconTool('Copy painting code', 'copy', copy)}
        <Tool label={sounds ? 'Sounds on' : 'Sounds off'} className="tray-circle tray-reveal" hidden={!open} pressed={sounds} onClick={toggleSounds}><HandIcon kind={sounds ? 'sounds-on' : 'sounds-off'} /></Tool>
      </div>
      </div>
    </div>
    <svg className="tray-ledge" viewBox="0 0 680 18" preserveAspectRatio="none" width="100%" height="18" aria-hidden="true">
      <path className="tray-wood" d="M2 3C120 1 420 4 678 2L677 15C460 17 160 14 3 16Z" />
      <path className="tray-wood-shade" d="M4 12.5C160 11 460 14 676 12L677 15C460 17 160 14 3 16Z" />
      <g className="tray-wood-grain" fill="none" strokeOpacity=".6" strokeWidth="1" strokeLinecap="round" vectorEffect="non-scaling-stroke">
        <path d="M14 6C90 5 150 8 230 6" vectorEffect="non-scaling-stroke" />
        <path d="M250 9C330 7 420 10 520 8" vectorEffect="non-scaling-stroke" />
        <path d="M430 5C500 4 580 7 664 5" vectorEffect="non-scaling-stroke" />
        <path d="M60 10C110 9 150 11 196 10" vectorEffect="non-scaling-stroke" />
      </g>
      <path className="tray-wood-outline" d="M2 3C120 1 420 4 678 2L677 15C460 17 160 14 3 16Z" fill="none" strokeWidth="1.5" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
    {confirmReset && <div className="tray-reset-label" role="dialog" aria-labelledby={resetTitle} onKeyDown={event => {
      if (event.key !== 'Tab') return;
      const buttons = Array.from(event.currentTarget.querySelectorAll('button'));
      const first = buttons[0], last = buttons.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }}><span id={resetTitle}>Start over?</span><div><Button variant="outline" onClick={() => { paint.startOver(); closeReset(); }}>Yes, start over</Button><Button ref={keepPainting} variant="outline" onClick={closeReset}>Keep painting</Button></div></div>}
    {ownerTools && <span className="tray-copy-status" role="status">{copied ? 'Copied' : ''}</span>}
    {ownerTools && snippet && <div className="paint-copy-fallback" inert={!open || undefined} hidden={!open}><label htmlFor={`${id}-code`}>Painting code</label><textarea id={`${id}-code`} readOnly value={snippet} onFocus={event => event.currentTarget.select()} /></div>}
  </section></TooltipProvider>;
}
