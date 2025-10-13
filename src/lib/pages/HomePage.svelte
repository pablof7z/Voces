<script lang="ts">
  import { ndk, hashtagInterests } from '$lib/ndk.svelte';
  import { settings } from '$lib/stores/settings.svelte';
  import { hashtagFilter } from '$lib/stores/hashtagFilter.svelte';
  import { layoutMode } from '$lib/stores/layoutMode.svelte';
  import { NDKKind, type NDKEvent, NDKArticle, NDKSubscriptionCacheUsage } from '@nostr-dev-kit/ndk';
  import NoteCard from '$lib/components/NoteCard.svelte';
  import ArticlePreviewCard from '$lib/components/ArticlePreviewCard.svelte';
  import FeaturedArticleCard from '$lib/components/FeaturedArticleCard.svelte';
  import HighlightGridCard from '$lib/components/HighlightGridCard.svelte';
  import MediaGrid from '$lib/components/MediaGrid.svelte';
  import LoadMoreTrigger from '$lib/components/LoadMoreTrigger.svelte';
  import { createLazyFeed } from '$lib/utils/lazyFeed.svelte';
  import { Avatar } from '@nostr-dev-kit/svelte';
  import RelaySelectorIcon from '$lib/components/RelaySelectorIcon.svelte';
  import { getRelaysToUse, isAgorasSelection } from '$lib/utils/relayUtils';
  import { useRelayInfoCached } from '$lib/utils/relayInfo.svelte';
  import { sub } from 'date-fns';
  import MediaTypeFilters from '$lib/components/MediaTypeFilters.svelte';

  type MediaFilter = 'conversations' | 'images' | 'videos' | 'articles';
  let selectedFilter = $state<MediaFilter>('conversations');

  // Get relays to use based on filter
  // If a specific relay is selected, use only that relay
  // If "agoras" is selected, use both agora relays
  // Otherwise, use all enabled relays
  const relaysToUse = $derived(
    getRelaysToUse(
      settings.selectedRelay,
      settings.relays.filter(r => r.enabled && r.read).map(r => r.url)
    )
  );

  // Get follows for filtering when in "Following" mode
  const follows = $derived(ndk.$sessions?.follows||[]);
  const followsArray = $derived.by(() => Array.from(follows));

  // Helper to check if selection is a follow pack
  function isFollowPackSelection(value: string | null): boolean {
    return value?.startsWith('followpack:') ?? false;
  }

  // Fetch selected follow pack if applicable
  let selectedPackEvent = $state<NDKEvent | null>(null);

  $effect(() => {
    if (!settings.selectedRelay || !isFollowPackSelection(settings.selectedRelay)) {
      selectedPackEvent = null;
      return;
    }

    const packId = settings.selectedRelay.replace('followpack:', '');
    ndk.fetchEvent(packId).then(event => {
      selectedPackEvent = event;
    }).catch(err => {
      console.error('Failed to fetch selected pack:', err);
      selectedPackEvent = null;
    });
  });

  // Get authors array based on selection
  // - If a follow pack is selected, use pack members
  // - If in "Following" mode (no selection), use follows
  // - Otherwise, use no author filter (all authors)
  const authorsArray = $derived.by(() => {
    if (selectedPackEvent) {
      return selectedPackEvent.tags.filter(t => t[0] === 'p').map(t => t[1]);
    } else if (!settings.selectedRelay) {
      return followsArray;
    }
    return [];
  });

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

    // When in Following mode or Follow Pack mode, filter by authors
    const isFollowingOrPackMode = !settings.selectedRelay || isFollowPackSelection(settings.selectedRelay);
    if (isFollowingOrPackMode && authorsArray.length > 0) {
      filter.authors = authorsArray;
    }

    console.log('Using filter:', filter, "relays:", relaysToUse);
    return {
      filters: [filter],
      relayUrls: relaysToUse.length > 0 ? relaysToUse : undefined,
      subId: 'home-notes',
      cacheUsage: relaysToUse.length > 0 ? NDKSubscriptionCacheUsage.ONLY_RELAY : NDKSubscriptionCacheUsage.PARALLEL,
      exclusiveRelay: relaysToUse.length > 0,
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

    // When in Following mode or Follow Pack mode, filter by authors
    const isFollowingOrPackMode = !settings.selectedRelay || isFollowPackSelection(settings.selectedRelay);
    if (isFollowingOrPackMode && authorsArray.length > 0) {
      filter.authors = authorsArray;
    }
    return {
					filters: [filter],
					relayUrls: relaysToUse.length > 0 ? relaysToUse : undefined,
					cacheUsage:
						relaysToUse.length > 0
							? NDKSubscriptionCacheUsage.ONLY_RELAY
							: NDKSubscriptionCacheUsage.PARALLEL,
					subId: "home-media",
					exclusiveRelay: relaysToUse.length > 0,
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

    // When in Following mode or Follow Pack mode, filter by authors
    const isFollowingOrPackMode = !settings.selectedRelay || isFollowPackSelection(settings.selectedRelay);
    if (isFollowingOrPackMode && authorsArray.length > 0) {
      filter.authors = authorsArray;
    }
    return {
      filters: [filter],
      cacheUsage: relaysToUse.length > 0 ? NDKSubscriptionCacheUsage.ONLY_RELAY : NDKSubscriptionCacheUsage.PARALLEL,
      subId: 'home-articles',
      exclusiveRelay: relaysToUse.length > 0,
      relayUrls: relaysToUse.length > 0 ? relaysToUse : undefined
    };
  }, {
    initialLimit: 10,
    pageSize: 10
  });

  const highlightsFeed = createLazyFeed(ndk, () => {
    const filter: any = {
      kinds: [9802],
      limit: 100
    };

    // Add hashtag filters if any are selected
    if (hashtagFilter.hasFilters) {
      filter['#t'] = hashtagFilter.selectedHashtags;
    }

    // When in Following mode or Follow Pack mode, filter by authors
    const isFollowingOrPackMode = !settings.selectedRelay || isFollowPackSelection(settings.selectedRelay);
    if (isFollowingOrPackMode && authorsArray.length > 0) {
      filter.authors = authorsArray;
    }
    return {
      filters: [filter],
      cacheUsage: relaysToUse.length > 0 ? NDKSubscriptionCacheUsage.ONLY_RELAY : NDKSubscriptionCacheUsage.PARALLEL,
      subId: 'home-highlights',
      exclusiveRelay: relaysToUse.length > 0,
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

  // Featured articles (first 10 with images preferred)
  const featuredArticles = $derived.by(() => {
    const articlesWithImages = filteredArticles.filter(a => a.image);
    const articlesWithoutImages = filteredArticles.filter(a => !a.image);
    return [...articlesWithImages, ...articlesWithoutImages].slice(0, 10);
  });

  // Highlights for grid (first 10)
  const gridHighlights = $derived.by(() => highlightsFeed.events.slice(0, 10));

  // Regular article feed (skip first 10 featured articles)
  const regularArticles = $derived.by(() => filteredArticles.slice(10));

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

  // Get the title to display in the header
  const headerTitle = $derived.by(() => {
    // If showing hashtag filters, return null to show hashtags instead
    if (hashtagInterests.interests.length > 0) return null;

    // If Agoras or Following is selected, show Agora logo
    if (isAgorasSelection(settings.selectedRelay) || !settings.selectedRelay) {
      return { type: 'logo' as const };
    }

    // If a follow pack is selected, show pack name
    if (isFollowPackSelection(settings.selectedRelay) && selectedPackEvent) {
      return {
        type: 'text' as const,
        text: selectedPackEvent.tagValue('title') || 'Untitled Pack'
      };
    }

    // If a relay is selected, show relay name
    const relayInfo = useRelayInfoCached(settings.selectedRelay);
    return {
      type: 'text' as const,
      text: relayInfo.info?.name || settings.selectedRelay.replace('wss://', '').replace('ws://', '')
    };
  });

  // Set layout mode based on selected filter
  $effect(() => {
    if (selectedFilter === 'articles') {
      layoutMode.setReadsMode();
    } else {
      layoutMode.reset();
    }
  });

</script>

<div class="max-w-full mx-auto">
  <!-- Header -->
  <div class="sticky top-0 z-10 bg-background/90 backdrop-blur-xl border-b border-border">
    <div class="px-4 py-4">
      <div class="flex items-center gap-2">
        <!-- Relay/Following selector icon (always visible) -->
        <div class="flex-shrink-0 relative z-20">
          <RelaySelectorIcon />
        </div>

        <!-- Hashtags scroll container OR Title -->
        <div class="flex items-center gap-2 overflow-x-auto scrollbar-hide flex-1 min-w-0">
        {#if hashtagInterests.interests.length > 0}
          {#each hashtagInterests.interests as hashtag}
            <button
              onclick={() => hashtagFilter.toggleHashtag(hashtag)}
              class="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all {
                hashtagFilter.isSelected(hashtag)
                  ? 'bg-orange-500 text-foreground border-2 border-orange-400'
                  : 'bg-muted text-muted-foreground border-2 border-border hover:border'
              }"
            >
              <span class="text-xs">#</span>
              <span>{hashtag}</span>
            </button>
          {/each}
          {#if hashtagFilter.hasFilters}
            <button
              onclick={() => hashtagFilter.clearAll()}
              class="flex-shrink-0 inline-flex items-center gap-1 px-2 py-1.5 rounded-full text-xs font-medium bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all"
              title="Clear all filters"
            >
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          {/if}
        {:else if headerTitle?.type === 'logo'}
          <!-- AGORA text (icon is on the left) -->
          <svg viewBox="0 0 575 250" class="h-8 w-auto" xmlns="http://www.w3.org/2000/svg">
            <style>
              .st1{fill:#FFFFFF;}
            </style>
            <g>
              <path class="st1" d="M123.9,165.4v-0.9c3.6-0.3,6.4-1.1,8.4-2.4c2-1.3,3.5-3.2,4.7-5.8l24.2-54.9h3.8l28.5,57.6
                c0.7,1.4,1.7,2.6,3.2,3.6c1.4,1,3.6,1.6,6.4,1.9v0.9h-27.7v-0.9c2.9-0.3,4.7-0.9,5.4-1.9c0.8-1,0.8-2.2,0.1-3.6l-21.5-44.6
                L141,156.3c-1.1,2.6-0.9,4.5,0.5,5.8c1.4,1.3,3.9,2.1,7.6,2.4v0.9H123.9z M163.1,87.7h8.8l-7.8,9.2h-3L163.1,87.7z"/>
              <path class="st1" d="M248.3,135.2c0-1.5-0.6-2.7-1.8-3.7c-1.2-0.9-3.3-1.5-6.1-1.8v-0.9H268v0.9c-2.9,0.3-4.9,0.9-6.1,1.8
                c-1.2,0.9-1.8,2.1-1.8,3.7v32.9c0,1.5,0.6,2.7,1.8,3.7c1.2,0.9,3.3,1.5,6.1,1.8v0.9h-29v-0.9c3.5-0.3,5.9-0.9,7.2-1.8
                c1.3-0.9,2-2.1,2-3.7v-11.1c-1.5,2.9-3.7,5.2-6.7,6.7c-2.9,1.6-6.8,2.3-11.5,2.3c-4.5,0-8.7-0.7-12.3-2.2c-3.7-1.5-6.8-3.6-9.4-6.4
                c-2.6-2.8-4.6-6.2-6-10.2c-1.4-4-2.1-8.6-2.1-13.6c0-5.1,0.7-9.6,2.2-13.7c1.5-4.1,3.7-7.5,6.6-10.4c2.9-2.9,6.5-5.1,10.9-6.7
                c4.4-1.6,9.4-2.3,15.1-2.3c3.8,0,7.5,0.3,11.2,1c3.7,0.7,7.2,1.7,10.6,3v15.6h-1.3c-1.1-2.5-2.3-4.8-3.7-6.8c-1.4-2-3-3.8-4.7-5.3
                c-1.8-1.5-3.7-2.6-5.9-3.4c-2.2-0.8-4.6-1.2-7.3-1.2c-3.6,0-6.8,0.7-9.5,2.1c-2.7,1.4-4.9,3.4-6.7,6c-1.8,2.6-3.2,5.7-4,9.3
                c-0.9,3.6-1.3,7.7-1.3,12.2c0,9.2,1.8,16.2,5.5,20.8c3.7,4.7,8.6,7,14.6,7c4.8,0,8.5-1.6,11.3-4.8c2.7-3.2,4.2-8.5,4.5-15.8V135.2z
                "/>
              <path class="st1" d="M370.2,101.4c12.3,0,21.4,1.4,27.3,4.3c5.8,2.9,8.8,6.9,8.8,12.1c0,3.8-1.6,7.1-4.7,9.7
                c-3.2,2.6-8,4.5-14.7,5.6l19,25.9c0.9,1.3,2.2,2.4,3.8,3.5c1.6,1,3.8,1.7,6.7,2v0.9h-27.7v-0.9c2.9-0.3,4.5-1,4.8-2
                c0.3-1,0-2.2-0.9-3.5l-17.9-24.8c-0.7,0.1-1.4,0.1-2.1,0.1c-0.8,0-1.5,0-2.3,0h-7.1V159c0,1.5,0.6,2.7,1.8,3.7
                c1.2,0.9,3.3,1.5,6.1,1.8v0.9h-27.7v-0.9c2.9-0.3,4.9-0.9,6.1-1.8c1.2-0.9,1.8-2.1,1.8-3.7v-51.2c0-1.5-0.6-2.7-1.8-3.7
                c-1.2-0.9-3.3-1.5-6.1-1.8v-0.9H370.2z M370.2,131.6c8.2,0,14.3-1.2,18.1-3.5c3.8-2.3,5.7-5.7,5.7-10.2c0-4.5-1.9-7.9-5.7-10.2
                c-3.8-2.3-9.8-3.5-18.1-3.5h-7.1v27.5H370.2z"/>
              <path class="st1" d="M418.9,165.4v-0.9c3.6-0.3,6.4-1.1,8.4-2.4c2-1.3,3.5-3.2,4.7-5.8l24.2-54.9h3.8l28.5,57.6
                c0.7,1.4,1.7,2.6,3.2,3.6c1.4,1,3.6,1.6,6.4,1.9v0.9h-27.7v-0.9c2.9-0.3,4.7-0.9,5.4-1.9c0.8-1,0.8-2.2,0.1-3.6l-21.5-44.6
                L436,156.3c-1.1,2.6-0.9,4.5,0.5,5.8c1.4,1.3,3.9,2.1,7.6,2.4v0.9H418.9z"/>
              <path class="st1" d="M335.1,120c-1.5-4-3.7-7.5-6.5-10.3c-2.8-2.9-6.2-5.1-10.1-6.6c-4-1.6-8.4-2.3-13.4-2.3
                c-4.9,0-9.3,0.8-13.3,2.3c-4,1.6-7.4,3.8-10.2,6.6c-2.8,2.9-5,6.3-6.5,10.3c-1.5,4-2.3,8.5-2.3,13.5s0.8,9.4,2.3,13.5
                c1.5,4,3.7,7.5,6.5,10.3c2.8,2.9,6.2,5.1,10.2,6.6c4,1.6,8.4,2.3,13.3,2.3c5,0,9.4-0.8,13.4-2.3c3.9-1.6,7.3-3.8,10.1-6.6
                c2.8-2.9,5-6.3,6.5-10.3c1.5-4,2.3-8.5,2.3-13.5S336.6,124,335.1,120z M305,163.4c-12.4,0-20.9-13.4-20.9-30s8.2-30,20.9-30
                c13,0,20.9,13.4,20.9,30S318,163.4,305,163.4z"/>
            </g>
          </svg>
        {:else if headerTitle}
          <h1 class="text-xl font-bold text-foreground">{headerTitle.text}</h1>
        {/if}
        </div>
      </div>
    </div>

    <!-- Media Type Filters -->
    <MediaTypeFilters {selectedFilter} onFilterChange={(filter) => selectedFilter = filter} />
  </div>

  <!-- Feed -->
  <div class="divide-y divide-neutral-800/50">
    {#if selectedFilter === 'articles'}
      <div class="pb-6">
        {#if filteredArticles.length === 0 && articlesFeed.eosed}
          <div class="p-8 text-center text-muted-foreground">
            No articles found
          </div>
        {:else if filteredArticles.length === 0}
          <div class="p-8 text-center text-muted-foreground">
            Loading articles...
          </div>
        {:else}
          <!-- Featured Articles Section -->
          {#if featuredArticles.length > 0}
            <div class="px-4 py-6 border-b border-border">
              <h2 class="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                Featured
              </h2>
              <div class="overflow-x-auto scrollbar-hide -mx-4 px-4">
                <div class="flex gap-4 pb-2">
                  {#each featuredArticles as article (article.id)}
                    <FeaturedArticleCard {article} />
                  {/each}
                </div>
              </div>
            </div>
          {/if}

          <!-- Highlights Grid Section -->
          {#if gridHighlights.length > 0}
            <div class="px-4 py-6 border-b border-border">
              <h2 class="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <svg class="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                Recent Highlights
              </h2>
              <div class="grid grid-cols-2 gap-4">
                {#each gridHighlights as highlight (highlight.id)}
                  <HighlightGridCard event={highlight} />
                {/each}
              </div>
            </div>
          {/if}

          <!-- Regular Articles Feed -->
          {#if regularArticles.length > 0}
            <div class="px-4 py-6">
              <h2 class="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Latest Articles
              </h2>
              <div class="divide-y divide-neutral-800/50 -mx-4">
                {#each regularArticles as article (article.id)}
                  <ArticlePreviewCard {article} />
                {/each}
              </div>
            </div>
          {/if}
        {/if}
      </div>

      <LoadMoreTrigger
        onIntersect={handleLoadMore}
        hasMore={articlesFeed.hasMore}
        isLoading={articlesFeed.isLoading}
      />
    {:else if selectedFilter === 'images' || selectedFilter === 'videos'}
      <div class="p-4">
        {#if mediaEvents.length === 0 && mediaFeed.eosed}
          <div class="p-8 text-center text-muted-foreground">
            No {selectedFilter} found
          </div>
        {:else if mediaEvents.length === 0}
          <div class="p-8 text-center text-muted-foreground">
            Loading {selectedFilter}...
          </div>
        {:else}
          <MediaGrid events={mediaEvents} />
        {/if}
      </div>
    {:else}
      <!-- New Notes Indicator (Twitter-style) -->
      {#if notesFeed.pendingCount > 0}
        <div class="flex justify-center py-2 lg:relative lg:static fixed bottom-20 left-0 right-0 z-[500] lg:z-auto pointer-events-none">
          <button
            onclick={() => notesFeed.loadPendingEvents()}
            class="flex items-center gap-2 px-4 py-2 bg-neutral-900/95 hover:bg-muted border border-orange-500/50 lg:border-border rounded-full transition-all shadow-lg backdrop-blur-sm pointer-events-auto"
          >
            <!-- Avatars -->
            <div class="flex -space-x-2">
              {#each pendingAuthors.slice(0, 3) as pubkey (pubkey)}
                <Avatar {ndk} {pubkey} class="w-6 h-6 rounded-full border-2 border-foreground" />
              {/each}
            </div>
            <!-- Text -->
            <span class="text-sm text-primary lg:text-foreground font-medium">
              {notesFeed.pendingCount} new {notesFeed.pendingCount === 1 ? 'note' : 'notes'}
            </span>
          </button>
        </div>
      {/if}

      {#if events.length === 0}
        <div class="p-8 text-center text-muted-foreground">
          No notes found
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
