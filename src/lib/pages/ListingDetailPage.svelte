<script lang="ts">
  import { ndk } from '$lib/ndk.svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import type { NDKEvent } from '@nostr-dev-kit/ndk';

  interface Props {
    listing: NDKEvent | null;
    loading: boolean;
  }

  const { listing, loading }: Props = $props();

  const timeAgo = $derived.by(() => {
    if (!listing?.created_at) return 'recently';
    const now = Date.now();
    const eventTime = listing.created_at * 1000;
    const diff = now - eventTime;

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'just now';
  });

  function getListingPrice(event: NDKEvent | null): { amount: string; currency: string; frequency?: string } | null {
    if (!event) return null;
    const priceTag = event.tags.find(t => t[0] === 'price');
    if (!priceTag || !priceTag[1] || !priceTag[2]) return null;
    return {
      amount: priceTag[1],
      currency: priceTag[2],
      frequency: priceTag[3]
    };
  }
</script>

<button
  onclick={() => goto('/marketplace')}
  class="flex items-center gap-2 px-4 py-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
>
  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
  </svg>
  Back to Marketplace
</button>

{#if loading}
  <div class="flex items-center justify-center py-12">
    <div class="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
  </div>
{:else if !listing}
  <div class="text-center py-12">
    <p class="text-muted-foreground">Listing not found</p>
  </div>
{:else}
  {@const price = getListingPrice(listing)}
  {@const categories = listing.tags.filter(t => t[0] === 't').map(t => t[1])}

  {#if listing.tagValue('image')}
    <div class="mb-6">
      <img
        src={listing.tagValue('image')}
        alt={listing.tagValue('title') || 'Listing'}
        class="w-full rounded-lg object-cover aspect-video"
      />
    </div>
  {/if}

  <div class="mb-6">
    <div class="flex items-start justify-between mb-4">
      <h1 class="text-2xl font-bold text-foreground">
        {listing.tagValue('title') || 'Untitled'}
      </h1>
      {#if price}
        <div class="text-lg px-4 py-2 bg-primary/20 text-primary rounded-lg font-semibold">
          {price.amount} {price.currency}
          {#if price.frequency && price.frequency !== 'once'}
            <span class="text-sm">/{price.frequency}</span>
          {/if}
        </div>
      {/if}
    </div>

    {#if listing.tagValue('status') === 'sold'}
      <div class="mb-4 p-4 bg-red-900/20 text-red-400 rounded-lg text-center font-semibold">
        This item has been sold
      </div>
    {/if}

    <div class="flex flex-wrap gap-4 text-sm text-muted-foreground mb-6">
      {#if listing.tagValue('location')}
        <div class="flex items-center gap-1">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>{listing.tagValue('location')}</span>
        </div>
      {/if}
      <div class="flex items-center gap-1">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>Posted {timeAgo}</span>
      </div>
    </div>

    {#if categories.length > 0}
      <div class="flex flex-wrap gap-2 mb-6">
        {#each categories as category}
          <span class="inline-flex items-center gap-1 px-3 py-1 bg-orange-900/20 text-primary rounded-full text-sm">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            {category}
          </span>
        {/each}
      </div>
    {/if}

    <div class="prose prose-invert max-w-none">
      <h3 class="text-lg font-semibold mb-2 text-foreground">Description</h3>
      <div class="whitespace-pre-wrap text-muted-foreground">{listing.content}</div>
    </div>
  </div>
{/if}
