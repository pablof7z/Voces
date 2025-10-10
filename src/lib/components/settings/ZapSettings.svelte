<script lang="ts">
  import { settings } from '$lib/stores/settings.svelte';

  const amounts = [10, 21, 50, 100, 500, 1000, 2100, 5000];
  let customAmount = $state('');
  let isEditingCustom = $state(false);

  function formatAmount(amount: number): string {
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(amount % 1000 === 0 ? 0 : 1)}K`;
    }
    return amount.toString();
  }

  function handleCustomAmount() {
    const parsed = Number.parseInt(customAmount);
    if (!Number.isNaN(parsed) && parsed > 0) {
      settings.updateZap({ defaultAmount: parsed });
      customAmount = '';
      isEditingCustom = false;
    }
  }

  function handleCustomKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      handleCustomAmount();
    } else if (e.key === 'Escape') {
      customAmount = '';
      isEditingCustom = false;
    }
  }
</script>

<div class="space-y-6">
  <div>
    <h3 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
      Default Zap Amount
    </h3>
    <p class="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
      Choose the default amount for quick zaps. Long-press the zap button to choose a custom amount.
    </p>

    <div class="grid grid-cols-4 gap-3">
      {#each amounts as amount}
        <button
          onclick={() => settings.updateZap({ defaultAmount: amount })}
          class="relative overflow-hidden rounded-xl p-4 transition-all duration-200 {settings.zap.defaultAmount === amount
            ? 'bg-gradient-to-br from-purple-600 to-pink-600 dark:from-purple-600 dark:to-pink-600 text-white shadow-lg shadow-purple-600/30 dark:shadow-purple-600/50 scale-105'
            : 'bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-900 dark:text-neutral-100 hover:scale-105'}"
          type="button"
        >
          <div class="flex flex-col items-center gap-2">
            <span class="text-xl">⚡</span>
            <span class="text-sm font-bold">{formatAmount(amount)}</span>
          </div>
        </button>
      {/each}
    </div>

    <!-- Custom Amount -->
    <div class="mt-4">
      {#if isEditingCustom}
        <div class="flex gap-2">
          <input
            type="number"
            bind:value={customAmount}
            onkeydown={handleCustomKeydown}
            placeholder="Enter custom amount..."
            class="flex-1 px-4 py-3 bg-neutral-100 dark:bg-neutral-800 border-2 border-purple-600 dark:border-purple-500 rounded-xl text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400 focus:outline-none font-semibold"
            autofocus
          />
          <button
            onclick={handleCustomAmount}
            class="px-6 py-3 bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold rounded-xl transition-all"
            type="button"
          >
            Set
          </button>
          <button
            onclick={() => { customAmount = ''; isEditingCustom = false; }}
            class="px-6 py-3 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-900 dark:text-neutral-100 font-semibold rounded-xl transition-all"
            type="button"
          >
            Cancel
          </button>
        </div>
      {:else}
        <button
          onclick={() => isEditingCustom = true}
          class="w-full px-4 py-3 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 border-2 border-dashed border-neutral-300 dark:border-neutral-600 rounded-xl text-neutral-700 dark:text-neutral-300 font-semibold transition-all flex items-center justify-center gap-2"
          type="button"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Custom Amount
        </button>
      {/if}
    </div>
  </div>

  <div class="p-4 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl">
    <div class="flex items-start gap-3">
      <div class="mt-0.5">
        <svg class="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <div class="flex-1">
        <h4 class="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
          How to Zap
        </h4>
        <ul class="text-sm text-neutral-600 dark:text-neutral-400 space-y-1">
          <li><strong>Tap:</strong> Send default zap amount ({settings.zap.defaultAmount} sats)</li>
          <li><strong>Long-press:</strong> Choose custom amount from modal</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800/30 rounded-xl">
    <div class="flex items-center gap-2 mb-2">
      <span class="text-2xl">⚡</span>
      <h4 class="text-sm font-semibold text-purple-900 dark:text-purple-100">
        Current Default
      </h4>
    </div>
    <p class="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
      {settings.zap.defaultAmount.toLocaleString()} sats
    </p>
  </div>
</div>
