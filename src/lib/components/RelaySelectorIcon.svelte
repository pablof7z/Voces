<script lang="ts">
  import { settings } from '$lib/stores/settings.svelte';
  import { useRelayInfoCached } from '$lib/utils/relayInfo.svelte';
  import { clickOutside } from '$lib/utils/clickOutside';
  import { isAgorasSelection, AGORAS_SELECTION } from '$lib/utils/relayUtils';
  import { ndk } from '$lib/ndk.svelte';
  import { followPacksStore } from '$lib/stores/followPacks.svelte';
  import type { NDKEvent } from '@nostr-dev-kit/ndk';

  let isOpen = $state(false);
  let enabledRelays = $derived(settings.relays.filter(r => r.enabled && r.read));

  // Get follows and check if user has any
  const follows = $derived(ndk.$sessions?.follows || []);
  const hasFollows = $derived(follows.size > 0);
  const isLoggedIn = $derived(!!ndk.$currentUser);
  const shouldShowFollowing = $derived(isLoggedIn && hasFollows);

  // Fetch favorite follow pack events
  let favoritePackEvents = $state<NDKEvent[]>([]);
  let userCreatedPackEvents = $state<NDKEvent[]>([]);

  $effect(() => {
    const favoriteIds = followPacksStore.favoritePacks;
    if (favoriteIds.length === 0) {
      favoritePackEvents = [];
      return;
    }

    // Fetch all favorite pack events
    Promise.all(
      favoriteIds.map(packId => ndk.fetchEvent(packId))
    ).then(events => {
      favoritePackEvents = events.filter((e): e is NDKEvent => e !== null);
    }).catch(err => {
      console.error('Failed to fetch favorite packs:', err);
      favoritePackEvents = [];
    });
  });

  // Fetch user's own created follow packs
  $effect(() => {
    const currentUser = ndk.$currentUser;
    if (!currentUser) {
      userCreatedPackEvents = [];
      return;
    }

    ndk.fetchEvents({
      kinds: [39089], // NDKKind.FollowPack
      authors: [currentUser.pubkey]
    }).then(events => {
      userCreatedPackEvents = Array.from(events);
    }).catch(err => {
      console.error('Failed to fetch user packs:', err);
      userCreatedPackEvents = [];
    });
  });

  // Combine and deduplicate all packs (favorites + user created)
  const allPacks = $derived.by(() => {
    const packMap = new Map<string, NDKEvent>();

    // Add user created packs first
    for (const pack of userCreatedPackEvents) {
      packMap.set(pack.id, pack);
    }

    // Add favorite packs (will override if same ID)
    for (const pack of favoritePackEvents) {
      packMap.set(pack.id, pack);
    }

    return Array.from(packMap.values());
  });

  const selectedRelayInfo = $derived.by(() => {
    if (!settings.selectedRelay || isAgorasSelection(settings.selectedRelay)) return null;
    if (isFollowPackSelection(settings.selectedRelay)) return null;
    return useRelayInfoCached(settings.selectedRelay);
  });

  // Helper to check if selection is a follow pack
  function isFollowPackSelection(value: string | null): boolean {
    return value?.startsWith('followpack:') ?? false;
  }

  // Get selected follow pack event
  const selectedFollowPack = $derived.by(() => {
    if (!settings.selectedRelay || !isFollowPackSelection(settings.selectedRelay)) return null;
    const packId = settings.selectedRelay.replace('followpack:', '');
    return allPacks.find(e => e.id === packId || e.encode() === packId);
  });

  function handleIconClick() {
    isOpen = !isOpen;
  }

  function selectRelay(url: string) {
    settings.setSelectedRelay(url);
    isOpen = false;
  }

  function selectAgoras() {
    settings.setSelectedRelay(AGORAS_SELECTION);
    isOpen = false;
  }

  function selectFollowing() {
    settings.setSelectedRelay(null);
    isOpen = false;
  }

  function selectFollowPack(packId: string) {
    settings.setSelectedRelay(`followpack:${packId}`);
    isOpen = false;
  }

  function handleClickOutside() {
    isOpen = false;
  }
</script>

<div class="relative" use:clickOutside={handleClickOutside}>
  <!-- Icon Button -->
  <button
    onclick={handleIconClick}
    class="flex items-center justify-center w-8 h-8 rounded-full hover:bg-muted/50 transition-colors"
    aria-label={settings.selectedRelay ? 'Change filter' : 'Change following filter'}
  >
    {#if isAgorasSelection(settings.selectedRelay)}
      <!-- Agora icon -->
      <img src="/logo-icon.svg" alt="Agoras" class="w-5 h-5" />
    {:else if isFollowPackSelection(settings.selectedRelay)}
      <!-- Follow Pack icon -->
      {#if selectedFollowPack?.tagValue('image')}
        <img src={selectedFollowPack.tagValue('image')} alt="" class="w-5 h-5 rounded" />
      {:else}
        <svg class="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      {/if}
    {:else if settings.selectedRelay}
      <!-- Relay icon -->
      {#if selectedRelayInfo?.info?.icon}
        <img src={selectedRelayInfo.info.icon} alt="" class="w-5 h-5 rounded" />
      {:else}
        <svg class="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
        </svg>
      {/if}
    {:else}
      <!-- Following icon -->
      <svg class="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    {/if}
  </button>

  <!-- Dropdown Menu -->
  {#if isOpen}
    <div class="absolute left-0 mt-1 w-64 bg-popover border border-border rounded-lg shadow-xl z-50 overflow-hidden">
      <!-- Agoras option -->
      <button
        onclick={selectAgoras}
        class="w-full px-4 py-3 hover:bg-muted transition-colors text-left flex items-center gap-3 {isAgorasSelection(settings.selectedRelay) ? 'bg-muted/50' : ''}"
      >
        <img src="/logo-icon.svg" alt="Agoras" class="w-5 h-5" />
        <div class="flex-1">
          <div class="font-medium text-foreground">Agoras</div>
          <div class="text-xs text-muted-foreground">Posts from both Agora communities</div>
        </div>
        {#if isAgorasSelection(settings.selectedRelay)}
          <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        {/if}
      </button>

      <!-- Following option (only show if user has follows) -->
      {#if shouldShowFollowing}
        <button
          onclick={selectFollowing}
          class="w-full px-4 py-3 hover:bg-muted transition-colors text-left flex items-center gap-3 {!settings.selectedRelay ? 'bg-muted/50' : ''}"
        >
          <svg class="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <div class="flex-1">
            <div class="font-medium text-foreground">Following</div>
            <div class="text-xs text-muted-foreground">All posts from people you follow</div>
          </div>
          {#if !settings.selectedRelay}
            <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          {/if}
        </button>
      {/if}

      <!-- Follow Packs -->
      {#if allPacks.length > 0}
        {#if shouldShowFollowing}
          <!-- Divider -->
          <div class="border-t border-border my-1"></div>
        {/if}

        <div class="px-2 py-1">
          <div class="text-xs text-muted-foreground px-2 py-1 font-medium">Follow Packs</div>
          {#each allPacks as pack (pack.id)}
            {@const packTitle = pack.tagValue('title') || 'Untitled Pack'}
            {@const packImage = pack.tagValue('image')}
            {@const packDescription = pack.tagValue('description')}
            {@const memberCount = pack.tags.filter(t => t[0] === 'p').length}
            {@const isSelected = isFollowPackSelection(settings.selectedRelay) && selectedFollowPack?.id === pack.id}
            <button
              onclick={() => selectFollowPack(pack.id)}
              class="w-full px-3 py-2.5 rounded-lg hover:bg-muted transition-colors text-left flex items-center gap-3 {isSelected ? 'bg-muted/50' : ''}"
            >
              {#if packImage}
                <img src={packImage} alt="" class="w-5 h-5 rounded flex-shrink-0" />
              {:else}
                <div class="w-5 h-5 rounded bg-muted flex items-center justify-center flex-shrink-0">
                  <svg class="w-3 h-3 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
              {/if}
              <div class="flex-1 min-w-0">
                <div class="text-sm font-medium text-foreground truncate">
                  {packTitle}
                </div>
                <div class="text-xs text-muted-foreground truncate">
                  {packDescription || `${memberCount} members`}
                </div>
              </div>
              {#if isSelected}
                <svg class="w-5 h-5 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              {/if}
            </button>
          {/each}
        </div>
      {/if}

      <!-- Divider -->
      <div class="border-t border-border my-1"></div>

      <!-- Relay options -->
      <div class="px-2 py-1">
        <div class="text-xs text-muted-foreground px-2 py-1 font-medium">Filter by Relay</div>
        {#each enabledRelays as relay (relay.url)}
          {@const relayInfo = useRelayInfoCached(relay.url)}
          <button
            onclick={() => selectRelay(relay.url)}
            class="w-full px-3 py-2.5 rounded-lg hover:bg-muted transition-colors text-left flex items-center gap-3 {settings.selectedRelay === relay.url ? 'bg-muted/50' : ''}"
          >
            {#if relayInfo.info?.icon}
              <img src={relayInfo.info.icon} alt="" class="w-5 h-5 rounded flex-shrink-0" />
            {:else}
              <div class="w-5 h-5 rounded bg-muted flex items-center justify-center flex-shrink-0">
                <svg class="w-3 h-3 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                </svg>
              </div>
            {/if}
            <div class="flex-1 min-w-0">
              <div class="text-sm font-medium text-foreground truncate">
                {relayInfo.info?.name || relay.url.replace('wss://', '').replace('ws://', '')}
              </div>
              {#if relayInfo.info?.description}
                <div class="text-xs text-muted-foreground truncate">
                  {relayInfo.info.description}
                </div>
              {/if}
            </div>
            {#if settings.selectedRelay === relay.url}
              <svg class="w-5 h-5 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            {/if}
          </button>
        {/each}
      </div>

      <!-- Manage relays link -->
      <div class="border-t border-border mt-1">
        <a
          href="/settings"
          class="block w-full px-4 py-2.5 text-sm text-center text-primary hover:bg-muted transition-colors"
          onclick={() => isOpen = false}
        >
          Manage Relays →
        </a>
      </div>
    </div>
  {/if}
</div>
