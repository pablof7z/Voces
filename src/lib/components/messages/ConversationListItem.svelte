<script lang="ts">
  import { goto } from '$app/navigation';
  import type { NDKConversation } from '@nostr-dev-kit/messages';
  import { Avatar } from '@nostr-dev-kit/svelte';
  import TimeAgo from '../TimeAgo.svelte';
  import { ndk } from '$lib/ndk.svelte';

  interface Props {
    conversation: NDKConversation;
  }

  const { conversation }: Props = $props();

  const participant = conversation.getOtherParticipant();
  const lastMessage = conversation.getLastMessage();

  // Use NDK's reactive profile fetching
  const profile = participant ? ndk.$fetchProfile(() => participant.pubkey) : null;

  function openConversation() {
    if (!participant) return;
    goto(`/messages/${participant.npub}`);
  }
</script>

<button
  onclick={openConversation}
  class="w-full flex items-center gap-3 px-4 py-4 hover:bg-neutral-900/50 transition-colors text-left"
>
  <!-- Avatar -->
  {#if participant}
    <Avatar {ndk} pubkey={participant.pubkey} class="w-12 h-12 flex-shrink-0" />
  {/if}

  <!-- Content -->
  <div class="flex-1 min-w-0">
    <!-- Name and time -->
    <div class="flex items-center justify-between mb-1">
      <div class="font-semibold text-white truncate">
        {profile?.name || profile?.displayName || 'Anonymous'}
      </div>
      {#if lastMessage}
        <div class="text-xs text-neutral-500 flex-shrink-0 ml-2">
          <TimeAgo timestamp={lastMessage.timestamp} />
        </div>
      {/if}
    </div>

    <!-- Message preview -->
    <div class="flex items-center justify-between">
      <p class="text-sm text-neutral-400 truncate flex-1">
        {#if lastMessage}
          {#if lastMessage.sender.pubkey === ndk.activeUser?.pubkey}
            <span class="text-neutral-500">You: </span>
          {/if}
          {lastMessage.content}
        {:else}
          No messages yet
        {/if}
      </p>

      <!-- Unread badge -->
      {#if conversation.getUnreadCount() > 0}
        <div class="ml-2 flex-shrink-0 min-w-[20px] h-5 px-1.5 rounded-full bg-orange-500 flex items-center justify-center">
          <span class="text-xs font-bold text-white">
            {conversation.getUnreadCount() > 99 ? '99+' : conversation.getUnreadCount()}
          </span>
        </div>
      {/if}
    </div>
  </div>
</button>
