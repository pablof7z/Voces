<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { ndk } from '$lib/ndk.svelte';
  import { fetchArticleByNaddr } from '$lib/utils/fetchArticle';
  import ArticleHeader from '$lib/components/ArticleHeader.svelte';
  import ArticleContent from '$lib/components/ArticleContent.svelte';
  import CommentSection from '$lib/components/CommentSection.svelte';
  import type { NDKArticle } from '@nostr-dev-kit/ndk';
  import { NDKKind, NDKList, NDKEvent } from '@nostr-dev-kit/ndk';
  import { nip19 } from 'nostr-tools';
  import { extractArticleImage } from '$lib/utils/extractArticleImage';
  import { Avatar } from '@nostr-dev-kit/svelte';

  let article = $state<NDKArticle | null>(null);
  let isLoading = $state(true);
  let error = $state<string | null>(null);
  let isBookmarked = $state(false);
  let showShareMenu = $state(false);
  let copied = $state(false);
  let userError = $state<string | null>(null);

  const naddr = $derived($page.params.naddr);
  const currentUser = ndk.$currentUser;

  const heroImage = $derived(article ? extractArticleImage(article) : null);
  const authorProfile = $derived(article ? ndk.$fetchProfile(() => article.pubkey) : undefined);
  const authorName = $derived(authorProfile?.name || authorProfile?.displayName || 'Anonymous');
  const publishedAt = $derived(article?.published_at);

  async function loadArticle() {
    if (!naddr) {
      error = 'No article identifier provided';
      isLoading = false;
      return;
    }

    isLoading = true;
    error = null;

    try {
      article = await fetchArticleByNaddr(ndk, naddr);
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to load article';
      console.error('Failed to load article:', err);
    } finally {
      isLoading = false;
    }
  }

  async function checkBookmark() {
    if (!currentUser || !article) return;

    try {
      const bookmarksNaddr = nip19.naddrEncode({
        kind: NDKKind.CurationSet,
        pubkey: currentUser.pubkey,
        identifier: 'bookmarks'
      });

      const bookmarkList = await ndk.fetchEvent(bookmarksNaddr);
      if (bookmarkList) {
        const bookmarkedItems = bookmarkList.tags
          .filter(tag => tag[0] === 'a')
          .map(tag => tag[1]);

        const articlePointer = article.tagId();
        isBookmarked = bookmarkedItems.includes(articlePointer);
      }
    } catch (err) {
      console.error('Failed to check bookmark status:', err);
    }
  }

  async function handleBookmark() {
    if (!currentUser || !article) return;

    try {
      const bookmarksNaddr = nip19.naddrEncode({
        kind: NDKKind.CurationSet,
        pubkey: currentUser.pubkey,
        identifier: 'bookmarks'
      });

      let bookmarkList = await ndk.fetchEvent(bookmarksNaddr) as NDKList | null;

      if (!bookmarkList) {
        bookmarkList = new NDKList(ndk);
        bookmarkList.kind = NDKKind.CurationSet;
        bookmarkList.tags = [
          ['d', 'bookmarks'],
          ['title', 'Bookmarks']
        ];
      }

      const articlePointer = article.tagId();

      if (isBookmarked) {
        bookmarkList.tags = bookmarkList.tags.filter(
          tag => !(tag[0] === 'a' && tag[1] === articlePointer)
        );
      } else {
        bookmarkList.addItem(['a', articlePointer, '', article.author.pubkey]);
      }

      await bookmarkList.publish();
      isBookmarked = !isBookmarked;
    } catch (err) {
      console.error('Bookmark error:', err);
    }
  }

  function handleCopyIdentifier() {
    if (!article) return;

    const identifier = article.encode();
    navigator.clipboard.writeText(identifier);
    copied = true;
    setTimeout(() => copied = false, 2000);
  }

  function handleShare(platform: string) {
    if (!article) return;

    const title = encodeURIComponent(article.title || 'Check out this article');
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`${article.title} by ${article.author.profile?.name || 'Anonymous'}`);

    const shareUrls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}&title=${title}`,
    };

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }

    showShareMenu = false;
  }

  function goBack() {
    window.history.back();
  }

  $effect(() => {
    if (naddr) {
      loadArticle().then(() => {
        if (article) {
          checkBookmark();
        }
      });
    }
  });
</script>

{#if isLoading}
  <div class="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-black">
    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-neutral-900 dark:border-white"></div>
    <p class="mt-4 text-neutral-600 dark:text-neutral-400">Loading article...</p>
  </div>
{:else if error || !article}
  <div class="flex flex-col items-center justify-center min-h-screen px-4 bg-white dark:bg-black">
    <h1 class="text-2xl font-bold text-neutral-900 dark:text-white mb-2">Article Not Found</h1>
    <p class="text-neutral-600 dark:text-neutral-400 mb-4">{error || 'The article could not be loaded.'}</p>
    <button
      type="button"
      onclick={() => goto('/')}
      class="px-4 py-2 bg-neutral-900 dark:bg-white text-white dark:text-black rounded-full hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors text-sm font-medium"
    >
      Go Home
    </button>
  </div>
{:else}
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

          <div class="flex items-center gap-2">
            <button
              type="button"
              onclick={handleBookmark}
              disabled={!currentUser}
              class={`p-2 rounded-full transition-colors ${
                isBookmarked
                  ? 'text-yellow-600 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
                  : 'hover:bg-neutral-100 dark:hover:bg-neutral-900 text-neutral-700 dark:text-neutral-300'
              } ${!currentUser ? 'opacity-50 cursor-not-allowed' : ''}`}
              title={currentUser ? (isBookmarked ? 'Remove bookmark' : 'Add bookmark') : 'Login to bookmark'}
            >
              <svg class={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </button>

            <div class="relative">
              <button
                type="button"
                onclick={() => showShareMenu = !showShareMenu}
                class="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-full transition-colors"
              >
                <svg class="w-5 h-5 text-neutral-700 dark:text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </button>

              {#if showShareMenu}
                <div class="absolute right-0 mt-2 w-48 bg-white dark:bg-neutral-900 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-800">
                  <button
                    type="button"
                    onclick={() => handleShare('twitter')}
                    class="w-full px-4 py-2 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800 flex items-center gap-3"
                  >
                    Share on X
                  </button>
                  <button
                    type="button"
                    onclick={() => handleShare('facebook')}
                    class="w-full px-4 py-2 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800 flex items-center gap-3"
                  >
                    Share on Facebook
                  </button>
                  <button
                    type="button"
                    onclick={() => handleShare('linkedin')}
                    class="w-full px-4 py-2 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800 flex items-center gap-3"
                  >
                    Share on LinkedIn
                  </button>
                </div>
              {/if}
            </div>

            <button
              type="button"
              onclick={handleCopyIdentifier}
              class="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-full transition-colors"
            >
              {#if copied}
                <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              {:else}
                <svg class="w-5 h-5 text-neutral-700 dark:text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              {/if}
            </button>
          </div>
        </div>
      </div>
    </header>

    {#if heroImage}
      <div class="relative w-full h-[70vh] min-h-[500px] max-h-[800px] mt-16 overflow-hidden">
        <img
          src={heroImage}
          alt={article.title || 'Article hero image'}
          class="absolute inset-0 w-full h-full object-cover"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>

        <div class="absolute inset-0 flex items-end">
          <div class="max-w-screen-lg mx-auto px-6 lg:px-8 pb-12 w-full">
            <h1 class="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-6 leading-[1.1] tracking-tight font-serif drop-shadow-2xl">
              {article.title || 'Untitled'}
            </h1>

            <div class="flex items-center gap-4">
              <button
                type="button"
                onclick={() => window.location.href = `/p/${nip19.npubEncode(article.pubkey)}`}
                class="flex-shrink-0"
              >
                <Avatar {ndk} pubkey={article.pubkey} class="w-12 h-12 sm:w-14 sm:h-14 ring-2 ring-white hover:ring-4 transition-all" />
              </button>

              <div class="text-white">
                <button
                  type="button"
                  onclick={() => window.location.href = `/p/${nip19.npubEncode(article.pubkey)}`}
                  class="font-semibold text-lg hover:text-white/80 transition-colors block"
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
          <div class="mt-12 border-t border-neutral-200 dark:border-neutral-800" />
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
{/if}
