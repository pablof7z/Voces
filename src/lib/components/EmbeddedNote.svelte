<script lang="ts">
  import type { NDKEvent, NDKSvelte } from '@nostr-dev-kit/ndk';
  import { NDKKind } from '@nostr-dev-kit/ndk';
  import NoteCard from './NoteCard.svelte';

  interface Props {
    ndk: NDKSvelte;
    bech32: string;
    onEventClick?: (bech32: string, event: NDKEvent) => void;
  }

  const { ndk, bech32, onEventClick }: Props = $props();

  let fetchedEvent = $state<NDKEvent | null>(null);
  let loading = $state(true);
  let error = $state<string | null>(null);

  $effect(() => {
    if (!bech32 || !ndk) return;

    loading = true;
    error = null;

    ndk.fetchEvent(bech32)
      .then((event) => {
        if (event) {
          fetchedEvent = event;
        } else {
          error = 'Event not found';
        }
        loading = false;
      })
      .catch((err) => {
        console.error('Failed to fetch event:', err);
        error = 'Failed to load event';
        loading = false;
      });
  });

  function handleNavigate() {
    if (onEventClick && fetchedEvent) {
      onEventClick(bech32, fetchedEvent);
    }
  }

  // Only render text notes (kind 1, 1111) with NoteCard
  // For other kinds, show a simple loading/error state for now
  const isTextNote = $derived(
    fetchedEvent && (fetchedEvent.kind === NDKKind.Text || fetchedEvent.kind === NDKKind.GenericReply)
  );
</script>

{#if loading}
  <div class="flex items-center gap-2 p-4 border border-border rounded-lg bg-card/50 my-2">
    <div class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-muted-foreground border-r-transparent"></div>
    <span class="text-sm text-muted-foreground">Loading event...</span>
  </div>
{:else if error}
  <div class="flex items-center gap-2 p-4 border border-red-200 dark:border-red-900 rounded-lg bg-red-50 dark:bg-red-950/30 my-2">
    <span class="text-red-600 dark:text-red-400">⚠️</span>
    <span class="text-sm text-red-600 dark:text-red-400">{error}</span>
  </div>
{:else if fetchedEvent}
  {#if isTextNote}
    <!-- Use NoteCard for text notes - it already has the compact mobile layout -->
    <div class="my-2 border border-border rounded-lg overflow-hidden bg-card">
      <NoteCard event={fetchedEvent} showActions={false} onNavigate={handleNavigate} />
    </div>
  {:else}
    <!-- For other event kinds, show a simple preview -->
    <div class="p-4 border border-border rounded-lg bg-card/50 my-2 cursor-pointer hover:bg-card/70 transition-colors" onclick={handleNavigate} role="button" tabindex="0">
      <div class="text-sm text-muted-foreground mb-1">Kind {fetchedEvent.kind} event</div>
      <div class="text-sm text-foreground line-clamp-3">{fetchedEvent.content.slice(0, 200)}{fetchedEvent.content.length > 200 ? '...' : ''}</div>
    </div>
  {/if}
{:else}
  <div class="flex items-center gap-2 p-4 border border-border rounded-lg bg-card/50 my-2">
    <span class="text-muted-foreground">❌</span>
    <span class="text-sm text-muted-foreground">No event to display</span>
  </div>
{/if}
