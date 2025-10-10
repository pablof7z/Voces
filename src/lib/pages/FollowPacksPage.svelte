<script lang="ts">
  import { ndk } from '$lib/ndk.svelte';
  import { goto } from '$app/navigation';
  import { followPacksStore } from '$lib/stores/followPacks.svelte';
  import { createPackModal } from '$lib/stores/createPackModal.svelte';
  import { mockFollowPacks } from '$lib/data/mockFollowPacks';
  import { NDKKind, type NDKEvent } from '@nostr-dev-kit/ndk';
  import { Avatar } from '@nostr-dev-kit/svelte';
  import CreateFollowPackDialog from '$lib/components/CreateFollowPackDialog.svelte';

  let searchQuery = $state('');

  type FilterType = 'all' | 'mine' | 'follows' | 'include-me';
  let activeFilter = $state<FilterType>('all');
  let isFilterDropdownOpen = $state(false);

  const filterLabels: Record<FilterType, string> = {
    all: 'All Packs',
    mine: 'My Packs',
    follows: 'From Follows',
    'include-me': 'Include Me'
  };

  function selectFilter(filter: FilterType) {
    activeFilter = filter;
    isFilterDropdownOpen = false;
  }

  function handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.filter-dropdown')) {
      isFilterDropdownOpen = false;
    }
  }

  $effect(() => {
    if (isFilterDropdownOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  });

  // Subscribe to follow packs from relays
  const subscription = ndk.$subscribe(
    () => ({
      filters: [{ kinds: [39089, 39092] }],
      bufferMs: 100,
    })
  );

  const packEvents = $derived(subscription.events);
  const eosed = $derived(subscription.eosed);

  // Convert events to pack objects
  interface Pack {
    id: string;
    title: string;
    description?: string;
    image?: string;
    pubkeys: string[];
    encode: () => string;
    kind: number;
    pubkey: string;
    created_at: number;
  }

  let packs = $derived.by(() => {
    const relayPacks: Pack[] = packEvents.map(event => ({
      id: event.id || '',
      title: event.tagValue('title') || 'Untitled Pack',
      description: event.tagValue('description'),
      image: event.tagValue('image'),
      pubkeys: event.tags.filter(t => t[0] === 'p').map(t => t[1]),
      encode: () => event.encode(),
      kind: event.kind || 39089,
      pubkey: event.pubkey,
      created_at: event.created_at || 0,
    }));

    // Use relay packs if available, otherwise mock data
    return relayPacks.length > 0 ? relayPacks : mockFollowPacks;
  });

  let filteredPacks = $derived.by(() => {
    let filtered = packs;

    // Apply filter type
    if (activeFilter !== 'all') {
      const currentUser = ndk.$currentUser;
      const userPubkey = currentUser?.pubkey;
      const userFollows = currentUser?.follows;

      if (activeFilter === 'mine' && userPubkey) {
        filtered = filtered.filter(pack => pack.pubkey === userPubkey);
      } else if (activeFilter === 'follows' && userFollows) {
        const followPubkeys = Array.from(userFollows).map(user => user.pubkey);
        filtered = filtered.filter(pack => followPubkeys.includes(pack.pubkey));
      } else if (activeFilter === 'include-me' && userPubkey) {
        filtered = filtered.filter(pack => pack.pubkeys.includes(userPubkey));
      }
    }

    // Apply search query
    if (searchQuery) {
      const search = searchQuery.toLowerCase();
      filtered = filtered.filter(pack =>
        pack.title.toLowerCase().includes(search) ||
        (pack.description && pack.description.toLowerCase().includes(search))
      );
    }

    return filtered;
  });

  let subscribedPacks = $derived.by(() => {
    return packs.filter(pack => followPacksStore.isSubscribed(pack.id));
  });

  function handlePackClick(pack: Pack) {
    goto(`/packs/${pack.encode()}`);
  }

  function handleSubscribe(e: MouseEvent, pack: Pack) {
    e.preventDefault();
    e.stopPropagation();

    if (followPacksStore.isSubscribed(pack.id)) {
      followPacksStore.unsubscribeFromPack(pack.id);
    } else {
      followPacksStore.subscribeToPack(pack.id);
    }
  }
</script>

<div class="max-w-6xl mx-auto px-4 py-8">
  <!-- Header -->
  <div class="mb-8">
    <div class="flex items-start justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <svg class="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          Follow Packs
        </h1>
        <p class="text-neutral-400">
          Discover curated lists of accounts to follow
        </p>
      </div>
      {#if ndk.$currentUser}
        <button
          onclick={() => createPackModal.open()}
          class="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors font-medium text-sm flex items-center gap-2 flex-shrink-0"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          New Follow Pack
        </button>
      {/if}
    </div>
  </div>

  <!-- Search and Filters -->
  <div class="mb-6">
    <div class="flex gap-3 flex-col sm:flex-row">
      <div class="relative flex-1">
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="search"
          placeholder="Search follow packs..."
          bind:value={searchQuery}
          class="w-full pl-10 pr-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:border-orange-500"
        />
      </div>

      <!-- Filter Dropdown -->
      {#if ndk.$currentUser}
        <div class="relative flex-shrink-0 filter-dropdown">
          <button
            onclick={() => isFilterDropdownOpen = !isFilterDropdownOpen}
            class="px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg text-white hover:border-neutral-700 transition-colors flex items-center gap-2 min-w-[160px] justify-between"
          >
            <div class="flex items-center gap-2">
              <svg class="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span class="text-sm font-medium">{filterLabels[activeFilter]}</span>
            </div>
            <svg class="w-4 h-4 text-neutral-400 transition-transform {isFilterDropdownOpen ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {#if isFilterDropdownOpen}
            <div class="absolute right-0 mt-2 w-48 bg-neutral-900 border border-neutral-800 rounded-lg shadow-xl z-10">
              <div class="py-1">
                <button
                  onclick={() => selectFilter('all')}
                  class="w-full px-4 py-2.5 text-left text-sm hover:bg-neutral-800 transition-colors {activeFilter === 'all' ? 'text-orange-500 font-medium' : 'text-neutral-300'}"
                >
                  All Packs
                </button>
                <button
                  onclick={() => selectFilter('mine')}
                  class="w-full px-4 py-2.5 text-left text-sm hover:bg-neutral-800 transition-colors {activeFilter === 'mine' ? 'text-orange-500 font-medium' : 'text-neutral-300'}"
                >
                  My Packs
                </button>
                <button
                  onclick={() => selectFilter('follows')}
                  class="w-full px-4 py-2.5 text-left text-sm hover:bg-neutral-800 transition-colors {activeFilter === 'follows' ? 'text-orange-500 font-medium' : 'text-neutral-300'}"
                >
                  From Follows
                </button>
                <button
                  onclick={() => selectFilter('include-me')}
                  class="w-full px-4 py-2.5 text-left text-sm hover:bg-neutral-800 transition-colors {activeFilter === 'include-me' ? 'text-orange-500 font-medium' : 'text-neutral-300'}"
                >
                  Include Me
                </button>
              </div>
            </div>
          {/if}
        </div>
      {/if}
    </div>
  </div>

  <!-- Your Subscribed Packs -->
  {#if subscribedPacks.length > 0}
    <div class="mb-8">
      <h2 class="text-xl font-semibold text-white mb-4">Your Packs</h2>
      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {#each subscribedPacks as pack (pack.id)}
          <div
            role="button"
            tabindex="0"
            onclick={() => handlePackClick(pack)}
            onkeydown={(e) => e.key === 'Enter' && handlePackClick(pack)}
            class="block bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden hover:border-neutral-700 transition-colors group cursor-pointer"
          >
            {#if pack.image}
              <div class="h-32 w-full">
                <img
                  src={pack.image}
                  alt={pack.title}
                  class="w-full h-full object-cover"
                />
              </div>
            {/if}

            <div class="p-5">
              <div class="mb-4">
                <h3 class="font-semibold text-white group-hover:text-orange-500 transition-colors">
                  {pack.title}
                </h3>
                <p class="text-sm text-neutral-500 mt-1">
                  {pack.pubkeys.length} members
                </p>
              </div>

              {#if pack.description}
                <p class="text-sm text-neutral-400 mb-4 line-clamp-2">
                  {pack.description}
                </p>
              {/if}

              <div class="flex items-center justify-between">
                <div class="flex -space-x-2">
                  {#each pack.pubkeys.slice(0, 4) as pubkey, index (pubkey)}
                    <button
                      type="button"
                      onclick={(e) => { e.stopPropagation(); goto(`/p/${pubkey}`); }}
                      class="relative cursor-pointer"
                      style="z-index: {4 - index}"
                    >
                      <Avatar {ndk} {pubkey} class="w-8 h-8 rounded-full ring-2 ring-neutral-900 hover:opacity-80 transition-opacity" />
                    </button>
                  {/each}
                  {#if pack.pubkeys.length > 4}
                    <div class="w-8 h-8 rounded-full bg-neutral-800 ring-2 ring-neutral-900 flex items-center justify-center">
                      <span class="text-xs text-neutral-400">
                        +{pack.pubkeys.length - 4}
                      </span>
                    </div>
                  {/if}
                </div>

                <button
                  onclick={(e) => handleSubscribe(e, pack)}
                  class="px-3 py-1.5 text-sm font-medium border rounded-lg transition-colors bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-700"
                >
                  Following
                </button>
              </div>
            </div>
          </div>
        {/each}
      </div>
    </div>
  {/if}

  <!-- All Packs Grid -->
  <div>
    <h2 class="text-xl font-semibold text-white mb-4">
      {subscribedPacks.length > 0 ? 'Discover More' : 'Popular Packs'}
    </h2>
    {#if filteredPacks.length > 0}
      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {#each filteredPacks as pack (pack.id)}
          <div
            role="button"
            tabindex="0"
            onclick={() => handlePackClick(pack)}
            onkeydown={(e) => e.key === 'Enter' && handlePackClick(pack)}
            class="block bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden hover:border-neutral-700 transition-colors group cursor-pointer"
          >
            {#if pack.image}
              <div class="h-32 w-full">
                <img
                  src={pack.image}
                  alt={pack.title}
                  class="w-full h-full object-cover"
                />
              </div>
            {/if}

            <div class="p-5">
              <div class="mb-4">
                <h3 class="font-semibold text-white group-hover:text-orange-500 transition-colors">
                  {pack.title}
                </h3>
                <p class="text-sm text-neutral-500 mt-1">
                  {pack.pubkeys.length} members
                </p>
              </div>

              {#if pack.description}
                <p class="text-sm text-neutral-400 mb-4 line-clamp-2">
                  {pack.description}
                </p>
              {/if}

              <div class="flex items-center justify-between">
                <div class="flex -space-x-2">
                  {#each pack.pubkeys.slice(0, 4) as pubkey, index (pubkey)}
                    <button
                      type="button"
                      onclick={(e) => { e.stopPropagation(); goto(`/p/${pubkey}`); }}
                      class="relative cursor-pointer"
                      style="z-index: {4 - index}"
                    >
                      <Avatar {ndk} {pubkey} class="w-8 h-8 rounded-full ring-2 ring-neutral-900 hover:opacity-80 transition-opacity" />
                    </button>
                  {/each}
                  {#if pack.pubkeys.length > 4}
                    <div class="w-8 h-8 rounded-full bg-neutral-800 ring-2 ring-neutral-900 flex items-center justify-center">
                      <span class="text-xs text-neutral-400">
                        +{pack.pubkeys.length - 4}
                      </span>
                    </div>
                  {/if}
                </div>

                <button
                  onclick={(e) => handleSubscribe(e, pack)}
                  class="px-3 py-1.5 text-sm font-medium border rounded-lg transition-colors {followPacksStore.isSubscribed(pack.id) ? 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-700' : 'bg-orange-500 border-orange-500 text-white hover:bg-orange-500/90'}"
                >
                  {followPacksStore.isSubscribed(pack.id) ? 'Following' : 'Follow'}
                </button>
              </div>
            </div>
          </div>
        {/each}
      </div>
    {:else}
      <div class="text-center py-12">
        <svg class="w-16 h-16 text-neutral-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
        <p class="text-neutral-400">
          No follow packs found
        </p>
      </div>
    {/if}
  </div>

  <CreateFollowPackDialog
    bind:open={createPackModal.show}
    onPublished={(packId) => {
      subscription.restart();
    }}
  />
</div>
