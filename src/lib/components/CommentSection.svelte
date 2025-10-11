<script lang="ts">
  import type { NDKArticle, NDKEvent } from '@nostr-dev-kit/ndk';
  import NDK, { NDKKind } from '@nostr-dev-kit/ndk';
  import { ndk } from '$lib/ndk.svelte';
  import CommentForm from './CommentForm.svelte';
  import CommentList from './CommentList.svelte';

  interface Props {
    article: NDKArticle;
    onError: (error: string) => void;
  }

  let { article, onError }: Props = $props();

  const commentsSubscription = ndk.$subscribe(() => ({
    filters: [{
      kinds: [NDKKind.Text, NDKKind.GenericReply],
      '#a': [`${article.kind}:${article.pubkey}:${article.dTag}`]
    }],
    bufferMs: 100
  }));

  const comments = $derived.by(() => {
    return [...commentsSubscription.events].sort((a, b) => (a.created_at || 0) - (b.created_at || 0));
  });

  const isLoading = $derived(!commentsSubscription.eosed);

  function addComment(comment: NDKEvent) {
    // The subscription will automatically pick up the new comment
    // No need to manually add it
  }
</script>

<div class="border-t border-neutral-200 dark:border-neutral-800 pt-12">
  <div class="mb-8">
    <h2 class="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white font-serif mb-2">
      Discussion
    </h2>
    <p class="text-neutral-600 dark:text-neutral-400">
      {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
    </p>
  </div>

  <CommentForm {article} onCommentPublished={addComment} {onError} />

  <CommentList {comments} {isLoading} />
</div>
