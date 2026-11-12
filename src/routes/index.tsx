import { createFileRoute } from "@tanstack/react-router";
import { DabblePlayer } from "@/components/dabble/DabblePlayer";
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { WALLS, WALL_STORAGE_KEY, readWall, type Wall } from '@/components/dabble/wall-rules';

const PLAYBACK_ID = 'AAprZsIykh7T29gtsNk02YhBrQRHXTj14ZxbWdc498wA';
const POSTER = `https://image.mux.com/${PLAYBACK_ID}/thumbnail.jpg?time=9&width=1280`;
const SAMPLE_TIMES = [9, 14, 19, 23] as const;
const CAPTIONS = { src: '/captions/dabble-dab.en.vtt', srcLang: 'en', label: 'English' };

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): { broken?: string } => String(search['broken'] ?? '') === '1' ? { broken: '1' } : {},
  head: () => ({
    meta: [
      { title: "Dabble — Hand-drawn video player" },
      { name: "description", content: "Dabble’s canvas-framed video player with hand-drawn controls, playback speeds, and accessible player states." },
      { property: "og:title", content: "Dabble — Hand-drawn video player" },
      { property: "og:description", content: "Dabble’s canvas-framed video player with hand-drawn controls, playback speeds, and accessible player states." },
      { property: "og:image", content: POSTER },
      { name: "twitter:image", content: POSTER },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const { broken } = Route.useSearch();
  const [wall, setWall] = useState<Wall>('gallery');
  useEffect(() => {
    try { setWall(readWall(localStorage.getItem(WALL_STORAGE_KEY))); } catch { /* Wall storage is optional. */ }
  }, []);
  const chooseWall = (next: Wall) => {
    setWall(next);
    try { localStorage.setItem(WALL_STORAGE_KEY, next); } catch { /* Wall storage is optional. */ }
  };
  return (
    <main className="dabble-demo min-h-screen px-4 py-10 sm:px-6" data-wall={wall}>
      <div className="mx-auto w-full max-w-[860px]">
        <div className="demo-heading-row">
        <div>
        <h1 className="text-xl font-semibold">Dabble</h1>
        <p className="mt-2 text-sm">Paint the frame around your video.</p>
        </div>
        <div className="wall-switcher" role="group" aria-label="Wall">
          <span className="text-sm">Wall</span>
          {WALLS.map(choice => <Button key={choice.id} variant="ghost" size="icon" className="wall-swatch" data-wall={choice.id} aria-label={choice.label} title={choice.label} aria-pressed={wall === choice.id} onClick={() => chooseWall(choice.id)}><span aria-hidden="true" /></Button>)}
        </div>
        </div>
        <div className="mt-6 w-full">
          <DabblePlayer sounds playbackId={PLAYBACK_ID} thumbnailSampleTimes={SAMPLE_TIMES} poster={POSTER} broken={broken === '1'} captions={CAPTIONS} />
        </div>
      </div>
    </main>
  );
}
