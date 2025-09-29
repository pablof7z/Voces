/**
 * Wallet initialization logic
 * Handles setting up NDKCashuWallet and NDKNutzapMonitor
 */

import type NDK from '@nostr-dev-kit/ndk';
import type { NDKUser } from '@nostr-dev-kit/ndk';
import { NDKRelaySet, NDKKind } from '@nostr-dev-kit/ndk';
import { NDKCashuWallet, NDKNutzapMonitor } from '@nostr-dev-kit/ndk-wallet';
import { walletLogger } from '../../utils/walletLogger';
import { toWalletError, retryWithBackoff } from '../../utils/walletErrors';
import { createNutzapMonitorStore } from '../../stores/walletStore';

export interface WalletInitializationConfig {
  ndk: NDK;
  currentUser: NDKUser;
  mintUrls: string[];
  walletRelays: string[];
}

export interface WalletInitializationResult {
  wallet: NDKCashuWallet;
  monitor: NDKNutzapMonitor;
  initialBalance: number;
}

/**
 * Find existing wallet from NDK events
 */
async function findExistingWallet(ndk: NDK): Promise<NDKCashuWallet | undefined> {
  const activeUser = ndk.activeUser;

  if (!activeUser) {
    walletLogger.warn('No active user, cannot search for existing wallet', 'findExistingWallet');
    return undefined;
  }

  walletLogger.info('Searching for existing wallet', 'findExistingWallet', { pubkey: activeUser.pubkey });

  const event = await ndk.fetchEvent({
    kinds: [NDKKind.CashuWallet],
    authors: [activeUser.pubkey]
  });

  if (event) {
    walletLogger.info('Found existing wallet event', 'findExistingWallet', { eventId: event.id });
    return await NDKCashuWallet.from(event);
  }

  walletLogger.info('No existing wallet found', 'findExistingWallet');
  return undefined;
}

/**
 * Initialize the Cashu wallet with retry logic
 */
async function initializeCashuWallet(
  ndk: NDK,
  mintUrls: string[],
  walletRelays: string[]
): Promise<NDKCashuWallet> {
  return retryWithBackoff(async () => {
    walletLogger.info('Initializing Cashu wallet', 'initializeCashuWallet');

    const existingWallet = await findExistingWallet(ndk);

    if (existingWallet) {
      walletLogger.info('Using existing wallet', 'initializeCashuWallet', {
        existingMints: existingWallet.mints
      });

      // Merge the existing wallet mints with any new mints from settings
      const combinedMints = new Set([
        ...(existingWallet.mints || []),
        ...mintUrls
      ]);
      existingWallet.mints = Array.from(combinedMints);

      // Set relay configuration if provided
      if (walletRelays.length > 0) {
        const relaySet = NDKRelaySet.fromRelayUrls(walletRelays, ndk);
        existingWallet.relaySet = relaySet;
      }

      await existingWallet.start();
      walletLogger.info('Existing wallet started successfully', 'initializeCashuWallet', {
        mints: existingWallet.mints
      });
      return existingWallet;
    }

    walletLogger.info('Creating new wallet', 'initializeCashuWallet');
    const cashuWallet = new NDKCashuWallet(ndk);
    cashuWallet.mints = [...mintUrls];
    if (walletRelays.length > 0) {
      const relaySet = NDKRelaySet.fromRelayUrls(walletRelays, ndk);
      cashuWallet.relaySet = relaySet;
    }

    const walletP2PK = await cashuWallet.getP2pk();
    walletLogger.info(`Wallet P2PK generated: ${walletP2PK}`, 'initializeCashuWallet');

    await cashuWallet.start();
    walletLogger.info('New wallet started successfully', 'initializeCashuWallet');

    return cashuWallet;
  }, {
    maxAttempts: 3,
    delayMs: 1000,
  });
}

/**
 * Initialize the nutzap monitor with retry logic
 */
async function initializeNutzapMonitor(
  ndk: NDK,
  currentUser: NDKUser,
  wallet: NDKCashuWallet
): Promise<NDKNutzapMonitor> {
  return retryWithBackoff(async () => {
    walletLogger.info('Initializing nutzap monitor', 'initializeNutzapMonitor');
    
    const nutzapMonitor = new NDKNutzapMonitor(ndk, currentUser, {
      store: createNutzapMonitorStore(),
    });
    
    nutzapMonitor.wallet = wallet;
    await nutzapMonitor.start({});
    
    walletLogger.info('Nutzap monitor started successfully', 'initializeNutzapMonitor');
    
    return nutzapMonitor;
  }, {
    maxAttempts: 3,
    delayMs: 1000,
  });
}

/**
 * Configure NDK wallet integration
 */
function configureNDKWalletIntegration(ndk: NDK, wallet: NDKCashuWallet): void {
  ndk.wallet = wallet;
  // ndk.walletConfig = {
  //   cashuPay: async (payment) => {
  //     walletLogger.info('Processing Cashu payment', 'configureNDKWalletIntegration', {
  //       amount: payment.amount,
  //       unit: payment.unit,
  //     });
  //     const result = await wallet.cashuPay(payment);
  //     return result;
  //   },
  //   lnPay: async (payment) => {
  //     walletLogger.info('Processing Lightning payment', 'configureNDKWalletIntegration', {
  //       amount: payment.amount,
  //       unit: payment.unit,
  //     });
  //     const result = await wallet.lnPay(payment);
  //     return result;
  //   },
  // };
}

/**
 * Main wallet initialization function
 */
export async function initializeWallet(
  config: WalletInitializationConfig
): Promise<WalletInitializationResult> {
  const { ndk, currentUser, mintUrls, walletRelays } = config;

  try {
    walletLogger.info('Starting wallet initialization', 'initializeWallet', { mintUrls, walletRelays });

    const wallet = await initializeCashuWallet(ndk, mintUrls, walletRelays);
    configureNDKWalletIntegration(ndk, wallet);
    
    const monitor = await initializeNutzapMonitor(ndk, currentUser, wallet);
    
    const initialBalance = wallet.balance?.amount || 0;
    
    walletLogger.info('Wallet initialization complete', 'initializeWallet', {
      balance: initialBalance,
      p2pk: wallet.p2pk,
    });
    
    return {
      wallet,
      monitor,
      initialBalance,
    };
  } catch (error) {
    walletLogger.error('Wallet initialization failed', 'initializeWallet', error);
    throw toWalletError(error, 'Wallet initialization failed');
  }
}

/**
 * Cleanup wallet resources
 */
export function cleanupWallet(wallet: NDKCashuWallet, monitor: NDKNutzapMonitor): void {
  try {
    walletLogger.info('Cleaning up wallet resources', 'cleanupWallet');
    wallet.stop();
    monitor.stop();
    walletLogger.info('Wallet cleanup complete', 'cleanupWallet');
  } catch (error) {
    walletLogger.error('Error during wallet cleanup', 'cleanupWallet', error);
  }
}