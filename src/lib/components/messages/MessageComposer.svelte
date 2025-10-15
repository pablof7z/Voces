<script lang="ts">
  import type { NDKUser } from '@nostr-dev-kit/ndk';
  import { messagesStore } from '$lib/stores/messages.svelte';
  import { ndk } from '$lib/ndk.svelte';
  import { toast } from '$lib/stores/toast.svelte';

  interface Props {
    recipient: NDKUser;
    onMessageSent?: () => void;
  }

  const { recipient, onMessageSent }: Props = $props();

  let message = $state('');
  let sending = $state(false);
  let textareaElement: HTMLTextAreaElement | null = $state(null);

  async function handleSend() {
    if (!message.trim() || sending) return;

    sending = true;

    try {
      await messagesStore.sendMessage(recipient.npub, message.trim());
      message = '';
      onMessageSent?.();

      // Reset textarea height
      if (textareaElement) {
        textareaElement.style.height = 'auto';
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
    } finally {
      sending = false;
    }
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleInput() {
    // Auto-resize textarea
    if (textareaElement) {
      textareaElement.style.height = 'auto';
      textareaElement.style.height = `${Math.min(textareaElement.scrollHeight, 200)}px`;
    }
  }
</script>

<div class="sticky bottom-0 border-t border-neutral-800/50 bg-black p-4">
  <div class="flex items-end gap-3">
    <div class="flex-1 relative">
      <textarea
        bind:this={textareaElement}
        bind:value={message}
        onkeydown={handleKeyDown}
        oninput={handleInput}
        placeholder="Type a message..."
        rows="1"
        class="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none min-h-[48px] max-h-[200px]"
        disabled={sending}
      />
      <div class="absolute right-3 bottom-3 text-xs text-neutral-600">
        {message.length}
      </div>
    </div>

    <button
      onclick={handleSend}
      disabled={!message.trim() || sending}
      class="px-6 py-3 bg-orange-500 hover:bg-orange-500/90 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 h-[48px]"
    >
      {#if sending}
        <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      {:else}
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
      {/if}
    </button>
  </div>

  <p class="text-xs text-neutral-500 mt-2">
    Press Enter to send, Shift+Enter for new line
  </p>
</div>
