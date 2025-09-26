import { useMemo } from 'react';
import { useSubscribe } from '@nostr-dev-kit/ndk-hooks';
import { useFollowPacksStore } from '@/stores/followPacksStore';
import type { FollowPackWithMetadata } from '../types';

// NIP-51 kinds for lists
const FOLLOW_LIST_KIND = 30000; // People lists
const INTEREST_LIST_KIND = 30001; // Interest/topic lists

export function useFollowPacks(pubkey?: string) {
  const { isSubscribed, isFavorite } = useFollowPacksStore();

  // Fetch lists created by a specific user or all lists
  const filters = pubkey
    ? [{
        kinds: [FOLLOW_LIST_KIND, INTEREST_LIST_KIND],
        authors: [pubkey],
        limit: 50
      }]
    : [{
        kinds: [FOLLOW_LIST_KIND, INTEREST_LIST_KIND],
        limit: 100
      }];

  const { events } = useSubscribe(filters);

  // Process events into FollowPackWithMetadata
  const processedPacks = useMemo(() => {
    if (!events) return [];

    return events.map((event) => {
      const dTag = event.tags.find(t => t[0] === 'd')?.[1] || '';
      const title = event.tags.find(t => t[0] === 'title')?.[1] ||
                    event.tags.find(t => t[0] === 'name')?.[1] ||
                    dTag || 'Untitled List';
      const description = event.tags.find(t => t[0] === 'description')?.[1] ||
                         event.tags.find(t => t[0] === 'about')?.[1] || '';
      const image = event.tags.find(t => t[0] === 'image')?.[1];

      // Extract pubkeys from 'p' tags
      const pubkeys = event.tags
        .filter(t => t[0] === 'p')
        .map(t => t[1]);

      return {
        id: event.id,
        author: event.pubkey,
        title,
        description,
        image,
        pubkeys,
        dTag,
        subscriberCount: 0,
        isSubscribed: isSubscribed(event.id),
        isFavorite: isFavorite(event.id),
        lastUpdated: event.created_at,
        event
      } as FollowPackWithMetadata;
    });
  }, [events, isSubscribed, isFavorite]);

  return {
    packs: processedPacks
  };
}

export function useFollowPacksByCategory(category?: string) {
  const { packs } = useFollowPacks();

  const filteredPacks = useMemo(() => {
    if (!category) return packs;

    // Filter by content analysis since NIP-51 doesn't define standard category tags
    return packs.filter(pack => {
      const searchText = `${pack.title} ${pack.description}`.toLowerCase();

      switch (category) {
        case 'tech':
          return /tech|dev|code|program|software/i.test(searchText);
        case 'bitcoin':
          return /bitcoin|btc|sats|lightning/i.test(searchText);
        case 'art':
          return /art|design|creative|artist/i.test(searchText);
        case 'music':
          return /music|musician|band|song/i.test(searchText);
        case 'news':
          return /news|media|journal|report/i.test(searchText);
        case 'philosophy':
          return /philosoph|think|idea|concept/i.test(searchText);
        case 'nostr':
          return /nostr|relay|nip/i.test(searchText);
        default:
          return true;
      }
    });
  }, [packs, category]);

  return filteredPacks;
}

export function useSubscribedFollowPacks() {
  const { subscribedPacks } = useFollowPacksStore();
  const { packs } = useFollowPacks();

  return useMemo(() => {
    return packs.filter(pack => subscribedPacks.includes(pack.id));
  }, [packs, subscribedPacks]);
}