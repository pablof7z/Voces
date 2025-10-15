<script lang="ts">
  import type { NDKMessage } from '@nostr-dev-kit/messages';
  import TimeAgo from '../TimeAgo.svelte';
  import { onMount } from 'svelte';
  import { ndk } from '$lib/ndk.svelte';

  interface Props {
    messages: NDKMessage[];
  }

  const { messages }: Props = $props();

  let scrollContainer: HTMLDivElement | null = $state(null);
  let shouldAutoScroll = $state(true);

  function scrollToBottom(smooth = true) {
    if (scrollContainer && shouldAutoScroll) {
      scrollContainer.scrollTo({
        top: scrollContainer.scrollHeight,
        behavior: smooth ? 'smooth' : 'instant'
      });
    }
  }

  function handleScroll() {
    if (!scrollContainer) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;

    shouldAutoScroll = isNearBottom;
  }

  // Scroll to bottom on mount and when new messages arrive
  $effect(() => {
    if (messages.length > 0) {
      scrollToBottom(messages.length > 1);
    }
  });

  onMount(() => {
    scrollToBottom(false);
  });

  function formatTime(timestamp: number): string {
    return new Date(timestamp * 1000).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    });
  }

  function shouldShowDate(currentMessage: NDKMessage, previousMessage: NDKMessage | null): boolean {
    if (!previousMessage) return true;

    const currentDate = new Date(currentMessage.timestamp * 1000).toDateString();
    const previousDate = new Date(previousMessage.timestamp * 1000).toDateString();

    return currentDate !== previousDate;
  }

  function formatDate(timestamp: number): string {
    const date = new Date(timestamp * 1000);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }
  }
</script>

<div
  bind:this={scrollContainer}
  onscroll={handleScroll}
  class="flex-1 overflow-y-auto px-4 py-6 space-y-4"
>
  {#if messages.length === 0}
    <div class="flex items-center justify-center h-full">
      <div class="text-center text-neutral-500">
        <p>No messages yet</p>
        <p class="text-sm mt-1">Start the conversation!</p>
      </div>
    </div>
  {:else}
    {#each messages as message, index (message.id)}
      {@const previousMessage = index > 0 ? messages[index - 1] : null}

      <!-- Date separator -->
      {#if shouldShowDate(message, previousMessage)}
        <div class="flex items-center justify-center my-6">
          <div class="px-3 py-1 bg-neutral-900 rounded-full text-xs text-neutral-400 font-medium">
            {formatDate(message.timestamp)}
          </div>
        </div>
      {/if}

      <!-- Message bubble -->
      <div class="flex {message.sender.pubkey === ndk.activeUser?.pubkey ? 'justify-end' : 'justify-start'}">
        <div class="max-w-[70%] {message.sender.pubkey === ndk.activeUser?.pubkey ? 'items-end' : 'items-start'} flex flex-col gap-1">
          <!-- Message content -->
          <div
            class="px-4 py-2 rounded-2xl {message.sender.pubkey === ndk.activeUser?.pubkey
              ? 'bg-orange-500 text-white rounded-tr-sm'
              : 'bg-neutral-900 text-white rounded-tl-sm'}"
          >
            <p class="whitespace-pre-wrap break-words">{message.content}</p>
          </div>

          <!-- Timestamp -->
          <div class="text-xs text-neutral-500 px-2">
            {formatTime(message.timestamp)}
          </div>
        </div>
      </div>
    {/each}
  {/if}
</div>

<!-- Scroll to bottom button (when not auto-scrolling) -->
{#if !shouldAutoScroll && messages.length > 0}
  <button
    onclick={() => {
      shouldAutoScroll = true;
      scrollToBottom();
    }}
    class="fixed bottom-24 right-8 p-3 bg-orange-500 hover:bg-orange-500/90 text-white rounded-full shadow-lg transition-colors"
  >
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
    </svg>
  </button>
{/if}
