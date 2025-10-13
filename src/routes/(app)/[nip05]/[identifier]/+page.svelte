<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { ndk } from '$lib/ndk.svelte';
  import { NDKKind, type NDKEvent } from '@nostr-dev-kit/ndk';
  import { nip19 } from 'nostr-tools';

  const nip05Identifier = $derived($page.params.nip05);
  const dTagIdentifier = $derived($page.params.identifier);

  let event = $state<NDKEvent | null>(null);
  let loading = $state(true);
  let error = $state<string | null>(null);

  // Resolve NIP-05 to pubkey
  const user = ndk.$fetchUser(() => nip05Identifier);
  const pubkey = $derived(user?.pubkey);

  // Fetch the event and redirect to appropriate route
  $effect(() => {
    if (!pubkey || !dTagIdentifier) {
      loading = false;
      error = 'Invalid user or identifier';
      return;
    }

    loading = true;
    error = null;

    ndk.fetchEvent({
      kinds: [NDKKind.Article, 30017, 30018, 30019, 30020, 39089, 39092], // Article, marketplace, and pack kinds
      authors: [pubkey],
      '#d': [dTagIdentifier]
    })
      .then(fetchedEvent => {
        if (!fetchedEvent) {
          error = 'Event not found';
          loading = false;
          return;
        }

        event = fetchedEvent;

        // Create naddr for the event
        const naddr = nip19.naddrEncode({
          kind: fetchedEvent.kind!,
          pubkey: fetchedEvent.pubkey,
          identifier: dTagIdentifier,
          relays: fetchedEvent.relay ? [fetchedEvent.relay.url] : []
        });

        // Redirect based on event kind
        if (fetchedEvent.kind === NDKKind.Article) {
          goto(`/article/${naddr}`, { replaceState: true });
        } else if ([30017, 30018, 30019, 30020].includes(fetchedEvent.kind || 0)) {
          goto(`/marketplace/${naddr}`, { replaceState: true });
        } else if ([39089, 39092].includes(fetchedEvent.kind || 0)) {
          goto(`/packs/${naddr}`, { replaceState: true });
        } else {
          error = `Unsupported event type (kind ${fetchedEvent.kind})`;
          loading = false;
        }
      })
      .catch(err => {
        console.error('Failed to fetch event:', err);
        error = 'Failed to load event';
        loading = false;
      });
  });

</script>

{#if loading}
  <div class="flex flex-col items-center justify-center min-h-screen bg-background">
    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    <p class="mt-4 text-muted-foreground">Redirecting...</p>
  </div>
{:else if error}
  <div class="flex flex-col items-center justify-center min-h-screen px-4 bg-background">
    <h1 class="text-2xl font-bold text-foreground mb-2">Content Not Found</h1>
    <p class="text-muted-foreground mb-4">{error}</p>
    <button
      type="button"
      onclick={() => goto('/')}
      class="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors text-sm font-medium"
    >
      Go Home
    </button>
  </div>
{/if}
