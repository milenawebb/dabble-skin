import inkLogo from '@/assets/dabble-logo-ink.png.asset.json';
import paperLogo from '@/assets/dabble-logo-paper.png.asset.json';
import './DabbleLogo.css';

export const BLOB_PATH = 'M-14-3C-13-13-2-16 7-13 15-10 17-1 13 7 9 14-3 15-10 11-15 8-15 2-14-3Z';

export function DabbleLogo({ size = 40, tone = 'ink', animate = false }: { size?: number; tone?: 'ink' | 'paper'; animate?: boolean }) {
  return <img className={`dabble-logo${animate ? ' dabble-logo--animate' : ''}`} src={(tone === 'paper' ? paperLogo : inkLogo).url} style={{ height: size }} role="img" aria-label="Dabble" alt="Dabble" />;
}
