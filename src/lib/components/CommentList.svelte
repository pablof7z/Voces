<script lang="ts">
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import NoteCard from './NoteCard.svelte';

  interface Props {
    comments: NDKEvent[];
    isLoading: boolean;
  }

  let { comments, isLoading }: Props = $props();
</script>

{#if isLoading}
  <div class="py-8 text-center">
    <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border"></div>
    <p class="mt-3 text-muted-foreground dark:text-muted-foreground">Loading comments...</p>
  </div>
{:else if comments.length === 0}
  <div class="py-12 text-center text-muted-foreground dark:text-muted-foreground">
    No comments yet. Be the first to share your thoughts!
  </div>
{:else}
  <div>
    {#each comments as comment (comment.id)}
      <NoteCard event={comment} variant="default" />
    {/each}
  </div>
{/if}
