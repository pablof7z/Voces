<script lang="ts">
  import type { NDKConversation } from '@nostr-dev-kit/messages';
  import ConversationListItem from './ConversationListItem.svelte';

  interface Props {
    conversations: NDKConversation[];
  }

  const { conversations }: Props = $props();
</script>

<div class="divide-y divide-neutral-800/50">
  {#if conversations.length === 0}
    <!-- Empty state -->
    <div class="flex flex-col items-center justify-center py-16 px-6 text-center">
      <svg class="w-20 h-20 text-neutral-700 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
      <h3 class="text-xl font-semibold text-white mb-2">No messages yet</h3>
      <p class="text-neutral-400 max-w-sm">
        Start a conversation by visiting someone's profile and clicking the message button
      </p>
    </div>
  {:else}
    {#each conversations as conversation (conversation.id)}
      <ConversationListItem {conversation} />
    {/each}
  {/if}
</div>
