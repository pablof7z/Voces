<script lang="ts">
  import type { NDKArticle } from '@nostr-dev-kit/ndk';
  import { ndk } from '$lib/ndk.svelte';
  import TimeAgo from './TimeAgo.svelte';
  import { getArticleUrl } from '$lib/utils/articleUrl';

  interface Props {
    article: NDKArticle;
  }

  const CARD_WIDTH = 240;
  const CARD_HEIGHT = 360;

  let { article }: Props = $props();

  const author = ndk.$fetchUser(() => article.pubkey);
  const authorProfile = ndk.$fetchProfile(() => article.pubkey);
  const title = $derived(article.title || 'Untitled');
  const summary = $derived(article.summary);
  const imageUrl = $derived(article.image);
  const publishedAt = $derived(article.published_at || article.created_at);
  const articleUrl = $derived(getArticleUrl(article, author));
  const authorName = $derived(authorProfile?.name || authorProfile?.displayName || 'Anonymous');

  const excerpt = $derived.by(() => {
    const text = summary || article.content;
    return text.slice(0, 100) + (text.length > 100 ? '...' : '');
  });
</script>

<a
  href={articleUrl}
  class="group block flex-shrink-0 rounded-2xl overflow-hidden bg-card hover:bg-muted transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-orange-500/10"
  style="width: {CARD_WIDTH}px; height: {CARD_HEIGHT}px;"
>
  <!-- Cover Image -->
  <div class="relative w-full h-48 overflow-hidden bg-gradient-to-br from-orange-500/20 to-red-500/20">
    {#if imageUrl}
      <img
        src={imageUrl}
        alt={title}
        class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        loading="lazy"
      />
      <!-- Gradient overlay for better text readability -->
      <div class="absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-transparent opacity-60" />
    {:else}
      <div class="w-full h-full flex items-center justify-center">
        <svg class="w-16 h-16 text-primary/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
    {/if}
  </div>

  <!-- Content -->
  <div class="p-4 flex flex-col h-[calc(100%-12rem)]">
    <!-- Title -->
    <h3 class="font-bold text-base text-foreground mb-2 line-clamp-2 leading-snug font-serif">
      {title}
    </h3>

    <!-- Excerpt -->
    <p class="text-muted-foreground text-xs mb-3 line-clamp-3 leading-relaxed flex-1">
      {excerpt}
    </p>

    <!-- Meta -->
    <div class="flex items-center gap-2 mt-auto pt-2 border-t border-border">
      <div class="flex-1 min-w-0">
        <p class="text-xs font-medium text-muted-foreground truncate">{authorName}</p>
        {#if publishedAt}
          <p class="text-xs text-muted-foreground">
            <TimeAgo timestamp={publishedAt} />
          </p>
        {/if}
      </div>
      <svg class="w-5 h-5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
    </div>
  </div>
</a>
