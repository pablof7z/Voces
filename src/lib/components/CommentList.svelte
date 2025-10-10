<script lang="ts">
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import CommentCard from './CommentCard.svelte';

  interface Props {
    comments: NDKEvent[];
    isLoading: boolean;
  }

  let { comments, isLoading }: Props = $props();
</script>

{#if isLoading}
  <div class="py-8 text-center">
    <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-400"></div>
    <p class="mt-3 text-neutral-500 dark:text-neutral-400">Loading comments...</p>
  </div>
{:else if comments.length === 0}
  <div class="py-12 text-center text-neutral-500 dark:text-neutral-400">
    No comments yet. Be the first to share your thoughts!
  </div>
{:else}
  <div class="space-y-6">
    {#each comments as comment (comment.id)}
      <CommentCard event={comment} />
    {/each}
  </div>
{/if}
