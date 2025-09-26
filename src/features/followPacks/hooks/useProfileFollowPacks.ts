import { useMemo } from 'react';
import { useSubscribe, NDKFollowPack } from '@nostr-dev-kit/ndk-hooks';
import { useFollowPacksStore } from '@/stores/followPacksStore';
import type { FollowPackWithMetadata } from '../types';

export function useProfileFollowPacks(profilePubkey: string) {
  const { isSubscribed, isFavorite } = useFollowPacksStore();

  // Single subscription: get packs created by user OR where user appears
  const filter = [{
    kinds: NDKFollowPack.kinds,
    authors: [profilePubkey]
  }, {
    kinds: NDKFollowPack.kinds,
    '#p': [profilePubkey]
  }];

  const { events } = useSubscribe(profilePubkey ? filter : false, { subId: `profile-packs-${profilePubkey.slice(0, 8)}` });

  // Process all events and categorize them
  const { createdPacks, appearsPacks, allPacks } = useMemo(() => {
    if (!events) return { createdPacks: [], appearsPacks: [], allPacks: [] };

    // Deduplicate events by ID
    const uniqueEvents = Array.from(
      new Map(events.map(e => [e.id, e])).values()
    );

    const processed = uniqueEvents.map((event) => {
      // Convert to NDKFollowPack to use its built-in getters
      const followPack = NDKFollowPack.from(event);

      // Extract pubkeys from 'p' tags
      const pubkeys = event.tags
        .filter((t: string[]) => t[0] === 'p')
        .map((t: string[]) => t[1]);

      return {
        ...followPack,
        pubkeys,
        subscriberCount: 0,
        isSubscribed: isSubscribed(event.id),
        isFavorite: isFavorite(event.id),
        lastUpdated: event.created_at,
        // Keep track of whether user created it or appears in it
        isCreator: event.pubkey === profilePubkey,
        appearsIn: pubkeys.includes(profilePubkey)
      } as FollowPackWithMetadata & { isCreator: boolean; appearsIn: boolean };
    });

    const created = processed.filter(p => p.isCreator);
    const appears = processed.filter(p => p.appearsIn && !p.isCreator);

    return {
      createdPacks: created,
      appearsPacks: appears,
      allPacks: processed
    };
  }, [events, profilePubkey, isSubscribed, isFavorite]);

  return {
    createdPacks,
    appearsPacks,
    allPacks
  };
}