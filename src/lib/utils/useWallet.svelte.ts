import type { NDKSvelte } from "@nostr-dev-kit/svelte";
import type { Mint, Transaction } from "@nostr-dev-kit/svelte";
import { NDKCashuWallet, consolidateMintTokens } from "@nostr-dev-kit/wallet";
import { CheckStateEnum } from "@cashu/cashu-ts";

export interface ProofEntry {
    proof: any;
    mint: string;
    state: "available" | "reserved" | "spent" | "deleted";
    tokenId?: string;
    timestamp: number;
}

export interface TokenEntry {
    tokenId: string | null;
    token?: any;
    mint: string;
    proofEntries: ProofEntry[];
}

/**
 * Application-specific wallet adapter.
 * Adds app-specific functionality on top of ReactiveWalletStore.
 * Most apps should use ndk.$wallet directly.
 */
export interface WalletAPI {
    balance: number;
    mints: Mint[];
    relays: string[];
    transactions: Transaction[];
    status: "idle" | "loading" | "error";
    needsOnboarding: boolean;
    deposit: ReturnType<typeof ndk.$wallet.deposit>;
    send: (amount: number, memo?: string) => Promise<{ token: string }>;
    receiveToken: typeof ndk.$wallet.receiveToken;
    setupWallet: typeof ndk.$wallet.setupWallet;
    getP2PKPubkey: typeof ndk.$wallet.getP2PKPubkey;
    getProofEntries: (opts?: { mint?: string; onlyAvailable?: boolean; includeDeleted?: boolean }) => ProofEntry[];
    getTokens: (opts?: { mint?: string; onlyAvailable?: boolean; includeDeleted?: boolean }) => TokenEntry[];
    validateProofs: (mint: string) => Promise<{ mint: string; spentCount: number; unspentCount: number; pendingCount: number }>;
}

export function useWallet(ndk: NDKSvelte): WalletAPI {
    const walletStore = ndk.$wallet;

    return {
        // Delegate to store
        get balance() { return walletStore.balance; },
        get mints() { return walletStore.mints; },
        get relays() { return walletStore.relays; },
        get transactions() { return walletStore.transactions; },
        get status() { return walletStore.status === 2 ? "idle" : "loading"; },
        get needsOnboarding() { return walletStore.needsOnboarding; },

        deposit: (amount, mint) => walletStore.deposit(amount, mint),
        send: async (amount, memo) => ({ token: await walletStore.send(amount, memo) }),
        receiveToken: (token, memo) => walletStore.receiveToken(token, memo),
        setupWallet: (config) => walletStore.setupWallet(config),
        getP2PKPubkey: () => walletStore.getP2PKPubkey(),

        // App-specific methods (proofs/tokens/validation - not in ReactiveWalletStore)
        getProofEntries(opts = {}) {
            const wallet = walletStore.wallet;
            if (!(wallet instanceof NDKCashuWallet)) return [];

            const entries = wallet.state.getProofEntries(opts);
            return entries.map(entry => ({
                proof: entry.proof,
                mint: entry.mint,
                state: entry.state,
                tokenId: entry.tokenId,
                timestamp: entry.timestamp,
            }));
        },
        getTokens(opts = {}) {
            const wallet = walletStore.wallet;
            if (!(wallet instanceof NDKCashuWallet)) return [];

            const tokensMap = wallet.state.getTokens(opts);
            return Array.from(tokensMap.values()).map(entry => ({
                tokenId: entry.tokenId,
                token: entry.token,
                mint: entry.mint,
                proofEntries: entry.proofEntries.map(pe => ({
                    proof: pe.proof,
                    mint: pe.mint,
                    state: pe.state,
                    tokenId: pe.tokenId,
                    timestamp: pe.timestamp,
                })),
            }));
        },
        async validateProofs(mint: string) {
            const wallet = walletStore.wallet;
            if (!(wallet instanceof NDKCashuWallet)) throw new Error("No wallet");

            const allProofs = wallet.state.getProofs({ mint, includeDeleted: true, onlyAvailable: false });

            return new Promise<{ mint: string; spentCount: number; unspentCount: number; pendingCount: number }>((resolve, reject) => {
                consolidateMintTokens(
                    mint,
                    wallet,
                    allProofs,
                    (walletChange) => {
                        const spentCount = walletChange.destroy?.length ?? 0;
                        const storeCount = walletChange.store?.length ?? 0;
                        const unspentCount = storeCount;
                        const pendingCount = 0;

                        resolve({ mint, spentCount, unspentCount, pendingCount });
                    },
                    (error) => {
                        reject(new Error(error));
                    }
                );
            });
        },
    };
}
