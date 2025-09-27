/**
 * Main wallet hook
 * Integrates initialization, event handling, and operations
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { useNDK, useNDKCurrentUser } from '@nostr-dev-kit/ndk-hooks';
import { useWalletStore } from '../../stores/walletStore';
import { walletLogger } from '../../utils/walletLogger';
import { getUserFriendlyErrorMessage, WalletError } from '../../utils/walletErrors';
import {
  initializeWallet,
  cleanupWallet,
  type WalletInitializationResult,
} from './initialization';
import {
  setupBalanceListeners,
  setupNutzapMonitorListeners,
} from './eventHandlers';
import {
  createDeposit as createDepositOperation,
  receiveToken as receiveTokenOperation,
  queryBalance,
} from './operations';
import type { WalletHookReturn } from './types';

const BALANCE_POLLING_INTERVAL_MS = 30000; // Poll every 30 seconds as fallback

export function useWallet(): WalletHookReturn {
  const { ndk } = useNDK();
  const currentUser = useNDKCurrentUser();
  const mintUrls = useWalletStore((state) => state.mints);

  const [wallet, setWallet] = useState<WalletInitializationResult['wallet'] | null>(null);
  const [monitor, setMonitor] = useState<WalletInitializationResult['monitor'] | null>(null);
  const [balance, setBalance] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const balancePollingRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize wallet when NDK and user are available
  useEffect(() => {
    if (!ndk || !currentUser || mintUrls.length === 0) {
      setWallet(null);
      setMonitor(null);
      setIsReady(false);
      setIsInitializing(false);
      return;
    }

    let isMounted = true;
    let cleanupBalanceListeners: (() => void) | null = null;
    let cleanupMonitorListeners: (() => void) | null = null;

    async function performWalletInitialization() {
      setIsInitializing(true);
      setError(null);

      try {
        walletLogger.info('Starting wallet initialization', 'useWallet');

        const initResult = await initializeWallet({
          ndk,
          currentUser,
          mintUrls,
        });

        if (!isMounted) return;

        const { wallet: initializedWallet, monitor: initializedMonitor, initialBalance } = initResult;

        // Setup event listeners
        cleanupBalanceListeners = setupBalanceListeners(
          initializedWallet,
          (newBalance) => {
            if (isMounted) {
              setBalance(newBalance);
            }
          }
        );

        cleanupMonitorListeners = setupNutzapMonitorListeners(initializedMonitor);

        setWallet(initializedWallet);
        setMonitor(initializedMonitor);
        setBalance(initialBalance);
        setIsReady(true);
        setIsInitializing(false);

        walletLogger.info('Wallet initialization complete', 'useWallet');
      } catch (err) {
        if (!isMounted) return;

        const walletError = err instanceof WalletError ? err : new WalletError(
          err instanceof Error ? err.message : 'Unknown error',
          err instanceof Error ? (err as any).code : 'UNKNOWN_ERROR'
        );

        const friendlyMessage = getUserFriendlyErrorMessage(walletError);
        setError(friendlyMessage);
        setIsInitializing(false);

        walletLogger.error('Wallet initialization failed', 'useWallet', err);
      }
    }

    performWalletInitialization();

    return () => {
      isMounted = false;
      if (cleanupBalanceListeners) cleanupBalanceListeners();
      if (cleanupMonitorListeners) cleanupMonitorListeners();
      if (wallet && monitor) {
        cleanupWallet(wallet, monitor);
      }
    };
  }, [ndk, currentUser, mintUrls]);

  // Fallback balance polling mechanism
  useEffect(() => {
    if (!wallet || !isReady) {
      if (balancePollingRef.current) {
        clearInterval(balancePollingRef.current);
        balancePollingRef.current = null;
      }
      return;
    }

    balancePollingRef.current = setInterval(async () => {
      try {
        const updatedBalance = await queryBalance(wallet);
        setBalance(updatedBalance);
      } catch (err) {
        walletLogger.warn('Balance polling failed', 'useWallet', err);
      }
    }, BALANCE_POLLING_INTERVAL_MS);

    return () => {
      if (balancePollingRef.current) {
        clearInterval(balancePollingRef.current);
        balancePollingRef.current = null;
      }
    };
  }, [wallet, isReady]);

  // Deposit action
  const deposit = useCallback(
    async (amountSats: number, mintUrl?: string): Promise<string> => {
      if (!wallet) {
        throw new Error('Wallet not initialized');
      }

      const targetMint = mintUrl || mintUrls[0];
      if (!targetMint) {
        throw new Error('No mint configured');
      }

      walletLogger.info(`Initiating deposit: ${amountSats} sats`, 'useWallet.deposit');

      const token = await createDepositOperation(wallet, {
        amountSats,
        mintUrl: targetMint,
      });

      walletLogger.info('Deposit completed', 'useWallet.deposit');
      return token;
    },
    [wallet, mintUrls]
  );

  // Receive token action
  const receiveToken = useCallback(
    async (token: string, description?: string): Promise<void> => {
      if (!wallet) {
        throw new Error('Wallet not initialized');
      }

      walletLogger.info('Receiving token', 'useWallet.receiveToken', { description });
      await receiveTokenOperation(wallet, token, description);
      walletLogger.info('Token received', 'useWallet.receiveToken');
    },
    [wallet]
  );

  // Refresh balance action
  const refreshBalance = useCallback(async (): Promise<void> => {
    if (!wallet) {
      throw new Error('Wallet not initialized');
    }

    walletLogger.info('Manually refreshing balance', 'useWallet.refreshBalance');
    const updatedBalance = await queryBalance(wallet);
    setBalance(updatedBalance);
  }, [wallet]);

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