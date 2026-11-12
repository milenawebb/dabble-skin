import { Paintbrush, Check, Undo2, Sparkles, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Brush } from './paint-engine';
import type { usePaint } from './use-paint';

const brushes: { label: string; type: Brush }[] = [
  { label: 'Impressionist', type: 'imp' }, { label: 'Cubist', type: 'cub' },
  { label: 'Drip', type: 'drip' }, { label: 'Ribbon', type: 'rib' },
];
const pots = ['Blue', 'Sky blue', 'Turquoise', 'Gold', 'Orange', 'Pink'];
export function PaintTray({ paint }: { paint: ReturnType<typeof usePaint> }) {
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
      <label className="paint-row-label" htmlFor="paint-size">Size</label>
      <input id="paint-size" type="range" min={8} max={40} value={paint.size} onChange={(event) => paint.setSize(Number(event.target.value))} />
      <output htmlFor="paint-size">{paint.size}</output>
    </div>
    <div className="paint-tool-row" data-dimmed={!paint.painting || undefined}>
      <span className="paint-row-label">Paint</span>
      <div className="paint-pots" role="group" aria-label="Paint color">
        {pots.map((name, index) => <Button key={name} variant="ghost" size="icon" className="paint-pot" data-pot={index} aria-label={name} title={name} aria-pressed={paint.color === index} onClick={() => paint.setColor(index)} />)}
      </div>
    </div>
    <div className="paint-tool-row">
      <span className="paint-row-label">Canvas</span>
      <div className="paint-actions">
        <Button variant="outline" onClick={paint.undo} disabled={paint.count === 0}><Undo2 />Undo</Button>
        <Button variant="outline" onClick={paint.automatic}><Sparkles />Paint it for me</Button>
        <Button variant="outline" onClick={paint.clear} disabled={paint.count === 0}><Trash2 />Clear</Button>
      </div>
    </div>
  </section>;
}