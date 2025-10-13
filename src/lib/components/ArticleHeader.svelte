<script lang="ts">
  import type { NDKArticle } from '@nostr-dev-kit/ndk';
  import { ndk } from '$lib/ndk.svelte';
  import { Avatar } from '@nostr-dev-kit/svelte';
  import { nip19 } from 'nostr-tools';

  interface Props {
    article: NDKArticle;
  }

  let { article }: Props = $props();

  const authorProfile = ndk.$fetchProfile(() => article.pubkey);
  const currentUser = ndk.$currentUser;
  const title = $derived(article.title || 'Untitled');
  const summary = $derived(article.summary);
  const publishedAt = $derived(article.published_at);

  const wordsPerMinute = 200;
  const readingTime = $derived.by(() => {
    const words = article.content?.split(/\s+/).length || 0;
    return Math.ceil(words / wordsPerMinute);
  });

  const authorName = $derived(authorProfile?.name || authorProfile?.displayName || 'Anonymous');
  const authorBio = $derived(authorProfile?.about);
  const isOwnArticle = $derived(currentUser?.pubkey === article.pubkey);
  const npub = $derived(nip19.npubEncode(article.pubkey));

  const firstParagraph = $derived.by(() => {
    if (!article.content) return '';
    const paragraphs = article.content.trim().split(/\n\n+/);
    return paragraphs[0]?.trim() || '';
  });

  const shouldShowSummary = $derived.by(() => {
    if (!summary) return false;
    const normalizedSummary = summary.trim().toLowerCase();
    const normalizedFirstParagraph = firstParagraph.toLowerCase();
    return normalizedSummary !== normalizedFirstParagraph;
  });

  function navigateToProfile() {
    window.location.href = `/p/${npub}`;
  }
</script>

<div class="mb-12">
  <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold text-neutral-900 dark:text-foreground mb-6 leading-[1.1] tracking-tight font-serif">
    {title}
  </h1>

  {#if shouldShowSummary}
    <p class="text-xl sm:text-2xl text-muted-foreground dark:text-muted-foreground mb-8 leading-relaxed font-light">
      {summary}
    </p>
  {/if}

  <div class="flex items-start sm:items-center gap-4 mb-8">
    <button type="button" onclick={navigateToProfile} class="flex-shrink-0">
      <Avatar {ndk} pubkey={article.pubkey} class="w-12 h-12 sm:w-14 sm:h-14 ring-2 ring-white dark:ring-black hover:ring-4 transition-all" />
    </button>

    <div class="flex-1">
      <div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
        <button type="button" onclick={navigateToProfile} class="group text-left">
          <div class="font-semibold text-lg text-neutral-900 dark:text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {authorName}
          </div>
          {#if authorBio}
            <p class="text-sm text-muted-foreground dark:text-muted-foreground line-clamp-1 max-w-md">
              {authorBio}
            </p>
          {/if}
        </button>
      </div>
    </div>
  </div>

  <div class="flex items-center gap-2 text-sm text-muted-foreground dark:text-muted-foreground">
    {#if publishedAt}
      <time datetime={new Date(publishedAt * 1000).toISOString()}>
        {new Date(publishedAt * 1000).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}
      </time>
      <span>·</span>
    {/if}
    <span>{readingTime} min read</span>
  </div>

  <div class="mt-8 border-t border" />
</div>
