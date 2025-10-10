import { NDKArticle, type NDKEvent, NDKKind } from '@nostr-dev-kit/ndk';
import type { NDKSvelte } from '@nostr-dev-kit/svelte';

export async function fetchArticleComments(
  ndk: NDKSvelte,
  article: NDKArticle
): Promise<NDKEvent[]> {
  const commentEvents = await ndk.fetchEvents({
    kinds: [NDKKind.Text],
    '#a': [`${article.kind}:${article.pubkey}:${article.dTag}`],
  });

  const commentsArray = Array.from(commentEvents);
  commentsArray.sort((a, b) => (a.created_at || 0) - (b.created_at || 0));

  return commentsArray;
}
