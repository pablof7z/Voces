<script lang="ts">
  import { ndk } from '$lib/ndk.svelte';
  import { settings } from '$lib/stores/settings.svelte';
  import { relayFilter } from '$lib/stores/relayFilter.svelte';
  import { NDKKind, type NDKEvent, NDKArticle } from '@nostr-dev-kit/ndk';
  import NoteCard from '$lib/components/NoteCard.svelte';
  import ArticlePreviewCard from '$lib/components/ArticlePreviewCard.svelte';
  import MediaGrid from '$lib/components/MediaGrid.svelte';
  import LoadMoreTrigger from '$lib/components/LoadMoreTrigger.svelte';
  import { createLazyFeed } from '$lib/utils/lazyFeed.svelte';

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
    // When no specific relay is selected (Following mode), filter by follows
    if (!relayFilter.selectedRelay && followsArray.length > 0) {
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
</script>

<div class="max-w-full mx-auto">
  <!-- Header -->
  <div class="sticky top-0 z-10 bg-black/90 backdrop-blur-xl border-b border-neutral-800/50">
    <div class="px-4 py-4">
      <h1 class="text-xl font-bold text-white">Home</h1>
    </div>

    <!-- Media Type Filters -->
    <div class="flex gap-2 px-4 pb-3 overflow-x-auto">
      <button
        onclick={() => selectedFilter = 'conversations'}
        class="flex items-center gap-2 px-4 py-2 rounded-full transition-colors whitespace-nowrap {selectedFilter === 'conversations' ? 'bg-orange-500 text-white' : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'}"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        Conversations
      </button>

      <button
        onclick={() => selectedFilter = 'images'}
        class="flex items-center gap-2 px-4 py-2 rounded-full transition-colors whitespace-nowrap {selectedFilter === 'images' ? 'bg-orange-500 text-white' : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'}"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        Images
      </button>

      <button
        onclick={() => selectedFilter = 'videos'}
        class="flex items-center gap-2 px-4 py-2 rounded-full transition-colors whitespace-nowrap {selectedFilter === 'videos' ? 'bg-orange-500 text-white' : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'}"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        Videos
      </button>

      <button
        onclick={() => selectedFilter = 'articles'}
        class="flex items-center gap-2 px-4 py-2 rounded-full transition-colors whitespace-nowrap {selectedFilter === 'articles' ? 'bg-orange-500 text-white' : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'}"
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
      <!-- New Events Notification Banner -->
      {#if notesFeed.pendingCount > 0}
        <button
          onclick={() => notesFeed.loadPendingEvents()}
          class="sticky top-[108px] z-10 w-full py-3 px-4 bg-orange-500 hover:bg-orange-500/90 text-white font-medium transition-colors border-b border-orange-500-dark"
        >
          {notesFeed.pendingCount} new {notesFeed.pendingCount === 1 ? 'event' : 'events'} - Click to load
        </button>
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
