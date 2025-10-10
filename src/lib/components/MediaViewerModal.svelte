<script lang="ts">
  import type { NDKEvent, NDKImetaTag } from '@nostr-dev-kit/ndk';
  import { NDKKind } from '@nostr-dev-kit/ndk';
  import { ndk } from '$lib/ndk.svelte';
  import CommentCard from './CommentCard.svelte';
  import CommentForm from './CommentForm.svelte';
  import { Avatar } from '@nostr-dev-kit/svelte';
  import { nip19 } from 'nostr-tools';
  import { formatDistanceToNow } from 'date-fns';

  interface Props {
    open: boolean;
    event: NDKEvent;
    imeta: NDKImetaTag;
    mediaType: 'image' | 'video' | 'audio' | 'file';
    onClose: () => void;
  }

  const { open, event, imeta, mediaType, onClose }: Props = $props();

  let errorMessage = $state('');

  const commentsSubscription = ndk.$subscribe(() => {
    if (!open || !event.id) return undefined;
    return {
      filters: [{
        kinds: [NDKKind.Text],
        '#e': [event.id]
      }],
      bufferMs: 100
    };
  });

  const comments = $derived.by(() => {
    return commentsSubscription.events.sort((a, b) => (a.created_at || 0) - (b.created_at || 0));
  });

  const isLoadingComments = $derived(!commentsSubscription.eosed);

  const profile = ndk.$fetchProfile(() => event.pubkey);
  const displayName = $derived(profile?.name || profile?.displayName || 'Anonymous');
  const npub = $derived(nip19.npubEncode(event.pubkey));
  const timeAgo = $derived(event.created_at ? formatDistanceToNow(new Date(event.created_at * 1000), { addSuffix: true }) : '');

  function addComment(comment: NDKEvent) {
    // The subscription will automatically pick up the new comment
  }

  function handleError(error: string) {
    errorMessage = error;
    setTimeout(() => errorMessage = '', 5000);
  }

  function navigateToProfile() {
    window.location.href = `/p/${npub}`;
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      onClose();
    }
  }

  $effect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  });
</script>

{#if open}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm"
    onclick={onClose}
    onkeydown={handleKeydown}
    role="button"
    tabindex="-1"
  >
    <div
      class="relative w-full h-full max-w-7xl mx-auto flex"
      onclick={(e) => e.stopPropagation()}
      onkeydown={(e) => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
      tabindex="0"
    >
      <!-- Close button -->
      <button
        onclick={onClose}
        class="absolute top-4 left-4 z-10 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm transition-colors flex items-center justify-center"
        type="button"
        aria-label="Close"
      >
        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <!-- Left side - Media -->
      <div class="flex-1 flex items-center justify-center p-4">
        <div class="max-w-full max-h-full flex items-center justify-center">
          {#if mediaType === 'image'}
            <img
              src={imeta.url}
              alt={imeta.alt || event.content || 'Image'}
              class="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
          {:else if mediaType === 'video'}
            <video
              src={imeta.url}
              controls
              class="max-w-full max-h-[90vh] rounded-lg"
            >
              <track kind="captions" />
            </video>
          {:else if mediaType === 'audio'}
            <div class="w-full max-w-md p-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg">
              <audio src={imeta.url} controls class="w-full"></audio>
            </div>
          {/if}
        </div>
      </div>

      <!-- Right side - Comments -->
      <div class="w-full max-w-md bg-black border-l border-neutral-800 flex flex-col">
        <!-- Header -->
        <div class="border-b border-neutral-800 p-4">
          <div class="flex items-start gap-3">
            <button type="button" onclick={navigateToProfile} class="flex-shrink-0">
              <Avatar {ndk} pubkey={event.pubkey} class="w-10 h-10 cursor-pointer hover:opacity-80 transition-opacity" />
            </button>
            <div class="flex-1 min-w-0">
              <button type="button" onclick={navigateToProfile} class="hover:underline">
                <p class="font-semibold text-white">{displayName}</p>
              </button>
              {#if timeAgo}
                <p class="text-sm text-neutral-400">{timeAgo}</p>
              {/if}
            </div>
          </div>
          {#if event.content}
            <p class="mt-3 text-white whitespace-pre-wrap break-words">{event.content}</p>
          {/if}
        </div>

        <!-- Comments list -->
        <div class="flex-1 overflow-y-auto">
          {#if isLoadingComments}
            <div class="flex items-center justify-center p-8">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          {:else if comments.length === 0}
            <div class="flex flex-col items-center justify-center p-8 text-center">
              <svg class="w-12 h-12 text-neutral-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p class="text-neutral-400 text-sm">No comments yet</p>
              <p class="text-neutral-500 text-xs mt-1">Be the first to comment!</p>
            </div>
          {:else}
            <div class="divide-y divide-neutral-800">
              {#each comments as comment (comment.id)}
                <div class="p-4">
                  <CommentCard event={comment} />
                </div>
              {/each}
            </div>
          {/if}
        </div>

        <!-- Comment form -->
        <div class="border-t border-neutral-800 p-4">
          {#if errorMessage}
            <div class="mb-3 p-2 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-sm">
              {errorMessage}
            </div>
          {/if}
          <CommentForm article={event as any} onCommentPublished={addComment} onError={handleError} />
        </div>
      </div>
    </div>
  </div>
{/if}
