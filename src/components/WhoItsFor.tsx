import { useEffect, useRef, useState } from 'react';
import { PaintedTitle } from './PaintedTitle';
import { renderStroke, type Brush, type Point } from './dabble/paint-engine';
import type { Palette } from './dabble/painting-data';
import still1 from '@/assets/use-cases/dab-1.asset.json';
import still17 from '@/assets/use-cases/dab-17.asset.json';
import still21 from '@/assets/use-cases/dab-21.asset.json';
import still12 from '@/assets/use-cases/dab-12.asset.json';
import still25 from '@/assets/use-cases/dab-25.asset.json';
import still7 from '@/assets/use-cases/dab-7.asset.json';

const uses: { title: string; image: string; text: string; brushes: Brush[]; palette: Palette; description: string }[] = [
  { title: "Art classes and kids' learning", image: still1.url, text: 'A lesson video that students can paint around while they watch. Each student keeps their own frame.', brushes: ['imp'], palette: ['#E83B61','#FFD23F','#25BFD1','#E83B61','#FFD23F','#25BFD1'], description: 'Example frame painted with the Impressionist brush in bright pink, yellow and cyan' },
  { title: 'Artists and illustrators', image: still17.url, text: 'A portfolio reel that visitors can respond to in your own palette, instead of a plain black box.', brushes: ['rib'], palette: ['#EF8664','#53BFC2','#EF8664','#53BFC2','#EF8664','#53BFC2'], description: 'Example frame painted with the Ribbon brush in coral and teal' },
  { title: 'Galleries and museums', image: still21.url, text: 'Exhibition films and artist talks, with a frame that invites people to make something too.', brushes: ['cub'], palette: ['#577D99','#9AB8C9','#718EA5','#577D99','#9AB8C9','#718EA5'], description: 'Example frame painted with the Cubist brush in muted blues' },
  { title: 'Craft and DIY tutorials', image: still12.url, text: 'Step-by-step videos for makers, where the player feels like the workbench.', brushes: ['drip'], palette: ['#DD3348','#F3C633','#DD3348','#F3C633','#DD3348','#F3C633'], description: 'Example frame painted with the Drip brush in red and yellow' },
  { title: "Children's authors and storytellers", image: still25.url, text: "Read-alongs and story trailers that end with the viewer's own picture.", brushes: ['rib','drip'], palette: ['#CEA6CF','#EF945D','#2E63BE','#57CFD0','#F5D53B','#CEA6CF'], description: 'Example frame painted with Ribbon and Drip brushes in the Dabble logo colors' },
  { title: 'Musicians and music videos', image: still7.url, text: 'Music videos and album drops where fans paint along. Every scene gives them new colors.', brushes: ['imp','imp','imp','drip'], palette: ['#1762CB','#13B7B1','#10469D','#FFCE36','#1762CB','#13B7B1'], description: 'Example frame painted with the Impressionist brush and Drip splashes in bold wave blues and teal with a bright yellow accent' },
];

function MiniPainting({ example, index, visible }: { example: typeof uses[number]; index: number; visible: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || !visible) return;
    const draw = () => {
      const W = canvas.clientWidth, H = canvas.clientHeight;
      if (!W || !H) return;
      const ratio = Math.min(devicePixelRatio || 1, 2);
      canvas.width = Math.round(W * ratio); canvas.height = Math.round(H * ratio);
      const context = canvas.getContext('2d');
      if (!context) return;
      context.scale(ratio, ratio);
      const geo = { W, H, vx: W * .14, vy: H * .2, vw: W * .72, vh: H * .6 };
      for (let n = 0; n < 4; n++) {
        const brush = example.brushes[n % example.brushes.length] ?? 'imp';
        const points: Point[] = Array.from({ length: 28 }, (_, step) => {
          const t = step / 27;
          return n % 2 === 0 ? [.02 + t * .96, (n === 0 ? .08 : .91) + Math.sin(t * Math.PI * 3 + index) * .025] : [(n === 1 ? .06 : .94) + Math.sin(t * Math.PI * 3) * .02, .08 + t * .84];
        });
        renderStroke(context, { type: brush, seed: 7100 + index * 137 + n * 43, pal: example.palette, color: example.palette[n % 6] ?? example.palette[0], size: brush === 'drip' ? .055 : .08, pts: points }, geo);
      }
      canvas.dataset['drawn'] = 'true';
    };
    draw(); const observer = new ResizeObserver(draw); observer.observe(canvas);
    return () => observer.disconnect();
  }, [example, index, visible]);
  return <div className="use-mini-canvas" role="img" aria-label={example.description}><canvas ref={ref} aria-hidden="true" /><img src={example.image} alt="" loading="lazy" width={480} height={270} /></div>;
}

export function WhoItsFor() {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const section = ref.current;
    if (!section) return;
    const observer = new IntersectionObserver(entries => { if (entries.some(entry => entry.isIntersecting)) { setVisible(true); observer.disconnect(); } });
    observer.observe(section); return () => observer.disconnect();
  }, []);
  return <section ref={ref} className="gallery-section who-section" id="who" aria-labelledby="who-title">
    <h2 id="who-title"><PaintedTitle>Who it's for</PaintedTitle></h2>
    <p className="who-intro">Anywhere the video is part of making something.</p>
    <div className="who-grid">{uses.map((example, index) => <article key={example.title} className={`paper-piece who-piece who-piece-${index}`}>
      <MiniPainting example={example} index={index} visible={visible} />
      <h3>{example.title}</h3><p>{example.text}</p>
    </article>)}</div>
  </section>;
}