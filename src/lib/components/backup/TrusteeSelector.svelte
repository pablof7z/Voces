<script lang="ts">
  import type { Trustee } from '$lib/backup/types';
  import { ndk } from '$lib/ndk.svelte';

  interface Props {
    trustees: Trustee[];
    maxTrustees: number;
    onTrusteesChange: (trustees: Trustee[]) => void;
  }

  let { trustees, maxTrustees, onTrusteesChange }: Props = $props();

  let searchValue = $state('');

  let followsList = $derived(Array.from(ndk.$sessions.follows));

  let filteredFollows = $derived(
    followsList.filter(pubkey => !trustees.some(t => t.pubkey === pubkey))
  );

  function handleAddTrustee(pubkey: string) {
    if (trustees.length >= maxTrustees) return;
    if (trustees.some(t => t.pubkey === pubkey)) return;

    onTrusteesChange([...trustees, { pubkey, selected: true }]);
  }

  function handleRemoveTrustee(pubkey: string) {
    onTrusteesChange(trustees.filter(t => t.pubkey !== pubkey));
  }
</script>

<div class="space-y-4">
  <div>
    <label class="block text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-2">
      Select Trustees
    </label>
    <p class="text-xs text-neutral-600 dark:text-neutral-400 mb-3">
      Choose trusted contacts who will receive encrypted pieces of your key
    </p>
  </div>

  <!-- Selected trustees -->
  {#if trustees.length > 0}
    <div class="space-y-2">
      {#each trustees as trustee}
        <div class="flex items-center gap-3 p-3 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg">
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
              {trustee.pubkey.slice(0, 8)}...{trustee.pubkey.slice(-4)}
            </p>
          </div>
          <button
            onclick={() => handleRemoveTrustee(trustee.pubkey)}
            class="p-2 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <svg class="w-4 h-4 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      {/each}
    </div>
  {/if}

  <div class="flex items-center justify-between text-sm mb-2">
    <span class="text-neutral-600 dark:text-neutral-400">
      Selected {trustees.length} of {maxTrustees}
    </span>
  </div>

  <!-- Search follows -->
  {#if trustees.length < maxTrustees}
    <div>
      <input
        type="text"
        bind:value={searchValue}
        placeholder="Search your follows..."
        class="w-full px-3 py-2 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
      />
    </div>

    {#if filteredFollows.length === 0}
      <div class="text-center py-8 text-neutral-500 dark:text-neutral-400 text-sm border border-neutral-200 dark:border-neutral-800 rounded-lg">
        {#if followsList.length === 0}
          No follows found. Follow some people first.
        {:else}
          All follows have been selected
        {/if}
      </div>
    {:else}
      <div class="border border-neutral-200 dark:border-neutral-800 rounded-lg max-h-64 overflow-y-auto">
        {#each filteredFollows.slice(0, 10) as pubkey}
          <button
            onclick={() => handleAddTrustee(pubkey)}
            class="w-full flex items-center gap-3 p-3 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors border-b border-neutral-200 dark:border-neutral-800 last:border-b-0"
          >
            <div class="flex-1 min-w-0 text-left">
              <p class="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
                {pubkey.slice(0, 8)}...{pubkey.slice(-4)}
              </p>
            </div>
          </button>
        {/each}
      </div>
    {/if}
  {/if}
</div>
