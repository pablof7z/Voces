/**
 * Wallet event handlers
 * Manages balance updates and nutzap monitoring events
 */

import type { NDKCashuWallet, NDKNutzapMonitor } from '@nostr-dev-kit/ndk-wallet';
import type { NDKNutzap } from '@nostr-dev-kit/ndk';
import { walletLogger } from '../../utils/walletLogger';

export type BalanceUpdateCallback = (newBalance: number) => void;

/**
 * Setup balance update event listeners
 */
export function setupBalanceListeners(
  wallet: NDKCashuWallet,
  onBalanceUpdate: BalanceUpdateCallback
): () => void {
  const handleBalanceUpdate = () => {
    const updatedBalance = wallet.balance?.amount || 0;
    walletLogger.info(`Balance updated: ${updatedBalance} sats`, 'setupBalanceListeners');
    onBalanceUpdate(updatedBalance);
  };

  const handleWalletReady = () => {
    walletLogger.info('Wallet ready event received', 'setupBalanceListeners');
    const currentBalance = wallet.balance?.amount || 0;
    onBalanceUpdate(currentBalance);
  };

  wallet.on('balance_updated', handleBalanceUpdate);
  wallet.on('ready', handleWalletReady);

  return () => {
    wallet.off('balance_updated', handleBalanceUpdate);
    wallet.off('ready', handleWalletReady);
  };
}

/**
 * Setup nutzap monitoring event listeners
 */
export function setupNutzapMonitorListeners(monitor: NDKNutzapMonitor): () => void {
  const handleNutzapSeen = (nutzap: NDKNutzap) => {
    walletLogger.info(`Nutzap seen: ${nutzap.id.substring(0, 8)}`, 'setupNutzapMonitorListeners');
  };

  const handleNutzapRedeemed = (nutzaps: NDKNutzap[], totalAmount: number) => {
    walletLogger.info(
      `Redeemed ${nutzaps.length} nutzap(s) for ${totalAmount} sats`,
      'setupNutzapMonitorListeners'
    );
  };

  const handleNutzapFailed = (nutzap: NDKNutzap, errorMessage: string) => {
    walletLogger.error(
      `Failed to redeem nutzap: ${nutzap.id.substring(0, 8)}`,
      'setupNutzapMonitorListeners',
      errorMessage
    );
  };

  const handleNutzapStateChanged = (nutzapId: string, newState: any) => {
    walletLogger.debug(
      `Nutzap ${nutzapId.substring(0, 8)} state changed`,
      'setupNutzapMonitorListeners',
      newState
    );
  };

  monitor.on('seen', handleNutzapSeen);
  monitor.on('redeemed', handleNutzapRedeemed);
  monitor.on('failed', handleNutzapFailed);
  monitor.on('state_changed', handleNutzapStateChanged);

  return () => {
    monitor.off('seen', handleNutzapSeen);
    monitor.off('redeemed', handleNutzapRedeemed);
    monitor.off('failed', handleNutzapFailed);
    monitor.off('state_changed', handleNutzapStateChanged);
  };
}