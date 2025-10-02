<script lang="ts">
  import { ndk } from '$lib/ndk.svelte';
  import { router } from '$lib/router.svelte';
  import { followPacksStore } from '$lib/stores/followPacks.svelte';
  import { mockFollowPacks } from '$lib/data/mockFollowPacks';
  import { NDKKind, type NDKEvent } from '@nostr-dev-kit/ndk';
  import Avatar from '@nostr-dev-kit/ndk-svelte5/components/Avatar.svelte';

  let searchQuery = $state('');

  // Subscribe to follow packs from relays
  const subscription = ndk.subscribeReactive(
    [{ kinds: [39089, 39092] }],
    { bufferMs: 100 }
  );

  // Make subscription reactive
  let packEvents = $state<NDKEvent[]>([]);
  let eosed = $state(false);

  $effect(() => {
    const interval = setInterval(() => {
      packEvents = subscription.events;
      eosed = subscription.eosed;
    }, 100);
    return () => clearInterval(interval);
  });

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
    if (!searchQuery) return packs;
    const search = searchQuery.toLowerCase();
    return packs.filter(pack =>
      pack.title.toLowerCase().includes(search) ||
      (pack.description && pack.description.toLowerCase().includes(search))
    );
  });

  let subscribedPacks = $derived.by(() => {
    return packs.filter(pack => followPacksStore.isSubscribed(pack.id));
  });

  function handlePackClick(pack: Pack) {
    router.push(`/packs/${pack.encode()}`);
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
    <h1 class="text-3xl font-bold text-white mb-2 flex items-center gap-3">
      <svg class="w-8 h-8 text-[#ff6b35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
      Follow Packs
    </h1>
    <p class="text-neutral-400">
      Discover curated lists of accounts to follow
    </p>
  </div>

  <!-- Search -->
  <div class="mb-6">
    <div class="relative">
      <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        type="search"
        placeholder="Search follow packs..."
        bind:value={searchQuery}
        class="w-full pl-10 pr-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#ff6b35]"
      />
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
                <h3 class="font-semibold text-white group-hover:text-[#ff6b35] transition-colors">
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
                    <div class="relative" style="z-index: {4 - index}">
                      <Avatar {ndk} {pubkey} class="w-8 h-8 rounded-full ring-2 ring-neutral-900" />
                    </div>
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
                <h3 class="font-semibold text-white group-hover:text-[#ff6b35] transition-colors">
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
                    <div class="relative" style="z-index: {4 - index}">
                      <Avatar {ndk} {pubkey} class="w-8 h-8 rounded-full ring-2 ring-neutral-900" />
                    </div>
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
                  class="px-3 py-1.5 text-sm font-medium border rounded-lg transition-colors {followPacksStore.isSubscribed(pack.id) ? 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-700' : 'bg-[#ff6b35] border-[#ff6b35] text-white hover:bg-[#ff5722]'}"
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
</div>
