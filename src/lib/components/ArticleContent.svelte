<script lang="ts">
  import { marked } from 'marked';
  import type { NDKEvent } from '@nostr-dev-kit/ndk';

  interface Props {
    content: string;
    emojiTags?: string[][];
    highlights?: NDKEvent[];
    onTextSelected?: (text: string, range: Range) => void;
  }

  let { content, emojiTags, highlights = [], onTextSelected }: Props = $props();

  let contentElement = $state<HTMLDivElement>();

  const hasMarkdown = $derived.by(() => {
    const markdownPatterns = [
      /^#{1,6}\s/m,
      /\*\*[^*]+\*\*/,
      /\*[^*]+\*/,
      /\[([^\]]+)\]\([^)]+\)/,
      /^[-*+]\s/m,
      /^>\s/m,
      /```[\s\S]*?```/,
      /^\d+\.\s/m,
    ];
    return markdownPatterns.some(pattern => pattern.test(content));
  });

  const htmlContent = $derived.by(() => {
    if (hasMarkdown) {
      return marked.parse(content, { async: false }) as string;
    }
    return content;
  });

  function handleMouseUp() {
    if (!onTextSelected) return;

    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;

    const selectedText = selection.toString().trim();
    if (selectedText.length === 0) return;

    // Check if selection is within the article content
    if (!contentElement?.contains(selection.anchorNode)) return;

    const range = selection.getRangeAt(0);
    onTextSelected(selectedText, range);
  }

  $effect(() => {
    if (contentElement && highlights.length > 0) {
      applyHighlights();
    }
  });

  function applyHighlights() {
    if (!contentElement) return;

    // Reset any existing highlights
    const existingMarks = contentElement.querySelectorAll('mark.nostr-highlight');
    existingMarks.forEach(mark => {
      const parent = mark.parentNode;
      if (parent) {
        parent.replaceChild(document.createTextNode(mark.textContent || ''), mark);
        parent.normalize();
      }
    });

    // Apply each highlight
    highlights.forEach(highlight => {
      const highlightText = highlight.content.trim();
      if (!highlightText) return;

      try {
        highlightTextInElement(contentElement, highlightText, highlight.pubkey);
      } catch (err) {
        console.warn('Failed to apply highlight:', err);
      }
    });
  }

  function highlightTextInElement(element: HTMLElement, searchText: string, pubkey: string) {
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      null
    );

    const nodesToHighlight: { node: Text; offset: number }[] = [];
    let currentNode: Text | null;

    while ((currentNode = walker.nextNode() as Text | null)) {
      // Skip if parent is already a highlight
      if (currentNode.parentElement?.classList.contains('nostr-highlight')) continue;

      const text = currentNode.textContent || '';
      const index = text.indexOf(searchText);

      if (index !== -1) {
        nodesToHighlight.push({ node: currentNode, offset: index });
      }
    }

    // Apply highlights (do this after tree walk to avoid modifying while walking)
    nodesToHighlight.forEach(({ node, offset }) => {
      const text = node.textContent || '';
      const before = text.substring(0, offset);
      const highlighted = text.substring(offset, offset + searchText.length);
      const after = text.substring(offset + searchText.length);

      const mark = document.createElement('mark');
      mark.className = 'nostr-highlight';
      mark.dataset.pubkey = pubkey;
      mark.textContent = highlighted;

      const parent = node.parentNode;
      if (parent) {
        if (before) parent.insertBefore(document.createTextNode(before), node);
        parent.insertBefore(mark, node);
        if (after) parent.insertBefore(document.createTextNode(after), node);
        parent.removeChild(node);
      }
    });
  }
</script>

{#if hasMarkdown}
  <div
    bind:this={contentElement}
    onmouseup={handleMouseUp}
    role="article"
    class="article-content prose prose-lg dark:prose-invert max-w-none select-text"
  >
    {@html htmlContent}
  </div>
{:else}
  <div
    bind:this={contentElement}
    onmouseup={handleMouseUp}
    role="article"
    class="article-content text-lg leading-[1.8] font-serif whitespace-pre-wrap select-text"
  >
    {content}
  </div>
{/if}

<style>
  @reference "../../app.css";

  :global(.article-content) {
    color: hsl(var(--foreground));
  }

  :global(.article-content h1) {
    @apply text-3xl sm:text-4xl font-bold mt-12 mb-6 font-serif;
    color: hsl(var(--foreground));
  }

  :global(.article-content h2) {
    @apply text-2xl sm:text-3xl font-bold mt-10 mb-5 font-serif;
    color: hsl(var(--foreground));
  }

  :global(.article-content h3) {
    @apply text-xl sm:text-2xl font-bold mt-8 mb-4 font-serif;
    color: hsl(var(--foreground));
  }

  :global(.article-content p) {
    @apply text-lg leading-[1.8] mb-6 font-serif;
    color: hsl(var(--foreground));
  }

  :global(.article-content a) {
    @apply text-blue-600 dark:text-blue-400 underline underline-offset-2 hover:text-blue-800 dark:hover:text-blue-300 transition-colors;
  }

  :global(.article-content img) {
    @apply w-full rounded-lg shadow-sm my-8;
  }

  :global(.article-content ul) {
    @apply list-disc pl-6 mb-6 space-y-2 text-lg font-serif;
    color: hsl(var(--foreground));
  }

  :global(.article-content ol) {
    @apply list-decimal pl-6 mb-6 space-y-2 text-lg font-serif;
    color: hsl(var(--foreground));
  }

  :global(.article-content li) {
    @apply leading-[1.8];
  }

  :global(.article-content blockquote) {
    @apply border-l-4 pl-6 my-8 italic text-xl font-serif leading-[1.8];
    border-color: hsl(var(--border));
    color: hsl(var(--muted-foreground));
  }

  :global(.article-content code) {
    @apply px-1.5 py-0.5 rounded text-sm font-mono;
    background-color: hsl(var(--muted));
    color: hsl(var(--foreground));
  }

  :global(.article-content pre) {
    @apply mb-6 overflow-hidden rounded-lg;
  }

  :global(.article-content pre code) {
    @apply block border rounded-lg p-4 overflow-x-auto text-sm font-mono leading-relaxed;
    background-color: hsl(var(--background));
    border-color: hsl(var(--border));
  }

  :global(.article-content hr) {
    @apply my-12 border-t;
    border-color: hsl(var(--border));
  }

  :global(.article-content strong) {
    @apply font-bold;
    color: hsl(var(--foreground));
  }

  :global(.article-content em) {
    @apply italic;
  }

  /* Nostr highlight styles */
  :global(mark.nostr-highlight) {
    @apply bg-yellow-200/60 dark:bg-yellow-500/30;
    @apply border-b-2 border-yellow-400 dark:border-yellow-500;
    @apply transition-all duration-200;
    @apply cursor-pointer;
    padding: 0.125rem 0;
  }

  :global(mark.nostr-highlight:hover) {
    @apply bg-yellow-300/80 dark:bg-yellow-500/50;
    @apply border-yellow-500 dark:border-yellow-400;
  }
</style>
