import { Paintbrush, Check, Undo2, Sparkles, Trash2, Pipette, Copy } from 'lucide-react';
import { useEffect, useId, useRef, useState, type CSSProperties } from 'react';
import { paintingCode } from './painting-data';
import { Button } from '@/components/ui/button';
import type { Brush } from './paint-engine';
import type { usePaint } from './use-paint';

const brushes: { label: string; type: Brush }[] = [
  { label: 'Impressionist', type: 'imp' }, { label: 'Cubist', type: 'cub' },
  { label: 'Drip', type: 'drip' }, { label: 'Ribbon', type: 'rib' },
];
export function PaintTray({ paint, src }: { paint: ReturnType<typeof usePaint>; src: string }) {
  const sizeId = useId();
  const [copied, setCopied] = useState(false);
  const [snippet, setSnippet] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const copy = async () => {
    const code = paintingCode(src, paint.getPainting());
    try {
      await navigator.clipboard.writeText(code); setSnippet(''); setCopied(true);
      clearTimeout(timer.current); timer.current = setTimeout(() => setCopied(false), 2000);
    } catch { setSnippet(code); }
  };
  return <section className="paint-tray" aria-label="Paint tools">
    <div className="paint-mode-row">
      <Button variant="outline" className="paint-mode-button" aria-pressed={paint.painting} onClick={() => paint.setPainting(!paint.painting)}>
        {paint.painting ? <Check /> : <Paintbrush />}{paint.painting ? 'Done painting' : 'Start painting'}
      </Button>
      <p aria-live="polite">{paint.painting ? 'Painting is on. Drag on the frame with a mouse or a finger.' : 'Painting is off. The player works like a normal player.'}</p>
    </div>
    <div className="paint-tool-row" data-dimmed={!paint.painting || undefined}>
      <span className="paint-row-label">Brush</span>
      <div className="paint-brushes" role="group" aria-label="Brush">
        {brushes.map(({ label, type }) => <Button key={type} variant="outline" aria-pressed={paint.brush === type} onClick={() => paint.setBrush(type)}>{label}</Button>)}
      </div>
    </div>
    <div className="paint-tool-row" data-dimmed={!paint.painting || undefined}>
      <label className="paint-row-label" htmlFor={sizeId}>Size</label>
      <input id={sizeId} type="range" min={8} max={40} value={paint.size} onChange={(event) => paint.setSize(Number(event.target.value))} />
      <output htmlFor={sizeId}>{paint.size}</output>
    </div>
    <div className="paint-tool-row" data-dimmed={!paint.painting || undefined}>
      <span className="paint-row-label">Paint</span>
      <div className="paint-pots" role="group" aria-label="Paint color">
        {paint.palette.map((hex, index) => <Button key={index} variant="ghost" size="icon" className="paint-pot" style={{'--pot-color':hex} as CSSProperties} aria-label={`Paint color ${index + 1}: ${hex}`} title={hex} aria-pressed={paint.color === index} onClick={() => paint.setColor(index)} />)}
      </div>
      <Button variant="outline" onClick={paint.sampleFrame}><Pipette />Colors from this frame</Button>
      {paint.sampleMessage && <span role="status" className="paint-inline-message">{paint.sampleMessage}</span>}
    </div>
    <div className="paint-tool-row">
      <span className="paint-row-label">Canvas</span>
      <div className="paint-actions">
        <Button variant="outline" onClick={paint.undo} disabled={paint.count === 0}><Undo2 />Undo</Button>
        <Button variant="outline" onClick={paint.automatic}><Sparkles />Paint it for me</Button>
        <Button variant="outline" onClick={paint.clear} disabled={paint.count === 0}><Trash2 />Clear</Button>
        <Button variant="outline" onClick={copy}><Copy />{copied ? 'Copied' : 'Copy painting code'}</Button>
      </div>
    </div>
    {snippet && <div className="paint-copy-fallback"><label htmlFor={`${sizeId}-code`}>Painting code</label><textarea id={`${sizeId}-code`} readOnly value={snippet} onFocus={event => event.currentTarget.select()} /></div>}
  </section>;
}