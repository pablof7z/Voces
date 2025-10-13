<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { ndk } from '$lib/ndk.svelte';
  import { layoutMode } from '$lib/stores/layoutMode.svelte';
  import { fetchArticleByNaddr } from '$lib/utils/fetchArticle';
  import ArticleHeader from '$lib/components/ArticleHeader.svelte';
  import ArticleContent from '$lib/components/ArticleContent.svelte';
  import CommentSection from '$lib/components/CommentSection.svelte';
  import TextHighlightToolbar from '$lib/components/TextHighlightToolbar.svelte';
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
  let highlights = $state<NDKEvent[]>([]);
  let showHighlightToolbar = $state(false);
  let selectedText = $state('');
  let selectedRange = $state<Range | null>(null);
  let toolbarPosition = $state({ x: 0, y: 0 });

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

  async function fetchHighlights() {
    if (!article) return;

    try {
      const articleTag = article.tagId();
      const highlightEvents = await ndk.fetchEvents({
        kinds: [9802], // NIP-84 Highlight kind
        '#a': [articleTag],
      });

      highlights = Array.from(highlightEvents);
    } catch (err) {
      console.error('Failed to fetch highlights:', err);
    }
  }

  function handleTextSelected(text: string, range: Range) {
    selectedText = text;
    selectedRange = range;

    const rect = range.getBoundingClientRect();
    toolbarPosition = {
      x: rect.left + rect.width / 2,
      y: rect.top + window.scrollY,
    };

    showHighlightToolbar = true;
  }

  function handleHighlightCreated() {
    showHighlightToolbar = false;
    selectedText = '';
    selectedRange = null;

    // Clear the text selection
    window.getSelection()?.removeAllRanges();

    // Refresh highlights
    fetchHighlights();
  }

  function handleCancelHighlight() {
    showHighlightToolbar = false;
    selectedText = '';
    selectedRange = null;

    // Clear the text selection
    window.getSelection()?.removeAllRanges();
  }

  async function handleBookmark() {
    if (!currentUser || !article) return;

    try {
      const bookmarksNaddr = nip19.naddrEncode({
        kind: NDKKind.ArticleCurationSet,
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
        bookmarkList.addItem(article);
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
    layoutMode.setArticleMode();

    if (naddr) {
      loadArticle().then(() => {
        if (article) {
          checkBookmark();
          fetchHighlights();
        }
      });
    }

    return () => {
      layoutMode.reset();
    };
  });
</script>

{#if isLoading}
  <div class="flex flex-col items-center justify-center min-h-screen bg-card">
    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-foreground"></div>
    <p class="mt-4 text-muted-foreground">Loading article...</p>
  </div>
{:else if error || !article}
  <div class="flex flex-col items-center justify-center min-h-screen px-4 bg-card">
    <h1 class="text-2xl font-bold text-foreground mb-2">Article Not Found</h1>
    <p class="text-muted-foreground mb-4">{error || 'The article could not be loaded.'}</p>
    <button
      type="button"
      onclick={() => goto('/')}
      class="px-4 py-2 bg-card dark:bg-white text-foreground dark:text-black rounded-full hover:bg-muted dark:hover:bg-neutral-100 transition-colors text-sm font-medium"
    >
      Go Home
    </button>
  </div>
{:else}
  <div class="article-container">
    <!-- Header -->
    <header class="article-header">
      <button class="back-btn" onclick={goBack}>
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <h1>{article.title || 'Article'}</h1>
      <div class="article-actions">
        <button
          type="button"
          onclick={handleBookmark}
          disabled={!currentUser}
          class="action-btn {isBookmarked ? 'bookmarked' : ''}"
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
            class="action-btn"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>

          {#if showShareMenu}
            <div class="share-menu">
              <button
                type="button"
                onclick={() => handleShare('twitter')}
                class="share-menu-item"
              >
                Share on X
              </button>
              <button
                type="button"
                onclick={() => handleShare('facebook')}
                class="share-menu-item"
              >
                Share on Facebook
              </button>
              <button
                type="button"
                onclick={() => handleShare('linkedin')}
                class="share-menu-item"
              >
                Share on LinkedIn
              </button>
            </div>
          {/if}
        </div>

        <button
          type="button"
          onclick={handleCopyIdentifier}
          class="action-btn"
        >
          {#if copied}
            <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          {:else}
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          {/if}
        </button>
      </div>
    </header>

    <!-- Content -->

    {#if heroImage}
      <div class="hero-image">
        <img
          src={heroImage}
          alt={article.title || 'Article hero image'}
          class="hero-img"
        />
        <div class="hero-overlay"></div>

        <div class="hero-content">
          <div class="hero-text">
            <h2 class="hero-title">
              {article.title || 'Untitled'}
            </h2>

            <div class="hero-author">
              <button
                type="button"
                onclick={() => window.location.href = `/p/${nip19.npubEncode(article.pubkey)}`}
                class="author-avatar"
              >
                <Avatar {ndk} pubkey={article.pubkey} class="w-10 h-10 sm:w-12 sm:h-12 rounded-full" />
              </button>

              <div class="author-info">
                <button
                  type="button"
                  onclick={() => window.location.href = `/p/${nip19.npubEncode(article.pubkey)}`}
                  class="author-name"
                >
                  {authorName}
                </button>
                <div class="author-date">
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

    <main class="article-main">
      <article class="article-content">
        {#if userError}
          <div class="error-banner">
            <p>{userError}</p>
            <button
              type="button"
              onclick={() => userError = null}
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        {/if}

        {#if !heroImage}
          <ArticleHeader {article} />
        {/if}

        <ArticleContent
          content={article.content}
          emojiTags={article.tags}
          {highlights}
          onTextSelected={handleTextSelected}
        />
      </article>

      {#if showHighlightToolbar && article}
        <TextHighlightToolbar
          {article}
          {selectedText}
          position={toolbarPosition}
          onHighlightCreated={handleHighlightCreated}
          onCancel={handleCancelHighlight}
        />
      {/if}

      <div class="comments-section">
        <CommentSection {article} onError={(err) => userError = err} />
      </div>
    </main>
  </div>
{/if}

<style>
  .article-container {
    width: 100%;
    min-height: 100vh;
    background: var(--color-card);
  }

  .article-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem;
    border-bottom: 1px solid var(--color-border);
    background: var(--color-background);
    position: sticky;
    top: 0;
    z-index: 10;
  }

  .back-btn {
    padding: 0.5rem;
    background: transparent;
    border: none;
    color: var(--color-foreground);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    border-radius: 8px;
    flex-shrink: 0;
  }

  .back-btn:hover {
    background: var(--color-muted);
  }

  .back-btn svg {
    width: 1.5rem;
    height: 1.5rem;
  }

  .article-header h1 {
    font-size: 1.125rem;
    font-weight: 700;
    margin: 0;
    color: var(--color-foreground);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1;
    min-width: 0;
  }

  .article-actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-shrink: 0;
  }

  .action-btn {
    padding: 0.5rem;
    background: transparent;
    border: none;
    color: var(--color-muted-foreground);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    border-radius: 8px;
  }

  .action-btn:hover {
    background: var(--color-muted);
    color: var(--color-foreground);
  }

  .action-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .action-btn.bookmarked {
    color: #eab308;
  }

  .share-menu {
    position: absolute;
    right: 0;
    top: calc(100% + 0.5rem);
    min-width: 12rem;
    background: var(--color-popover);
    border: 1px solid var(--color-border);
    border-radius: 0.5rem;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    overflow: hidden;
  }

  .share-menu-item {
    width: 100%;
    padding: 0.75rem 1rem;
    text-align: left;
    background: transparent;
    border: none;
    color: var(--color-foreground);
    cursor: pointer;
    transition: background 0.2s;
    font-size: 0.875rem;
  }

  .share-menu-item:hover {
    background: var(--color-muted);
  }

  .hero-image {
    position: relative;
    width: 100%;
    height: 50vh;
    min-height: 400px;
    max-height: 600px;
    overflow: hidden;
  }

  .hero-img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .hero-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.5), transparent);
  }

  .hero-content {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: flex-end;
  }

  .hero-text {
    width: 100%;
    max-width: 56rem;
    margin: 0 auto;
    padding: 0 1.5rem 2rem;
  }

  .hero-title {
    font-size: clamp(1.5rem, 4vw, 3rem);
    font-weight: 700;
    color: white;
    margin: 0 0 1rem 0;
    line-height: 1.2;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
  }

  .hero-author {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .author-avatar {
    flex-shrink: 0;
    border: none;
    background: transparent;
    cursor: pointer;
    padding: 0;
    transition: opacity 0.2s;
  }

  .author-avatar:hover {
    opacity: 0.8;
  }

  .author-info {
    color: white;
  }

  .author-name {
    font-weight: 600;
    display: block;
    background: transparent;
    border: none;
    color: white;
    cursor: pointer;
    padding: 0;
    font-size: 1rem;
    transition: opacity 0.2s;
    text-align: left;
  }

  .author-name:hover {
    opacity: 0.8;
  }

  .author-date {
    font-size: 0.875rem;
    opacity: 0.9;
    margin-top: 0.25rem;
  }

  .article-main {
    padding: 2rem 0;
  }

  .article-content {
    max-width: 48rem;
    margin: 0 auto;
    padding: 2rem 1.5rem;
    background: var(--color-card);
    border-radius: 0.75rem;
  }

  .error-banner {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 1.5rem;
    padding: 1rem;
    background: var(--color-destructive);
    border: 1px solid var(--color-border);
    border-radius: 0.5rem;
  }

  .error-banner p {
    margin: 0;
    color: var(--color-foreground);
  }

  .error-banner button {
    background: transparent;
    border: none;
    color: var(--color-foreground);
    cursor: pointer;
    padding: 0;
    transition: opacity 0.2s;
  }

  .error-banner button:hover {
    opacity: 0.7;
  }

  .comments-section {
    max-width: 48rem;
    margin: 4rem auto 0;
    padding: 0 1.5rem;
  }

  @media (max-width: 640px) {
    .article-header h1 {
      font-size: 1rem;
    }

    .article-actions {
      gap: 0.25rem;
    }

    .action-btn {
      padding: 0.375rem;
    }

    .hero-image {
      height: 40vh;
      min-height: 300px;
    }

    .article-content {
      padding: 1.5rem 1rem;
    }
  }
</style>
