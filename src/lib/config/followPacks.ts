import { NDKKind } from '@nostr-dev-kit/ndk';

// Community to relay mapping
// Maps community IDs to their dedicated relay URLs for fetching follow packs
export const COMMUNITY_RELAYS: Record<string, string[]> = {
  venezuela: ['wss://ve.agorawlc.com'],
  nicaragua: ['wss://ni.agorawlc.com'],
  // Other communities can be added here as they get their own relays
};

// Follow pack kind for subscription filters
export const FOLLOW_PACK_KIND = NDKKind.FollowPack; // 39089

// Community metadata - this will be shown while loading actual data
export const COMMUNITY_METADATA: Record<string, { name: string; description: string }> = {
  venezuela: {
    name: 'Venezuela',
    description: 'Connect with the Venezuelan community'
  },
  cambodia: {
    name: 'Cambodia',
    description: 'Join voices from the Kingdom of Wonder'
  },
  nicaragua: {
    name: 'Nicaragua',
    description: 'Unite with Nicaraguan changemakers'
  },
  zimbabwe: {
    name: 'Zimbabwe',
    description: 'Connect with Zimbabwe\'s innovators'
  },
  afghanistan: {
    name: 'Afghanistan',
    description: 'Support Afghan voices of hope'
  },
  iran: {
    name: 'Iran',
    description: 'Join the Persian community'
  }
};