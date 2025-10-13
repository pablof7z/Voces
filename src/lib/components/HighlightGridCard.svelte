<script lang="ts">
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import { ndk } from '$lib/ndk.svelte';
  import { Avatar } from '@nostr-dev-kit/svelte';

  interface Props {
    event: NDKEvent;
  }

  let { event }: Props = $props();

  const author = ndk.$fetchUser(() => event.pubkey);
  const authorProfile = ndk.$fetchProfile(() => event.pubkey);
  const authorName = $derived(authorProfile?.name || authorProfile?.displayName || 'Anonymous');

  const highlightContent = $derived(event.content);

  // Get the source reference
  const sourceTag = $derived.by(() => {
    const aTag = event.tags.find(t => t[0] === 'a');
    const eTag = event.tags.find(t => t[0] === 'e');
    const rTag = event.tags.find(t => t[0] === 'r');
    return aTag || eTag || rTag;
  });

  const sourceInfo = $derived.by(() => {
    if (!sourceTag) return null;

    const type = sourceTag[0];
    const value = sourceTag[1];

    if (type === 'r') {
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
    }
    return {
      type: type === 'a' ? ('article' as const) : ('event' as const),
      displayText: type === 'a' ? 'Article' : 'Note',
      value
    };
  });

  // Truncate content for grid display
  const displayContent = $derived.by(() => {
    const maxLength = 180;
    return highlightContent.length > maxLength
      ? highlightContent.slice(0, maxLength) + '...'
      : highlightContent;
  });
</script>

<div class="group relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-yellow-400/10 via-orange-500/10 to-yellow-600/10 hover:from-yellow-400/20 hover:via-orange-500/20 hover:to-yellow-600/20 transition-all duration-300 cursor-pointer">
  <!-- Background pattern -->
  <div class="absolute inset-0 opacity-5">
    <div class="absolute inset-0" style="background-image: repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255, 255, 255, 0.1) 10px, rgba(255, 255, 255, 0.1) 20px);" />
  </div>

  <!-- Highlight marker on the left -->
  <div class="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b from-yellow-400 via-orange-500 to-yellow-600" />

  <!-- Content container -->
  <div class="relative h-full p-5 flex flex-col">
    <!-- Highlighted text -->
    <div class="flex-1 mb-4 overflow-hidden">
      <div class="relative">
        <!-- Large opening quote -->
        <span class="absolute -top-2 -left-1 text-5xl text-yellow-400/30 font-serif leading-none">"</span>

        <!-- Text content -->
        <p class="relative text-foreground text-sm leading-relaxed font-serif italic pl-6 line-clamp-6">
          {displayContent}
        </p>
      </div>
    </div>

    <!-- Bottom section with author and source -->
    <div class="flex items-center gap-2 mt-auto pt-3 border-t border-yellow-500/20">
      <Avatar {ndk} pubkey={event.pubkey} class="w-6 h-6 rounded-full flex-shrink-0" />
      <div class="flex-1 min-w-0">
        <p class="text-xs font-medium text-muted-foreground truncate">{authorName}</p>
        {#if sourceInfo}
          <p class="text-xs text-muted-foreground truncate flex items-center gap-1">
            {#if sourceInfo.type === 'web'}
              <svg class="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            {:else}
              <svg class="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            {/if}
            <span class="truncate">{sourceInfo.displayText}</span>
          </p>
        {/if}
      </div>
    </div>
  </div>

  <!-- Hover overlay -->
  <div class="absolute inset-0 bg-gradient-to-t from-neutral-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
</div>
