import { afterEach, describe, expect, it, vi } from 'vitest';
import { loadPainting, savePainting, storageKey, newPainting, parsePainting, roundStroke, paintingCode } from './painting-data';
describe('painting data', () => {
  afterEach(() => { vi.restoreAllMocks(); localStorage.clear(); });
  it('stores version 1 data under a key containing the video source and restores it', () => {
    const p = newPainting(); savePainting('oceans.mp4',p);
    expect(storageKey('oceans.mp4')).toContain('oceans.mp4'); expect(loadPainting('oceans.mp4')).toEqual(p);
    expect(loadPainting('another.mp4')).toBeNull();
  });
  it('rounds completed hand points and size to four decimals', () => {
    expect(roundStroke({type:'rib',seed:1,pal:newPainting().palette,color:'#0057FF',size:20/680,pts:[[0.123456,0.987654]]})).toMatchObject({size:0.0294,pts:[[0.1235,0.9877]]});
  });
  it('restores a deliberately cleared painting instead of the starter', () => {
    const p = {...newPainting(),strokes:[]};savePainting('oceans',p);expect(loadPainting('oceans')?.strokes).toEqual([]);
  });
  it('survives storage refusal', () => {
    vi.spyOn(Storage.prototype,'setItem').mockImplementation(()=>{throw new Error('blocked');});
    vi.spyOn(Storage.prototype,'getItem').mockImplementation(()=>{throw new Error('blocked');});
    expect(()=>savePainting('oceans',newPainting())).not.toThrow();expect(loadPainting('oceans')).toBeNull();
  });
  it('rejects corrupt painting data', () => { expect(parsePainting({version:1,palette:['bad'],strokes:[]})).toBeNull(); });
  it('exports a finished player without paintable', () => {
    const p = newPainting(); const code = paintingCode('oceans.mp4',p);
    expect(code).toBe(`<DabblePlayer src={"oceans.mp4"} painting={${JSON.stringify(p)}} />`);expect(code).not.toContain('paintable');
  });
});