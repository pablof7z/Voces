import { useFollows } from '@nostr-dev-kit/ndk-hooks';
import { useMemo } from 'react';
import { isValidPubkey } from '@/features/backup/utils/pubkey';

/**
 * Hook that wraps useFollows and filters out any invalid pubkeys
 * Returns a Set of valid hex pubkeys only
 */
export function useValidFollows(): Set<string> {
  const follows = useFollows();

  return useMemo(() => {
    const validFollows = new Set<string>();

    follows.forEach(pubkey => {
      // Only include valid 64-character hex pubkeys
      if (isValidPubkey(pubkey)) {
        validFollows.add(pubkey);
      }
    });

    return validFollows;
  }, [follows]);
}