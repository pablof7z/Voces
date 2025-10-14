/**
 * Helper functions for wallet operations
 * Broken down into single-purpose, testable utilities
 */

import NDK, { NDKPrivateKeySigner, NDKEvent, NDKUser, NDKNutzap, NDKZapper } from "@nostr-dev-kit/ndk";
import { NDKCashuWallet, NDKNutzapMonitor } from "@nostr-dev-kit/wallet";

export interface WalletConnectionConfig {
  explicitRelayUrls: string[];
}

export interface WalletSetupResult {
  ndk: NDK;
  signer: NDKPrivateKeySigner;
  user: NDKUser;
  wallet: NDKCashuWallet;
  monitor: NDKNutzapMonitor;
}

export interface DepositResult {
  token: string;
  amount: number;
  mint: string;
}

export interface NutzapSendResult {
  success: boolean;
  nutzapId?: string;
  error?: Error;
}

/**
 * Initialize NDK connection with specified relays
 */
export async function initializeNDKConnection(config: WalletConnectionConfig): Promise<NDK> {
  const ndk = new NDK(config);
  await ndk.connect();
  return ndk;
}

/**
 * Generate a new keypair and return the signer and user
 */
export async function generateWalletKeypair(): Promise<{
  signer: NDKPrivateKeySigner;
  user: NDKUser;
}> {
  const signer = NDKPrivateKeySigner.generate();
  const user = await signer.user();
  return { signer, user };
}

/**
 * Create and initialize a Cashu wallet with the specified mints
 */
export async function createCashuWallet(
  ndk: NDK,
  signer: NDKPrivateKeySigner,
  mintUrls: string[]
): Promise<NDKCashuWallet> {
  ndk.signer = signer;

  const cashuWallet = new NDKCashuWallet(ndk);
  cashuWallet.mints = [...mintUrls];

  const walletP2PK = await cashuWallet.getP2pk();
  console.log('🔑 Wallet P2PK:', walletP2PK);

  await cashuWallet.start();
  return cashuWallet;
}

/**
 * Create a deposit and wait for it to complete
 */
export async function createWalletDeposit(
  wallet: NDKCashuWallet,
  amountSats: number,
  mintUrl: string
): Promise<DepositResult> {
  return new Promise((resolve, reject) => {
    const depositInstance = wallet.deposit(amountSats, mintUrl);

    const timeoutId = setTimeout(() => {
      reject(new Error('Deposit timeout after 60 seconds'));
    }, 60000);

    depositInstance.on('success', (token) => {
      clearTimeout(timeoutId);
      resolve({
        token,
        amount: amountSats,
        mint: mintUrl,
      });
    });

    depositInstance.on('error', (error) => {
      clearTimeout(timeoutId);
      reject(error);
    });

    depositInstance.start();
    console.log('💡 Invoice:', depositInstance.quote);
  });
}

/**
 * Setup nutzap monitoring with event handlers
 */
export async function setupNutzapMonitoring(
  ndk: NDK,
  wallet: NDKCashuWallet,
  user: NDKUser
): Promise<NDKNutzapMonitor> {
  const monitor = new NDKNutzapMonitor(ndk, user, {});
  monitor.wallet = wallet;

  monitor.on('seen', (nutzap: NDKNutzap) => {
    console.log('👁️  Seen nutzap:', nutzap.id.substring(0, 8));
  });

  monitor.on('redeemed', (nutzaps: NDKNutzap[], totalAmount: number) => {
    console.log(`✅ Redeemed ${nutzaps.length} nutzap(s) for ${totalAmount} sats`);
  });

  monitor.on('failed', (nutzap: NDKNutzap, errorMessage: string) => {
    console.error('❌ Failed to redeem nutzap:', nutzap.id.substring(0, 8), errorMessage);
  });

  monitor.on('state_changed', (nutzapId: string, newState: string) => {
    console.log(`🔄 Nutzap ${nutzapId.substring(0, 8)} state changed to:`, newState);
  });

  await monitor.start({});
  return monitor;
}

/**
 * Send a nutzap to a recipient
 */
export async function sendNutzapToRecipient(
  ndk: NDK,
  wallet: NDKCashuWallet,
  recipientPubkey: string,
  amountSats: number,
  targetEvent?: NDKEvent,
  comment?: string
): Promise<NutzapSendResult> {
  try {
    const recipient = ndk.getUser({ pubkey: recipientPubkey });
    const zapTarget = targetEvent || recipient;

    ndk.walletConfig = {
      cashuPay: async (payment) => {
        const result = await wallet.cashuPay(payment);
        return result;
      },
    };

    const zapper = new NDKZapper(zapTarget, amountSats, "sat", {
      ndk,
      comment: comment || "Nutzap from CLI script",
    });

    const zapResults = await zapper.zap(["nip61"]);

    for (const [, zapResult] of zapResults) {
      if (zapResult instanceof Error) {
        return {
          success: false,
          error: zapResult,
        };
      } else if (zapResult instanceof NDKNutzap) {
        return {
          success: true,
          nutzapId: zapResult.id,
        };
      }
    }

    return {
      success: false,
      error: new Error('No valid zap result returned'),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}

/**
 * Cleanup wallet and monitor resources
 */
export function cleanupWalletResources(
  wallet: NDKCashuWallet,
  monitor: NDKNutzapMonitor
): void {
  wallet.stop();
  monitor.stop();
}