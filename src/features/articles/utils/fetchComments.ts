import { NDKArticle, NDKEvent, NDKKind } from '@nostr-dev-kit/ndk';
import type NDK from '@nostr-dev-kit/ndk';

export async function fetchArticleComments(
  ndk: NDK,
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