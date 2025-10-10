<script lang="ts">
  import type { NDKArticle, NDKEvent } from '@nostr-dev-kit/ndk';
  import { ndk } from '$lib/ndk.svelte';
  import { Avatar } from '@nostr-dev-kit/svelte';
  import { nip19 } from 'nostr-tools';

  interface Props {
    article: NDKArticle;
    onCommentPublished: (comment: NDKEvent) => void;
    onError: (error: string) => void;
  }

  let { article, onCommentPublished, onError }: Props = $props();

  let replyContent = $state('');
  let isSubmitting = $state(false);

  const currentUser = ndk.$currentUser;
  const profile = ndk.$fetchProfile(() => currentUser?.pubkey);
  const displayName = $derived(profile?.name || profile?.displayName || 'Anonymous');
  const npub = $derived(currentUser ? nip19.npubEncode(currentUser.pubkey) : '');

  function navigateToProfile() {
    if (npub) {
      window.location.href = `/p/${npub}`;
    }
  }

  async function handleCommentPublish() {
    if (!currentUser || !replyContent.trim()) return;

    isSubmitting = true;
    try {
      const replyEvent = article.reply();
      replyEvent.content = replyContent;
      await replyEvent.publish();

      onCommentPublished(replyEvent);
      replyContent = '';
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to publish comment';
      onError(errorMessage);
    } finally {
      isSubmitting = false;
    }
  }
</script>

{#if currentUser}
  <div class="mb-8">
    <div class="flex gap-3">
      <button type="button" onclick={navigateToProfile} class="flex-shrink-0">
        <Avatar {ndk} pubkey={currentUser.pubkey} class="w-10 h-10 cursor-pointer hover:opacity-80 transition-opacity" />
      </button>
      <div class="flex-1">
        <textarea
          bind:value={replyContent}
          placeholder="Share your thoughts..."
          class="w-full p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all min-h-[100px] text-neutral-900 dark:text-white placeholder:text-neutral-500 dark:placeholder:text-neutral-400"
          disabled={isSubmitting}
        />
        <div class="flex justify-end mt-2">
          <button
            type="button"
            onclick={handleCommentPublish}
            disabled={!replyContent.trim() || isSubmitting}
            class="px-4 py-2 bg-neutral-900 dark:bg-white text-white dark:text-black rounded-full hover:bg-neutral-800 dark:hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
          >
            {isSubmitting ? 'Posting...' : 'Comment'}
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}
