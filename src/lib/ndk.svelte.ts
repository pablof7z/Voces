import { NDKSvelte, initStores } from '@nostr-dev-kit/ndk-svelte5';
import { NDKNip07Signer, NDKPrivateKeySigner } from '@nostr-dev-kit/ndk';

const DEFAULT_RELAYS = [
  'wss://relay.damus.io',
  'wss://relay.nostr.band',
  'wss://nos.lol',
  'wss://relay.snort.social',
  'wss://relay.primal.net',
  'wss://purplepag.es'
];

console.log('[NDK] Creating NDK instance with relays:', DEFAULT_RELAYS);

export const ndk = new NDKSvelte({
  explicitRelayUrls: DEFAULT_RELAYS,
  autoConnectUserRelays: false,
  autoFetchUserMutelist: false
});

console.log('[NDK] Initializing stores');
initStores(ndk);

export async function initializeSigner() {
  if (typeof window === 'undefined') return;

  if (window.nostr) {
    const signer = new NDKNip07Signer();
    ndk.signer = signer;
    return signer;
  }

  const privateKey = localStorage.getItem('nostr_private_key');
  if (privateKey) {
    const signer = new NDKPrivateKeySigner(privateKey);
    ndk.signer = signer;
    return signer;
  }

  return null;
}

if (typeof window !== 'undefined') {
  console.log('[NDK] Connecting to relays...');
  ndk.connect().then(() => {
    console.log('[NDK] Successfully connected to relays');
    initializeSigner().then((signer) => {
      if (signer) {
        console.log('[NDK] Signer initialized');
      } else {
        console.log('[NDK] No signer available');
      }
    });
  }).catch((error) => {
    console.error('[NDK] Failed to connect:', error);
  });
}
