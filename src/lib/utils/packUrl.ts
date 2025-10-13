import type { NDKUser } from '@nostr-dev-kit/ndk';
import { nip19 } from 'nostr-tools';

interface Pack {
  encode: () => string;
  pubkey: string;
  [key: string]: any;
}

/**
 * Generate a URL for a pack using NIP-05/identifier format
 * Falls back to npub/identifier if no NIP-05 is available
 */
export function getPackUrl(pack: Pack, author?: NDKUser): string {
  // Decode the pack's naddr to get the identifier
  try {
    const decoded = nip19.decode(pack.encode());
    if (decoded.type === 'naddr' && decoded.data.identifier) {
      const identifier = decoded.data.identifier;

      // Try to use NIP-05 if available
      const nip05 = author?.profile?.nip05;
      if (nip05) {
        return `/${nip05}/${identifier}`;
      }

      // Fallback to npub
      const npub = nip19.npubEncode(pack.pubkey);
      return `/${npub}/${identifier}`;
    }
  } catch (e) {
    // If decoding fails, fall back to old format
  }

  // Fallback to naddr format if no identifier
  return `/packs/${pack.encode()}`;
}
