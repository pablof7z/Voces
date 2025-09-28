import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const PABLO_NPUB = 'npub1l2vyh47mk2p0qlsku7hg0vn29faehy9hy34ygaclpn66ukqp3afqutajft';
export const PABLO_PUBKEY = '7fa56f5d6962ab1e3cd424e758c3002b8665f7b0d8dcee9fe9e288d7751ac194';

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