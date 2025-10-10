<script lang="ts">
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import { ndk } from '$lib/ndk.svelte';
  import { NDKEvent as NDKEventClass } from '@nostr-dev-kit/ndk';
  import { Avatar } from '@nostr-dev-kit/svelte';
  import { toast } from '$lib/stores/toast.svelte';

  interface Props {
    open?: boolean;
    onClose?: () => void;
    replyTo?: NDKEvent;
    onPublished?: () => void;
  }

  let { open = $bindable(false), onClose, replyTo, onPublished }: Props = $props();

  let content = $state('');
  let isPublishing = $state(false);

  const replyToProfile = $derived(replyTo ? ndk.$fetchProfile(() => replyTo.pubkey) : null);

  async function publishNote() {
    if (!content.trim() || isPublishing) return;

    try {
      isPublishing = true;
      const event = replyTo ? replyTo.reply() : new NDKEventClass(ndk);
      event.kind ??= 1;
      event.content = content;

      await event.sign();
      event.publish();

      content = '';
      open = false;
      toast.success(replyTo ? 'Reply published' : 'Note published');
      onPublished?.();
      onClose?.();
    } catch (error) {
      console.error('Failed to publish note:', error);
      toast.error('Failed to publish note');
    } finally {
      isPublishing = false;
    }
  }

  function handleClose() {
    if (!isPublishing) {
      open = false;
      content = '';
      onClose?.();
    }
  }

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && !isPublishing) {
      handleClose();
    }
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      publishNote();
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
  <div
    class="fixed inset-0 z-50 flex items-start justify-center bg-black/80 backdrop-blur-sm"
    onclick={handleBackdropClick}
    role="presentation"
  >
    <div
      class="w-full max-w-2xl mt-12 mx-4 bg-neutral-900 rounded-2xl border border-neutral-800 shadow-2xl"
      onclick={(e) => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
    >
      <!-- Header -->
      <div class="flex items-center justify-between px-4 py-3 border-b border-neutral-800">
        <button
          onclick={handleClose}
          disabled={isPublishing}
          class="text-neutral-400 hover:text-white transition-colors disabled:opacity-50"
          aria-label="Close"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h2 class="text-lg font-semibold text-white">
          {replyTo ? 'Reply' : 'Compose'}
        </h2>
        <button
          onclick={publishNote}
          disabled={!content.trim() || isPublishing}
          class="px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-neutral-700 disabled:cursor-not-allowed text-white rounded-full transition-colors font-semibold text-sm"
        >
          {isPublishing ? 'Publishing...' : 'Post'}
        </button>
      </div>

      <!-- Reply context (if replying) -->
      {#if replyTo && replyToProfile}
        <div class="px-4 py-3 border-b border-neutral-800/50 bg-neutral-900/50">
          <div class="flex gap-3">
            <Avatar {ndk} pubkey={replyTo.pubkey} class="w-10 h-10" />
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <span class="font-semibold text-white text-sm">
                  {replyToProfile.displayName || replyToProfile.name || `${replyTo.pubkey.slice(0, 8)}...`}
                </span>
                <span class="text-neutral-500 text-xs">
                  @{replyToProfile.name || replyTo.pubkey.slice(0, 8)}
                </span>
              </div>
              <p class="text-neutral-400 text-sm line-clamp-3">
                {replyTo.content}
              </p>
            </div>
          </div>
        </div>
      {/if}

      <!-- Compose area -->
      <div class="p-4">
        <div class="flex gap-3">
          {#if ndk.$currentUser}
            <Avatar {ndk} pubkey={ndk.$currentUser.pubkey} class="w-12 h-12 flex-shrink-0" />
          {:else}
            <div class="w-12 h-12 rounded-full bg-neutral-800 flex-shrink-0"></div>
          {/if}
          <div class="flex-1 min-w-0">
            <textarea
              bind:value={content}
              placeholder={replyTo ? 'Write your reply...' : "What's on your mind?"}
              class="w-full min-h-[120px] bg-transparent text-white placeholder-neutral-500 resize-none focus:outline-none text-lg"
              autofocus
            ></textarea>
          </div>
        </div>
      </div>

      <!-- Footer hint -->
      <div class="px-4 py-3 border-t border-neutral-800/50">
        <p class="text-xs text-neutral-500">
          Press <kbd class="px-1.5 py-0.5 bg-neutral-800 rounded text-neutral-400">Esc</kbd> to cancel,
          <kbd class="px-1.5 py-0.5 bg-neutral-800 rounded text-neutral-400">⌘</kbd> +
          <kbd class="px-1.5 py-0.5 bg-neutral-800 rounded text-neutral-400">Enter</kbd> to post
        </p>
      </div>
    </div>
  </div>
{/if}
