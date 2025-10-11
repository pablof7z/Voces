<script lang="ts">
  import { ndk } from '$lib/ndk.svelte';
  import type { Mint } from '@nostr-dev-kit/svelte';
  import MintBrowser from '$lib/components/wallet/MintBrowser.svelte';

  let isAddingMint = $state(false);
  let isAddingRelay = $state(false);
  let isBrowsingMints = $state(false);
  let newMintUrl = $state('');
  let newRelayUrl = $state('');
  let error = $state<string | null>(null);
  let successMessage = $state<string | null>(null);

  const wallet = $derived(ndk.$wallet);
  const mints = $derived(wallet.mints.map(m => typeof m === 'string' ? m : m.url));
  const relays = $derived(wallet.relays);
  const mintBalances = $derived(() => {
    const balances = new Map<string, number>();
    mints.forEach(mint => {
      const walletInstance = (wallet as any)._wallet;
      if (walletInstance?.mintBalance) {
        balances.set(mint, walletInstance.mintBalance(mint));
      }
    });
    return balances;
  });

  function validateMintUrl(url: string): boolean {
    const trimmed = url.trim();
    if (!trimmed) return false;

    try {
      const parsed = new URL(trimmed);
      return (parsed.protocol === 'https:' || parsed.protocol === 'http:') && !!parsed.hostname;
    } catch {
      return false;
    }
  }

  function validateRelayUrl(url: string): boolean {
    const trimmed = url.trim();
    if (!trimmed) return false;

    try {
      const parsed = new URL(trimmed);
      return (parsed.protocol === 'wss:' || parsed.protocol === 'ws:') && !!parsed.hostname;
    } catch {
      return false;
    }
  }

  async function handleAddMint() {
    error = null;
    successMessage = null;

    if (!validateMintUrl(newMintUrl)) {
      error = 'Invalid mint URL. Must be a valid HTTP/HTTPS URL.';
      return;
    }

    const trimmedUrl = newMintUrl.trim();

    if (mints.some(mint => mint === trimmedUrl)) {
      error = 'This mint is already added.';
      return;
    }

    try {
      const walletInstance = (wallet as any)._wallet;
      if (!walletInstance) {
        error = 'Wallet not initialized';
        return;
      }

      walletInstance.mints = [...walletInstance.mints, trimmedUrl];
      await walletInstance.publish();

      successMessage = 'Mint added successfully!';
      newMintUrl = '';
      isAddingMint = false;

      setTimeout(() => {
        successMessage = null;
      }, 3000);
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to add mint';
    }
  }

  async function handleRemoveMint(mint: string) {
    error = null;
    successMessage = null;

    try {
      const walletInstance = (wallet as any)._wallet;
      if (!walletInstance) {
        error = 'Wallet not initialized';
        return;
      }

      walletInstance.mints = walletInstance.mints.filter((m: string) => m !== mint);
      await walletInstance.publish();

      successMessage = 'Mint removed successfully!';

      setTimeout(() => {
        successMessage = null;
      }, 3000);
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to remove mint';
    }
  }

  async function handleAddRelay() {
    error = null;
    successMessage = null;

    let trimmedUrl = newRelayUrl.trim();

    // Auto-add wss:// if missing
    if (!trimmedUrl.startsWith('wss://') && !trimmedUrl.startsWith('ws://')) {
      trimmedUrl = `wss://${trimmedUrl}`;
    }

    if (!validateRelayUrl(trimmedUrl)) {
      error = 'Invalid relay URL. Must be a valid WebSocket URL (wss:// or ws://).';
      return;
    }

    if (relays.includes(trimmedUrl)) {
      error = 'This relay is already added.';
      return;
    }

    try {
      const walletInstance = (wallet as any)._wallet;
      if (!walletInstance) {
        error = 'Wallet not initialized';
        return;
      }

      const { NDKRelaySet } = await import('@nostr-dev-kit/ndk');
      const currentRelays = walletInstance.relaySet?.relayUrls || [];
      walletInstance.relaySet = NDKRelaySet.fromRelayUrls([...currentRelays, trimmedUrl], ndk);
      await walletInstance.publish();

      successMessage = 'Relay added successfully!';
      newRelayUrl = '';
      isAddingRelay = false;

      setTimeout(() => {
        successMessage = null;
      }, 3000);
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to add relay';
    }
  }

  async function handleRemoveRelay(relay: string) {
    error = null;
    successMessage = null;

    try {
      const walletInstance = (wallet as any)._wallet;
      if (!walletInstance) {
        error = 'Wallet not initialized';
        return;
      }

      const { NDKRelaySet } = await import('@nostr-dev-kit/ndk');
      const currentRelays = walletInstance.relaySet?.relayUrls || [];
      const filteredRelays = currentRelays.filter((r: string) => r !== relay);
      walletInstance.relaySet = filteredRelays.length > 0
        ? NDKRelaySet.fromRelayUrls(filteredRelays, ndk)
        : undefined;
      await walletInstance.publish();

      successMessage = 'Relay removed successfully!';

      setTimeout(() => {
        successMessage = null;
      }, 3000);
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to remove relay';
    }
  }

  function getMintName(mintUrl: string): string {
    try {
      const url = new URL(mintUrl);
      return url.hostname;
    } catch {
      return mintUrl;
    }
  }

  function getRelayName(relayUrl: string): string {
    try {
      const url = new URL(relayUrl);
      return url.hostname;
    } catch {
      return relayUrl;
    }
  }

  function formatSats(amount: number): string {
    return new Intl.NumberFormat('en-US').format(amount);
  }

  async function handleBrowseMints(selectedMints: string[]) {
    error = null;
    successMessage = null;

    try {
      const walletInstance = (wallet as any)._wallet;
      if (!walletInstance) {
        error = 'Wallet not initialized';
        return;
      }

      const newMints = selectedMints.filter(mintUrl => !mints.includes(mintUrl));

      if (newMints.length > 0) {
        walletInstance.mints = [...walletInstance.mints, ...newMints];
        await walletInstance.publish();

        successMessage = `Added ${newMints.length} mint${newMints.length === 1 ? '' : 's'} successfully!`;
        setTimeout(() => {
          successMessage = null;
        }, 3000);
      }
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to add mints';
      console.error('Failed to add mints:', e);
    }

    isBrowsingMints = false;
  }
</script>

<div class="space-y-6">
  <!-- Header -->
  <div>
    <h2 class="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
      Wallet Configuration
    </h2>
    <p class="text-sm text-neutral-600 dark:text-neutral-400">
      Manage your Cashu mints and wallet relays for ecash transactions.
    </p>
  </div>

  <!-- Success/Error Messages -->
  {#if successMessage}
    <div class="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
      <div class="flex gap-3">
        <svg class="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-sm text-green-800 dark:text-green-300">{successMessage}</p>
      </div>
    </div>
  {/if}

  {#if error}
    <div class="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
      <div class="flex gap-3">
        <svg class="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-sm text-red-800 dark:text-red-300">{error}</p>
      </div>
    </div>
  {/if}

  <!-- Cashu Mints Section -->
  <div class="space-y-3">
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
        Cashu Mints
      </h3>
      <span class="text-sm text-neutral-500 dark:text-neutral-400">
        {mints.length} {mints.length === 1 ? 'mint' : 'mints'}
      </span>
    </div>

    <!-- Mint List -->
    <div class="space-y-2">
      {#each mints as mint (mint)}
        <div class="border rounded-lg p-4 bg-white dark:bg-black border-neutral-200 dark:border-neutral-700">
          <div class="flex items-center justify-between">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <svg class="w-5 h-5 text-orange-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <div class="flex-1 min-w-0">
                  <div class="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
                    {getMintName(mint)}
                  </div>
                  <div class="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                    {mint}
                  </div>
                </div>
              </div>
              {#if mintBalances.has(mint)}
                <div class="mt-2 text-sm">
                  <span class="text-orange-600 dark:text-orange-500 font-semibold">
                    {formatSats(mintBalances.get(mint) || 0)} sats
                  </span>
                </div>
              {/if}
            </div>
            <button
              onclick={() => handleRemoveMint(mint)}
              class="ml-3 p-2 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors group"
              title="Remove mint"
            >
              <svg class="w-5 h-5 text-neutral-400 group-hover:text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      {/each}

      {#if mints.length === 0}
        <div class="text-center py-8 text-neutral-500 dark:text-neutral-400">
          <svg class="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <p class="text-sm">No mints configured</p>
        </div>
      {/if}

      <!-- Add New Mint -->
      {#if isAddingMint}
        <div class="border-2 border-dashed border-orange-300 dark:border-orange-700 rounded-lg p-4">
          <div class="space-y-3">
            <input
              type="url"
              bind:value={newMintUrl}
              placeholder="https://mint.example.com"
              class="w-full px-3 py-2 bg-white dark:bg-black border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-neutral-900 dark:text-neutral-100"
              autofocus
            />
            <div class="flex gap-2">
              <button
                onclick={handleAddMint}
                disabled={!newMintUrl.trim()}
                class="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Add Mint
              </button>
              <button
                onclick={() => {
                  isAddingMint = false;
                  newMintUrl = '';
                  error = null;
                }}
                class="px-4 py-2 bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      {:else}
        <div class="flex gap-2">
          <button
            onclick={() => isAddingMint = true}
            class="flex-1 border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-lg p-4 hover:border-orange-500 dark:hover:border-orange-600 transition-colors group"
          >
            <div class="flex items-center justify-center gap-2 text-neutral-500 group-hover:text-orange-600 dark:group-hover:text-orange-500">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span class="font-medium">Add Manually</span>
            </div>
          </button>
          <button
            onclick={() => isBrowsingMints = true}
            class="flex-1 border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-lg p-4 hover:border-orange-500 dark:hover:border-orange-600 transition-colors group"
          >
            <div class="flex items-center justify-center gap-2 text-neutral-500 group-hover:text-orange-600 dark:group-hover:text-orange-500">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span class="font-medium">Browse Mints</span>
            </div>
          </button>
        </div>
      {/if}
    </div>
  </div>

  <!-- Wallet Relays Section -->
  <div class="space-y-3">
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
        Wallet Relays
      </h3>
      <span class="text-sm text-neutral-500 dark:text-neutral-400">
        {relays.length} {relays.length === 1 ? 'relay' : 'relays'}
      </span>
    </div>

    <!-- Relay List -->
    <div class="space-y-2">
      {#each relays as relay (relay)}
        <div class="border rounded-lg p-4 bg-white dark:bg-black border-neutral-200 dark:border-neutral-700">
          <div class="flex items-center justify-between">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <svg class="w-5 h-5 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                </svg>
                <div class="flex-1 min-w-0">
                  <div class="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
                    {getRelayName(relay)}
                  </div>
                  <div class="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                    {relay}
                  </div>
                </div>
              </div>
            </div>
            <button
              onclick={() => handleRemoveRelay(relay)}
              class="ml-3 p-2 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors group"
              title="Remove relay"
            >
              <svg class="w-5 h-5 text-neutral-400 group-hover:text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      {/each}

      {#if relays.length === 0}
        <div class="text-center py-8 text-neutral-500 dark:text-neutral-400">
          <svg class="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
          </svg>
          <p class="text-sm">No relays configured</p>
        </div>
      {/if}

      <!-- Add New Relay -->
      {#if isAddingRelay}
        <div class="border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-lg p-4">
          <div class="space-y-3">
            <input
              type="text"
              bind:value={newRelayUrl}
              placeholder="wss://relay.example.com"
              class="w-full px-3 py-2 bg-white dark:bg-black border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-neutral-900 dark:text-neutral-100"
              autofocus
            />
            <div class="text-xs text-neutral-500 dark:text-neutral-400">
              URL will automatically be prefixed with wss:// if not provided
            </div>
            <div class="flex gap-2">
              <button
                onclick={handleAddRelay}
                disabled={!newRelayUrl.trim()}
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Add Relay
              </button>
              <button
                onclick={() => {
                  isAddingRelay = false;
                  newRelayUrl = '';
                  error = null;
                }}
                class="px-4 py-2 bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      {:else}
        <button
          onclick={() => isAddingRelay = true}
          class="w-full border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-lg p-4 hover:border-blue-500 dark:hover:border-blue-600 transition-colors group"
        >
          <div class="flex items-center justify-center gap-2 text-neutral-500 group-hover:text-blue-600 dark:group-hover:text-blue-500">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span class="font-medium">Add Relay</span>
          </div>
        </button>
      {/if}
    </div>
  </div>

  <!-- Info Notice -->
  <div class="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
    <div class="flex gap-3">
      <svg class="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <div class="text-sm text-blue-800 dark:text-blue-300">
        <p class="font-medium mb-1">About Wallet Configuration</p>
        <p class="mb-2"><strong>Cashu Mints:</strong> Servers that issue and redeem ecash tokens. You need at least one mint to use the wallet.</p>
        <p><strong>Wallet Relays:</strong> Nostr relays used to store and sync your wallet state (NIP-60). Changes are saved automatically.</p>
      </div>
    </div>
  </div>
</div>

<!-- Mint Browser Modal -->
{#if isBrowsingMints}
  <MintBrowser
    onSelectMints={handleBrowseMints}
    onClose={() => isBrowsingMints = false}
  />
{/if}
