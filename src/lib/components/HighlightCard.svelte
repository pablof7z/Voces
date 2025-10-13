<script lang="ts">
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import { ndk } from '$lib/ndk.svelte';
  import { Avatar } from '@nostr-dev-kit/svelte';
  import TimeAgo from './TimeAgo.svelte';
  import { EventContent } from '@nostr-dev-kit/svelte';

  interface Props {
    event: NDKEvent;
    variant?: 'default' | 'compact';
  }

  let { event, variant = 'default' }: Props = $props();

  const author = ndk.$fetchUser(() => event.pubkey);
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
  const context = $derived(contextTag ? contextTag[1] : null);

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
      // Nostr article reference
      return {
        type: 'article' as const,
        displayText: 'Article',
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
</script>

{#if variant === 'compact'}
  <div class="block p-4 hover:bg-card/30 transition-colors rounded-lg group">
    <div class="relative">
      <!-- Highlight marker line on the left -->
      <div class="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-yellow-400 to-orange-500 rounded-full" />

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
  <div class="block p-6 hover:bg-card/30 transition-colors border-b border-border last:border-b-0 group">
    <!-- Author header -->
    <div class="flex items-start gap-3 mb-4">
      <Avatar {ndk} pubkey={event.pubkey} class="w-10 h-10 rounded-full flex-shrink-0" />
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 flex-wrap">
          <span class="font-semibold text-foreground">{authorName}</span>
          <span class="text-muted-foreground text-sm">highlighted</span>
          {#if publishedAt}
            <span class="text-muted-foreground">·</span>
            <TimeAgo timestamp={publishedAt} class="text-muted-foreground text-sm" />
          {/if}
        </div>
      </div>
    </div>

    <!-- Main highlight content -->
    <div class="relative mb-4">
      <!-- Highlighter effect background -->
      <div class="absolute -inset-3 bg-gradient-to-r from-yellow-400/5 via-yellow-400/10 to-yellow-400/5 rounded-xl" />
      <div class="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-yellow-400 via-orange-500 to-yellow-600 rounded-full shadow-lg shadow-yellow-500/20" />

      <div class="relative pl-6">
        <p class="text-neutral-50 text-lg sm:text-xl leading-relaxed font-serif italic">
          <span class="text-yellow-400/40 text-2xl mr-1">"</span>{highlightContent}<span class="text-yellow-400/40 text-2xl ml-1">"</span>
        </p>
      </div>
    </div>

    <!-- Context if available -->
    {#if context}
      <div class="mb-4 pl-6 border-l-2 border-border">
        <p class="text-muted-foreground text-sm leading-relaxed">
          ...{context}...
        </p>
      </div>
    {/if}

    <!-- Source reference -->
    {#if sourceInfo}
      <div class="flex items-center gap-2 text-sm text-muted-foreground pl-6">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
        <span>From:</span>
        {#if sourceInfo.type === 'web' && sourceInfo.url}
          <a
            href={sourceInfo.url}
            target="_blank"
            rel="noopener noreferrer"
            class="hover:text-primary transition-colors flex items-center gap-1"
          >
            <span>{sourceInfo.displayText}</span>
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        {:else}
          <span>{sourceInfo.displayText}</span>
        {/if}
      </div>
    {/if}

    <!-- Actions bar -->
    <div class="flex items-center gap-6 mt-4 pl-6 text-muted-foreground text-sm">
      <button class="flex items-center gap-1.5 hover:text-primary transition-colors group-hover:opacity-100 opacity-60">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <span>Comment</span>
      </button>

      <button class="flex items-center gap-1.5 hover:text-primary transition-colors group-hover:opacity-100 opacity-60">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        <span>Share</span>
      </button>
    </div>
  </div>
{/if}
