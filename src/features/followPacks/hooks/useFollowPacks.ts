import { useMemo } from 'react';
import { useSubscribe, NDKFollowPack } from '@nostr-dev-kit/ndk-hooks';

export function useFollowPacks(pubkey?: string) {
  // Fetch lists created by a specific user or all lists
  const filters = pubkey
    ? [{
        kinds: NDKFollowPack.kinds,
        authors: [pubkey]
      }]
    : [{
        kinds: NDKFollowPack.kinds
      }];

  const { events } = useSubscribe(filters);

  // Convert events to NDKFollowPack instances
  const packs = useMemo(() => {
    if (!events) return [];
    return events.map(event => NDKFollowPack.from(event));
  }, [events]);

  return { packs };
}

import { useFollowPacksStore } from '@/stores/followPacksStore';

export function useSubscribedFollowPacks() {
  const { subscribedPacks } = useFollowPacksStore();
  const { packs } = useFollowPacks();

  return useMemo(() => {
    return packs.filter(pack => subscribedPacks.includes(pack.id));
  }, [packs, subscribedPacks]);
}