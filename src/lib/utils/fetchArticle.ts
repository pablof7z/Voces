import { NDKArticle } from '@nostr-dev-kit/ndk';
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

  const event = await ndk.fetchEvent(naddr);
  if (!event) {
    throw new Error('Article not found');
  }

  return NDKArticle.from(event);
}
