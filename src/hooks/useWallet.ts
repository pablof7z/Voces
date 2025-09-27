/**
 * Re-export the modular wallet hook
 * Maintains backwards compatibility while using refactored modules
 */

export { useWallet } from './wallet/useWallet';
export type { WalletHookReturn, WalletState, WalletActions } from './wallet/types';