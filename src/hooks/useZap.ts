import { useState, useCallback } from 'react';
import { NDKEvent, NDKZapper } from '@nostr-dev-kit/ndk-hooks';
import { useNDK } from '@nostr-dev-kit/ndk-hooks';
import { useWallet } from './useWallet';
import { walletLogger } from '@/utils/walletLogger';
import { toWalletError } from '@/utils/walletErrors';

interface UseZapOptions {
  onSuccess?: (amount: number, eventId: string) => void;
  onError?: (error: Error) => void;
}

export function useZap(options: UseZapOptions = {}) {
  const { ndk } = useNDK();
  const { wallet, isReady: isWalletReady } = useWallet();
  const [isZapping, setIsZapping] = useState(false);

  const sendZap = useCallback(async (
    event: NDKEvent,
    amountSats: number,
    comment?: string
  ): Promise<boolean> => {
    if (!ndk) {
      const error = new Error('NDK not initialized');
      walletLogger.error('Zap failed: NDK not initialized', 'useZap');
      options.onError?.(error);
      return false;
    }

    if (!isWalletReady || !wallet) {
      const error = new Error('Wallet not ready');
      walletLogger.error('Zap failed: Wallet not ready', 'useZap');
      options.onError?.(error);
      return false;
    }

    setIsZapping(true);
    
    try {
      walletLogger.info(
        `Initiating nutzap: ${amountSats} sats to event ${event.id}`,
        'useZap',
        { amountSats, eventId: event.id, authorPubkey: event.pubkey }
      );

      const zapper = new NDKZapper(event, amountSats, 'sat', {
        ndk,
        comment: comment || `Zapped ${amountSats} sats`,
        cashuPay: wallet,
      });

      const zapResults = await zapper.zap(['nip61']);

      if (!zapResults || zapResults.length === 0) {
        throw new Error('Zap failed: No results returned');
      }

      const successfulZaps = zapResults.filter((result) => result !== null);
      
      if (successfulZaps.length === 0) {
        throw new Error('Zap failed: All zap attempts failed');
      }

      walletLogger.info(
        `Nutzap successful: ${amountSats} sats`,
        'useZap',
        { eventId: event.id, results: zapResults.length }
      );

      options.onSuccess?.(amountSats, event.id);
      return true;
    } catch (error) {
      const walletError = toWalletError(error, 'Failed to send zap');
      walletLogger.error('Zap failed', 'useZap', walletError);
      options.onError?.(walletError);
      return false;
    } finally {
      setIsZapping(false);
    }
  }, [ndk, wallet, isWalletReady, options]);

  return {
    sendZap,
    isZapping,
    canZap: isWalletReady && !!wallet,
  };
}