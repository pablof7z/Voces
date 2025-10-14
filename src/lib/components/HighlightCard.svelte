<script lang="ts">
  import { type NDKEvent, NDKArticle } from '@nostr-dev-kit/ndk';
  import { ndk } from '$lib/ndk.svelte';
  import { Avatar } from '@nostr-dev-kit/svelte';
  import TimeAgo from './TimeAgo.svelte';
  import EventActions from './EventActions.svelte';
  import { getArticleUrl } from '$lib/utils/articleUrl';

  interface Props {
    event: NDKEvent;
    variant?: 'default' | 'compact' | 'feed';
  }

  let { event, variant = 'default' }: Props = $props();

  const authorProfile = ndk.$fetchProfile(() => event.pubkey);
  const authorName = $derived(authorProfile?.name || authorProfile?.displayName || 'Anonymous');

  // Extract the highlighted content
  const highlightContent = $derived(event.content);

  // Get the source reference (could be 'a', 'e', or 'r' tag)
  const sourceTag = $derived.by(() => {
    const aTag = event.tags.find(t => t[0] === 'a');
    const eTag = event.tags.find(t => t[0] === 'e');
    const rTag = event.tags.find(t => t[0] === 'r');
    return aTag || eTag || rTag;
  });

  // Get context tag if available
  const contextTag = $derived(event.tags.find(t => t[0] === 'context'));

  // State for referenced article
  let referencedArticle = $state<NDKArticle | undefined>(undefined);

  // Fetch article if referenced
  $effect(() => {
    if (!sourceTag || sourceTag[0] !== 'a') {
      referencedArticle = undefined;
      return;
    }

    const aTagValue = sourceTag[1];
    // Parse a tag format: "kind:pubkey:d-tag"
    const parts = aTagValue.split(':');
    if (parts.length !== 3) {
      referencedArticle = undefined;
      return;
    }

    const [kind, pubkey, dTag] = parts;
    ndk.fetchEvent({
      kinds: [parseInt(kind)],
      authors: [pubkey],
      '#d': [dTag]
    }).then((article) => {
      if (article) {
        referencedArticle = NDKArticle.from(article);
      }
    });
  });

  // Determine the source type and get reference
  const sourceInfo = $derived.by(() => {
    if (!sourceTag) return null;

    const type = sourceTag[0];
    const value = sourceTag[1];

    if (type === 'r') {
      // Web URL
      try {
        const url = new URL(value);
        return {
          type: 'web' as const,
          displayText: url.hostname.replace('www.', ''),
          url: value
        };
      } catch {
        return {
          type: 'web' as const,
          displayText: value,
          url: value
        };
      }
    } else if (type === 'a') {
      // Nostr article reference - extract title from fetched article
      const article = referencedArticle;
      const title = article?.tags.find(t => t[0] === 'title')?.[1];
      return {
        type: 'article' as const,
        displayText: title || 'Article',
        value
      };
    } else if (type === 'e') {
      // Nostr event reference
      return {
        type: 'event' as const,
        displayText: 'Note',
        value
      };
    }
    return null;
  });

  const publishedAt = $derived(event.created_at);

  function navigateToProfile() {
    window.location.href = `/p/${event.author.npub}`;
  }

  function navigateToSource() {
    if (sourceInfo?.type === 'web' && sourceInfo.url) {
      window.open(sourceInfo.url, '_blank', 'noopener,noreferrer');
    } else if (sourceInfo?.type === 'article' && referencedArticle) {
      const articleUrl = getArticleUrl(referencedArticle);
      window.location.href = articleUrl;
    }
  }
</script>

{#if variant === 'feed'}
  <article class="p-3 sm:p-4 hover:bg-card/30 transition-colors border-b border-border">
    <!-- Author header -->
    <div class="flex items-center gap-2 sm:gap-3 mb-3">
      <button
        type="button"
        onclick={(e) => { e.stopPropagation(); navigateToProfile(); }}
        class="flex-shrink-0"
      >
        <Avatar {ndk} pubkey={event.pubkey} class="w-9 h-9 sm:w-12 sm:h-12 rounded-full hover:opacity-80 transition-opacity" />
      </button>
      <div class="flex items-center gap-2 flex-1 min-w-0">
        <div class="flex items-center gap-2 min-w-0 flex-shrink">
          <span class="text-base font-semibold text-foreground truncate min-w-0">{authorName}</span>
          <span class="text-muted-foreground text-sm truncate min-w-0">@{authorProfile?.name || event.pubkey.slice(0, 8)}</span>
        </div>
        <span class="text-muted-foreground text-sm flex-shrink-0">·</span>
        {#if publishedAt}
          <TimeAgo timestamp={publishedAt} class="text-muted-foreground text-sm flex-shrink-0" />
        {/if}
      </div>
    </div>

    <!-- Book page style highlight -->
    <div
      onclick={(sourceInfo?.type === 'web' || sourceInfo?.type === 'article') ? navigateToSource : undefined}
      class="relative aspect-square rounded-lg overflow-hidden bg-[#f9f7f4] shadow-lg mb-2 {(sourceInfo?.type === 'web' || sourceInfo?.type === 'article') ? 'cursor-pointer' : ''}"
    >
      <!-- Paper texture overlay -->
      <div class="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxwYXRoIGQ9Ik0wIDBoMzAwdjMwMEgweiIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIuMDUiLz48L3N2Zz4=')]" />

      <!-- Content -->
      <div class="relative h-full flex flex-col items-center justify-center p-8 sm:p-12">
        <!-- Yellow highlight bar (like a highlighter mark) -->
        <div class="absolute left-0 right-0 top-[35%] bottom-[35%] bg-yellow-300/20" />

        <!-- Highlighted text -->
        <div class="relative z-10">
          <p class="text-neutral-900 text-2xl sm:text-3xl md:text-4xl font-serif leading-relaxed text-center">
            {highlightContent}
          </p>
        </div>
      </div>

      <!-- Source badge (small, bottom right corner) -->
      {#if sourceInfo}
        <div class="absolute bottom-3 right-3 flex items-center gap-2 px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded text-xs text-neutral-600">
          {#if sourceInfo.type === 'web'}
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          {:else if sourceInfo.type === 'article'}
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          {:else}
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
          {/if}
          <span class="max-w-[200px] truncate">{sourceInfo.displayText}</span>
        </div>
      {/if}
    </div>

    <!-- Actions -->
    <EventActions {event} />
  </article>
{:else if variant === 'compact'}
  <div class="block p-4 hover:bg-card/30 transition-colors rounded-lg group">
    <div class="relative">
      <!-- Highlight marker line on the left -->
      <div class="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-yellow-400 to-primary rounded-full" />

      <div class="pl-4">
        <!-- Highlighted text -->
        <div class="mb-3 relative">
          <div class="absolute -inset-2 bg-yellow-400/10 rounded-lg" />
          <p class="relative text-foreground text-base leading-relaxed font-serif italic">
            "{highlightContent}"
          </p>
        </div>

        <!-- Meta information -->
        <div class="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{authorName}</span>
          {#if publishedAt}
            <span>·</span>
            <TimeAgo timestamp={publishedAt} />
          {/if}
          {#if sourceInfo}
            <span>·</span>
            <span class="flex items-center gap-1">
              {#if sourceInfo.type === 'web'}
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              {:else}
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              {/if}
              {sourceInfo.displayText}
            </span>
          {/if}
        </div>
      </div>
    </div>
  </div>
{:else}
  <article class="p-3 sm:p-4 hover:bg-card/30 transition-colors border-b border-border">
    <!-- Author header -->
    <div class="flex items-center gap-2 sm:gap-3 mb-3">
      <button
        type="button"
        onclick={(e) => { e.stopPropagation(); navigateToProfile(); }}
        class="flex-shrink-0"
      >
        <Avatar {ndk} pubkey={event.pubkey} class="w-9 h-9 sm:w-12 sm:h-12 rounded-full hover:opacity-80 transition-opacity" />
      </button>
      <div class="flex items-center gap-2 flex-1 min-w-0">
        <div class="flex items-center gap-2 min-w-0 flex-shrink">
          <span class="text-base font-semibold text-foreground truncate min-w-0">{authorName}</span>
          <span class="text-muted-foreground text-sm truncate min-w-0">@{authorProfile?.name || event.pubkey.slice(0, 8)}</span>
        </div>
        <span class="text-muted-foreground text-sm flex-shrink-0">·</span>
        {#if publishedAt}
          <TimeAgo timestamp={publishedAt} class="text-muted-foreground text-sm flex-shrink-0" />
        {/if}
      </div>
    </div>

    <!-- Book page style highlight -->
    <div
      onclick={(sourceInfo?.type === 'web' || sourceInfo?.type === 'article') ? navigateToSource : undefined}
      class="relative aspect-square rounded-lg overflow-hidden bg-[#f9f7f4] shadow-lg mb-2 {(sourceInfo?.type === 'web' || sourceInfo?.type === 'article') ? 'cursor-pointer' : ''}"
    >
      <!-- Paper texture overlay -->
      <div class="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxwYXRoIGQ9Ik0wIDBoMzAwdjMwMEgweiIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIuMDUiLz48L3N2Zz4=')]" />

      <!-- Content -->
      <div class="relative h-full flex flex-col items-center justify-center p-8 sm:p-12">
        <!-- Yellow highlight bar (like a highlighter mark) -->
        <div class="absolute left-0 right-0 top-[35%] bottom-[35%] bg-yellow-300/20" />

        <!-- Highlighted text -->
        <div class="relative z-10">
          <p class="text-neutral-900 text-2xl sm:text-3xl md:text-4xl font-serif leading-relaxed text-center">
            {highlightContent}
          </p>
        </div>
      </div>

      <!-- Source badge (small, bottom right corner) -->
      {#if sourceInfo}
        <div class="absolute bottom-3 right-3 flex items-center gap-2 px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded text-xs text-neutral-600">
          {#if sourceInfo.type === 'web'}
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          {:else if sourceInfo.type === 'article'}
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          {:else}
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
          {/if}
          <span class="max-w-[200px] truncate">{sourceInfo.displayText}</span>
        </div>
      {/if}
    </div>

    <!-- Actions -->
    <EventActions {event} />
  </article>
{/if}
