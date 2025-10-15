<script lang="ts">
  import type { NDKEvent, NDKImetaTag } from '@nostr-dev-kit/ndk';
  import { NDKKind } from '@nostr-dev-kit/ndk';
  import { ndk } from '$lib/ndk.svelte';
  import { portal } from '$lib/utils/portal.svelte';
  import CommentCard from './CommentCard.svelte';
  import CommentForm from './CommentForm.svelte';
  import { Avatar } from '@nostr-dev-kit/svelte';
  import { nip19 } from 'nostr-tools';
  import TimeAgo from './TimeAgo.svelte';

  interface Props {
    open: boolean;
    event: NDKEvent;
    imeta: NDKImetaTag;
    mediaType: 'image' | 'video' | 'audio' | 'file';
    onClose: () => void;
  }

  const { open, event, imeta, mediaType, onClose }: Props = $props();

  let errorMessage = $state('');
  let showComments = $state(false);
  let startY = $state(0);
  let currentY = $state(0);
  let isDragging = $state(false);

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
    return [...commentsSubscription.events].sort((a, b) => (a.created_at || 0) - (b.created_at || 0));
  });

  const isLoadingComments = $derived(!commentsSubscription.eosed);

  const profile = ndk.$fetchProfile(() => event.pubkey);
  const displayName = $derived(profile?.name || profile?.displayName || 'Anonymous');
  const npub = $derived(nip19.npubEncode(event.pubkey));

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

  function handleTouchStart(e: TouchEvent) {
    startY = e.touches[0].clientY;
    isDragging = true;
  }

  function handleTouchMove(e: TouchEvent) {
    if (!isDragging) return;
    currentY = e.touches[0].clientY;
    const diff = currentY - startY;

    // Only allow pull-up gesture when not showing comments
    if (!showComments && diff < -50) {
      showComments = true;
      isDragging = false;
    }
    // Allow pull-down to hide comments
    else if (showComments && diff > 50) {
      showComments = false;
      isDragging = false;
    }
  }

  function handleTouchEnd() {
    isDragging = false;
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
    use:portal
    class="fixed inset-0 z-[9999] bg-black"
    role="dialog"
    aria-modal="true"
  >
    <!-- Desktop Layout (md and up) -->
    <div class="hidden md:flex items-center justify-center h-full w-full">
      <!-- Close button (top-left, outside content) -->
      <button
        onclick={onClose}
        class="absolute top-6 left-6 z-[10000] w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-colors flex items-center justify-center"
        type="button"
        aria-label="Close"
      >
        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div
        class="relative w-full h-full flex max-w-[1600px] mx-auto"
        onclick={(e) => e.stopPropagation()}
        onkeydown={handleKeydown}
        tabindex="0"
      >
        <!-- Left side - Media (takes most space) -->
        <div class="flex-1 flex items-center justify-center p-8 bg-black min-w-0">
          {#if mediaType === 'image'}
            <img
              src={imeta.url}
              alt={imeta.alt || event.content || 'Image'}
              class="max-w-full max-h-full object-contain"
              onclick={onClose}
            />
          {:else if mediaType === 'video'}
            <video
              src={imeta.url}
              controls
              class="max-w-full max-h-full object-contain"
            >
              <track kind="captions" />
            </video>
          {:else if mediaType === 'audio'}
            <div class="w-full max-w-md p-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg">
              <audio src={imeta.url} controls class="w-full"></audio>
            </div>
          {/if}
        </div>

        <!-- Right side - Comments (fixed width) -->
        <div class="w-[400px] bg-[#1a1a1a] border-l border-neutral-800 flex flex-col shrink-0">
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
                {#if event.created_at}
                  <TimeAgo timestamp={event.created_at} class="text-sm text-gray-400" />
                {/if}
              </div>
            </div>
            {#if event.content}
              <p class="mt-3 text-gray-200 text-sm whitespace-pre-wrap break-words">{event.content}</p>
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
                <svg class="w-12 h-12 text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p class="text-gray-400 text-sm">No comments yet</p>
                <p class="text-gray-500 text-xs mt-1">Be the first to comment!</p>
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
          <div class="border-t border-neutral-800 p-4 bg-[#1a1a1a]">
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

    <!-- Mobile Layout -->
    <div class="md:hidden flex flex-col h-full relative">
      <!-- Close button -->
      <button
        onclick={onClose}
        class="absolute top-4 left-4 z-50 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm transition-colors flex items-center justify-center"
        type="button"
        aria-label="Close"
      >
        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <!-- Media Container -->
      <div
        class="flex-1 flex flex-col items-center justify-center bg-black overflow-hidden relative"
        ontouchstart={handleTouchStart}
        ontouchmove={handleTouchMove}
        ontouchend={handleTouchEnd}
      >
        {#if mediaType === 'image'}
          <img
            src={imeta.url}
            alt={imeta.alt || event.content || 'Image'}
            class="w-full h-full object-contain"
          />
        {:else if mediaType === 'video'}
          <video
            src={imeta.url}
            controls
            class="w-full h-full object-contain"
          >
            <track kind="captions" />
          </video>
        {:else if mediaType === 'audio'}
          <div class="w-full max-w-md p-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg mx-4">
            <audio src={imeta.url} controls class="w-full"></audio>
          </div>
        {/if}

        <!-- Post info overlay -->
        <div class="absolute top-16 left-0 right-0 p-4 bg-gradient-to-b from-black/60 to-transparent">
          <div class="flex items-start gap-3">
            <button type="button" onclick={navigateToProfile} class="flex-shrink-0">
              <Avatar {ndk} pubkey={event.pubkey} class="w-10 h-10 cursor-pointer hover:opacity-80 transition-opacity" />
            </button>
            <div class="flex-1 min-w-0">
              <button type="button" onclick={navigateToProfile} class="hover:underline">
                <p class="font-semibold text-white">{displayName}</p>
              </button>
              {#if event.created_at}
                <TimeAgo timestamp={event.created_at} class="text-sm text-white/70" />
              {/if}
            </div>
          </div>
          {#if event.content}
            <p class="mt-3 text-white text-sm whitespace-pre-wrap break-words">{event.content}</p>
          {/if}
        </div>

        <!-- Comments button -->
        {#if !showComments}
          <div class="absolute bottom-4 left-0 right-0 flex justify-center px-4">
            <button
              onclick={() => showComments = true}
              class="flex items-center gap-2 px-6 py-3 bg-white/90 hover:bg-white rounded-full transition-colors shadow-lg"
              type="button"
            >
              <svg class="w-5 h-5 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span class="text-gray-900 font-medium">
                {#if comments.length > 0}
                  View {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
                {:else}
                  Add Comment
                {/if}
              </span>
            </button>
          </div>
        {/if}
      </div>

      <!-- Comments Panel (slides up from bottom) -->
      <div
        class="absolute inset-x-0 bottom-0 bg-background flex flex-col transition-transform duration-300 ease-out {showComments ? 'translate-y-0' : 'translate-y-full'}"
        style="height: 80vh; border-top-left-radius: 16px; border-top-right-radius: 16px;"
        ontouchstart={handleTouchStart}
        ontouchmove={handleTouchMove}
        ontouchend={handleTouchEnd}
      >
        <!-- Drag handle -->
        <div class="flex justify-center py-3 border-b border-border">
          <div class="w-12 h-1 bg-muted-foreground/30 rounded-full"></div>
        </div>

        <!-- Comments header -->
        <div class="px-4 py-3 border-b border-border flex items-center justify-between">
          <h3 class="font-semibold text-foreground">
            {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
          </h3>
          <button
            onclick={() => showComments = false}
            class="text-muted-foreground hover:text-foreground"
            type="button"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        <!-- Comments list -->
        <div class="flex-1 overflow-y-auto">
          {#if isLoadingComments}
            <div class="flex items-center justify-center p-8">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          {:else if comments.length === 0}
            <div class="flex flex-col items-center justify-center p-8 text-center">
              <svg class="w-12 h-12 text-muted-foreground mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p class="text-muted-foreground text-sm">No comments yet</p>
              <p class="text-muted-foreground text-xs mt-1">Be the first to comment!</p>
            </div>
          {:else}
            <div class="divide-y divide-border">
              {#each comments as comment (comment.id)}
                <div class="p-4">
                  <CommentCard event={comment} />
                </div>
              {/each}
            </div>
          {/if}
        </div>

        <!-- Comment form -->
        <div class="border-t border-border p-4 bg-background">
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
