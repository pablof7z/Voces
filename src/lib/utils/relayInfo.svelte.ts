export interface RelayInfo {
  name?: string;
  description?: string;
  pubkey?: string;
  contact?: string;
  supported_nips?: number[];
  software?: string;
  version?: string;
  icon?: string;
  limitation?: {
    max_message_length?: number;
    max_subscriptions?: number;
    max_filters?: number;
    max_limit?: number;
    max_subid_length?: number;
    max_event_tags?: number;
    min_prefix?: number;
    max_content_length?: number;
    min_pow_difficulty?: number;
    auth_required?: boolean;
    payment_required?: boolean;
  };
  relay_countries?: string[];
  language_tags?: string[];
  tags?: string[];
  posting_policy?: string;
  payments_url?: string;
  fees?: {
    admission?: { amount?: number; unit?: string };
    subscription?: { amount?: number; unit?: string; period?: number };
    publication?: { kinds?: number[]; amount?: number; unit?: string }[];
  };
}

const relayInfoCache = new Map<string, { info: RelayInfo; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

export function useRelayInfoCached(relayUrl: string | null) {
  let info = $state<RelayInfo | null>(null);
  let loading = $state(false);

  $effect(() => {
    if (!relayUrl) {
      info = null;
      return;
    }

    // Check cache first
    const cached = relayInfoCache.get(relayUrl);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      info = cached.info;
      return;
    }

    const fetchRelayInfo = async () => {
      loading = true;

      try {
        // Convert ws/wss URL to http/https for NIP-11
        const httpUrl = relayUrl
          .replace('wss://', 'https://')
          .replace('ws://', 'http://');

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

        const response = await fetch(httpUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/nostr+json'
          },
          signal: controller.signal,
          mode: 'cors'
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        // Cache the result
        relayInfoCache.set(relayUrl, { info: data, timestamp: Date.now() });
        info = data;
      } catch (err) {
        console.error('Failed to fetch relay info for', relayUrl, err);
        // Set empty object so we don't keep retrying
        const emptyInfo = {};
        relayInfoCache.set(relayUrl, { info: emptyInfo, timestamp: Date.now() });
        info = emptyInfo;
      } finally {
        loading = false;
      }
    };

    fetchRelayInfo();
  });

  return {
    get info() { return info; },
    get loading() { return loading; }
  };
}
