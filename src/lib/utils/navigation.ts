import { goto } from '$app/navigation';
import { nip19 } from 'nostr-tools';

/**
 * Navigate to a user's profile page
 * @param pubkey - The user's public key (hex format)
 */
export function navigateToProfile(pubkey: string) {
  const npub = nip19.npubEncode(pubkey);
  goto(`/p/${npub}`);
}

/**
 * Get the URL for a user's profile page
 * @param pubkey - The user's public key (hex format)
 * @returns The profile URL path
 */
export function getProfileUrl(pubkey: string): string {
  const npub = nip19.npubEncode(pubkey);
  return `/p/${npub}`;
}
