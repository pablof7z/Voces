<script lang="ts">
  import { page } from '$app/stores';
  import { ndk } from '$lib/ndk.svelte';
  import { NDKKind, NDKArticle, type NDKEvent } from '@nostr-dev-kit/ndk';
  import { Avatar } from '@nostr-dev-kit/svelte';
  import { EventContent } from '@nostr-dev-kit/svelte';
  import NoteCard from '$lib/components/NoteCard.svelte';
  import FollowButton from '$lib/components/FollowButton.svelte';
  import ShareProfileModal from '$lib/components/ShareProfileModal.svelte';
  import MediaGrid from '$lib/components/MediaGrid.svelte';
  import ArticleList from '$lib/components/ArticleList.svelte';
  import PackCard from '$lib/components/PackCard.svelte';
  import LoadMoreTrigger from '$lib/components/LoadMoreTrigger.svelte';
  import { createLazyFeed } from '$lib/utils/lazyFeed.svelte';

  const identifier = $derived($page.params.identifier || '');
  const user = ndk.$fetchUser(() => identifier);
  const profile = ndk.$fetchProfile(() => user?.pubkey);
  const pubkey = $derived(user?.pubkey || '');
  const currentUser = ndk.$currentUser;
  const isOwnProfile = $derived(currentUser?.pubkey === pubkey);

  let activeTab = $state<'notes' | 'replies' | 'media' | 'articles' | 'packs'>('notes');
  let isShareModalOpen = $state(false);
  let packFilter = $state<'all' | 'created' | 'appears'>('all');

  const allTextEventsFeed = createLazyFeed(
    ndk,
    () => pubkey ? { filters: [{ kinds: [NDKKind.Text], authors: [pubkey], limit: 200 }] } : undefined,
    { initialLimit: 20, pageSize: 20 }
  );

  const nip68MediaFeed = createLazyFeed(
    ndk,
    () => activeTab === 'media' && pubkey ? {
      filters: [{ kinds: [20, 21, 22], authors: [pubkey], limit: 200 }]
    } : undefined,
    { initialLimit: 30, pageSize: 30 }
  );

  const articlesFeed = createLazyFeed(
    ndk,
    () => activeTab === 'articles' && pubkey ? {
      filters: [{ kinds: [NDKKind.Article], authors: [pubkey], limit: 100 }]
    } : undefined,
    { initialLimit: 10, pageSize: 10 }
  );

  const createdPacksFeed = createLazyFeed(
    ndk,
    () => activeTab === 'packs' && pubkey ? {
      filters: [{ kinds: [39089, 39092], authors: [pubkey], limit: 100 }]
    } : undefined,
    { initialLimit: 20, pageSize: 20 }
  );

  const appearsPacksFeed = createLazyFeed(
    ndk,
    () => activeTab === 'packs' && pubkey ? {
      filters: [{ kinds: [39089, 39092], '#p': [pubkey], limit: 100 }]
    } : undefined,
    { initialLimit: 20, pageSize: 20 }
  );

  const contactListSubscription = ndk.$subscribe(
    () => pubkey ? ({
      filters: [{ kinds: [3], authors: [pubkey], limit: 1 }],
      bufferMs: 100,
    }) : undefined
  );

  const followingCount = $derived.by(() => {
    const contactList = contactListSubscription.events[0];
    if (!contactList) return 0;
    return contactList.tags.filter(tag => tag[0] === 'p').length;
  });

  const notes = $derived.by(() => allTextEventsFeed.events.filter(event => !event.tags.some(tag => tag[0] === 'e')));
  const replies = $derived.by(() => allTextEventsFeed.events.filter(event => event.tags.some(tag => tag[0] === 'e')));

  function hasMediaUrl(content: string): boolean {
    const urlRegex = /(https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|webp|svg|avif|mp4|webm|mov|avi|mkv))/gi;
    return urlRegex.test(content);
  }

  const textMediaEvents = $derived.by(() => allTextEventsFeed.allEvents.filter(event => hasMediaUrl(event.content)));
  const allMediaEvents = $derived.by(() => [...nip68MediaFeed.events, ...textMediaEvents]);

  const articles = $derived.by(() => articlesFeed.events.map(e => NDKArticle.from(e)));

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

  const createdPacks = $derived.by((): Pack[] => {
    return createdPacksFeed.events.map(event => ({
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
  });

  const appearsPacks = $derived.by((): Pack[] => {
    return appearsPacksFeed.events.map(event => ({
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
  });

  const allPacks = $derived.by(() => [...createdPacks, ...appearsPacks]);

  const packs = $derived.by(() =>
    packFilter === 'created' ? createdPacks :
    packFilter === 'appears' ? appearsPacks :
    allPacks
  );

  const hasArticles = $derived.by(() => articles.length > 0);
  const npub = $derived(user?.npub || '');

  function handleLoadMore() {
    if (activeTab === 'notes' || activeTab === 'replies') {
      allTextEventsFeed.loadMore();
    } else if (activeTab === 'media') {
      nip68MediaFeed.loadMore();
    } else if (activeTab === 'articles') {
      articlesFeed.loadMore();
    } else if (activeTab === 'packs') {
      if (packFilter === 'created') {
        createdPacksFeed.loadMore();
      } else if (packFilter === 'appears') {
        appearsPacksFeed.loadMore();
      } else {
        createdPacksFeed.loadMore();
        appearsPacksFeed.loadMore();
      }
    }
  }

  const hasMore = $derived.by(() => {
    if (activeTab === 'notes' || activeTab === 'replies') {
      return allTextEventsFeed.hasMore;
    } else if (activeTab === 'media') {
      return nip68MediaFeed.hasMore;
    } else if (activeTab === 'articles') {
      return articlesFeed.hasMore;
    } else if (activeTab === 'packs') {
      if (packFilter === 'created') {
        return createdPacksFeed.hasMore;
      } else if (packFilter === 'appears') {
        return appearsPacksFeed.hasMore;
      } else {
        return createdPacksFeed.hasMore || appearsPacksFeed.hasMore;
      }
    }
    return false;
  });

  const isLoading = $derived.by(() => {
    if (activeTab === 'notes' || activeTab === 'replies') {
      return allTextEventsFeed.isLoading;
    } else if (activeTab === 'media') {
      return nip68MediaFeed.isLoading;
    } else if (activeTab === 'articles') {
      return articlesFeed.isLoading;
    } else if (activeTab === 'packs') {
      return createdPacksFeed.isLoading || appearsPacksFeed.isLoading;
    }
    return false;
  });
</script>

<div class="max-w-2xl mx-auto">
  <!-- Profile header -->
  <div class="bg-black border-b border-neutral-800">
    <!-- Cover image -->
    <div class="h-48 sm:h-64 bg-gradient-to-br from-orange-500 to-red-500 relative">
      {#if profile?.banner}
        <img
          src={profile.banner}
          alt="Banner"
          class="w-full h-full object-cover"
        />
      {/if}
    </div>

    <!-- Profile info -->
    <div class="px-4 sm:px-6 pb-4 pt-4">
      <!-- Avatar -->
      <div class="relative -mt-24 sm:-mt-28 mb-4">
        <Avatar {ndk} {pubkey} size="sm" class="w-48 h-48 sm:w-48 sm:h-48 rounded-full border-4 border-black" />
      </div>

      <!-- Name and bio -->
      <div class="mb-4">
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1">
            <h1 class="text-xl sm:text-2xl font-bold text-neutral-100">
              {profile?.name || 'Anonymous'}
            </h1>
            <div class="flex items-center gap-2">
              <p class="text-neutral-400">
                {profile?.nip05 ? `@${profile.nip05.split('@')[0]}` : `${pubkey.slice(0, 12)}...`}
              </p>
              <button
                onclick={() => isShareModalOpen = true}
                class="p-1 text-neutral-400 hover:text-neutral-300 transition-colors"
                aria-label="Share profile"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </button>
            </div>
          </div>
          <FollowButton {pubkey} />
        </div>
        {#if profile?.about}
          <div class="mt-3">
            <EventContent
              content={profile.about}
              class="text-neutral-300"
            />
          </div>
        {/if}
      </div>

      <!-- Meta info -->
      <div class="flex flex-wrap gap-4 text-sm text-neutral-400">
        {#if profile?.website}
          <a
            href={profile.website}
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center gap-1 hover:text-orange-500"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            <span>{profile.website.replace(/^https?:\/\//, '')}</span>
          </a>
        {/if}
      </div>

      <!-- Stats -->
      <div class="flex gap-6 mt-4">
        <div>
          <span class="font-semibold text-neutral-100">{notes.length}</span>
          <span class="text-neutral-400 ml-1">Notes</span>
        </div>
        <div>
          <span class="font-semibold text-neutral-100">{followingCount}</span>
          <span class="text-neutral-400 ml-1">Following</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Tabs -->
  <div class="sticky top-0 z-30 bg-black/80 backdrop-blur-sm border-b border-neutral-800">
    <div class="flex px-4 sm:px-6 overflow-x-auto">
      <button
        onclick={() => activeTab = 'notes'}
        class={`px-4 py-3 font-medium whitespace-nowrap ${
          activeTab === 'notes'
            ? 'text-orange-500 border-b-2 border-orange-500'
            : 'text-neutral-400 hover:text-neutral-300'
        }`}
      >
        Notes
      </button>
      <button
        onclick={() => activeTab = 'replies'}
        class={`px-4 py-3 font-medium whitespace-nowrap ${
          activeTab === 'replies'
            ? 'text-orange-500 border-b-2 border-orange-500'
            : 'text-neutral-400 hover:text-neutral-300'
        }`}
      >
        Replies
      </button>
      <button
        onclick={() => activeTab = 'media'}
        class={`px-4 py-3 font-medium whitespace-nowrap ${
          activeTab === 'media'
            ? 'text-orange-500 border-b-2 border-orange-500'
            : 'text-neutral-400 hover:text-neutral-300'
        }`}
      >
        Media
      </button>
      {#if hasArticles}
        <button
          onclick={() => activeTab = 'articles'}
          class={`px-4 py-3 font-medium whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'articles'
              ? 'text-orange-500 border-b-2 border-orange-500'
              : 'text-neutral-400 hover:text-neutral-300'
          }`}
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Articles
        </button>
      {/if}
      <button
        onclick={() => activeTab = 'packs'}
        class={`px-4 py-3 font-medium whitespace-nowrap flex items-center gap-1.5 ${
          activeTab === 'packs'
            ? 'text-orange-500 border-b-2 border-orange-500'
            : 'text-neutral-400 hover:text-neutral-300'
        }`}
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
        Follow Packs
      </button>
    </div>
  </div>

  <!-- Tab content -->
  <div>
    {#if activeTab === 'notes'}
      {#if notes.length === 0}
        <div class="text-center py-8 text-neutral-400">No notes yet</div>
      {:else}
        <div class="divide-y divide-neutral-800/50">
          {#each notes as note (note.id)}
            <NoteCard event={note} />
          {/each}
        </div>
      {/if}
      <LoadMoreTrigger
        onIntersect={handleLoadMore}
        {hasMore}
        {isLoading}
      />
    {/if}

    {#if activeTab === 'replies'}
      {#if replies.length === 0}
        <div class="text-center py-8 text-neutral-400">No replies yet</div>
      {:else}
        <div class="divide-y divide-neutral-800/50">
          {#each replies as reply (reply.id)}
            <NoteCard event={reply} />
          {/each}
        </div>
      {/if}
      <LoadMoreTrigger
        onIntersect={handleLoadMore}
        {hasMore}
        {isLoading}
      />
    {/if}

    {#if activeTab === 'media'}
      <div class="p-4">
        <MediaGrid events={allMediaEvents} />
      </div>
      <LoadMoreTrigger
        onIntersect={handleLoadMore}
        {hasMore}
        {isLoading}
      />
    {/if}

    {#if activeTab === 'articles'}
      <ArticleList
        {articles}
        isLoading={!articlesFeed.eosed}
        emptyMessage={isOwnProfile ? "You haven't published any articles yet" : "No articles published yet"}
      />
      <LoadMoreTrigger
        onIntersect={handleLoadMore}
        {hasMore}
        {isLoading}
      />
    {/if}

    {#if activeTab === 'packs'}
      <div class="p-4 space-y-4">
        <div class="flex gap-2 mb-4">
          <button
            onclick={() => packFilter = 'all'}
            class={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              packFilter === 'all'
                ? 'bg-orange-600 text-white'
                : 'bg-black text-neutral-300 hover:bg-neutral-900'
            }`}
          >
            All
          </button>
          <button
            onclick={() => packFilter = 'created'}
            class={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              packFilter === 'created'
                ? 'bg-orange-600 text-white'
                : 'bg-black text-neutral-300 hover:bg-neutral-900'
            }`}
          >
            {isOwnProfile ? 'by you' : `by @${profile?.name || profile?.displayName || pubkey.slice(0, 8)}`}
          </button>
          <button
            onclick={() => packFilter = 'appears'}
            class={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              packFilter === 'appears'
                ? 'bg-orange-600 text-white'
                : 'bg-black text-neutral-300 hover:bg-neutral-900'
            }`}
          >
            {isOwnProfile ? 'with you' : `with @${profile?.name || profile?.displayName || pubkey.slice(0, 8)}`}
          </button>
        </div>

        {#if packs.length > 0}
          <div class="grid gap-4 md:grid-cols-2">
            {#each packs as pack (pack.id)}
              <PackCard {pack} variant="compact" />
            {/each}
          </div>
        {:else}
          <div class="text-center py-8 text-neutral-400">
            {packFilter === 'created'
              ? (isOwnProfile
                  ? "You haven't created any follow packs yet"
                  : `@${profile?.name || 'user'} hasn't created any follow packs yet`)
              : packFilter === 'appears'
              ? (isOwnProfile
                  ? "You don't appear on any follow packs yet"
                  : `@${profile?.name || 'user'} doesn't appear on any follow packs yet`)
              : "No follow packs found"}
          </div>
        {/if}
      </div>
      <LoadMoreTrigger
        onIntersect={handleLoadMore}
        {hasMore}
        {isLoading}
      />
    {/if}
  </div>

  <ShareProfileModal
    isOpen={isShareModalOpen}
    onClose={() => isShareModalOpen = false}
    {pubkey}
    {npub}
  />
</div>
