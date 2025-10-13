<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { ndk } from '$lib/ndk.svelte';
  import { layoutMode } from '$lib/stores/layoutMode.svelte';
  import ListingDetailPage from '$lib/pages/ListingDetailPage.svelte';
  import FollowPackDetailPage from '$lib/pages/FollowPackDetailPage.svelte';
  import SellerSidebar from '$lib/components/marketplace/SellerSidebar.svelte';
  import ArticleHeader from '$lib/components/ArticleHeader.svelte';
  import ArticleContent from '$lib/components/ArticleContent.svelte';
  import CommentSection from '$lib/components/CommentSection.svelte';
  import { sidebarStore } from '$lib/stores/sidebar.svelte';
  import { NDKKind, type NDKEvent, NDKArticle } from '@nostr-dev-kit/ndk';
  import { nip19 } from 'nostr-tools';
  import { extractArticleImage } from '$lib/utils/extractArticleImage';
  import { Avatar } from '@nostr-dev-kit/svelte';

  const nip05Identifier = $derived($page.params.nip05);
  const dTagIdentifier = $derived($page.params.identifier);

  let event = $state<NDKEvent | null>(null);
  let loading = $state(true);
  let error = $state<string | null>(null);
  let userError = $state<string | null>(null);

  // Resolve NIP-05 to pubkey
  const user = ndk.$fetchUser(() => nip05Identifier);
  const pubkey = $derived(user?.pubkey);

  // Fetch the event
  $effect(() => {
    if (!pubkey || !dTagIdentifier) {
      loading = false;
      return;
    }

    loading = true;
    error = null;

    ndk.fetchEvent({
      kinds: [NDKKind.Article, 30017, 30018, 30019, 30020, 39089, 39092], // Article, marketplace, and pack kinds
      authors: [pubkey],
      '#d': [dTagIdentifier]
    })
      .then(fetchedEvent => {
        event = fetchedEvent;
        loading = false;
      })
      .catch(err => {
        console.error('Failed to fetch event:', err);
        error = 'Failed to load event';
        loading = false;
      });
  });

  // Set sidebar for marketplace items and layout mode for articles
  $effect(() => {
    if (event?.kind === NDKKind.Article) {
      layoutMode.setArticleMode();
    } else if (event?.kind && [30017, 30018, 30019, 30020].includes(event.kind)) {
      sidebarStore.rightSidebar = sellerSidebarContent;
    }

    return () => {
      sidebarStore.clear();
      layoutMode.reset();
    };
  });

  // Convert to article if needed
  const article = $derived(event?.kind === NDKKind.Article ? NDKArticle.from(event) : null);
  const heroImage = $derived(article ? extractArticleImage(article) : null);
  const authorProfile = $derived(article ? ndk.$fetchProfile(() => article.pubkey) : undefined);
  const authorName = $derived(authorProfile?.name || authorProfile?.displayName || 'Anonymous');
  const publishedAt = $derived(article?.published_at);

  function goBack() {
    window.history.back();
  }
</script>

{#snippet sellerSidebarContent()}
  <SellerSidebar listing={event} />
{/snippet}

{#if loading}
  <div class="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-black">
    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-neutral-900 dark:border-white"></div>
    <p class="mt-4 text-neutral-600 dark:text-neutral-400">Loading...</p>
  </div>
{:else if error || !event}
  <div class="flex flex-col items-center justify-center min-h-screen px-4 bg-white dark:bg-black">
    <h1 class="text-2xl font-bold text-neutral-900 dark:text-white mb-2">Event Not Found</h1>
    <p class="text-neutral-600 dark:text-neutral-400 mb-4">{error || 'The event could not be loaded.'}</p>
    <button
      type="button"
      onclick={() => goto('/')}
      class="px-4 py-2 bg-neutral-900 dark:bg-white text-white dark:text-black rounded-full hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors text-sm font-medium"
    >
      Go Home
    </button>
  </div>
{:else if event.kind === NDKKind.Article && article}
  <!-- Render as article -->
  <div class="min-h-screen bg-white dark:bg-black">
    <header class="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-black/95 backdrop-blur-sm">
      <div class="max-w-screen-lg mx-auto px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <button
            type="button"
            onclick={goBack}
            class="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-full transition-colors"
            aria-label="Go back"
          >
            <svg class="w-5 h-5 text-neutral-700 dark:text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>
      </div>
    </header>

    {#if heroImage}
      <div class="relative w-full h-[50vh] min-h-[400px] max-h-[600px] mt-16 overflow-hidden">
        <img
          src={heroImage}
          alt={article.title || 'Article hero image'}
          class="absolute inset-0 w-full h-full object-cover"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>

        <div class="absolute inset-0 flex items-end">
          <div class="max-w-screen-lg mx-auto px-6 lg:px-8 pb-8 w-full">
            <h1 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight tracking-tight font-serif drop-shadow-2xl">
              {article.title || 'Untitled'}
            </h1>

            <div class="flex items-center gap-3">
              <button
                type="button"
                onclick={() => window.location.href = `/p/${nip19.npubEncode(article.pubkey)}`}
                class="flex-shrink-0"
              >
                <Avatar {ndk} pubkey={article.pubkey} class="w-10 h-10 sm:w-12 sm:h-12 ring-2 ring-white hover:ring-4 transition-all" />
              </button>

              <div class="text-white">
                <button
                  type="button"
                  onclick={() => window.location.href = `/p/${nip19.npubEncode(article.pubkey)}`}
                  class="font-semibold text-base hover:text-white/80 transition-colors block"
                >
                  {authorName}
                </button>
                <div class="flex items-center gap-2 text-sm text-white/80">
                  {#if publishedAt}
                    <time datetime={new Date(publishedAt * 1000).toISOString()}>
                      {new Date(publishedAt * 1000).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </time>
                  {/if}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    {/if}

    <main class={heroImage ? 'pb-32' : 'pt-24 pb-32'}>
      <article class="max-w-screen-md mx-auto px-6 lg:px-8">
        {#if userError}
          <div class="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div class="flex items-start justify-between">
              <p class="text-red-600 dark:text-red-400">{userError}</p>
              <button
                type="button"
                onclick={() => userError = null}
                class="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                aria-label="Dismiss error"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        {/if}

        {#if !heroImage}
          <ArticleHeader {article} />
        {:else}
          <div class="mt-12 border-t border-neutral-200 dark:border-neutral-800"></div>
        {/if}

        <div class={heroImage ? 'mt-12' : ''}>
          <ArticleContent content={article.content} emojiTags={article.tags} />
        </div>
      </article>

      <div class="max-w-screen-md mx-auto px-6 lg:px-8 mt-16">
        <CommentSection {article} onError={(err) => userError = err} />
      </div>
    </main>
  </div>
{:else if [30017, 30018, 30019, 30020].includes(event.kind || 0)}
  <!-- Render as marketplace listing -->
  <ListingDetailPage listing={event} {loading} />
{:else if [39089, 39092].includes(event.kind || 0)}
  <!-- Render as follow pack -->
  <FollowPackDetailPage />
{:else}
  <!-- Unknown kind -->
  <div class="flex flex-col items-center justify-center min-h-screen px-4 bg-white dark:bg-black">
    <h1 class="text-2xl font-bold text-neutral-900 dark:text-white mb-2">Unsupported Event Type</h1>
    <p class="text-neutral-600 dark:text-neutral-400 mb-4">This event type (kind {event.kind}) is not yet supported.</p>
    <button
      type="button"
      onclick={() => goto('/')}
      class="px-4 py-2 bg-neutral-900 dark:bg-white text-white dark:text-black rounded-full hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors text-sm font-medium"
    >
      Go Home
    </button>
  </div>
{/if}
