<script lang="ts">
  import { ndk } from '$lib/ndk.svelte';
  import type { Mint } from '@nostr-dev-kit/svelte';
  import { NDKCashuWallet } from '@nostr-dev-kit/wallet';
  import MintBrowser from '$lib/components/wallet/MintBrowser.svelte';

  let isAddingMint = $state(false);
  let isAddingRelay = $state(false);
  let isBrowsingMints = $state(false);
  let newMintUrl = $state('');
  let newRelayUrl = $state('');
  let error = $state<string | null>(null);
  let successMessage = $state<string | null>(null);
  let isSaving = $state(false);

  const wallet = $derived(ndk.$wallet);

  // Track pending changes locally
  let pendingMints = $state<string[]>([]);
  let pendingRelays = $state<string[]>([]);
  let hasPendingChanges = $state(false);

  // Initialize pending state from wallet
  $effect(() => {
    if (!hasPendingChanges) {
      pendingMints = wallet.mints.map(m => typeof m === 'string' ? m : m.url);
      pendingRelays = wallet.relays;
    }
  });

  const mints = $derived(pendingMints);
  const relays = $derived(pendingRelays);
  const mintBalances = $derived.by(() => {
    const balances = new Map<string, number>();
    mints.forEach(mint => {
      const walletInstance = (wallet as any)._wallet;
      if (walletInstance?.mintBalance) {
        balances.set(mint, walletInstance.mintBalance(mint));
      }
    });
    return balances;
  });

  // Shared utilities
  function clearMessages() {
    error = null;
    successMessage = null;
  }

  function showSuccess(message: string) {
    successMessage = message;
    setTimeout(() => {
      successMessage = null;
    }, 3000);
  }

  function showError(e: unknown) {
    error = e instanceof Error ? e.message : 'Operation failed';
  }

  function markChanges() {
    hasPendingChanges = true;
  }

  async function saveChanges() {
    clearMessages();
    isSaving = true;

    try {
      const walletInstance = (wallet as any)._wallet;

      // Create wallet if it doesn't exist
      if (!(walletInstance instanceof NDKCashuWallet)) {
        const newWallet = await NDKCashuWallet.create(ndk, pendingMints, undefined);

        // Set relays if any
        if (pendingRelays.length > 0) {
          const { NDKRelaySet } = await import('@nostr-dev-kit/ndk');
          newWallet.relaySet = NDKRelaySet.fromRelayUrls(pendingRelays, ndk);
        }

        await newWallet.publish();
      } else {
        // Update existing wallet
        walletInstance.mints = [...pendingMints];

        if (pendingRelays.length > 0) {
          const { NDKRelaySet } = await import('@nostr-dev-kit/ndk');
          walletInstance.relaySet = NDKRelaySet.fromRelayUrls(pendingRelays, ndk);
        } else {
          walletInstance.relaySet = undefined;
        }

        await walletInstance.publish();
      }

      hasPendingChanges = false;
      showSuccess('Changes saved successfully!');
    } catch (e) {
      showError(e);
    } finally {
      isSaving = false;
    }
  }

  function discardChanges() {
    pendingMints = wallet.mints.map(m => typeof m === 'string' ? m : m.url);
    pendingRelays = wallet.relays;
    hasPendingChanges = false;
    clearMessages();
  }

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

  function handleAddMint() {
    if (!validateMintUrl(newMintUrl)) {
      error = 'Invalid mint URL. Must be a valid HTTP/HTTPS URL.';
      return;
    }

    const trimmedUrl = newMintUrl.trim();

    if (mints.some(mint => mint === trimmedUrl)) {
      error = 'This mint is already added.';
      return;
    }

    pendingMints = [...pendingMints, trimmedUrl];
    markChanges();
    newMintUrl = '';
    isAddingMint = false;
    clearMessages();
  }

  function handleRemoveMint(mint: string) {
    pendingMints = pendingMints.filter(m => m !== mint);
    markChanges();
    clearMessages();
  }

  function handleAddRelay() {
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

    pendingRelays = [...pendingRelays, trimmedUrl];
    markChanges();
    newRelayUrl = '';
    isAddingRelay = false;
    clearMessages();
  }

  function handleRemoveRelay(relay: string) {
    pendingRelays = pendingRelays.filter(r => r !== relay);
    markChanges();
    clearMessages();
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

  function handleBrowseMints(selectedMints: string[]) {
    const newMints = selectedMints.filter(mintUrl => !mints.includes(mintUrl));

    if (newMints.length > 0) {
      pendingMints = [...pendingMints, ...newMints];
      markChanges();
      clearMessages();
    }

    isBrowsingMints = false;
  }
</script>

<div class="space-y-6">
  <!-- Header -->
  <div>
    <h2 class="text-xl font-semibold text-neutral-900 dark:text-foreground mb-2">
      Wallet Configuration
    </h2>
    <p class="text-sm text-muted-foreground dark:text-muted-foreground">
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
      <h3 class="text-lg font-semibold text-neutral-900 dark:text-foreground">
        Cashu Mints
      </h3>
      <span class="text-sm text-muted-foreground dark:text-muted-foreground">
        {mints.length} {mints.length === 1 ? 'mint' : 'mints'}
      </span>
    </div>

    <!-- Mint List -->
    <div class="space-y-2">
      {#each mints as mint (mint)}
        <div class="border rounded-lg p-4 bg-white dark:bg-background border">
          <div class="flex items-center justify-between">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <svg class="w-5 h-5 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <div class="flex-1 min-w-0">
                  <div class="text-sm font-medium text-neutral-900 dark:text-foreground truncate">
                    {getMintName(mint)}
                  </div>
                  <div class="text-xs text-muted-foreground dark:text-muted-foreground truncate">
                    {mint}
                  </div>
                </div>
              </div>
              {#if mintBalances.has(mint)}
                <div class="mt-2 text-sm">
                  <span class="text-primary dark:text-primary font-semibold">
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
              <svg class="w-5 h-5 text-muted-foreground group-hover:text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      {/each}

      {#if mints.length === 0}
        <div class="text-center py-8 text-muted-foreground dark:text-muted-foreground">
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
              class="w-full px-3 py-2 bg-white dark:bg-background border border dark:border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-neutral-900 dark:text-foreground"
              autofocus
            />
            <div class="flex gap-2">
              <button
                onclick={handleAddMint}
                disabled={!newMintUrl.trim()}
                class="px-4 py-2 bg-orange-600 text-foreground rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Add Mint
              </button>
              <button
                onclick={() => {
                  isAddingMint = false;
                  newMintUrl = '';
                  error = null;
                }}
                class="px-4 py-2 bg-neutral-200 dark:bg-muted text-neutral-700 dark:text-muted-foreground rounded-lg hover:bg-neutral-300 dark:hover:bg-muted transition-colors"
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
            class="flex-1 border-2 border-dashed border rounded-lg p-4 hover:border-orange-500 dark:hover:border-orange-600 transition-colors group"
          >
            <div class="flex items-center justify-center gap-2 text-muted-foreground group-hover:text-primary dark:group-hover:text-primary">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span class="font-medium">Add Manually</span>
            </div>
          </button>
          <button
            onclick={() => isBrowsingMints = true}
            class="flex-1 border-2 border-dashed border rounded-lg p-4 hover:border-orange-500 dark:hover:border-orange-600 transition-colors group"
          >
            <div class="flex items-center justify-center gap-2 text-muted-foreground group-hover:text-primary dark:group-hover:text-primary">
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
      <h3 class="text-lg font-semibold text-neutral-900 dark:text-foreground">
        Wallet Relays
      </h3>
      <span class="text-sm text-muted-foreground dark:text-muted-foreground">
        {relays.length} {relays.length === 1 ? 'relay' : 'relays'}
      </span>
    </div>

    <!-- Relay List -->
    <div class="space-y-2">
      {#each relays as relay (relay)}
        <div class="border rounded-lg p-4 bg-white dark:bg-background border">
          <div class="flex items-center justify-between">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <svg class="w-5 h-5 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                </svg>
                <div class="flex-1 min-w-0">
                  <div class="text-sm font-medium text-neutral-900 dark:text-foreground truncate">
                    {getRelayName(relay)}
                  </div>
                  <div class="text-xs text-muted-foreground dark:text-muted-foreground truncate">
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
              <svg class="w-5 h-5 text-muted-foreground group-hover:text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      {/each}

      {#if relays.length === 0}
        <div class="text-center py-8 text-muted-foreground dark:text-muted-foreground">
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
              class="w-full px-3 py-2 bg-white dark:bg-background border border dark:border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-neutral-900 dark:text-foreground"
              autofocus
            />
            <div class="text-xs text-muted-foreground dark:text-muted-foreground">
              URL will automatically be prefixed with wss:// if not provided
            </div>
            <div class="flex gap-2">
              <button
                onclick={handleAddRelay}
                disabled={!newRelayUrl.trim()}
                class="px-4 py-2 bg-blue-600 text-foreground rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Add Relay
              </button>
              <button
                onclick={() => {
                  isAddingRelay = false;
                  newRelayUrl = '';
                  error = null;
                }}
                class="px-4 py-2 bg-neutral-200 dark:bg-muted text-neutral-700 dark:text-muted-foreground rounded-lg hover:bg-neutral-300 dark:hover:bg-muted transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      {:else}
        <button
          onclick={() => isAddingRelay = true}
          class="w-full border-2 border-dashed border rounded-lg p-4 hover:border-blue-500 dark:hover:border-blue-600 transition-colors group"
        >
          <div class="flex items-center justify-center gap-2 text-muted-foreground group-hover:text-blue-600 dark:group-hover:text-blue-500">
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
        <p><strong>Wallet Relays:</strong> Nostr relays used to store and sync your wallet state (NIP-60).</p>
      </div>
    </div>
  </div>

  <!-- Save/Discard Actions -->
  {#if hasPendingChanges}
    <div class="sticky bottom-0 -mx-6 px-6 py-4 bg-white dark:bg-background border-t border shadow-lg">
      <div class="flex items-center justify-between gap-4">
        <div class="flex items-center gap-2 text-sm">
          <svg class="w-5 h-5 text-primary animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span class="text-neutral-700 dark:text-muted-foreground font-medium">You have unsaved changes</span>
        </div>
        <div class="flex gap-3">
          <button
            onclick={discardChanges}
            disabled={isSaving}
            class="px-4 py-2 bg-neutral-200 dark:bg-muted text-neutral-700 dark:text-muted-foreground rounded-lg hover:bg-neutral-300 dark:hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            Discard Changes
          </button>
          <button
            onclick={saveChanges}
            disabled={isSaving}
            class="px-6 py-2 bg-orange-600 text-foreground rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
          >
            {#if isSaving}
              <svg class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Saving...
            {:else}
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              Save Changes
            {/if}
          </button>
        </div>
      </div>
    </div>
  {/if}
</div>

<!-- Mint Browser Modal -->
{#if isBrowsingMints}
  <MintBrowser
    onSelectMints={handleBrowseMints}
    onClose={() => isBrowsingMints = false}
  />
{/if}
