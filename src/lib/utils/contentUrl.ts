import type { NDKUser } from '@nostr-dev-kit/ndk';
import { nip19 } from 'nostr-tools';

interface EncodableContent {
  encode: () => string;
  pubkey: string;
  tagValue: (tag: string) => string | undefined;
}

/**
 * Generate a URL for content (article, pack, etc.) using NIP-05/identifier format
 * Falls back to npub/identifier if no NIP-05 is available, and to encoded format if no identifier
 */
export function getContentUrl(content: EncodableContent, author?: NDKUser, fallbackPrefix = 'item'): string {
  const identifier = content.tagValue('d');

  if (!identifier) {
    return `/${fallbackPrefix}/${content.encode()}`;
  }

  // Try to use NIP-05 if available
  const nip05 = author?.profile?.nip05;
  if (nip05) {
    return `/${nip05}/${identifier}`;
  }

  // Fallback to npub
  const npub = nip19.npubEncode(content.pubkey);
  return `/${npub}/${identifier}`;
}
