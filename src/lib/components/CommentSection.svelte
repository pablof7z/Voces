<script lang="ts">
  import type { NDKArticle, NDKEvent } from '@nostr-dev-kit/ndk';
  import { ndk } from '$lib/ndk.svelte';
  import { fetchArticleComments } from '$lib/utils/fetchArticleComments';
  import CommentForm from './CommentForm.svelte';
  import CommentList from './CommentList.svelte';

  interface Props {
    article: NDKArticle;
    onError: (error: string) => void;
  }

  let { article, onError }: Props = $props();

  let comments = $state<NDKEvent[]>([]);
  let isLoading = $state(false);

  async function loadComments() {
    isLoading = true;
    try {
      const fetchedComments = await fetchArticleComments(ndk, article);
      comments = fetchedComments;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load comments';
      onError(errorMessage);
    } finally {
      isLoading = false;
    }
  }

  function addComment(comment: NDKEvent) {
    comments = [...comments, comment];
  }

  $effect(() => {
    loadComments();
  });
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
