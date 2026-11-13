import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useRef } from 'react';
import { beforeEach, expect, it, vi } from 'vitest';
import { useVideoColorPicker } from './use-video-color-picker';
import { readVideoColor } from './video-color-pick';
vi.mock('./video-color-pick', async importOriginal => ({ ...await importOriginal<typeof import('./video-color-pick')>(), readVideoColor: vi.fn().mockResolvedValue({color:'#123456',source:'live'}), liveVideoColor:()=> '#123456' }));
beforeEach(() => { vi.stubGlobal('ResizeObserver',class {observe(){} disconnect(){}}); });
function Picker({pick}:{pick:(color:string)=>void}) {
  const root=useRef<HTMLDivElement>(null);
  const picker=useVideoColorPicker(root,'abc',pick);
  return <div ref={root}><video data-testid="video" ref={video=>{if(video) video.getBoundingClientRect=()=>({left:0,top:0,width:200,height:100} as DOMRect);}} /><button data-video-color-toggle onClick={picker.toggle}>Pick</button><output>{picker.picking?'active':'inactive'}</output></div>;
}
it('consumes pick pointer events before video playback or painting handlers', async () => {
  const pick=vi.fn();render(<Picker pick={pick}/>);
  const video=screen.getByTestId('video'),play=vi.fn(),paint=vi.fn();
  video.addEventListener('pointerdown',paint);video.addEventListener('pointerup',play);
  fireEvent.click(screen.getByText('Pick'));
  const event=new Event('pointerdown',{bubbles:true,cancelable:true});Object.assign(event,{button:0,clientX:50,clientY:25});act(()=>{video.dispatchEvent(event);});
  fireEvent.pointerUp(video);
  await waitFor(()=>expect(pick).toHaveBeenCalledWith('#123456'));
  expect(readVideoColor).toHaveBeenCalledWith(video,{x:.25,y:.25},'abc');expect(play).not.toHaveBeenCalled();expect(paint).not.toHaveBeenCalled();
});
it('Escape cancels without picking', () => {
  const pick=vi.fn();render(<Picker pick={pick}/>);fireEvent.click(screen.getByText('Pick'));fireEvent.keyDown(document,{key:'Escape'});
  expect(screen.getByText('inactive')).toBeInTheDocument();expect(pick).not.toHaveBeenCalled();
});
it('an outside tap cancels without picking', () => {
  const pick=vi.fn();render(<Picker pick={pick}/>);fireEvent.click(screen.getByText('Pick'));
  const event=new Event('pointerdown',{bubbles:true,cancelable:true});Object.assign(event,{button:0,clientX:250,clientY:25});act(()=>{document.body.dispatchEvent(event);});
  expect(screen.getByText('inactive')).toBeInTheDocument();expect(pick).not.toHaveBeenCalled();
});