import { NDKArticle } from '@nostr-dev-kit/ndk';
import type { NDKSvelte } from '@nostr-dev-kit/svelte';

export async function fetchArticleByNaddr(
  ndk: NDKSvelte,
  naddr: string
): Promise<NDKArticle> {
  const event = await ndk.fetchEvent(naddr);
  if (!event) {
    throw new Error('Article not found');
  }

  return NDKArticle.from(event);
}
