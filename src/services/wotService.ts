import type NDK from "@nostr-dev-kit/ndk";
import { type NDKEvent, type NDKFilter, NDKKind } from "@nostr-dev-kit/ndk"
import { PABLO_PUBKEY } from '@/stores/wotStore';

interface TrustScore {
  score: number;
  level: 1 | 2;
}

export async function calculateWebOfTrust(
  ndk: NDK,
  userPubkey?: string,
  onProgress?: (phase: string, progress: number) => void
): Promise<Record<string, TrustScore>> {
  const scores: Record<string, TrustScore> = {};

  const centralPubkey = userPubkey && await shouldUseFallback(ndk, userPubkey)
    ? PABLO_PUBKEY
    : userPubkey || PABLO_PUBKEY;

  onProgress?.('Fetching your follows...', 0);

  const directFollows = await fetchFollows(ndk, centralPubkey);

  directFollows.forEach(pubkey => {
    scores[pubkey] = { score: 1.0, level: 1 };
  });

  onProgress?.('Fetching network (2nd degree)...', 30);

  const secondDegreeFollows = await fetchFollowsOfFollows(
    ndk,
    directFollows,
    (current, total) => {
      const progress = 30 + (current / total) * 60;
      onProgress?.('Fetching network (2nd degree)...', progress);
    }
  );

  secondDegreeFollows.forEach(pubkey => {
    if (!scores[pubkey]) {
      scores[pubkey] = { score: 0.5, level: 2 };
    }
  });

  onProgress?.('Complete', 100);

  return scores;
}

async function shouldUseFallback(ndk: NDK, userPubkey: string): Promise<boolean> {
  const follows = await fetchFollows(ndk, userPubkey);
  return follows.length < 50;
}

async function fetchFollows(ndk: NDK, pubkey: string): Promise<string[]> {
  const filter: NDKFilter = {
    kinds: [NDKKind.Contacts],
    authors: [pubkey],
    limit: 1
  };

  const events = await ndk.fetchEvents(filter);

  if (events.size === 0) return [];

  const contactListEvent = Array.from(events)[0];

  return contactListEvent.tags
    .filter(tag => tag[0] === 'p')
    .map(tag => tag[1])
    .filter(Boolean);
}

async function fetchFollowsOfFollows(
  ndk: NDK,
  pubkeys: string[],
  onProgress?: (current: number, total: number) => void
): Promise<string[]> {
  const BATCH_SIZE = 50;
  const allFollows = new Set<string>();

  for (let i = 0; i < pubkeys.length; i += BATCH_SIZE) {
    const batch = pubkeys.slice(i, i + BATCH_SIZE);

    const filter: NDKFilter = {
      kinds: [NDKKind.Contacts],
      authors: batch,
      limit: batch.length
    };

    const events = await ndk.fetchEvents(filter);

    events.forEach((event: NDKEvent) => {
      event.tags
        .filter(tag => tag[0] === 'p')
        .map(tag => tag[1])
        .filter(Boolean)
        .forEach(follow => allFollows.add(follow));
    });

    onProgress?.(i + batch.length, pubkeys.length);
  }

  return Array.from(allFollows);
}