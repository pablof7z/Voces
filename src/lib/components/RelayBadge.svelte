<script lang="ts">
  import { ndk } from '$lib/ndk.svelte';
  import type { NDKRelay } from '@nostr-dev-kit/ndk';

  interface Props {
    relay: NDKRelay;
    variant?: 'default' | 'compact';
  }

  const { relay, variant = 'default' }: Props = $props();

  const relayInfo = $derived(relay.connectivity.nip11);
  const relayName = $derived(relayInfo?.name || new URL(relay.url).hostname);
  const relayIcon = $derived(relayInfo?.icon);
  const relayDescription = $derived(relayInfo?.description);
</script>

{#if variant === 'compact'}
  <div class="flex items-center gap-1.5 px-2 py-1 bg-muted/50 rounded text-xs text-muted-foreground group relative">
    {#if relayIcon}
      <img src={relayIcon} alt={relayName} class="w-3 h-3 rounded" />
    {:else}
      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
      </svg>
    {/if}
    <span class="truncate max-w-[120px]">{relayName}</span>

    {#if relayDescription}
      <div class="invisible group-hover:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-card border border-border rounded-lg shadow-xl z-50 w-64 text-xs">
        <div class="font-semibold text-foreground mb-1">{relayName}</div>
        <div class="text-muted-foreground">{relayDescription}</div>
        <div class="text-muted-foreground mt-1 break-all">{relay.url}</div>
      </div>
    {/if}
  </div>
{:else}
  <div class="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg text-sm text-muted-foreground hover:bg-muted transition-colors">
    {#if relayIcon}
      <img src={relayIcon} alt={relayName} class="w-5 h-5 rounded flex-shrink-0" />
    {:else}
      <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
      </svg>
    {/if}
    <div class="flex-1 min-w-0">
      <div class="font-medium text-foreground truncate">{relayName}</div>
      {#if relayDescription}
        <div class="text-xs text-muted-foreground truncate">{relayDescription}</div>
      {/if}
    </div>
  </div>
{/if}
