import { createFileRoute } from "@tanstack/react-router";
import { DabblePlayer } from "@/components/dabble/DabblePlayer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dabble — Video.js v10 test" },
      { name: "description", content: "Dabble step 1: a working Video.js v10 player using the stock video skin." },
      { property: "og:title", content: "Dabble — Video.js v10 test" },
      { property: "og:description", content: "Dabble step 1: a working Video.js v10 player using the stock video skin." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="min-h-screen bg-background px-4 py-10 sm:px-6">
      <div className="mx-auto w-full max-w-[860px]">
        <h1 className="text-xl font-semibold">Dabble</h1>
        <p className="mt-2 text-sm text-muted-foreground">Step 1: Video.js v10 is working.</p>
        <div className="mt-6 aspect-video w-full">
          <DabblePlayer src="https://vjs.zencdn.net/v/oceans.mp4" />
        </div>
      </div>
    </main>
  );
}
