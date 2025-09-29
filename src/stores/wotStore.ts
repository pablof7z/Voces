import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const PABLO_PUBKEY =
	"fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52";

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

interface TrustScore {
  score: number;
  level: 1 | 2;
}

interface WoTState {
  trustScores: Record<string, TrustScore>;
  lastUpdate: number | null;
  isCalculating: boolean;
  enabled: boolean;
  minTrustLevel: number;

  getTrustScore: (pubkey: string) => number;
  setTrustScores: (scores: Record<string, TrustScore>) => void;
  setLastUpdate: (timestamp: number) => void;
  setIsCalculating: (isCalculating: boolean) => void;
  setEnabled: (enabled: boolean) => void;
  setMinTrustLevel: (level: number) => void;
  needsUpdate: () => boolean;
  reset: () => void;
}

export const useWoTStore = create<WoTState>()(
  persist(
    (set, get) => ({
      trustScores: {},
      lastUpdate: null,
      isCalculating: false,
      enabled: true,
      minTrustLevel: 0.5,

      getTrustScore: (pubkey: string) => {
        const trust = get().trustScores[pubkey];
        return trust?.score || 0;
      },

      setTrustScores: (scores: Record<string, TrustScore>) =>
        set({ trustScores: scores }),

      setLastUpdate: (timestamp: number) =>
        set({ lastUpdate: timestamp }),

      setIsCalculating: (isCalculating: boolean) =>
        set({ isCalculating }),

      setEnabled: (enabled: boolean) =>
        set({ enabled }),

      setMinTrustLevel: (level: number) =>
        set({ minTrustLevel: level }),

      needsUpdate: () => {
        const { lastUpdate } = get();
        if (!lastUpdate) return true;
        return Date.now() - lastUpdate > ONE_WEEK_MS;
      },

      reset: () =>
        set({
          trustScores: {},
          lastUpdate: null,
          isCalculating: false
        }),
    }),
    {
      name: 'voces-wot-store',
      partialize: (state) => ({
        trustScores: state.trustScores,
        lastUpdate: state.lastUpdate,
        enabled: state.enabled,
        minTrustLevel: state.minTrustLevel,
      }),
    }
  )
);