<script lang="ts">
  import { ndk } from '$lib/ndk.svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { toast } from '$lib/stores/toast.svelte';
  import { followPacksStore } from '$lib/stores/followPacks.svelte';
  import { mockFollowPacks } from '$lib/data/mockFollowPacks';
  import { NDKKind, type NDKEvent } from '@nostr-dev-kit/ndk';
  import { Avatar } from '@nostr-dev-kit/svelte';
  import NoteCard from '$lib/components/NoteCard.svelte';

  const packId = $derived($page.params.packId);

  type ActiveTab = 'feed' | 'members';
  let activeTab = $state<ActiveTab>('feed');
  let isFollowingAll = $state(false);

  let packEvent = $state<NDKEvent | null>(null);
  let isLoading = $state(true);

  // Fetch the specific pack event by its bech32 ID
  $effect(() => {
    if (packId) {
      isLoading = true;

      // Try to decode and fetch the event
      ndk.fetchEvent(packId).then(event => {
        if (event) {
          packEvent = event;
        }
        isLoading = false;
      }).catch(err => {
        console.error('Failed to fetch pack:', err);
        isLoading = false;
      });
    }
  });

  // Convert event to pack or use mock data
  let pack = $derived.by(() => {
    if (packEvent) {
      return {
        id: packEvent.id || '',
        title: packEvent.tagValue('title') || 'Untitled Pack',
        description: packEvent.tagValue('description'),
        image: packEvent.tagValue('image'),
        pubkeys: packEvent.tags.filter(t => t[0] === 'p').map(t => t[1]),
        encode: () => packEvent.encode(),
        kind: packEvent.kind || 39089,
        pubkey: packEvent.pubkey,
        created_at: packEvent.created_at || 0,
      };
    }

    // Fallback to mock data only if pack ID matches exactly
    if (packId && !isLoading) {
      return mockFollowPacks.find(p => p.encode() === packId);
    }

    return null;
  });

  let pubkeys = $derived(pack?.pubkeys || []);

  // Fetch profile for pack creator
  const packCreatorProfile = ndk.$fetchProfile(() => pack?.pubkey);

  let isFavorite = $derived(pack ? followPacksStore.isFavorite(pack.id) : false);

  // Subscribe to notes from pack members
  const feedSubscription = $derived.by(() => {
    if (activeTab === 'feed' && pubkeys.length > 0) {
      console.log(`[FollowPackDetail] Creating subscription for ${pubkeys.length} members`);
      return ndk.$subscribe(
        () => ({
          filters: [{ kinds: [NDKKind.Text], authors: pubkeys, limit: 50 }],
          bufferMs: 100,
        })
      );
    }
    return null;
  });

  const feedEvents = $derived(feedSubscription?.events || []);
  const feedEosed = $derived(feedSubscription?.eosed || false);

  function handleFavorite() {
    if (!pack) return;
    followPacksStore.toggleFavorite(pack.id);
  }

  async function handleFollowAll() {
    if (!pack || !ndk.activeUser || pubkeys.length === 0) {
      toast.error('Please login to follow users');
      return;
    }

    isFollowingAll = true;
    try {
      // This would actually follow all users in the pack
      console.log('Following all users:', pubkeys);
      toast.success(`Following ${pubkeys.length} users`);
      // TODO: Implement actual follow logic
    } catch (error) {
      console.error('Error following all users:', error);
      toast.error('Failed to follow users');
    } finally {
      isFollowingAll = false;
    }
  }

  function handleBack() {
    goto('/packs');
  }
</script>

<div class="max-w-4xl mx-auto px-4 py-8">
  <!-- Back button -->
  <button
    onclick={handleBack}
    class="inline-flex items-center gap-2 text-neutral-400 hover:text-white mb-6 transition-colors"
  >
    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
    Back to Follow Packs
  </button>

  {#if pack}
    <!-- Pack Header -->
    <div class="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden mb-6">
      {#if pack.image}
        <div class="h-48 w-full">
          <img
            src={pack.image}
            alt={pack.title}
            class="w-full h-full object-cover"
          />
        </div>
      {/if}

      <div class="p-6">
        <div class="flex items-start justify-between mb-4">
          <div>
            <h1 class="text-2xl font-bold text-white mb-2">
              {pack.title}
            </h1>
            <p class="text-neutral-400">
              {pack.description || 'A curated list of accounts to follow'}
            </p>
          </div>
          <div class="flex items-center gap-2">
            <button
              onclick={handleFollowAll}
              disabled={isFollowingAll}
              class="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-500/90 disabled:bg-neutral-700 text-white font-medium rounded-lg transition-colors"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              {isFollowingAll ? 'Following...' : 'Follow All'}
            </button>
            <button
              onclick={handleFavorite}
              class="p-2.5 rounded-lg transition-colors {isFavorite ? 'bg-red-500/10 text-red-500' : 'bg-neutral-800 text-neutral-400 hover:text-white'}"
            >
              <svg class="w-5 h-5 {isFavorite ? 'fill-current' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Stats -->
        <div class="flex items-center gap-6 mb-6 text-sm">
          <div class="flex items-center gap-2 text-neutral-400">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span>{pubkeys.length} members</span>
          </div>
          {#if pack.created_at}
            <div class="flex items-center gap-2 text-neutral-400">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Updated {new Date(pack.created_at * 1000).toLocaleDateString()}</span>
            </div>
          {/if}
        </div>

        <!-- Creator -->
        <div class="flex items-center gap-3">
          <button
            type="button"
            onclick={() => goto(`/p/${pack.pubkey}`)}
            class="flex-shrink-0"
          >
            <Avatar {ndk} pubkey={pack.pubkey} class="w-10 h-10 rounded-full cursor-pointer hover:opacity-80 transition-opacity" />
          </button>
          <div>
            <p class="text-sm text-neutral-500">Created by</p>
            <button
              onclick={() => goto(`/p/${pack.pubkey}`)}
              class="font-medium text-white hover:text-orange-500 transition-colors"
            >
              {packCreatorProfile?.name || 'Anonymous'}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="border-b border-neutral-800 mb-6">
      <div class="flex gap-6">
        <button
          onclick={() => activeTab = 'feed'}
          class="pb-3 px-1 font-medium transition-colors relative {activeTab === 'feed' ? 'text-white' : 'text-neutral-400 hover:text-neutral-200'}"
        >
          Feed
          {#if activeTab === 'feed'}
            <div class="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500"></div>
          {/if}
        </button>
        <button
          onclick={() => activeTab = 'members'}
          class="pb-3 px-1 font-medium transition-colors relative {activeTab === 'members' ? 'text-white' : 'text-neutral-400 hover:text-neutral-200'}"
        >
          Members ({pubkeys.length})
          {#if activeTab === 'members'}
            <div class="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500"></div>
          {/if}
        </button>
      </div>
    </div>

    <!-- Content -->
    {#if activeTab === 'feed'}
      <div class="divide-y divide-neutral-800/50 border-y border-neutral-800/50">
        {#if feedEvents.length === 0 && !feedEosed}
          <div class="p-8 text-center text-neutral-400">
            Loading notes from pack members...
          </div>
        {:else if feedEvents.length === 0}
          <div class="p-8 text-center text-neutral-400">
            No notes found from pack members
          </div>
        {:else}
          {#each feedEvents as event (event.id)}
            <NoteCard {event} />
          {/each}
        {/if}
      </div>
    {:else}
      <div class="grid gap-4 md:grid-cols-2">
        {#each pubkeys as pubkey (pubkey)}
          {@const memberProfile = ndk.$fetchProfile(() => pubkey)}
          <button
            onclick={() => goto(`/p/${pubkey}`)}
            class="flex items-center gap-3 p-4 bg-neutral-900 border border-neutral-800 rounded-lg hover:border-neutral-700 transition-colors text-left"
          >
            <Avatar {ndk} {pubkey} class="w-12 h-12 rounded-full" />
            <div class="flex-1 min-w-0">
              <p class="font-medium text-white truncate">
                {memberProfile?.name || 'Anonymous'}
              </p>
              {#if memberProfile?.nip05}
                <p class="text-sm text-neutral-500 truncate">
                  {memberProfile?.nip05}
                </p>
              {/if}
              {#if memberProfile?.about}
                <p class="text-sm text-neutral-400 line-clamp-1 mt-1">
                  {memberProfile?.about}
                </p>
              {/if}
            </div>
          </button>
        {/each}
      </div>
    {/if}
  {:else if isLoading}
    <div class="text-center py-12">
      <div class="inline-block w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p class="text-neutral-400">Loading follow pack...</p>
    </div>
  {:else}
    <div class="text-center py-12">
      <p class="text-neutral-400">Follow pack not found</p>
      <button
        onclick={handleBack}
        class="text-orange-500 hover:text-orange-500/90 mt-4 inline-block transition-colors"
      >
        Browse all packs
      </button>
    </div>
  {/if}
</div>
