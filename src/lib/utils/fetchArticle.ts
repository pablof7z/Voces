import { NDKArticle, NDKKind, type NDKEvent } from '@nostr-dev-kit/ndk';
import type { NDKSvelte } from '@nostr-dev-kit/svelte';
import { nip19 } from 'nostr-tools';

export async function fetchArticleByNaddr(
  ndk: NDKSvelte,
  naddr: string
): Promise<NDKArticle> {
  const decoded = nip19.decode(naddr);
  if (decoded.type !== 'naddr') {
    throw new Error('Invalid article address format');
  }

  const { kind, pubkey, identifier } = decoded.data;

  const events = await ndk.fetchEvents({
    kinds: [kind || NDKKind.Article],
    authors: [pubkey],
    '#d': [identifier],
  });

  const event = Array.from(events)[0];
  if (!event) {
    throw new Error('Article not found');
  }

  return NDKArticle.from(event);
}
