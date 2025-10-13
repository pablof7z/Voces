<script lang="ts">
  import { ndk } from '$lib/ndk.svelte';

  const nutzaps = $derived(ndk.$wallet.nutzaps);
  const pendingCount = $derived(nutzaps.pending.length);
  const redeemedCount = $derived(nutzaps.redeemed.length);
  const failedCount = $derived(nutzaps.failed.length);

  let showDetails = $state(false);

  function formatDate(timestamp: number): string {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  }
</script>

<div class="bg-background border border-border rounded-xl p-6">
  <div class="flex items-center justify-between mb-4">
    <h3 class="text-lg font-semibold text-foreground">Nutzap Monitor</h3>
    <button
      onclick={() => showDetails = !showDetails}
      class="text-sm text-primary hover:text-primary"
    >
      {showDetails ? 'Hide Details' : 'Show Details'}
    </button>
  </div>

  <div class="grid grid-cols-3 gap-3 mb-4">
    <div class="bg-card border border-border rounded-lg p-3 text-center">
      <div class="text-2xl font-bold text-yellow-500">{pendingCount}</div>
      <div class="text-xs text-muted-foreground mt-1">Pending</div>
    </div>
    <div class="bg-card border border-border rounded-lg p-3 text-center">
      <div class="text-2xl font-bold text-green-500">{redeemedCount}</div>
      <div class="text-xs text-muted-foreground mt-1">Redeemed</div>
    </div>
    <div class="bg-card border border-border rounded-lg p-3 text-center">
      <div class="text-2xl font-bold text-red-500">{failedCount}</div>
      <div class="text-xs text-muted-foreground mt-1">Failed</div>
    </div>
  </div>

  {#if showDetails}
    <div class="space-y-4">
      {#if pendingCount > 0}
        <div>
          <h4 class="text-sm font-semibold text-yellow-500 mb-2">Pending Nutzaps</h4>
          <div class="space-y-2">
            {#each nutzaps.pending as nutzap (nutzap.id)}
              <div class="p-2 bg-card border border-border rounded text-sm">
                <div class="text-foreground">{nutzap.id.slice(0, 16)}...</div>
                <div class="text-muted-foreground text-xs">{formatDate(nutzap.created_at || 0)}</div>
              </div>
            {/each}
          </div>
        </div>
      {/if}

      {#if redeemedCount > 0}
        <div>
          <h4 class="text-sm font-semibold text-green-500 mb-2">Redeemed Nutzaps</h4>
          <div class="space-y-2">
            {#each nutzaps.redeemed.slice(0, 5) as nutzap (nutzap.id)}
              <div class="p-2 bg-card border border-border rounded text-sm">
                <div class="text-foreground">{nutzap.id.slice(0, 16)}...</div>
                <div class="text-muted-foreground text-xs">{formatDate(nutzap.created_at || 0)}</div>
              </div>
            {/each}
          </div>
        </div>
      {/if}

      {#if failedCount > 0}
        <div>
          <h4 class="text-sm font-semibold text-red-500 mb-2">Failed Nutzaps</h4>
          <div class="space-y-2">
            {#each nutzaps.failed.slice(0, 5) as nutzap (nutzap.id)}
              <div class="p-2 bg-card border border-border rounded text-sm">
                <div class="text-foreground">{nutzap.id.slice(0, 16)}...</div>
                <div class="text-muted-foreground text-xs">{formatDate(nutzap.created_at || 0)}</div>
              </div>
            {/each}
          </div>
        </div>
      {/if}
    </div>
  {/if}

  {#if pendingCount === 0 && redeemedCount === 0 && failedCount === 0}
    <div class="text-center py-8 text-muted-foreground">
      No nutzaps yet
    </div>
  {/if}
</div>
