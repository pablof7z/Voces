<script lang="ts">
  import { page } from '$app/stores';
  import { ndk } from '$lib/ndk.svelte';
  import { settings } from '$lib/stores/settings.svelte';
  import { sidebarStore } from '$lib/stores/sidebar.svelte';
  import { NDKKind, type NDKEvent, NDKArticle } from '@nostr-dev-kit/ndk';
  import { Avatar } from '@nostr-dev-kit/svelte';
  import NoteCard from '$lib/components/NoteCard.svelte';
  import ArticlePreviewCard from '$lib/components/ArticlePreviewCard.svelte';
  import MediaGrid from '$lib/components/MediaGrid.svelte';
  import LoadMoreTrigger from '$lib/components/LoadMoreTrigger.svelte';
  import { createLazyFeed } from '$lib/utils/lazyFeed.svelte';

  type MediaFilter = 'conversations' | 'images' | 'videos' | 'articles';
  let selectedFilter = $state<MediaFilter>('conversations');

  // Get the hashtag from the URL parameter
  const hashtag = $derived($page.params.hashtag);

  // Get enabled relays
  const relaysToUse = $derived(
    settings.relays
      .filter(r => r.enabled && r.read)
      .map(r => r.url)
  );

  const notesFeed = createLazyFeed(ndk, () => {
    const currentHashtag = hashtag;
    const filter: any = {
      kinds: [NDKKind.Text],
      '#t': [currentHashtag.toLowerCase()],
      limit: 200
    };

    return {
      filters: [filter],
      relayUrls: relaysToUse.length > 0 ? relaysToUse : undefined
    };
  }, {
    initialLimit: 20,
    pageSize: 20
  });

  const mediaFeed = createLazyFeed(ndk, () => {
    const currentHashtag = hashtag;
    const filter: any = {
      kinds: [NDKKind.Text, NDKKind.Image, NDKKind.Video, NDKKind.ShortVideo],
      '#t': [currentHashtag.toLowerCase()],
      limit: 300
    };

    return {
      filters: [filter],
      relayUrls: relaysToUse.length > 0 ? relaysToUse : undefined
    };
  }, {
    initialLimit: 30,
    pageSize: 30
  });

  const articlesFeed = createLazyFeed(ndk, () => {
    const currentHashtag = hashtag;
    const filter: any = {
      kinds: [NDKKind.Article],
      '#t': [currentHashtag.toLowerCase()],
      limit: 100
    };

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

  // Calculate top authors for this hashtag
  const topAuthors = $derived.by(() => {
    const authorCounts = new Map<string, number>();

    // Count posts by each author from all feeds
    [...notesFeed.events, ...mediaFeed.events, ...articlesFeed.events].forEach(event => {
      const count = authorCounts.get(event.pubkey) || 0;
      authorCounts.set(event.pubkey, count + 1);
    });

    // Sort by count and return top 5
    return Array.from(authorCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([pubkey, count]) => ({ pubkey, count }));
  });

  // Set up custom sidebar
  $effect(() => {
    sidebarStore.rightSidebar = hashtagSidebar;

    return () => {
      sidebarStore.clear();
    };
  });
</script>

{#snippet hashtagSidebar()}
  <div class="p-4 bg-neutral-900 rounded-lg border border-neutral-800">
    <div class="flex items-center gap-2 mb-4">
      <svg class="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
      <h2 class="text-lg font-semibold text-white">Top Authors</h2>
    </div>
    <div class="space-y-3">
      {#if topAuthors.length === 0}
        <div class="h-12 bg-neutral-800 rounded animate-pulse"></div>
        <div class="h-12 bg-neutral-800 rounded animate-pulse"></div>
        <div class="h-12 bg-neutral-800 rounded animate-pulse"></div>
      {:else}
        {#each topAuthors as { pubkey, count } (pubkey)}
          <a
            href="/p/{pubkey}"
            class="flex items-center gap-3 hover:bg-neutral-800/50 rounded-lg p-2 transition-colors"
          >
            <Avatar {ndk} {pubkey} class="w-10 h-10 rounded-full flex-shrink-0" />
            <div class="flex-1 min-w-0">
              <div class="text-sm font-medium text-white truncate">
                {pubkey.slice(0, 16)}...
              </div>
              <div class="text-xs text-neutral-500">
                {count} {count === 1 ? 'post' : 'posts'}
              </div>
            </div>
          </a>
        {/each}
      {/if}
    </div>
  </div>
{/snippet}

<div class="max-w-full mx-auto">
  <!-- Header -->
  <div class="sticky top-0 z-10 bg-black/90 backdrop-blur-xl border-b border-neutral-800/50">
    <div class="px-4 py-4">
      <div class="flex items-center gap-3">
        <a
          href="/"
          class="flex items-center justify-center w-8 h-8 rounded-full hover:bg-neutral-800 transition-colors"
          aria-label="Back to home"
        >
          <svg class="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </a>
        <div>
          <h1 class="text-xl font-bold text-white flex items-center gap-2">
            <span class="text-orange-500">#</span>
            {hashtag}
          </h1>
          <p class="text-sm text-neutral-400">
            Posts tagged with #{hashtag}
          </p>
        </div>
      </div>
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
          No articles found with #{hashtag}
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
            No {selectedFilter} found with #{hashtag}
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
      {#if status === 'connecting'}
        <div class="p-8 text-center text-neutral-400">
          Connecting to relays...
        </div>
      {:else if events.length === 0 && eosed}
        <div class="p-8 text-center text-neutral-400">
          No notes found with #{hashtag}
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
