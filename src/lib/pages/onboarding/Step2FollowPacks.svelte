<script lang="ts">
  import { ndk } from '$lib/ndk.svelte';
  import { NDKFollowPack, NDKSubscriptionCacheUsage, type NDKFilter } from '@nostr-dev-kit/ndk';
  import { COMMUNITY_RELAYS, FOLLOW_PACK_KIND, COMMUNITY_METADATA } from '$lib/config/followPacks';

  interface Props {
    selectedCommunity: string | null;
    selectedPacks: string[];
    onSelectPacks: (packs: string[]) => void;
    onNext: () => void;
  }

  let { selectedCommunity, selectedPacks, onSelectPacks, onNext }: Props = $props();

  let followPacks = $state<NDKFollowPack[]>([]);
  let loading = $state(true);

  $effect(() => {
    const communityKey = selectedCommunity || 'venezuela';
    const relayUrls = COMMUNITY_RELAYS[communityKey];

    if (!relayUrls || relayUrls.length === 0) {
      console.warn(`No relay configured for community: ${communityKey}`);
      loading = false;
      return;
    }

    loading = true;
    const packs: NDKFollowPack[] = [];

    const filter: NDKFilter = {
      kinds: [FOLLOW_PACK_KIND]
    };

    const sub = ndk.subscribe(
      filter,
      {
        closeOnEose: true,
        cacheUsage: NDKSubscriptionCacheUsage.ONLY_RELAY
      },
      relayUrls
    );

    sub.on('event', (event) => {
      const pack = NDKFollowPack.from(event);
      packs.push(pack);
    });

    sub.on('eose', () => {
      followPacks = packs;
      loading = false;
    });

    return () => {
      sub.stop();
    };
  });

  const communityKey = selectedCommunity || 'venezuela';
  const communityInfo = COMMUNITY_METADATA[communityKey] || COMMUNITY_METADATA.venezuela;

  function handlePackClick(pack: NDKFollowPack) {
    const packId = pack.encode();
    if (selectedPacks.includes(packId)) {
      onSelectPacks(selectedPacks.filter(id => id !== packId));
    } else {
      onSelectPacks([...selectedPacks, packId]);
    }
  }

  function handleNext() {
    if (selectedPacks.length === 0) return;
    onNext();
  }
</script>

<div class="flex min-h-screen">
  <!-- Left Panel - Visual -->
  <div class="hidden lg:block w-1/2 relative">
    <img
      src="https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=1200&q=80"
      alt="Community leaders"
      class="absolute inset-0 w-full h-full object-cover"
    />
    <div class="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black/70" />
    <div class="absolute bottom-0 left-0 right-0 p-12">
      <div class="mb-8">
        <p class="text-3xl text-foreground/90 italic leading-relaxed">
          "We're not just surviving—we're building the future our community deserves. One voice at a time."
        </p>
      </div>
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-foreground font-semibold">
          MR
        </div>
        <div class="text-foreground">
          <div class="font-semibold">María Rodríguez</div>
          <div class="text-sm opacity-75">Community Organizer · Caracas</div>
        </div>
      </div>
    </div>
  </div>

  <!-- Right Panel - Follow Packs Grid -->
  <div class="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-12">
    <div class="max-w-xl w-full">
      <div class="mb-6 lg:mb-8">
        <h1 class="text-2xl lg:text-3xl font-bold mb-2 lg:mb-3">Build Your Network</h1>
        <p class="text-sm lg:text-base text-muted-foreground dark:text-muted-foreground">
          Follow curated packs from the {communityInfo.name} community
        </p>
      </div>

        {#if loading}
          <div class="text-center py-12">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p class="mt-4 text-sm text-muted-foreground dark:text-muted-foreground">Loading follow packs...</p>
          </div>
        {:else if followPacks.length === 0}
          <div class="text-center py-8 text-muted-foreground dark:text-muted-foreground">
            No follow packs available for this community yet
          </div>
        {:else}
          <div class="space-y-2 mb-6 lg:mb-8 max-h-[50vh] lg:max-h-[60vh] overflow-y-auto p-2 -m-2">
            {#each followPacks.slice(0, 6) as pack (pack.id)}
              {@const isSelected = selectedPacks.includes(pack.encode())}
              <button
                onclick={() => handlePackClick(pack)}
                class={`
                  relative w-full cursor-pointer rounded-xl transition-all text-left
                  flex gap-3 sm:gap-4 p-3 sm:p-4 bg-white dark:bg-background hover:bg-neutral-50 dark:hover:bg-card border border dark:border
                  ${isSelected ? 'ring-2 ring-orange-500 bg-orange-50 dark:bg-orange-950/20' : ''}
                `}
              >
                <!-- Image -->
                {#if pack.image}
                  <img
                    src={pack.image}
                    alt={pack.title}
                    class="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover flex-shrink-0"
                  />
                {:else}
                  <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center flex-shrink-0">
                    <span class="text-xl sm:text-2xl">📦</span>
                  </div>
                {/if}

                <!-- Content -->
                <div class="flex-1 min-w-0">
                  <h4 class="font-semibold text-sm sm:text-base text-neutral-900 dark:text-foreground truncate">
                    {pack.title}
                  </h4>
                  {#if pack.description}
                    <p class="text-xs sm:text-sm text-muted-foreground dark:text-muted-foreground line-clamp-1 sm:truncate">
                      {pack.description}
                    </p>
                  {/if}
                  <div class="flex items-center gap-2 sm:gap-3 mt-1 sm:mt-2">
                    <span class="text-[10px] sm:text-xs text-muted-foreground dark:text-muted-foreground">
                      {pack.pubkeys?.length || 0} members
                    </span>
                  </div>
                </div>

                <!-- Selection checkmark -->
                {#if isSelected}
                  <div class="absolute top-1/2 right-4 -translate-y-1/2 bg-primary text-foreground rounded-full p-1.5 z-10">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                  </div>
                {/if}
              </button>
            {/each}
          </div>
        {/if}

      <button
        onclick={handleNext}
        disabled={selectedPacks.length === 0 || loading}
        class={`
          w-full py-3 lg:py-4 px-6 rounded-lg font-medium transition-all text-sm lg:text-base
          ${selectedPacks.length > 0 && !loading
            ? 'bg-background dark:bg-white text-foreground dark:text-black hover:bg-muted dark:hover:bg-neutral-200'
            : 'bg-neutral-100 dark:bg-background text-muted-foreground cursor-not-allowed'
          }
        `}
      >
        Continue →
      </button>
    </div>
  </div>
</div>
