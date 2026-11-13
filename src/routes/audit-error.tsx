import { createFileRoute } from '@tanstack/react-router';
import { DabblePlayer } from '@/components/dabble/DabblePlayer';
import { useState } from 'react';
export const Route = createFileRoute('/audit-error')({
  head: () => ({ meta: [{ title: 'Dabble temporary error audit' }, { name: 'description', content: 'Temporary playback failure verification.' }, { property: 'og:title', content: 'Dabble temporary error audit' }, { property: 'og:description', content: 'Temporary playback failure verification.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' }] }),
  component: TestError,
});
function TestError() {
  const [bad, setBad] = useState(false);
  return <><button onClick={() => setBad(true)}>Use missing video</button><DabblePlayer key={String(bad)} playbackId={bad ? 'BBprZsIykh7T29gtsNk02YhBrQRHXTj14ZxbWdc498wA' : 'AAprZsIykh7T29gtsNk02YhBrQRHXTj14ZxbWdc498wA'} /></>;
}