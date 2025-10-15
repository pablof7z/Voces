<script lang="ts">
  import { ndk } from '$lib/ndk.svelte';
  import { settings } from '$lib/stores/settings.svelte';
  import { NDKSubscriptionCacheUsage } from '@nostr-dev-kit/ndk';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import * as Dialog from '$lib/components/ui/dialog';
  import { SvelteMap } from 'svelte/reactivity';

  interface Props {
    selectedTags?: string[];
    onTagsChange?: (tags: string[]) => void;
    open?: boolean;
    onClose?: () => void;
  }

  let { selectedTags = [], onTagsChange, open = $bindable(false), onClose }: Props = $props();

  let isLoading = $state(false);
  let popularHashtags = $state<Array<{ tag: string; count: number }>>([]);
  let searchQuery = $state('');

  // Filter hashtags based on search
  const filteredHashtags = $derived.by(() => {
    if (!searchQuery) return popularHashtags;
    const query = searchQuery.toLowerCase();
    return popularHashtags.filter(h => h.tag.toLowerCase().includes(query));
  });

  // Check if search query is a new tag (not in results)
  const isNewTag = $derived.by(() => {
    if (!searchQuery.trim()) return false;
    const normalized = searchQuery.trim().toLowerCase().replace(/^#/, '');
    return !popularHashtags.some(h => h.tag.toLowerCase() === normalized) &&
           !selectedTags.some(t => t.toLowerCase() === normalized);
  });

  // Fetch popular hashtags when modal opens
  $effect(() => {
    if (open && popularHashtags.length === 0) {
      fetchPopularHashtags();
    }
  });

  async function fetchPopularHashtags() {
    isLoading = true;
    try {
      const relayUrl = settings.selectedRelay || settings.relays.find(r => r.enabled && r.read)?.url;

      const filters = [
        {
          kinds: [1, 20, 21, 22],
          limit: 500
        }
      ];

      const events = await ndk.fetchEvents(
        filters,
        {
          cacheUsage: relayUrl ? NDKSubscriptionCacheUsage.ONLY_RELAY : NDKSubscriptionCacheUsage.CACHE_FIRST,
          relayUrls: relayUrl ? [relayUrl] : undefined
        }
      );

      // Count hashtag occurrences
      const tagCounts = new SvelteMap<string, number>();

      for (const event of events) {
        const tTags = event.tags.filter(t => t[0] === 't' && t[1]);
        for (const tag of tTags) {
          const tagValue = tag[1].toLowerCase();
          tagCounts.set(tagValue, (tagCounts.get(tagValue) || 0) + 1);
        }
      }

      // Sort by count descending
      popularHashtags = Array.from(tagCounts.entries())
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 100); // Top 100 hashtags

    } catch (error) {
      console.error('Failed to fetch popular hashtags:', error);
    } finally {
      isLoading = false;
    }
  }

  function toggleTag(tag: string) {
    if (selectedTags.includes(tag)) {
      onTagsChange?.(selectedTags.filter(t => t !== tag));
    } else {
      onTagsChange?.([...selectedTags, tag]);
    }
  }

  function addCustomTag() {
    if (!isNewTag) return;
    const normalized = searchQuery.trim().toLowerCase().replace(/^#/, '');
    onTagsChange?.([...selectedTags, normalized]);
    searchQuery = '';
  }

  function handleSearchKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && isNewTag) {
      e.preventDefault();
      addCustomTag();
    }
  }

  function handleClose() {
    open = false;
    searchQuery = '';
    onClose?.();
  }
</script>

<Dialog.Root {open} onOpenChange={(newOpen) => {
    open = newOpen;
    if (!newOpen) handleClose();
  }}>
  <Dialog.Content class="max-w-xl max-h-[80vh] flex flex-col">
    <Dialog.Title>Select Hashtags</Dialog.Title>

    <!-- Search -->
    <div class="mb-4">
      <Input
        type="text"
        bind:value={searchQuery}
        onkeydown={handleSearchKeydown}
        placeholder="Search hashtags..."
        autofocus
      />
    </div>

    <!-- Add new tag hint -->
    {#if isNewTag}
      <button
        onclick={addCustomTag}
        class="w-full px-3 py-2 text-sm text-left border border-primary rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors mb-4"
      >
        <div class="flex items-center gap-2">
          <svg class="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          <span class="text-primary font-medium">
            Add custom tag: #{searchQuery.trim().toLowerCase().replace(/^#/, '')}
          </span>
        </div>
        <p class="text-xs text-muted-foreground mt-1 ml-6">
          Press Enter or click to add
        </p>
      </button>
    {/if}

    <!-- Selected tags -->
    {#if selectedTags.length > 0}
      <div class="mb-4 flex flex-wrap gap-2">
        {#each selectedTags as tag (tag)}
          <button
            onclick={() => toggleTag(tag)}
            class="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary rounded-full text-sm hover:bg-primary/20 transition-colors"
          >
            <span>#{tag}</span>
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        {/each}
      </div>
    {/if}

    <!-- Popular hashtags list -->
    <div class="flex-1 overflow-y-auto -mx-6 px-6">
      {#if isLoading}
        <div class="flex items-center justify-center py-12">
          <div class="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin"></div>
        </div>
      {:else if filteredHashtags.length === 0}
        <div class="text-center py-12">
          <svg class="w-12 h-12 text-muted-foreground mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          <p class="text-muted-foreground">
            {searchQuery ? 'No hashtags found matching your search' : 'No popular hashtags found'}
          </p>
        </div>
      {:else}
        <div class="grid grid-cols-2 gap-2">
          {#each filteredHashtags as { tag, count } (tag)}
            {@const isSelected = selectedTags.includes(tag)}
            <button
              onclick={() => toggleTag(tag)}
              class="flex items-center justify-between px-3 py-2 rounded-lg border transition-colors {
                isSelected
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border hover:border-primary/50 hover:bg-muted'
              }"
            >
              <span class="font-medium truncate">#{tag}</span>
              <span class="text-xs text-muted-foreground ml-2 flex-shrink-0">
                {count}
              </span>
            </button>
          {/each}
        </div>
      {/if}
    </div>

    <!-- Footer -->
    <div class="flex items-center justify-between pt-4 border-t border-border -mx-6 px-6">
      <p class="text-xs text-muted-foreground">
        {selectedTags.length} {selectedTags.length === 1 ? 'tag' : 'tags'} selected
      </p>
      <Button onclick={handleClose}>Done</Button>
    </div>
  </Dialog.Content>
</Dialog.Root>
