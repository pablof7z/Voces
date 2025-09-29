import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { NDKNutzapState, NDKEventId, NDKUser } from '@nostr-dev-kit/ndk';
import type NDK from '@nostr-dev-kit/ndk';
import { NdkNutzapStatus } from '@nostr-dev-kit/ndk';
import type { NDKNutzapMonitorStore, NDKCashuWallet } from '@nostr-dev-kit/ndk-wallet';
import type { NDKNutzapMonitor } from '@nostr-dev-kit/ndk-wallet';
import { walletLogger } from '../utils/walletLogger';
import { WalletError, getUserFriendlyErrorMessage } from '../utils/walletErrors';
import {
  initializeWallet,
  cleanupWallet,
} from '../hooks/wallet/initialization';
import {
  setupBalanceListeners,
  setupNutzapMonitorListeners,
} from '../hooks/wallet/eventHandlers';
import {
  createDeposit as createDepositOperation,
  receiveToken as receiveTokenOperation,
  queryBalance,
  type DepositResult,
} from '../hooks/wallet/operations';

const BALANCE_POLLING_INTERVAL_MS = 30000;

interface WalletState {
  // Wallet instances
  wallet: NDKCashuWallet | null;
  monitor: NDKNutzapMonitor | null;

  // Wallet state
  balance: number;
  isReady: boolean;
  isInitializing: boolean;
  error: string | null;

  // Nutzap state tracking
  nutzaps: Map<NDKEventId, NDKNutzapState>;

  // Wallet configuration
  mints: string[];
  selectedMint: string | null;
  walletRelays: string[];

  // Internal state
  balancePollingInterval: ReturnType<typeof setInterval> | null;
  cleanupBalanceListeners: (() => void) | null;
  cleanupMonitorListeners: (() => void) | null;

  // Initialization
  initialize: (ndk: NDK, currentUser: NDKUser) => Promise<void>;
  cleanup: () => void;

  // Actions
  deposit: (amountSats: number, mintUrl?: string) => Promise<DepositResult>;
  receiveToken: (token: string, description?: string) => Promise<void>;
  refreshBalance: () => Promise<void>;
  setNutzapState: (id: NDKEventId, state: Partial<NDKNutzapState>) => Promise<void>;
  getAllNutzaps: () => Promise<Map<NDKEventId, NDKNutzapState>>;
  addMint: (mint: string) => void;
  removeMint: (mint: string) => void;
  setSelectedMint: (mint: string | null) => void;
  addWalletRelay: (relay: string) => void;
  removeWalletRelay: (relay: string) => void;
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      wallet: null,
      monitor: null,
      balance: 0,
      isReady: false,
      isInitializing: false,
      error: null,
      nutzaps: new Map(),
      mints: ['https://nofees.testnut.cashu.space'],
      selectedMint: null,
      walletRelays: [],
      balancePollingInterval: null,
      cleanupBalanceListeners: null,
      cleanupMonitorListeners: null,

      initialize: async (ndk: NDK, currentUser: NDKUser) => {
        const state = get();

        if (state.isInitializing) {
          walletLogger.info('Wallet already initializing, skipping', 'walletStore');
          return;
        }

        if (state.wallet && state.isReady) {
          walletLogger.info('Wallet already initialized', 'walletStore');
          return;
        }

        set({ isInitializing: true, error: null });

        try {
          walletLogger.info('Starting wallet initialization', 'walletStore');

          const initResult = await initializeWallet({
            ndk,
            currentUser,
            mintUrls: state.mints,
            walletRelays: state.walletRelays,
          });

          const { wallet: initializedWallet, monitor: initializedMonitor, initialBalance } = initResult;

          const cleanupBalance = setupBalanceListeners(
            initializedWallet,
            (newBalance) => {
              set({ balance: newBalance });
            }
          );

          const cleanupMonitor = setupNutzapMonitorListeners(initializedMonitor);

          const pollingInterval = setInterval(async () => {
            try {
              const currentWallet = get().wallet;
              if (currentWallet) {
                const updatedBalance = await queryBalance(currentWallet);
                set({ balance: updatedBalance });
              }
            } catch (err) {
              walletLogger.warn('Balance polling failed', 'walletStore', err);
            }
          }, BALANCE_POLLING_INTERVAL_MS);

          set({
            wallet: initializedWallet,
            monitor: initializedMonitor,
            balance: initialBalance,
            isReady: true,
            isInitializing: false,
            cleanupBalanceListeners: cleanupBalance,
            cleanupMonitorListeners: cleanupMonitor,
            balancePollingInterval: pollingInterval,
          });

          walletLogger.info('Wallet initialization complete', 'walletStore');
        } catch (err) {
          const walletError = err instanceof WalletError ? err : new WalletError(
            err instanceof Error ? err.message : 'Unknown error',
            err instanceof Error && 'code' in err ? (err.code as string) : 'UNKNOWN_ERROR'
          );

          const friendlyMessage = getUserFriendlyErrorMessage(walletError);
          set({ error: friendlyMessage, isInitializing: false });

          walletLogger.error('Wallet initialization failed', 'walletStore', err);
        }
      },

      cleanup: () => {
        const state = get();

        if (state.balancePollingInterval) {
          clearInterval(state.balancePollingInterval);
        }

        if (state.cleanupBalanceListeners) {
          state.cleanupBalanceListeners();
        }

        if (state.cleanupMonitorListeners) {
          state.cleanupMonitorListeners();
        }

        if (state.wallet && state.monitor) {
          cleanupWallet(state.wallet, state.monitor);
        }

        set({
          wallet: null,
          monitor: null,
          balance: 0,
          isReady: false,
          error: null,
          balancePollingInterval: null,
          cleanupBalanceListeners: null,
          cleanupMonitorListeners: null,
        });

        walletLogger.info('Wallet cleanup complete', 'walletStore');
      },

      deposit: async (amountSats: number, mintUrl?: string) => {
        const state = get();

        if (!state.wallet) {
          throw new Error('Wallet not initialized');
        }

        const targetMint = mintUrl || state.mints[0];
        if (!targetMint) {
          throw new Error('No mint configured');
        }

        walletLogger.info(`Initiating deposit: ${amountSats} sats`, 'walletStore.deposit');

        const result = await createDepositOperation(state.wallet, {
          amountSats,
          mintUrl: targetMint,
        });

        walletLogger.info('Deposit completed', 'walletStore.deposit');
        return result;
      },

      receiveToken: async (token: string, description?: string) => {
        const state = get();

        if (!state.wallet) {
          throw new Error('Wallet not initialized');
        }

        walletLogger.info('Receiving token', 'walletStore.receiveToken', { description });
        await receiveTokenOperation(state.wallet, token, description);
        walletLogger.info('Token received', 'walletStore.receiveToken');
      },

      refreshBalance: async () => {
        const state = get();

        if (!state.wallet) {
          throw new Error('Wallet not initialized');
        }

        walletLogger.info('Manually refreshing balance', 'walletStore.refreshBalance');
        const updatedBalance = await queryBalance(state.wallet);
        set({ balance: updatedBalance });
      },

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

      addWalletRelay: (relay: string) => {
        set((state) => {
          if (state.walletRelays.includes(relay)) return state;
          return { walletRelays: [...state.walletRelays, relay] };
        });
      },

      removeWalletRelay: (relay: string) => {
        set((state) => ({
          walletRelays: state.walletRelays.filter((r) => r !== relay),
        }));
      },
    }),
    {
      name: 'voces-wallet-storage',
      partialize: (state) => ({
        mints: state.mints,
        selectedMint: state.selectedMint,
        walletRelays: state.walletRelays,
        nutzaps: Array.from(state.nutzaps.entries()),
      }),
      merge: (persistedState: { mints?: string[]; selectedMint?: string; walletRelays?: string[]; nutzaps?: [string, NDKNutzap][] }, currentState) => {
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