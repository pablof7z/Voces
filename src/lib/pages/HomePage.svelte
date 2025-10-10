<script lang="ts">
  import { ndk, hashtagInterests } from '$lib/ndk.svelte';
  import { settings } from '$lib/stores/settings.svelte';
  import { relayFilter } from '$lib/stores/relayFilter.svelte';
  import { hashtagFilter } from '$lib/stores/hashtagFilter.svelte';
  import { NDKKind, type NDKEvent, NDKArticle } from '@nostr-dev-kit/ndk';
  import NoteCard from '$lib/components/NoteCard.svelte';
  import ArticlePreviewCard from '$lib/components/ArticlePreviewCard.svelte';
  import MediaGrid from '$lib/components/MediaGrid.svelte';
  import LoadMoreTrigger from '$lib/components/LoadMoreTrigger.svelte';
  import { createLazyFeed } from '$lib/utils/lazyFeed.svelte';
  import { Avatar } from '@nostr-dev-kit/svelte';
  import Hashtag from '$lib/components/Hashtag.svelte';
  import { useRelayInfoCached } from '$lib/utils/relayInfo.svelte';

  type MediaFilter = 'conversations' | 'images' | 'videos' | 'articles';
  let selectedFilter = $state<MediaFilter>('conversations');

  // Get relays to use based on filter
  // If a specific relay is selected, use only that relay
  // Otherwise, use all enabled relays
  const relaysToUse = $derived(
    relayFilter.selectedRelay
      ? [relayFilter.selectedRelay]
      : settings.relays
          .filter(r => r.enabled && r.read)
          .map(r => r.url)
  );

  // Get follows for filtering when in "Following" mode
  const follows = $derived(ndk.$sessions?.follows||[]);
  const followsArray = $derived.by(() => Array.from(follows));

  console.log('[HomePage] Creating subscriptions');

  const notesFeed = createLazyFeed(ndk, () => {
    const filter: any = {
      kinds: [NDKKind.Text],
      limit: 200
    };

    // Add hashtag filters if any are selected
    if (hashtagFilter.hasFilters) {
      filter['#t'] = hashtagFilter.selectedHashtags;
    }

    // When no specific relay is selected (Following mode) AND no hashtag filters, filter by follows
    if (!relayFilter.selectedRelay && followsArray.length > 0 && !hashtagFilter.hasFilters) {
      filter.authors = followsArray;
    } else if (!relayFilter.selectedRelay && followsArray.length > 0 && hashtagFilter.hasFilters) {
      // When hashtag filters are active in Following mode, combine with authors
      filter.authors = followsArray;
    }

    console.log('Using filter:', filter);
    return {
      filters: [filter],
      relayUrls: relaysToUse.length > 0 ? relaysToUse : undefined
    };
  }, {
    initialLimit: 20,
    pageSize: 20
  });
  console.log('[HomePage] Notes subscription created');

  const mediaFeed = createLazyFeed(ndk, () => {
    const filter: any = {
      kinds: [NDKKind.Text, NDKKind.Image, NDKKind.Video, NDKKind.ShortVideo],
      limit: 300
    };

    // Add hashtag filters if any are selected
    if (hashtagFilter.hasFilters) {
      filter['#t'] = hashtagFilter.selectedHashtags;
    }

    // When no specific relay is selected (Following mode), filter by follows
    if (!relayFilter.selectedRelay && followsArray.length > 0) {
      filter.authors = followsArray;
    }
    return {
      filters: [filter],
      relayUrls: relaysToUse.length > 0 ? relaysToUse : undefined
    };
  }, {
    initialLimit: 30,
    pageSize: 30
  });

  const articlesFeed = createLazyFeed(ndk, () => {
    const filter: any = {
      kinds: [NDKKind.Article],
      limit: 100
    };

    // Add hashtag filters if any are selected
    if (hashtagFilter.hasFilters) {
      filter['#t'] = hashtagFilter.selectedHashtags;
    }

    // When no specific relay is selected (Following mode), filter by follows
    if (!relayFilter.selectedRelay && followsArray.length > 0) {
      filter.authors = followsArray;
    }
    return {
      filters: [filter],
      cacheUsage: 1, // NDKSubscriptionCacheUsage.CACHE_FIRST
      relayUrls: relaysToUse.length > 0 ? relaysToUse : undefined
    };
  }, {
    initialLimit: 10,
    pageSize: 10
  });

  const articles = $derived.by(() => articlesFeed.events.map(e => NDKArticle.from(e)));

  const filteredArticles = $derived.by(() =>
    articles
      .filter(article => article.title && article.content)
      .sort((a, b) => (b.published_at ?? b.created_at ?? 0) - (a.published_at ?? a.created_at ?? 0))
  );

  function hasMediaUrl(content: string, type: 'image' | 'video'): boolean {
    const regex = type === 'image'
      ? /(https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|webp|svg|avif))/gi
      : /(https?:\/\/[^\s]+\.(mp4|webm|mov|avi|mkv))/gi;
    return regex.test(content);
  }

  const mediaEvents = $derived.by(() => {
    if (selectedFilter === 'images') {
      return mediaFeed.events.filter(event =>
        event.kind === NDKKind.Image ||
        (event.kind === NDKKind.Text && hasMediaUrl(event.content, 'image'))
      );
    } else if (selectedFilter === 'videos') {
      return mediaFeed.events.filter(event =>
        event.kind === NDKKind.Video ||
        event.kind === NDKKind.ShortVideo ||
        (event.kind === NDKKind.Text && hasMediaUrl(event.content, 'video'))
      );
    }
    return [];
  });

  const events = $derived(selectedFilter === 'articles' ? [] : notesFeed.events);
  const eosed = $derived(selectedFilter === 'articles' ? articlesFeed.eosed : notesFeed.eosed);
  const status = $derived(selectedFilter === 'articles' ? 'connected' : 'connected');
  const hasMore = $derived(selectedFilter === 'articles' ? articlesFeed.hasMore : notesFeed.hasMore);
  const isLoading = $derived(selectedFilter === 'articles' ? articlesFeed.isLoading : notesFeed.isLoading);

  function handleLoadMore() {
    if (selectedFilter === 'articles') {
      articlesFeed.loadMore();
    } else {
      notesFeed.loadMore();
    }
  }

  // Get unique authors from pending events (up to 3 for display)
  const pendingAuthors = $derived.by(() => {
    const authors = new Set<string>();
    const pending = notesFeed.pendingEvents;
    for (const event of pending) {
      if (authors.size >= 3) break;
      authors.add(event.pubkey);
    }
    return Array.from(authors);
  });

  // Fetch relay info when a relay is selected
  const relayInfo = useRelayInfoCached(relayFilter.selectedRelay);
</script>

<div class="max-w-full mx-auto">
  <!-- Header -->
  <div class="sticky top-0 z-10 bg-black/90 backdrop-blur-xl border-b border-neutral-800/50">
    <div class="px-4 py-4">
      {#if hashtagInterests.interests.length > 0}
        <div class="flex flex-wrap items-center gap-2">
          {#if relayFilter.selectedRelay}
            <!-- Show relay icon when a specific relay is selected -->
            {#if relayInfo.info?.icon}
              <img src={relayInfo.info.icon} alt="" class="w-5 h-5 rounded" />
            {:else}
              <svg class="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
              </svg>
            {/if}
          {:else}
            <span class="text-sm text-neutral-400 mr-1">Following:</span>
          {/if}
          {#each hashtagInterests.interests as hashtag}
            <button
              onclick={() => hashtagFilter.toggleHashtag(hashtag)}
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all {
                hashtagFilter.isSelected(hashtag)
                  ? 'bg-orange-500 text-white border-2 border-orange-400'
                  : 'bg-neutral-800 text-neutral-300 border-2 border-neutral-700 hover:border-neutral-600'
              }"
            >
              <span class="text-xs">#</span>
              <span>{hashtag}</span>
            </button>
          {/each}
          {#if hashtagFilter.hasFilters}
            <button
              onclick={() => hashtagFilter.clearAll()}
              class="inline-flex items-center gap-1 px-2 py-1.5 rounded-full text-xs font-medium bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all"
              title="Clear all filters"
            >
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          {/if}
        </div>
      {:else}
        <h1 class="text-xl font-bold text-white">Home</h1>
      {/if}
    </div>

    <!-- Media Type Filters -->
    <div class="flex px-4 overflow-x-auto">
      <button
        onclick={() => selectedFilter = 'conversations'}
        class={`px-4 py-3 font-medium whitespace-nowrap flex items-center gap-1.5 ${
          selectedFilter === 'conversations'
            ? 'text-orange-500 border-b-2 border-orange-500'
            : 'text-neutral-400 hover:text-neutral-300'
        }`}
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        Conversations
      </button>

      <button
        onclick={() => selectedFilter = 'images'}
        class={`px-4 py-3 font-medium whitespace-nowrap flex items-center gap-1.5 ${
          selectedFilter === 'images'
            ? 'text-orange-500 border-b-2 border-orange-500'
            : 'text-neutral-400 hover:text-neutral-300'
        }`}
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        Images
      </button>

      <button
        onclick={() => selectedFilter = 'videos'}
        class={`px-4 py-3 font-medium whitespace-nowrap flex items-center gap-1.5 ${
          selectedFilter === 'videos'
            ? 'text-orange-500 border-b-2 border-orange-500'
            : 'text-neutral-400 hover:text-neutral-300'
        }`}
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        Videos
      </button>

      <button
        onclick={() => selectedFilter = 'articles'}
        class={`px-4 py-3 font-medium whitespace-nowrap flex items-center gap-1.5 ${
          selectedFilter === 'articles'
            ? 'text-orange-500 border-b-2 border-orange-500'
            : 'text-neutral-400 hover:text-neutral-300'
        }`}
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Articles
      </button>
    </div>
  </div>

  <!-- Feed -->
  <div class="divide-y divide-neutral-800/50">
    {#if selectedFilter === 'articles'}
      {#if filteredArticles.length === 0 && articlesFeed.eosed}
        <div class="p-8 text-center text-neutral-400">
          No articles found
        </div>
      {:else if filteredArticles.length === 0}
        <div class="p-8 text-center text-neutral-400">
          Loading articles...
        </div>
      {:else}
        {#each filteredArticles as article (article.id)}
          <ArticlePreviewCard {article} />
        {/each}
      {/if}

      <LoadMoreTrigger
        onIntersect={handleLoadMore}
        hasMore={articlesFeed.hasMore}
        isLoading={articlesFeed.isLoading}
      />
    {:else if selectedFilter === 'images' || selectedFilter === 'videos'}
      <div class="p-4">
        {#if mediaEvents.length === 0 && mediaFeed.eosed}
          <div class="p-8 text-center text-neutral-400">
            No {selectedFilter} found
          </div>
        {:else if mediaEvents.length === 0}
          <div class="p-8 text-center text-neutral-400">
            Loading {selectedFilter}...
          </div>
        {:else}
          <MediaGrid events={mediaEvents} />
        {/if}
      </div>
    {:else}
      <!-- New Notes Indicator (Twitter-style) -->
      {#if notesFeed.pendingCount > 0}
        <div class="flex justify-center py-2">
          <button
            onclick={() => notesFeed.loadPendingEvents()}
            class="flex items-center gap-2 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded-full transition-all shadow-lg"
          >
            <!-- Avatars -->
            <div class="flex -space-x-2">
              {#each pendingAuthors.slice(0, 3) as pubkey (pubkey)}
                <Avatar {ndk} {pubkey} class="w-6 h-6 rounded-full border-2 border-neutral-900" />
              {/each}
            </div>
            <!-- Text -->
            <span class="text-sm text-neutral-200 font-medium">
              {notesFeed.pendingCount} new {notesFeed.pendingCount === 1 ? 'note' : 'notes'}
            </span>
          </button>
        </div>
      {/if}

      {#if status === 'connecting'}
        <div class="p-8 text-center text-neutral-400">
          Connecting to relays...
        </div>
      {:else if events.length === 0 && eosed}
        <div class="p-8 text-center text-neutral-400">
          No notes found
        </div>
      {:else if events.length === 0}
        <div class="p-8 text-center text-neutral-400">
          Loading notes...
        </div>
      {:else}
        {#each events as event (event.id)}
          <NoteCard {event} />
        {/each}
      {/if}

      <LoadMoreTrigger
        onIntersect={handleLoadMore}
        {hasMore}
        {isLoading}
      />
    {/if}
  </div>
</div>
