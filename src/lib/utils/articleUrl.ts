import type { NDKArticle } from '@nostr-dev-kit/ndk';
import type { NDKUser } from '@nostr-dev-kit/ndk';
import { nip19 } from 'nostr-tools';

/**
 * Generate a URL for an article using NIP-05/identifier format
 * Falls back to npub/identifier if no NIP-05 is available
 */
export function getArticleUrl(article: NDKArticle, author?: NDKUser): string {
  const identifier = article.tagValue('d');

  if (!identifier) {
    // Fallback to naddr format if no identifier
    return `/article/${article.encode()}`;
  }

  // Try to use NIP-05 if available
  const nip05 = author?.profile?.nip05;
  if (nip05) {
    return `/${nip05}/${identifier}`;
  }

  // Fallback to npub
  const npub = nip19.npubEncode(article.pubkey);
  return `/${npub}/${identifier}`;
}
