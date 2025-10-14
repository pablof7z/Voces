import NDKCacheSqliteWasm from "@nostr-dev-kit/cache-sqlite-wasm";
import { NDKSvelte } from '@nostr-dev-kit/svelte';
import { LocalStorage } from '@nostr-dev-kit/sessions';
import { NDKEvent, NDKKind, NDKBlossomList, NDKInterestList } from '@nostr-dev-kit/ndk';
import { browser } from '$app/environment';
import { createAuthPolicyWithConfirmation } from './relayAuthPolicy.svelte';
import { createHashtagInterestsStore } from './stores/hashtagInterests.svelte';

const DEFAULT_RELAYS = [
  'wss://relay.primal.net',
  'wss://relay.nostr.band',
];

// Initialize SQLite WASM cache with worker mode (browser only)
const cacheAdapter = browser ? new NDKCacheSqliteWasm({
  dbName: "voces-cache",
  useWorker: true,
  workerUrl: "/worker.js",
  wasmUrl: "/sql-wasm.wasm",
}) : undefined;

// Initialize signature verification worker (only in browser)
let sigVerifyWorker: Worker | undefined;

export const ndk = new NDKSvelte({
  explicitRelayUrls: DEFAULT_RELAYS,
  autoConnectUserRelays: true,
  cacheAdapter,
  signatureVerificationWorker: sigVerifyWorker,
  initialValidationRatio: 1.0,
  lowestValidationRatio: 0.1,
  aiGuardrails: true,
  session: browser ? {
    storage: new LocalStorage(),
    autoSave: true,
    fetches: {
      follows: true,
      mutes: true,
      wallet: true,
      relayList: true,
      eventConstructors: [NDKBlossomList, NDKInterestList],
    }
  } : undefined
});

// Set the relay authentication policy (browser only)
if (browser) {
  ndk.relayAuthDefaultPolicy = createAuthPolicyWithConfirmation({ ndk });
}

// Initialize the cache and connect
export const ndkReady = (async () => {
  if (!browser) return;

  try {
    // Initialize worker
    const SigVerifyWorker = (await import('./sig-verify.worker.ts?worker')).default;
    sigVerifyWorker = new SigVerifyWorker();
    ndk.signatureVerificationWorker = sigVerifyWorker;

    // Initialize cache
    if (cacheAdapter) {
      await cacheAdapter.initializeAsync(ndk);
    }

    ndk.connect();
  } catch (error) {
    console.error("❌ Failed to initialize cache:", error);
  }
})();

// Create hashtag interests store (only in browser)
export const hashtagInterests = browser ? createHashtagInterestsStore(ndk) : null as any;

// Re-export auth management utilities
export {
  clearAuthDecisions,
  removeAuthDecision,
  getAuthDecisions
} from './relayAuthPolicy.svelte';

export default ndk;
