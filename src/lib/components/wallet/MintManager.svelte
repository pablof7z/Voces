<script lang="ts">
  import { ndk } from '$lib/ndk.svelte';

  const mints = $derived(ndk.$wallet.mints);
  const mintBalances = $derived(ndk.$wallet.getMintBalances());

  let newMintUrl = $state('');
  let isAdding = $state(false);
  let error = $state<string | null>(null);

  async function addMint() {
    if (!newMintUrl.trim()) {
      error = 'Please enter a mint URL';
      return;
    }

    if (!newMintUrl.startsWith('http://') && !newMintUrl.startsWith('https://')) {
      error = 'Mint URL must start with http:// or https://';
      return;
    }

    try {
      const wallet = ndk.$wallet.wallet;
      if (!wallet) {
        error = 'Wallet not initialized';
        return;
      }

      wallet.mints = [...wallet.mints, newMintUrl.trim()];
      await wallet.publish();

      newMintUrl = '';
      error = null;
      isAdding = false;
    } catch (e) {
      error = e instanceof Error ? e.message : String(e);
    }
  }

  async function removeMint(mint: string) {
    if (confirm(`Remove mint: ${mint}?`)) {
      try {
        const wallet = ndk.$wallet.wallet;
        if (!wallet) {
          error = 'Wallet not initialized';
          return;
        }

        wallet.mints = wallet.mints.filter(m => m !== mint);
        await wallet.publish();
      } catch (e) {
        error = e instanceof Error ? e.message : String(e);
      }
    }
  }

  function formatSats(amount: number): string {
    return amount.toLocaleString();
  }

  function getMintName(mintUrl: string): string {
    try {
      const url = new URL(mintUrl);
      return url.hostname;
    } catch {
      return mintUrl;
    }
  }
</script>

<div class="bg-black border border-neutral-800 rounded-xl p-6">
  <div class="flex items-center justify-between mb-4">
    <h3 class="text-lg font-semibold text-white">Cashu Mints</h3>
    <button
      onclick={() => isAdding = !isAdding}
      class="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-lg transition-colors"
    >
      {isAdding ? 'Cancel' : 'Add Mint'}
    </button>
  </div>

  {#if isAdding}
    <div class="mb-4 p-4 bg-neutral-900 border border-neutral-700 rounded-lg">
      <label class="block text-sm font-medium text-neutral-300 mb-2">
        Mint URL
      </label>
      <input
        type="url"
        bind:value={newMintUrl}
        placeholder="https://mint.example.com"
        class="w-full px-4 py-2 bg-black border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-500 mb-3"
      />
      <button
        onclick={addMint}
        class="w-full py-2 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors"
      >
        Add Mint
      </button>
      {#if error}
        <div class="mt-2 p-2 bg-red-900/20 border border-red-800 rounded text-red-400 text-sm">
          {error}
        </div>
      {/if}
    </div>
  {/if}

  {#if mints.length === 0}
    <div class="text-center py-8 text-neutral-400">
      No mints configured
    </div>
  {:else}
    <div class="space-y-2">
      {#each mints as mint (mint)}
        <div class="flex items-center justify-between p-3 bg-neutral-900 border border-neutral-700 rounded-lg">
          <div class="flex-1 min-w-0">
            <div class="text-white font-medium truncate">{getMintName(mint)}</div>
            <div class="text-sm text-neutral-400 truncate">{mint}</div>
            {#if mintBalances.has(mint)}
              <div class="text-sm text-orange-500 mt-1">
                Balance: {formatSats(mintBalances.get(mint) || 0)} sats
              </div>
            {/if}
          </div>
          <button
            onclick={() => removeMint(mint)}
            class="ml-3 p-2 text-neutral-400 hover:text-red-500 transition-colors"
            aria-label="Remove mint"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      {/each}
    </div>
  {/if}
</div>
