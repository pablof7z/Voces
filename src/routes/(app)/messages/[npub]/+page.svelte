<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { ndk } from '$lib/ndk.svelte';
  import { messagesStore } from '$lib/stores/messages.svelte';
  import { Avatar } from '@nostr-dev-kit/svelte';
  import ConversationThread from '$lib/components/messages/ConversationThread.svelte';
  import MessageComposer from '$lib/components/messages/MessageComposer.svelte';
  import type { NDKUser } from '@nostr-dev-kit/ndk';
  import type { NDKMessage, NDKConversation } from '@nostr-dev-kit/messages';

  const currentUser = ndk.$currentUser;

  let participant = $state<NDKUser | null>(null);
  let participantPubkey = $state<string | null>(null);
  let conversation = $state<NDKConversation | null>(null);
  let messages = $state<NDKMessage[]>([]);
  let loading = $state(true);
  let error = $state<string | null>(null);
  let lastNpub = $state<string>('');

  const npub = $derived($page.params.npub);

  // Reactive profile fetching
  const profile = $derived(participantPubkey ? ndk.$fetchProfile(() => participantPubkey) : null);

  async function loadConversation() {
    if (!npub || !currentUser) {
      error = 'Invalid conversation';
      loading = false;
      return;
    }

    // Prevent reload if npub hasn't changed
    if (npub === lastNpub && participant) {
      return;
    }

    try {
      loading = true;
      error = null;
      lastNpub = npub;

      // Get participant from npub
      participant = ndk.getUser({ npub });
      participantPubkey = participant.pubkey;

      // Get conversation from store
      conversation = await messagesStore.getConversation(npub);

      if (conversation) {
        // Get messages from conversation
        messages = await conversation.getMessages(100);

        // Mark conversation as read
        await messagesStore.markConversationAsRead(conversation.id);

        // Listen for new messages in this conversation
        conversation.on('message', async () => {
          messages = await conversation!.getMessages(100);
        });
      }
    } catch (err) {
      console.error('Failed to load conversation:', err);
      error = 'Failed to load conversation';
    } finally {
      loading = false;
    }
  }

  function handleBack() {
    goto('/messages');
  }

  async function handleMessageSent() {
    // Refresh messages from conversation
    if (conversation) {
      messages = await conversation.getMessages(100);
    }
  }

  // Load conversation when component mounts or npub changes
  $effect(() => {
    if (npub && currentUser) {
      loadConversation();
    }
  });
</script>

<div class="h-screen flex flex-col">
  <!-- Header -->
  <div class="sticky top-0 z-10 bg-black border-b border-neutral-800/50 px-4 py-3">
    <div class="flex items-center gap-3">
      <!-- Back button -->
      <button
        onclick={handleBack}
        class="p-2 rounded-lg hover:bg-neutral-800/50 transition-colors text-neutral-400 hover:text-white"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {#if participant}
        <!-- Avatar -->
        <Avatar {ndk} pubkey={participant.pubkey} class="w-10 h-10" />

        <!-- Name -->
        <div class="flex-1 min-w-0">
          <h1 class="text-lg font-bold text-white truncate">
            {profile?.name || profile?.displayName || 'Anonymous'}
          </h1>
          {#if profile?.nip05}
            <p class="text-xs text-neutral-500 truncate">
              {profile.nip05}
            </p>
          {/if}
        </div>

        <!-- Profile button -->
        <button
          onclick={() => goto(`/p/${participant.npub}`)}
          class="p-2 rounded-lg hover:bg-neutral-800/50 transition-colors text-neutral-400 hover:text-orange-500"
          title="View profile"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </button>
      {:else}
        <div class="flex-1">
          <div class="h-5 w-32 bg-neutral-800 rounded animate-pulse" />
        </div>
      {/if}
    </div>
  </div>

  <!-- Content -->
  {#if !currentUser}
    <!-- Not logged in -->
    <div class="flex-1 flex items-center justify-center px-6 text-center">
      <div>
        <svg class="w-20 h-20 text-neutral-700 mb-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <h3 class="text-xl font-semibold text-white mb-2">Sign in required</h3>
        <p class="text-neutral-400 max-w-sm">
          Please sign in to view and send direct messages
        </p>
      </div>
    </div>
  {:else if loading}
    <!-- Loading -->
    <div class="flex-1 flex items-center justify-center">
      <svg class="w-8 h-8 text-orange-500 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
    </div>
  {:else if error}
    <!-- Error -->
    <div class="flex-1 flex items-center justify-center px-6 text-center">
      <div>
        <svg class="w-20 h-20 text-red-500 mb-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 class="text-xl font-semibold text-white mb-2">Error</h3>
        <p class="text-neutral-400">{error}</p>
        <button
          onclick={loadConversation}
          class="mt-4 px-4 py-2 bg-orange-500 hover:bg-orange-500/90 text-white rounded-lg transition-colors"
        >
          Retry
        </button>
      </div>
    </div>
  {:else if participant}
    <!-- Conversation -->
    <ConversationThread {messages} />
    <MessageComposer recipient={participant} onMessageSent={handleMessageSent} />
  {/if}
</div>
