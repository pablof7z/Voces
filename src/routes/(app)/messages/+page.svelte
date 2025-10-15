<script lang="ts">
  import { ndk } from '$lib/ndk.svelte';
  import ConversationList from '$lib/components/messages/ConversationList.svelte';
  import NewMessageModal from '$lib/components/messages/NewMessageModal.svelte';
  import { messagesStore } from '$lib/stores/messages.svelte';

  const currentUser = ndk.$currentUser;

  let showNewMessageModal = $state(false);

  function handleNewMessage() {
    showNewMessageModal = true;
  }
</script>

<div class="h-screen flex flex-col">
  <!-- Header -->
  <div class="sticky top-0 z-10 bg-background border-b border-border/50 px-4 py-3">
    <div class="flex items-center justify-between">
      <h1 class="text-xl font-bold text-foreground">Messages</h1>
      <button
        onclick={handleNewMessage}
        class="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-primary"
        title="New message"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  </div>

  <!-- Conversations List -->
  <div class="flex-1 overflow-y-auto">
    {#if !currentUser}
      <!-- Not logged in state -->
      <div class="flex flex-col items-center justify-center h-full px-6 text-center">
        <svg class="w-20 h-20 text-muted mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <h3 class="text-xl font-semibold text-foreground mb-2">Sign in required</h3>
        <p class="text-muted-foreground max-w-sm">
          Please sign in to view and send direct messages
        </p>
      </div>
    {:else}
      <ConversationList conversations={messagesStore.conversations} />
    {/if}
  </div>
</div>

<NewMessageModal isOpen={showNewMessageModal} onClose={() => showNewMessageModal = false} />
