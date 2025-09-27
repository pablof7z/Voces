import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { NDKNutzapState, NDKEventId } from '@nostr-dev-kit/ndk';
import { NdkNutzapStatus } from '@nostr-dev-kit/ndk';
import type { NDKNutzapMonitorStore } from '@nostr-dev-kit/ndk-wallet';

interface WalletState {
  // Nutzap state tracking
  nutzaps: Map<NDKEventId, NDKNutzapState>;
  
  // Wallet configuration
  mints: string[];
  selectedMint: string | null;
  
  // Actions
  setNutzapState: (id: NDKEventId, state: Partial<NDKNutzapState>) => Promise<void>;
  getAllNutzaps: () => Promise<Map<NDKEventId, NDKNutzapState>>;
  addMint: (mint: string) => void;
  removeMint: (mint: string) => void;
  setSelectedMint: (mint: string | null) => void;
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      nutzaps: new Map(),
      mints: ['https://nofees.testnut.cashu.space'],
      selectedMint: null,

      setNutzapState: async (id: NDKEventId, stateChange: Partial<NDKNutzapState>) => {
        set((state) => {
          const nutzaps = new Map(state.nutzaps);
          const current = nutzaps.get(id) || { status: NdkNutzapStatus.INITIAL };
          nutzaps.set(id, { ...current, ...stateChange });
          return { nutzaps };
        });
      },

      getAllNutzaps: async () => {
        return get().nutzaps;
      },

      addMint: (mint: string) => {
        set((state) => {
          if (state.mints.includes(mint)) return state;
          return { mints: [...state.mints, mint] };
        });
      },

      removeMint: (mint: string) => {
        set((state) => ({
          mints: state.mints.filter((m) => m !== mint),
          selectedMint: state.selectedMint === mint ? null : state.selectedMint,
        }));
      },

      setSelectedMint: (mint: string | null) => {
        set({ selectedMint: mint });
      },
    }),
    {
      name: 'voces-wallet-storage',
      partialize: (state) => ({
        mints: state.mints,
        selectedMint: state.selectedMint,
        // Note: nutzaps Map needs special handling for persistence
        nutzaps: Array.from(state.nutzaps.entries()),
      }),
      merge: (persistedState: any, currentState) => {
        // Convert persisted nutzaps array back to Map
        const nutzapsArray = persistedState?.nutzaps || [];
        const nutzapsMap = new Map(nutzapsArray);
        
        return {
          ...currentState,
          ...persistedState,
          nutzaps: nutzapsMap,
        };
      },
    }
  )
);

// Create a store adapter for NDKNutzapMonitor
export function createNutzapMonitorStore(): NDKNutzapMonitorStore {
  return {
    getAllNutzaps: () => useWalletStore.getState().getAllNutzaps(),
    setNutzapState: (id, state) => useWalletStore.getState().setNutzapState(id, state),
  };
}