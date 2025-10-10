<script lang="ts">
  import { ndk } from '$lib/ndk.svelte';
  import { goto } from '$app/navigation';
  import { toast } from '$lib/stores/toast.svelte';
  import { NDKEvent } from '@nostr-dev-kit/ndk';

  interface Props {
    listing: NDKEvent | null;
  }

  const { listing }: Props = $props();

  const profile = ndk.$fetchProfile(() => listing?.pubkey || '');
  const isOwner = $derived(ndk.$sessions.current?.pubkey === listing?.pubkey);

  function handleShare() {
    if (typeof navigator.clipboard !== 'undefined') {
      navigator.clipboard.writeText(window.location.href)
        .then(() => toast.success('Link copied to clipboard'))
        .catch(() => toast.error('Failed to copy link'));
    }
  }

  async function handleDelete() {
    if (!listing || !confirm('Are you sure you want to delete this listing?')) return;

    try {
      // Create a deletion event (kind 5)
      const deleteEvent = new NDKEvent(ndk);
      deleteEvent.kind = 5;
      deleteEvent.tags = [['e', listing.id]];
      await deleteEvent.publish();

      toast.success('Listing deleted');
      goto('/marketplace');
    } catch (error) {
      console.error('Failed to delete listing:', error);
      toast.error('Failed to delete listing');
    }
  }
</script>

<div class="p-4 bg-neutral-900 rounded-lg border border-neutral-800">
  {#if listing}
    <div class="flex items-center gap-3 mb-6">
      <div class="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-lg">
        {(profile?.displayName || profile?.name || listing.pubkey).slice(0, 2).toUpperCase()}
      </div>
      <div>
        <p class="text-sm text-neutral-400">Listed by</p>
        <p class="font-medium text-white truncate">{profile?.displayName || profile?.name || `${listing.pubkey.slice(0, 16)}...`}</p>
      </div>
    </div>

    <div class="space-y-3">
      {#if isOwner}
        <button
          onclick={handleDelete}
          class="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Delete Listing
        </button>
      {:else}
        <button
          class="w-full flex items-center justify-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          Contact Seller
        </button>
      {/if}

      <button
        onclick={handleShare}
        class="w-full flex items-center justify-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white font-medium rounded-lg transition-colors"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        Share Listing
      </button>
    </div>
  {/if}
</div>
