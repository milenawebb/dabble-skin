import { useRef, type CSSProperties } from 'react';
import { Button } from '@/components/ui/button';
import { BrushDrawing, HandIcon, PaintBlob, type HandIconKind } from './HandDrawings';
import { paintColorNames } from './palette';
import { nextBrushSize, phonePanelPadding } from './phone-panel-rules';
import type { usePaint } from './use-paint';
import './phone-panel.css';

const brushes = [{ type: 'imp', name: 'Impressionist' }, { type: 'cub', name: 'Cubist' }, { type: 'drip', name: 'Drip' }, { type: 'rib', name: 'Ribbon' }] as const;
export function PhonePaintPanel({ paint, width, setHost, sounds, toggleSounds, automaticSound, onActivity }: { paint: ReturnType<typeof usePaint>; width: number; setHost: (host: HTMLDivElement | null) => void; sounds: boolean; toggleSounds: () => void; automaticSound: () => void; onActivity: (active: boolean) => void }) {
  const mode = useRef<HTMLButtonElement>(null);
  const picker = useRef<HTMLInputElement>(null);
  const done = () => { paint.setPainting(false); mode.current?.focus(); };
  const names = paintColorNames(paint.palette);
  const sizeName = paint.size === 10 ? 'small' : paint.size === 20 ? 'medium' : 'large';
  const action = (name: string, icon: HandIconKind, onClick: () => void, disabled = false, pressed?: boolean) => <Button variant="ghost" size="icon" aria-label={name} title={name} onClick={onClick} disabled={disabled} aria-pressed={pressed}><HandIcon kind={icon} /></Button>;
  return <section className="phone-panel" data-painting={paint.painting || undefined} style={{ '--phone-panel-width': `${width}px`, '--phone-panel-padding': `${phonePanelPadding(width)}px`, '--tray-color': paint.color === -1 ? paint.customColor ?? paint.palette[0] : paint.palette[paint.color] ?? paint.palette[0] } as CSSProperties} aria-label="Player and painting tools" onPointerEnter={() => onActivity(true)} onPointerLeave={() => onActivity(false)} onFocusCapture={() => onActivity(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) onActivity(false); }} onKeyDown={event => { if (event.key === 'Escape' && paint.painting) { event.preventDefault(); event.stopPropagation(); done(); } }}>
    <div className="phone-panel-slot">
      <div ref={setHost} className="phone-watch-panel" inert={paint.painting || undefined} />
      <div className="phone-paint-panel" inert={!paint.painting || undefined}>
        <span className="phone-brush-name" aria-hidden="true">{brushes.find(item => item.type === paint.brush)?.name}</span>
        <div className="phone-tool-row phone-colors" role="group" aria-label="Paint color">
          {paint.palette.map((color, i) => <Button key={i} variant="ghost" size="icon" aria-label={names[i]} title={names[i]} aria-pressed={paint.color === i} onClick={() => paint.setColor(i)} style={{ '--pot-color': color } as CSSProperties}><PaintBlob selected={paint.color === i} /></Button>)}
          <Button variant="ghost" size="icon" aria-label="Mix your own color" title="Mix your own color" aria-pressed={paint.color === -1} onClick={() => picker.current?.click()}><span className="phone-custom-color" style={{ '--pot-color': paint.customColor ?? paint.palette[0] } as CSSProperties} /><HandIcon kind="eyedropper" /></Button>
          <input ref={picker} type="color" className="tray-color-input" aria-label="Custom paint color" tabIndex={-1} value={paint.customColor ?? paint.palette[0]} onChange={event => paint.chooseCustomColor(event.target.value)} />
        </div>
        <div className="phone-tool-row phone-brushes" role="group" aria-label="Brush and size">
          {brushes.map(({ type, name }) => <Button key={type} variant="ghost" size="icon" aria-label={`${name} brush`} title={`${name} brush`} aria-pressed={paint.brush === type} onClick={() => paint.setBrush(type)}>{paint.brush === type && <PaintBlob />}<BrushDrawing brush={type} /></Button>)}
          <Button variant="ghost" size="icon" aria-label={`Brush size: ${sizeName}. Change`} title={`Brush size: ${sizeName}. Change`} onClick={() => paint.setSize(nextBrushSize(paint.size))}><PaintBlob scale={paint.size === 10 ? .35 : paint.size === 20 ? .65 : 1} /></Button>
        </div>
        <div className="phone-tool-row phone-actions" role="group" aria-label="Painting actions">
          {action('Undo', 'undo', paint.undo, !paint.canUndo)}
          {action('Paint it for me', 'wand', () => { paint.automatic(); automaticSound(); })}
          {action(sounds ? 'Turn sounds off' : 'Turn sounds on', sounds ? 'sounds-on' : 'sounds-off', toggleSounds, false, sounds)}
          <span className="phone-blank">{action('Blank canvas', 'clear', paint.clear, paint.count === 0)}</span>
        </div>
      </div>
    </div>
    <div className="phone-ledge">
      <Button ref={mode} variant="ghost" aria-label={paint.painting ? 'Done painting' : 'Start painting'} aria-expanded={paint.painting} onClick={() => { if (paint.painting) done(); else paint.setPainting(true); }}><HandIcon kind={paint.painting ? 'check' : 'brush'} /><span>{paint.painting ? 'Done' : 'Paint the frame'}</span></Button>
      <svg className="tray-ledge" viewBox="0 0 680 18" preserveAspectRatio="none" aria-hidden="true"><path className="tray-wood" d="M2 3C120 1 420 4 678 2L677 15C460 17 160 14 3 16Z" /><path className="tray-wood-shade" d="M4 12.5C160 11 460 14 676 12L677 15C460 17 160 14 3 16Z" /><path className="tray-wood-outline" d="M2 3C120 1 420 4 678 2L677 15C460 17 160 14 3 16Z" fill="none" strokeWidth="1.5" /></svg>
    </div>
  </section>;
}