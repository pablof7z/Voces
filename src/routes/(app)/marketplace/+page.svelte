<script lang="ts">
  import { ndk } from '$lib/ndk.svelte';
  import { NDKKind, NDKEvent } from '@nostr-dev-kit/ndk';
  import type { NDKFilter } from '@nostr-dev-kit/ndk';
  import { goto } from '$app/navigation';
  import { createListingModal } from '$lib/stores/createListingModal.svelte';
  import CreateListingModal from '$lib/components/CreateListingModal.svelte';

  const CATEGORIES = [
    { value: '', label: 'All Categories' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'furniture', label: 'Furniture' },
    { value: 'clothing', label: 'Clothing' },
    { value: 'books', label: 'Books' },
    { value: 'services', label: 'Services' },
    { value: 'vehicles', label: 'Vehicles' },
    { value: 'real-estate', label: 'Real Estate' },
    { value: 'jobs', label: 'Jobs' },
    { value: 'free', label: 'Free' },
    { value: 'wanted', label: 'Wanted' }
  ];

  let selectedCategory = $state('');
  let searchQuery = $state('');

  // Subscribe to classifieds with reactive filters
  const subscription = ndk.$subscribe(() => {
    const filter: NDKFilter = {
      kinds: [30402 as NDKKind], // NDKKind.Classified
      limit: 50
    };

    if (selectedCategory) {
      filter['#t'] = [selectedCategory.toLowerCase()];
    }

    return {
      filters: [filter],
      bufferMs: 100,
    };
  });

  // Filter and process listings
  const listings = $derived.by(() => {
    return subscription.events
      .filter(event => {
        const status = event.tagValue('status') || 'active';
        if (status !== 'active') return false;

        if (!searchQuery) return true;

        const query = searchQuery.toLowerCase();
        const title = event.tagValue('title')?.toLowerCase() || '';
        const summary = event.tagValue('summary')?.toLowerCase() || '';
        const content = event.content?.toLowerCase() || '';
        const location = event.tagValue('location')?.toLowerCase() || '';

        return title.includes(query) ||
               summary.includes(query) ||
               content.includes(query) ||
               location.includes(query);
      });
  });

  // Group listings by category
  const listingsByCategory = $derived.by(() => {
    const grouped: Record<string, NDKEvent[]> = {};

    listings.forEach(listing => {
      const categories = listing.tags.filter(t => t[0] === 't').map(t => t[1]);
      if (categories.length > 0) {
        categories.forEach(category => {
          const key = category.toLowerCase();
          if (!grouped[key]) grouped[key] = [];
          grouped[key].push(listing);
        });
      } else {
        if (!grouped['uncategorized']) grouped['uncategorized'] = [];
        grouped['uncategorized'].push(listing);
      }
    });

    return grouped;
  });

  const isFilteredView = $derived(selectedCategory || searchQuery);

  function handleCategoryChange(category: string) {
    selectedCategory = category;
  }

  function getListingImage(listing: NDKEvent): string | undefined {
    return listing.tagValue('image');
  }

  function getListingPrice(listing: NDKEvent): { amount: string; currency: string } | null {
    const priceTag = listing.tags.find(t => t[0] === 'price');
    if (!priceTag || !priceTag[1] || !priceTag[2]) return null;
    return {
      amount: priceTag[1],
      currency: priceTag[2]
    };
  }
</script>

<div class="min-h-screen bg-neutral-50 dark:bg-background">
  <div class="container mx-auto px-4 py-4 max-w-7xl">
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent mb-4">
        Marketplace
      </h1>

      <!-- Search and Filter Bar -->
      <div class="flex gap-2 sm:gap-3">
        <div class="flex-1">
          <div class="relative">
            <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search listings..."
              bind:value={searchQuery}
              class="w-full pl-10 h-12 bg-white/80 dark:bg-background/80 backdrop-blur border border rounded-xl text-base focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
            />
          </div>
        </div>

        <!-- Category Filter -->
        <div class="relative">
          <select
            bind:value={selectedCategory}
            class="h-12 px-4 bg-white/80 dark:bg-background/80 backdrop-blur border border rounded-xl text-base focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all appearance-none pr-10"
          >
            {#each CATEGORIES as category}
              <option value={category.value}>{category.label}</option>
            {/each}
          </select>
          <svg class="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>

    <!-- Content -->
    {#if isFilteredView}
      <!-- Filtered view - show grid -->
      <div>
        {#if selectedCategory}
          <div class="mb-6">
            <h2 class="text-xl font-semibold text-foreground">
              {CATEGORIES.find(c => c.value === selectedCategory)?.label || selectedCategory}
            </h2>
            <p class="text-sm text-muted-foreground mt-1">
              {listings.length} listings found
            </p>
          </div>
        {/if}

        <!-- Listings Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {#each listings as listing (listing.id)}
            {@const price = getListingPrice(listing)}
            <button
              onclick={() => goto(`/marketplace/${listing.encode()}`)}
              class="bg-white dark:bg-card/50 rounded-xl border border overflow-hidden transition-all hover:border-primary-500 dark:hover:border-primary-500 hover:shadow-lg text-left"
            >
              {#if getListingImage(listing)}
                <div class="aspect-video bg-neutral-100 dark:bg-muted overflow-hidden">
                  <img
                    src={getListingImage(listing)}
                    alt={listing.tagValue('title') || 'Listing'}
                    class="w-full h-full object-cover"
                  />
                </div>
              {/if}
              <div class="p-4">
                <h3 class="font-semibold text-foreground truncate">
                  {listing.tagValue('title') || 'Untitled'}
                </h3>
                {#if listing.tagValue('summary')}
                  <p class="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {listing.tagValue('summary')}
                  </p>
                {/if}
                {#if price}
                  <p class="text-sm font-medium text-primary-600 dark:text-primary-400 mt-2">
                    {price.amount} {price.currency}
                  </p>
                {/if}
              </div>
            </button>
          {:else}
            <div class="col-span-full text-center py-12 text-muted-foreground">
              No listings found
            </div>
          {/each}
        </div>
      </div>
    {:else}
      <!-- Category sections view -->
      <div>
        {#if Object.keys(listingsByCategory).length === 0}
          <div class="text-center py-12 text-muted-foreground">
            No marketplace items yet
          </div>
        {:else}
          <!-- Recent listings -->
          {#if listings.length > 0}
            <div class="mb-8">
              <h2 class="text-xl font-semibold text-foreground mb-4">
                Recent Listings
              </h2>
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {#each listings.slice(0, 8) as listing (listing.id)}
                  {@const price = getListingPrice(listing)}
                  <button
                    onclick={() => goto(`/marketplace/${listing.encode()}`)}
                    class="bg-white dark:bg-card/50 rounded-xl border border overflow-hidden transition-all hover:border-primary-500 dark:hover:border-primary-500 hover:shadow-lg text-left"
                  >
                    {#if getListingImage(listing)}
                      <div class="aspect-video bg-neutral-100 dark:bg-muted overflow-hidden">
                        <img
                          src={getListingImage(listing)}
                          alt={listing.tagValue('title') || 'Listing'}
                          class="w-full h-full object-cover"
                        />
                      </div>
                    {/if}
                    <div class="p-4">
                      <h3 class="font-semibold text-foreground truncate">
                        {listing.tagValue('title') || 'Untitled'}
                      </h3>
                      {#if listing.tagValue('summary')}
                        <p class="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {listing.tagValue('summary')}
                        </p>
                      {/if}
                      {#if price}
                        <p class="text-sm font-medium text-primary-600 dark:text-primary-400 mt-2">
                          {price.amount} {price.currency}
                        </p>
                      {/if}
                    </div>
                  </button>
                {/each}
              </div>
            </div>
          {/if}

          <!-- Category sections -->
          {#each CATEGORIES.filter(c => c.value && listingsByCategory[c.value]?.length > 0) as category}
            <div class="mb-8">
              <div class="flex items-center justify-between mb-4">
                <h2 class="text-xl font-semibold text-foreground">
                  {category.label}
                </h2>
                <button
                  onclick={() => handleCategoryChange(category.value)}
                  class="text-sm text-primary-600 dark:text-primary-400 hover:underline"
                >
                  View All
                </button>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {#each listingsByCategory[category.value].slice(0, 4) as listing (listing.id)}
                  {@const price = getListingPrice(listing)}
                  <button
                    onclick={() => goto(`/marketplace/${listing.encode()}`)}
                    class="bg-white dark:bg-card/50 rounded-xl border border overflow-hidden transition-all hover:border-primary-500 dark:hover:border-primary-500 hover:shadow-lg text-left"
                  >
                    {#if getListingImage(listing)}
                      <div class="aspect-video bg-neutral-100 dark:bg-muted overflow-hidden">
                        <img
                          src={getListingImage(listing)}
                          alt={listing.tagValue('title') || 'Listing'}
                          class="w-full h-full object-cover"
                        />
                      </div>
                    {/if}
                    <div class="p-4">
                      <h3 class="font-semibold text-foreground truncate">
                        {listing.tagValue('title') || 'Untitled'}
                      </h3>
                      {#if listing.tagValue('summary')}
                        <p class="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {listing.tagValue('summary')}
                        </p>
                      {/if}
                      {#if price}
                        <p class="text-sm font-medium text-primary-600 dark:text-primary-400 mt-2">
                          {price.amount} {price.currency}
                        </p>
                      {/if}
                    </div>
                  </button>
                {/each}
              </div>
            </div>
          {/each}
        {/if}
      </div>
    {/if}
  </div>

  <CreateListingModal
    bind:open={createListingModal.show}
    onClose={() => {
      subscription.restart?.();
    }}
  />
</div>
