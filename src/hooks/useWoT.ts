import { useEffect, useMemo } from 'react';
import { useNDK, useNDKCurrentUser, NDKEvent } from '@nostr-dev-kit/ndk-hooks';
import { useWoTStore } from '@/stores/wotStore';
import { calculateWebOfTrust } from '@/services/wotService';

export function useWoT() {
  const { ndk } = useNDK();
  const currentUser = useNDKCurrentUser();
  const {
    trustScores,
    lastUpdate,
    isCalculating,
    enabled,
    minTrustLevel,
    needsUpdate,
    setTrustScores,
    setLastUpdate,
    setIsCalculating,
  } = useWoTStore();

  useEffect(() => {
    if (!ndk || isCalculating || !needsUpdate()) return;

    const calculate = async () => {
      setIsCalculating(true);
      try {
        const scores = await calculateWebOfTrust(
          ndk,
          currentUser?.pubkey
        );
        setTrustScores(scores);
        setLastUpdate(Date.now());
      } catch (error) {
        console.error('Failed to calculate WoT:', error);
      } finally {
        setIsCalculating(false);
      }
    };

    calculate();
  }, [ndk, currentUser?.pubkey, isCalculating, needsUpdate, setTrustScores, setLastUpdate, setIsCalculating]);

  return {
    trustScores,
    lastUpdate,
    isCalculating,
    enabled,
    minTrustLevel,
  };
}

export function useWoTFilter(events: NDKEvent[]): NDKEvent[] {
  const { enabled, minTrustLevel, getTrustScore, trustScores } = useWoTStore();
  const currentUser = useNDKCurrentUser();

  return useMemo(() => {
    if (!enabled) return events;

    // If trust scores are empty, let everything through
    if (Object.keys(trustScores).length === 0) return events;

    return events.filter(event => {
      if (event.pubkey === currentUser?.pubkey) return true;

      const score = getTrustScore(event.pubkey);
      console.log({score})
      return score >= minTrustLevel;
    });
  }, [events, enabled, minTrustLevel, getTrustScore, trustScores, currentUser?.pubkey]);
}

export function useWoTScore(pubkey: string): number {
  const { getTrustScore } = useWoTStore();
  return getTrustScore(pubkey);
}