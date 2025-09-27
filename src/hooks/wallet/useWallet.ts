/**
 * Thin wrapper around wallet store
 * Hook for components to access wallet state and actions
 */

import { useWalletStore } from '../../stores/walletStore';
import type { WalletHookReturn } from './types';

export function useWallet(): WalletHookReturn {
  const wallet = useWalletStore((state) => state.wallet);
  const monitor = useWalletStore((state) => state.monitor);
  const balance = useWalletStore((state) => state.balance);
  const isReady = useWalletStore((state) => state.isReady);
  const isInitializing = useWalletStore((state) => state.isInitializing);
  const error = useWalletStore((state) => state.error);
  const deposit = useWalletStore((state) => state.deposit);
  const receiveToken = useWalletStore((state) => state.receiveToken);
  const refreshBalance = useWalletStore((state) => state.refreshBalance);

  return {
    wallet,
    monitor,
    balance,
    isReady,
    isInitializing,
    error,
    p2pk: wallet?.p2pk,
    deposit,
    receiveToken,
    refreshBalance,
  };
}