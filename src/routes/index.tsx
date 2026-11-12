import { createFileRoute } from "@tanstack/react-router";
import { DabblePlayer } from "@/components/dabble/DabblePlayer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dabble — Canvas frame" },
      { name: "description", content: "Dabble step 2: a video mounted in a textured artist’s canvas frame." },
      { property: "og:title", content: "Dabble — Canvas frame" },
      { property: "og:description", content: "Dabble step 2: a video mounted in a textured artist’s canvas frame." },
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
        <p className="mt-2 text-sm text-muted-foreground">Step 2: canvas frame.</p>
        <div className="mt-6 w-full">
          <DabblePlayer src="https://vjs.zencdn.net/v/oceans.mp4" />
        </div>
      </div>
    </main>
  );
}
