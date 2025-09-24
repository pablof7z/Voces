// This file is now deprecated as all NDK functionality is provided by ndk-hooks
// Keeping it only for reference if needed during migration

import { NDKNip07Signer, NDKPrivateKeySigner } from '@nostr-dev-kit/ndk-hooks';

// Default relay configuration (moved to NDKContext.tsx)
export const defaultRelays = [
  'wss://relay.damus.io',
  'wss://relay.nostr.band',
  'wss://nos.lol',
  'wss://relay.snort.social',
  'wss://relay.primal.net'
];

// Helper to get signer based on available auth method (deprecated - use session hooks instead)
export async function getSigner(): Promise<NDKPrivateKeySigner | NDKNip07Signer | null> {
  // Check for NIP-07 extension (like Alby, nos2x, etc.)
  if (window.nostr) {
    return new NDKNip07Signer();
  }
  
  // Check for stored private key (for demo purposes - in production use secure storage)
  const privateKey = localStorage.getItem('nostr_private_key');
  if (privateKey) {
    return new NDKPrivateKeySigner(privateKey);
  }
  
  return null;
}