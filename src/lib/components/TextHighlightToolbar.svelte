<script lang="ts">
  import { ndk } from '$lib/ndk.svelte';
  import { NDKEvent, type NDKArticle } from '@nostr-dev-kit/ndk';

  interface Props {
    article: NDKArticle;
    selectedText: string;
    position: { x: number; y: number };
    onHighlightCreated: () => void;
    onCancel: () => void;
  }

  let { article, selectedText, position, onHighlightCreated, onCancel }: Props = $props();

  let isCreating = $state(false);
  let error = $state<string | null>(null);

  async function createHighlight() {
    if (!ndk.$currentUser) {
      error = 'You must be logged in to create highlights';
      return;
    }

    if (!selectedText.trim()) {
      error = 'No text selected';
      return;
    }

    isCreating = true;
    error = null;

    try {
      const highlight = new NDKEvent(ndk);
      highlight.kind = 9802; // NIP-84 Highlight
      highlight.content = selectedText.trim();
      highlight.tags = [
        ['a', article.tagId()], // Reference to the article
        ['p', article.pubkey, '', 'author'], // Original author
      ];

      await highlight.publish();
      onHighlightCreated();
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to create highlight';
      console.error('Failed to create highlight:', err);
      isCreating = false;
    }
  }
</script>

<div
  class="fixed z-50 bg-card text-foreground rounded-lg shadow-xl border border-border overflow-hidden"
  style="left: {position.x}px; top: {position.y}px; transform: translate(-50%, -100%) translateY(-12px);"
>
  {#if error}
    <div class="px-4 py-2 bg-red-900/20 text-red-400 text-sm border-b border-red-800">
      {error}
    </div>
  {/if}

  <div class="flex items-center">
    <button
      type="button"
      onclick={createHighlight}
      disabled={isCreating}
      class="flex items-center gap-2 px-4 py-3 hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      title="Create highlight"
    >
      {#if isCreating}
        <svg class="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      {:else}
        <svg class="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 13h6m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      {/if}
      <span class="text-sm font-medium">Highlight</span>
    </button>

    <div class="w-px h-6 bg-muted" />

    <button
      type="button"
      onclick={onCancel}
      class="px-3 py-3 hover:bg-muted transition-colors"
      title="Cancel"
      disabled={isCreating}
    >
      <svg class="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>
</div>

<!-- Triangle pointer -->
<div
  class="fixed z-50"
  style="left: {position.x}px; top: {position.y}px; transform: translate(-50%, -100%);"
>
  <div class="w-3 h-3 bg-card border-r border-b border-border rotate-45 translate-y-1.5" />
</div>
