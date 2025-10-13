/**
 * Utility functions for relay operations
 */

/** Special value for selecting both Agora relays */
export const AGORAS_SELECTION = 'agoras';

/** Agora relay URLs */
export const AGORA_RELAYS = [
  'wss://ve.agorawlc.com',
  'wss://ni.agorawlc.com',
  'wss://zw.agorawlc.com',
] as const;

/**
 * Maps agora relay URLs to their preferred language
 * When a user accepts an invitation from these agoras, the app will automatically
 * set the language to the mapped value
 */
export const AGORA_LANGUAGE_MAP: Record<string, 'en' | 'es'> = {
  'wss://ve.agorawlc.com': 'es', // Venezuela - Spanish
  'wss://ni.agorawlc.com': 'es', // Nicaragua - Spanish
  'wss://zw.agorawlc.com': 'en', // Nicaragua - Spanish
};

/**
 * Checks if a relay URL is an Agora relay
 * @param url - The relay URL to check
 * @returns true if the relay is an Agora relay, false otherwise
 */
export function isAgoraRelay(url: string | null | undefined): boolean {
  if (!url) return false;
  return url.includes('agorawlc.com');
}

/**
 * Checks if the selectedRelay value represents the Agoras selection
 * @param selectedRelay - The selectedRelay value from settings
 * @returns true if the value represents the Agoras selection
 */
export function isAgorasSelection(selectedRelay: string | null | undefined): boolean {
  return selectedRelay === AGORAS_SELECTION;
}

/**
 * Gets the relay URLs to use based on the selectedRelay value
 * @param selectedRelay - The selectedRelay value from settings (null, "agoras", or a specific relay URL)
 * @param enabledRelays - Array of enabled relay URLs
 * @returns Array of relay URLs to use
 */
export function getRelaysToUse(
  selectedRelay: string | null | undefined,
  enabledRelays: string[]
): string[] {
  if (isAgorasSelection(selectedRelay)) {
    return [...AGORA_RELAYS];
  }
  if (selectedRelay) {
    return [selectedRelay];
  }
  return enabledRelays;
}

/**
 * Gets the preferred language for a given agora relay
 * @param relayUrl - The relay URL to check
 * @returns The preferred language code, or null if no mapping exists
 */
export function getAgoraLanguage(relayUrl: string | null | undefined): 'en' | 'es' | null {
  if (!relayUrl) return null;
  return AGORA_LANGUAGE_MAP[relayUrl] ?? null;
}
