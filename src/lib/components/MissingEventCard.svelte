<script lang="ts">
  import { nip19 } from 'nostr-tools';
  import MissingEventModal from './MissingEventModal.svelte';
  import type { NDKEvent } from '@nostr-dev-kit/ndk';

  interface Props {
    eventId: string;
    relayHint?: string;
    showThreadLine?: boolean;
    onEventFound?: (event: NDKEvent) => void;
  }

  let { eventId, relayHint, showThreadLine = false, onEventFound }: Props = $props();

  let showModal = $state(false);

  const neventId = $derived.by(() => {
    try {
      return nip19.neventEncode({
        id: eventId,
        relays: relayHint ? [relayHint] : []
      });
    } catch {
      return eventId;
    }
  });
</script>

<article
  class="p-3 sm:p-4 bg-muted/10 border-b border-border relative min-w-0"
>
  {#if showThreadLine}
    <div class="absolute left-[29px] -top-px h-[73px] w-0.5 bg-muted"></div>
    <div class="absolute left-[29px] top-[73px] bottom-0 w-0.5 bg-muted"></div>
  {/if}

  <div class="p-4 border border-dashed border-muted-foreground/30 rounded-lg bg-muted/20">
    <div class="flex items-start gap-3">
      <!-- Icon -->
      <div class="flex-shrink-0 mt-0.5">
        <svg class="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>

      <!-- Content -->
      <div class="flex-1 min-w-0">
        <p class="text-sm font-medium text-foreground mb-1">
          Missing Parent Event
        </p>
        <p class="text-xs text-muted-foreground mb-2">
          This note is replying to an event that couldn't be found on the default relays.
        </p>
        {#if neventId}
          <p class="text-xs text-muted-foreground/70 font-mono truncate mb-3 bg-background/50 p-2 rounded">
            {neventId.slice(0, 40)}...
          </p>
        {/if}
        <button
          type="button"
          onclick={() => showModal = true}
          class="text-sm text-primary hover:text-primary/80 underline transition-colors flex items-center gap-1"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Try fetching from other relays
        </button>
      </div>
    </div>
  </div>
</article>

<!-- Missing Event Modal -->
{#if showModal}
  <MissingEventModal
    {eventId}
    {relayHint}
    bind:show={showModal}
    {onEventFound}
  />
{/if}
