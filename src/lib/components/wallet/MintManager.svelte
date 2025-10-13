<script lang="ts">
  import { ndk } from '$lib/ndk.svelte';

  const wallet = $derived(ndk.$wallet);
  const mints = $derived(wallet.mints.map(m => typeof m === 'string' ? m : m.url));
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
      const walletInstance = (wallet as any)._wallet;
      if (!walletInstance) {
        error = 'Wallet not initialized';
        return;
      }

      walletInstance.mints = [...walletInstance.mints, newMintUrl.trim()];
      await walletInstance.publish();

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
        const walletInstance = (wallet as any)._wallet;
        if (!walletInstance) {
          error = 'Wallet not initialized';
          return;
        }

        walletInstance.mints = walletInstance.mints.filter((m: string) => m !== mint);
        await walletInstance.publish();
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

<div class="bg-background border border-border rounded-xl p-6">
  <div class="flex items-center justify-between mb-4">
    <h3 class="text-lg font-semibold text-foreground">Cashu Mints</h3>
    <button
      onclick={() => isAdding = !isAdding}
      class="px-3 py-1.5 bg-primary hover:bg-accent-dark text-foreground text-sm font-medium rounded-lg transition-colors"
    >
      {isAdding ? 'Cancel' : 'Add Mint'}
    </button>
  </div>

  {#if isAdding}
    <div class="mb-4 p-4 bg-card border border-border rounded-lg">
      <label class="block text-sm font-medium text-muted-foreground mb-2">
        Mint URL
      </label>
      <input
        type="url"
        bind:value={newMintUrl}
        placeholder="https://mint.example.com"
        class="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-500 mb-3"
      />
      <button
        onclick={addMint}
        class="w-full py-2 bg-primary hover:bg-accent-dark text-foreground font-medium rounded-lg transition-colors"
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
    <div class="text-center py-8 text-muted-foreground">
      No mints configured
    </div>
  {:else}
    <div class="space-y-2">
      {#each mints as mint (mint)}
        <div class="flex items-center justify-between p-3 bg-card border border-border rounded-lg">
          <div class="flex-1 min-w-0">
            <div class="text-foreground font-medium truncate">{getMintName(mint)}</div>
            <div class="text-sm text-muted-foreground truncate">{mint}</div>
            {#if mintBalances.has(mint)}
              <div class="text-sm text-primary mt-1">
                Balance: {formatSats(mintBalances.get(mint) || 0)} sats
              </div>
            {/if}
          </div>
          <button
            onclick={() => removeMint(mint)}
            class="ml-3 p-2 text-muted-foreground hover:text-red-500 transition-colors"
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
