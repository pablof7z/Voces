/**
 * TypeScript types for wallet hooks
 */

import type { NDKCashuWallet, NDKNutzapMonitor } from '@nostr-dev-kit/ndk-wallet';
import type { DepositResult } from './operations';

export interface WalletState {
  wallet: NDKCashuWallet | null;
  monitor: NDKNutzapMonitor | null;
  balance: number;
  isReady: boolean;
  isInitializing: boolean;
  error: string | null;
  p2pk: string | undefined;
}

export interface WalletActions {
  deposit: (amountSats: number, mintUrl?: string) => Promise<DepositResult>;
  receiveToken: (token: string, description?: string) => Promise<void>;
  refreshBalance: () => Promise<void>;
}

export type WalletHookReturn = WalletState & WalletActions;