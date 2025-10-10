import type { NDKRelay, NDKAuthPolicy } from '@nostr-dev-kit/ndk';
import { NDKEvent, NDKKind } from '@nostr-dev-kit/ndk';
import type NDK from '@nostr-dev-kit/ndk';
import createDebug from 'debug';
import { relayAuthModal } from './stores/relayAuthModal.svelte';

const debug = createDebug('voces:relay:auth');

// Storage key for auth decisions
const AUTH_DECISIONS_KEY = 'voces:relay-auth-decisions';

interface AuthDecision {
  relay: string;
  accepted: boolean;
  timestamp: number;
}

// In-memory cache of auth decisions
const authDecisionsCache = new Map<string, boolean>();

// Load auth decisions from localStorage
function loadAuthDecisions(): Map<string, boolean> {
  try {
    const stored = localStorage.getItem(AUTH_DECISIONS_KEY);
    if (stored) {
      const decisions: AuthDecision[] = JSON.parse(stored);
      const map = new Map<string, boolean>();
      decisions.forEach(d => map.set(d.relay, d.accepted));
      return map;
    }
  } catch (error) {
    debug('Failed to load auth decisions:', error);
  }
  return new Map();
}

// Save auth decisions to localStorage
function saveAuthDecisions(decisions: Map<string, boolean>): void {
  try {
    const array: AuthDecision[] = Array.from(decisions.entries()).map(([relay, accepted]) => ({
      relay,
      accepted,
      timestamp: Date.now()
    }));
    localStorage.setItem(AUTH_DECISIONS_KEY, JSON.stringify(array));
  } catch (error) {
    debug('Failed to save auth decisions:', error);
  }
}

// Initialize cache from localStorage (browser only)
if (typeof window !== 'undefined') {
  const stored = loadAuthDecisions();
  stored.forEach((accepted, relay) => authDecisionsCache.set(relay, accepted));
}

// Prompt user for confirmation
async function promptUserForAuth(relay: NDKRelay): Promise<boolean> {
  return new Promise((resolve) => {
    relayAuthModal.open({
      relayUrl: relay.url,
      onConfirm: () => {
        authDecisionsCache.set(relay.url, true);
        saveAuthDecisions(authDecisionsCache);
        resolve(true);
      },
      onReject: () => {
        authDecisionsCache.set(relay.url, false);
        saveAuthDecisions(authDecisionsCache);
        resolve(false);
      }
    });
  });
}

// Get stored decision for a relay
function getStoredDecision(relayUrl: string): boolean | undefined {
  return authDecisionsCache.get(relayUrl);
}

/**
 * Authentication policy that asks the user for confirmation before authenticating.
 * Stores user decisions so they don't get asked again for the same relay.
 */
export function createAuthPolicyWithConfirmation({ ndk }: { ndk?: NDK } = {}): NDKAuthPolicy {
  debug('Creating auth policy with user confirmation');

  return async (relay: NDKRelay, challenge: string): Promise<boolean | NDKEvent> => {
    debug(`Relay ${relay.url} requested authentication`);

    // Check if we already have a decision for this relay
    const storedDecision = getStoredDecision(relay.url);

    if (storedDecision !== undefined) {
      debug(`Using stored decision for ${relay.url}: ${storedDecision ? 'accepted' : 'rejected'}`);

      if (!storedDecision) {
        // User previously rejected, return false
        return false;
      }

      // User previously accepted, create auth event
      const event = new NDKEvent(ndk);
      event.kind = NDKKind.ClientAuth;
      event.tags = [
        ['relay', relay.url],
        ['challenge', challenge]
      ];

      // Sign the event
      const signer = ndk?.signer;
      if (signer) {
        await event.sign(signer);
        return event;
      } else {
        // Wait for signer to be ready
        return new Promise((resolve, reject) => {
          ndk?.once('signer:ready', async (signer) => {
            try {
              await event.sign(signer);
              resolve(event);
            } catch (e) {
              debug('Failed to sign auth event:', e);
              reject(e);
            }
          });
        });
      }
    }

    // No stored decision, ask the user
    debug(`Prompting user for auth decision for ${relay.url}`);
    const userAccepted = await promptUserForAuth(relay);

    if (!userAccepted) {
      debug(`User rejected authentication for ${relay.url}`);
      return false;
    }

    debug(`User accepted authentication for ${relay.url}`);

    // Create and sign auth event
    const event = new NDKEvent(ndk);
    event.kind = NDKKind.ClientAuth;
    event.tags = [
      ['relay', relay.url],
      ['challenge', challenge]
    ];

    const signer = ndk?.signer;
    if (signer) {
      await event.sign(signer);
      return event;
    } else {
      // Wait for signer to be ready
      return new Promise((resolve, reject) => {
        ndk?.once('signer:ready', async (signer) => {
          try {
            await event.sign(signer);
            resolve(event);
          } catch (e) {
            debug('Failed to sign auth event:', e);
            reject(e);
          }
        });
      });
    }
  };
}

/**
 * Clear all stored auth decisions
 */
export function clearAuthDecisions(): void {
  authDecisionsCache.clear();
  try {
    localStorage.removeItem(AUTH_DECISIONS_KEY);
  } catch (error) {
    debug('Failed to clear auth decisions:', error);
  }
}

/**
 * Remove auth decision for a specific relay
 */
export function removeAuthDecision(relayUrl: string): void {
  authDecisionsCache.delete(relayUrl);
  saveAuthDecisions(authDecisionsCache);
}

/**
 * Get all stored auth decisions
 */
export function getAuthDecisions(): Map<string, boolean> {
  return new Map(authDecisionsCache);
}
