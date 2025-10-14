<script lang="ts">
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import { ndk } from '$lib/ndk.svelte';
  import * as Dialog from '$lib/components/ui/dialog';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { nip19 } from 'nostr-tools';

  interface Props {
    eventId: string;
    relayHint?: string;
    show: boolean;
    onEventFound?: (event: NDKEvent) => void;
  }

  let { eventId, relayHint, show = $bindable(), onEventFound }: Props = $props();

  let customRelayUrl = $state('');
  let relaysToTry = $state<string[]>(relayHint ? [relayHint] : []);
  let isFetching = $state(false);
  let fetchError = $state('');
  let fetchSuccess = $state(false);

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

  function addRelay() {
    const url = customRelayUrl.trim();
    if (!url) return;

    // Basic validation
    if (!url.startsWith('wss://') && !url.startsWith('ws://')) {
      fetchError = 'Relay URL must start with wss:// or ws://';
      return;
    }

    if (relaysToTry.includes(url)) {
      fetchError = 'This relay is already in the list';
      return;
    }

    relaysToTry = [...relaysToTry, url];
    customRelayUrl = '';
    fetchError = '';
  }

  function removeRelay(url: string) {
    relaysToTry = relaysToTry.filter(r => r !== url);
  }

  async function tryFetchEvent() {
    if (relaysToTry.length === 0) {
      fetchError = 'Please add at least one relay URL';
      return;
    }

    isFetching = true;
    fetchError = '';
    fetchSuccess = false;

    try {
      // Create a relay set from the relay URLs
      const relaySet = await import('@nostr-dev-kit/ndk').then(({ NDKRelaySet }) =>
        NDKRelaySet.fromRelayUrls(relaysToTry, ndk)
      );

      // Try to fetch the event from the specified relays
      const event = await ndk.fetchEvent(
        { ids: [eventId] },
        { closeOnEose: true },
        relaySet
      );

      if (event) {
        fetchSuccess = true;
        onEventFound?.(event);
        setTimeout(() => {
          show = false;
        }, 1000);
      } else {
        fetchError = 'Event not found on the specified relays';
      }
    } catch (error) {
      console.error('Error fetching event:', error);
      fetchError = error instanceof Error ? error.message : 'Failed to fetch event';
    } finally {
      isFetching = false;
    }
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      addRelay();
    }
  }
</script>

<Dialog.Root bind:open={show}>
  <Dialog.Content class="max-w-2xl" onClose={() => show = false}>
    <Dialog.Header>
      <Dialog.Title>Missing Event Explorer</Dialog.Title>
      <Dialog.Description>
        This event couldn't be found on the default relays. Try adding relay URLs where it might be stored.
      </Dialog.Description>
    </Dialog.Header>

    <div class="space-y-4">
      <!-- Event ID Display -->
      <div class="p-3 bg-muted/50 rounded-lg border border-border">
        <div class="text-xs text-muted-foreground mb-1 font-medium">Event ID (nevent)</div>
        <div class="font-mono text-xs break-all text-foreground">
          {neventId}
        </div>
      </div>

      <!-- Add Relay Input -->
      <div class="space-y-2">
        <label class="text-sm font-medium text-foreground">
          Add Relay URL
        </label>
        <div class="flex gap-2">
          <Input
            type="text"
            bind:value={customRelayUrl}
            placeholder="wss://relay.example.com"
            disabled={isFetching}
            onkeydown={handleKeyDown}
            class="flex-1"
          />
          <Button
            type="button"
            onclick={addRelay}
            disabled={isFetching || !customRelayUrl.trim()}
            variant="outline"
          >
            Add
          </Button>
        </div>
        <p class="text-xs text-muted-foreground">
          Enter relay URLs where this event might be stored (e.g., wss://relay.damus.io)
        </p>
      </div>

      <!-- Relays List -->
      {#if relaysToTry.length > 0}
        <div class="space-y-2">
          <div class="text-sm font-medium text-foreground">
            Relays to search ({relaysToTry.length})
          </div>
          <div class="max-h-40 overflow-y-auto space-y-1">
            {#each relaysToTry as relay}
              <div class="flex items-center justify-between p-2 bg-muted/30 rounded border border-border text-sm">
                <span class="font-mono text-xs truncate flex-1 mr-2">{relay}</span>
                <button
                  type="button"
                  onclick={() => removeRelay(relay)}
                  disabled={isFetching}
                  class="text-muted-foreground hover:text-destructive transition-colors p-1"
                  aria-label="Remove relay"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            {/each}
          </div>
        </div>
      {/if}

      <!-- Error Message -->
      {#if fetchError}
        <div class="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm flex gap-2">
          <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{fetchError}</span>
        </div>
      {/if}

      <!-- Success Message -->
      {#if fetchSuccess}
        <div class="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-600 dark:text-green-400 text-sm flex gap-2">
          <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Event found! Loading...</span>
        </div>
      {/if}
    </div>

    <Dialog.Footer>
      <Button
        type="button"
        variant="outline"
        onclick={() => show = false}
        disabled={isFetching}
      >
        Cancel
      </Button>
      <Button
        type="button"
        onclick={tryFetchEvent}
        disabled={isFetching || relaysToTry.length === 0 || fetchSuccess}
      >
        {#if isFetching}
          <svg class="w-4 h-4 animate-spin mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Searching...
        {:else}
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Search for Event
        {/if}
      </Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
