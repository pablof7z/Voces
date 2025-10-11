<script lang="ts">
  import { marked } from 'marked';

  interface Props {
    content: string;
    emojiTags?: string[][];
  }

  let { content, emojiTags }: Props = $props();

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
</script>

{#if hasMarkdown}
  <div class="article-content prose prose-lg dark:prose-invert max-w-none">
    {@html htmlContent}
  </div>
{:else}
  <div class="article-content text-lg leading-[1.8] text-neutral-800 dark:text-neutral-200 font-serif whitespace-pre-wrap">
    {content}
  </div>
{/if}

<style>
  @reference "../../app.css";

  :global(.article-content) {
    @apply text-neutral-900 dark:text-neutral-200;
  }

  :global(.article-content h1) {
    @apply text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-white mt-12 mb-6 font-serif;
  }

  :global(.article-content h2) {
    @apply text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white mt-10 mb-5 font-serif;
  }

  :global(.article-content h3) {
    @apply text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white mt-8 mb-4 font-serif;
  }

  :global(.article-content p) {
    @apply text-lg leading-[1.8] text-neutral-800 dark:text-neutral-200 mb-6 font-serif;
  }

  :global(.article-content a) {
    @apply text-blue-600 dark:text-blue-400 underline underline-offset-2 hover:text-blue-800 dark:hover:text-blue-300 transition-colors;
  }

  :global(.article-content img) {
    @apply w-full rounded-lg shadow-sm my-8;
  }

  :global(.article-content ul) {
    @apply list-disc pl-6 mb-6 space-y-2 text-lg text-neutral-800 dark:text-neutral-200 font-serif;
  }

  :global(.article-content ol) {
    @apply list-decimal pl-6 mb-6 space-y-2 text-lg text-neutral-800 dark:text-neutral-200 font-serif;
  }

  :global(.article-content li) {
    @apply leading-[1.8];
  }

  :global(.article-content blockquote) {
    @apply border-l-4 border-neutral-300 dark:border-neutral-700 pl-6 my-8 italic text-xl text-neutral-700 dark:text-neutral-300 font-serif leading-[1.8];
  }

  :global(.article-content code) {
    @apply px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 rounded text-sm font-mono;
  }

  :global(.article-content pre) {
    @apply mb-6 overflow-hidden rounded-lg;
  }

  :global(.article-content pre code) {
    @apply block bg-neutral-50 dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 overflow-x-auto text-sm font-mono leading-relaxed;
  }

  :global(.article-content hr) {
    @apply my-12 border-t border-neutral-200 dark:border-neutral-800;
  }

  :global(.article-content strong) {
    @apply font-bold text-neutral-900 dark:text-white;
  }

  :global(.article-content em) {
    @apply italic;
  }
</style>
