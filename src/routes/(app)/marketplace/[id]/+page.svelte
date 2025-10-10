<script lang="ts">
  import { ndk } from '$lib/ndk.svelte';
  import { page } from '$app/stores';
  import { sidebarStore } from '$lib/stores/sidebar.svelte';
  import ListingDetailPage from '$lib/pages/ListingDetailPage.svelte';
  import SellerSidebar from '$lib/components/marketplace/SellerSidebar.svelte';
  import type { NDKEvent } from '@nostr-dev-kit/ndk';

  const listingId = $derived($page.params.id);

  let listing = $state<NDKEvent | null>(null);
  let loading = $state(true);

  // Fetch the listing event
  $effect(() => {
    if (!listingId) return;

    loading = true;

    // Decode the naddr and fetch the event
    ndk.fetchEvent(listingId)
      .then(event => {
        listing = event;
        loading = false;
      })
      .catch(error => {
        console.error('Failed to fetch listing:', error);
        loading = false;
      });
  });

  // Set and clear sidebar
  $effect(() => {
    // Set the sidebar snippet
    sidebarStore.rightSidebar = sellerSidebarContent;

    // Clear on cleanup
    return () => {
      sidebarStore.clear();
    };
  });
</script>

{#snippet sellerSidebarContent()}
  <SellerSidebar {listing} />
{/snippet}

<ListingDetailPage {listing} {loading} />
