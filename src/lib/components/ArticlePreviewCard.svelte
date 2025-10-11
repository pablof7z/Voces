<script lang="ts">
  import type { NDKArticle } from '@nostr-dev-kit/ndk';
  import { nip19 } from 'nostr-tools';
  import { ndk } from '$lib/ndk.svelte';
  import TimeAgo from './TimeAgo.svelte';

  interface Props {
    article: NDKArticle;
    variant?: 'default' | 'compact';
  }

  const MAX_EXCERPT_LENGTH = 150;
  const THUMBNAIL_SIZE = 'w-32 h-24 sm:w-40 sm:h-28';

  let { article, variant = 'default' }: Props = $props();

  const authorProfile = ndk.$fetchProfile(() => article.pubkey);
  const title = $derived(article.title || 'Untitled');
  const summary = $derived(article.summary);

  const excerpt = $derived.by(() => {
    const text = summary || article.content;
    return text.slice(0, MAX_EXCERPT_LENGTH) + (text.length > MAX_EXCERPT_LENGTH ? '...' : '');
  });

  const publishedAt = $derived(article.published_at || article.created_at);
  const imageUrl = $derived(article.image);

  const naddr = $derived.by(article.encode);

  const authorName = $derived(authorProfile?.name || authorProfile?.displayName || 'Anonymous');
</script>

{#if variant === 'compact'}
  <a
    href="/article/{naddr}"
    class="block p-3 hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors rounded-lg"
  >
    <div class="flex items-start gap-3">
      <div class="flex-shrink-0 w-10 h-10 bg-orange-500/10 dark:bg-orange-500/20 rounded-lg flex items-center justify-center">
        <svg class="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <div class="flex-1 min-w-0">
        <h3 class="font-semibold text-sm text-neutral-900 dark:text-white line-clamp-2 mb-1">
          {title}
        </h3>
        <div class="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
          <span>{authorName}</span>
          {#if publishedAt}
            <span>·</span>
            <TimeAgo timestamp={publishedAt} />
          {/if}
        </div>
      </div>
    </div>
  </a>
{:else}
  <a
    href="/article/{naddr}"
    class="block p-4 sm:p-6 hover:bg-neutral-900/30 transition-colors border-b border-neutral-800/50 last:border-b-0"
  >
    <div class="flex gap-4 sm:gap-6">
      <div class="flex-1 min-w-0">
        <h3 class="font-bold text-xl sm:text-2xl text-white mb-2 line-clamp-2 font-serif">
          {title}
        </h3>
        <p class="text-neutral-400 text-sm sm:text-base mb-4 line-clamp-3 leading-relaxed">
          {excerpt}
        </p>
        <div class="flex items-center gap-3 text-xs sm:text-sm text-neutral-500">
          <span class="font-medium">{authorName}</span>
          {#if publishedAt}
            <span>·</span>
            <span class="flex items-center gap-1">
              <svg class="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <TimeAgo timestamp={publishedAt} />
            </span>
          {/if}
        </div>
      </div>

      {#if imageUrl}
        <div class="{THUMBNAIL_SIZE} flex-shrink-0 rounded-lg overflow-hidden bg-neutral-800">
          <img
            src={imageUrl}
            alt={title}
            class="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      {:else}
        <div class="{THUMBNAIL_SIZE} flex-shrink-0 rounded-lg bg-orange-500/10 flex items-center justify-center">
          <svg class="w-8 h-8 sm:w-10 sm:h-10 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
      {/if}
    </div>
  </a>
{/if}
