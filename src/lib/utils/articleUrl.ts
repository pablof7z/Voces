import type { NDKArticle, NDKUser } from '@nostr-dev-kit/ndk';
import { getContentUrl } from './contentUrl';

/**
 * Generate a URL for an article using NIP-05/identifier format
 * Falls back to npub/identifier if no NIP-05 is available
 */
export function getArticleUrl(article: NDKArticle, author?: NDKUser): string {
  return getContentUrl(article, author, 'article');
}
