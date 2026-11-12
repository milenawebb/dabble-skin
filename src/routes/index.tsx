import { createFileRoute } from "@tanstack/react-router";
import { DabblePlayer } from "@/components/dabble/DabblePlayer";

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): { broken?: string } => String(search['broken'] ?? '') === '1' ? { broken: '1' } : {},
  head: () => ({
    meta: [
      { title: "Dabble — Hand-drawn video player" },
      { name: "description", content: "Dabble’s canvas-framed video player with hand-drawn controls, playback speeds, and accessible player states." },
      { property: "og:title", content: "Dabble — Hand-drawn video player" },
      { property: "og:description", content: "Dabble’s canvas-framed video player with hand-drawn controls, playback speeds, and accessible player states." },
      { property: "og:image", content: "https://vjs.zencdn.net/v/oceans.png" },
      { name: "twitter:image", content: "https://vjs.zencdn.net/v/oceans.png" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const { broken } = Route.useSearch();
  return (
    <main className="min-h-screen bg-background px-4 py-10 sm:px-6">
      <div className="mx-auto w-full max-w-[860px]">
        <h1 className="text-xl font-semibold">Dabble</h1>
        <p className="mt-2 text-sm text-muted-foreground">Paint the frame around your video.</p>
        <div className="mt-6 w-full">
          <DabblePlayer sounds paintable src="https://vjs.zencdn.net/v/oceans.mp4" poster="https://vjs.zencdn.net/v/oceans.png" broken={broken === '1'} captions={{ src: '/captions/oceans.en.vtt', srcLang: 'en', label: 'English' }} />
        </div>
      </div>
    </main>
  );
}
