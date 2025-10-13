<script lang="ts">
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import HighlightCard from './HighlightCard.svelte';

  interface Props {
    highlights: NDKEvent[];
    emptyMessage?: string;
  }

  const { highlights, emptyMessage = 'No highlights yet' }: Props = $props();
</script>

{#if highlights.length === 0}
  <div class="text-center py-8 text-muted-foreground">
    {emptyMessage}
  </div>
{:else}
  <div class="divide-y divide-neutral-800/50">
    {#each highlights as highlight (highlight.id)}
      <HighlightCard event={highlight} />
    {/each}
  </div>
{/if}
