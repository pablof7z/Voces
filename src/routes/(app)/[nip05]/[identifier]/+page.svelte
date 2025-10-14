<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { ndk } from '$lib/ndk.svelte';
  import { NDKFollowPack, NDKKind, type NDKEvent, NDKClassified } from '@nostr-dev-kit/ndk';

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

    ndk.guardrailOff('fetch-events-usage').fetchEvent({
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

        const bech32 = fetchedEvent.encode();

        // Redirect based on event kind
        if (fetchedEvent.kind === NDKKind.Article) {
          goto(`/article/${bech32}`, { replaceState: true });
        } else if (NDKKind.Classified === fetchedEvent.kind) {
            goto(`/marketplace/${bech32}`, {
            replaceState: true,
          });
        } else if ([NDKFollowPack.kind].includes(fetchedEvent.kind || 0)) {
									goto(`/packs/${bech32}`, {
										replaceState: true,
									});
								} else {
                  goto(`/e/${bech32}`, {
																			replaceState: true,
																		});
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
