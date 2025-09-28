/**
 * Wallet operations
 * Handles deposits, token receiving, and balance queries
 */

import type { NDKCashuWallet } from '@nostr-dev-kit/ndk-wallet';
import { walletLogger } from '../../utils/walletLogger';
import { toWalletError, retryWithBackoff } from '../../utils/walletErrors';

const DEPOSIT_TIMEOUT_MS = 120000; // 2 minutes

export interface DepositOptions {
  amountSats: number;
  mintUrl: string;
  timeoutMs?: number;
}

/**
 * Create a deposit with timeout and error handling
 */
export interface DepositResult {
  token: string;
  invoice: string;
}

export async function createDeposit(
  wallet: NDKCashuWallet,
  options: DepositOptions
): Promise<DepositResult> {
  const { amountSats, mintUrl, timeoutMs = DEPOSIT_TIMEOUT_MS } = options;

  return retryWithBackoff(async () => {
    walletLogger.info(
      `Creating deposit for ${amountSats} sats`,
      'createDeposit',
      { mintUrl }
    );

    return new Promise<DepositResult>((resolve, reject) => {
      const depositInstance = wallet.deposit(amountSats, mintUrl);

      const timeoutId = setTimeout(() => {
        reject(
          toWalletError(
            new Error(`Deposit timeout after ${timeoutMs}ms`),
            'Deposit operation timed out'
          )
        );
      }, timeoutMs);

      depositInstance.on('success', (token: any) => {
        clearTimeout(timeoutId);
        const tokenStr = typeof token === 'string' ? token : JSON.stringify(token);
        const invoice = (depositInstance as any).pr || '';
        walletLogger.info('Deposit successful', 'createDeposit', { token: tokenStr.substring(0, 20), invoice: invoice.substring(0, 20) });
        resolve({ token: tokenStr, invoice });
      });

      depositInstance.on('error', (error: any) => {
        clearTimeout(timeoutId);
        const errorObj = typeof error === 'string' ? new Error(error) : error;
        walletLogger.error('Deposit failed', 'createDeposit', errorObj);
        reject(toWalletError(errorObj, 'Deposit operation failed'));
      });

      depositInstance.start();

      if (depositInstance.quoteId) {
        walletLogger.debug('Deposit invoice generated', 'createDeposit', {
          quoteId: depositInstance.quoteId,
        });
      }
    });
  }, {
    maxAttempts: 2,
    delayMs: 2000,
  });
}

/**
 * Receive a Cashu token with error handling
 */
export async function receiveToken(
  wallet: NDKCashuWallet,
  token: string,
  description?: string
): Promise<void> {
  try {
    walletLogger.info(
      'Receiving Cashu token',
      'receiveToken',
      { description, tokenPrefix: token.substring(0, 20) }
    );

    const tokenEvent = await wallet.receiveToken(token, description);
    
    if (tokenEvent) {
      walletLogger.info(
        'Token received successfully',
        'receiveToken',
        { eventId: tokenEvent.id }
      );
    }
  } catch (error) {
    walletLogger.error('Failed to receive token', 'receiveToken', error);
    throw toWalletError(error, 'Failed to receive token');
  }
}

/**
 * Get current wallet balance with retry
 */
export async function queryBalance(wallet: NDKCashuWallet): Promise<number> {
  try {
    const currentBalance = wallet.balance?.amount || 0;
    walletLogger.debug('Balance queried', 'queryBalance', { balance: currentBalance });
    return currentBalance;
  } catch (error) {
    walletLogger.warn('Failed to query balance', 'queryBalance', error);
    return wallet.balance?.amount || 0;
  }
}