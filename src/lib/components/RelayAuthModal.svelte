<script lang="ts">
  import { relayAuthModal } from '$lib/stores/relayAuthModal.svelte';
  import * as Dialog from '$lib/components/ui/dialog';
  import { Button } from '$lib/components/ui/button';

  function handleConfirm() {
    relayAuthModal.confirm();
  }

  function handleReject() {
    relayAuthModal.reject();
  }

  function handleClose() {
    relayAuthModal.reject();
  }

  const open = $derived(relayAuthModal.show && !!relayAuthModal.request);
</script>

<Dialog.Root open={open} onOpenChange={(isOpen) => {
    if (!isOpen) handleClose();
  }}>
  <Dialog.Content class="max-w-md">
    <Dialog.Header>
      <div class="flex items-center gap-3 mb-4">
        <div class="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
          <svg class="w-5 h-5 text-primary dark:text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <Dialog.Title>Relay Authentication</Dialog.Title>
      </div>
    </Dialog.Header>

    {#if relayAuthModal.request}
      <div class="space-y-4">
        <div>
          <p class="text-muted-foreground mb-2">
            The relay <strong class="font-semibold text-foreground">{relayAuthModal.request.relayUrl}</strong> is requesting authentication.
          </p>
          <p class="text-sm text-muted-foreground">
            This will create a signed authentication event using your Nostr identity. Your decision will be remembered for this relay.
          </p>
        </div>

        <div class="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div class="flex gap-2">
            <svg class="w-5 h-5 flex-shrink-0 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div class="text-sm text-blue-800 dark:text-blue-300">
              <strong class="font-semibold">Why authenticate?</strong>
              <p class="mt-1">Some relays require authentication to access content or reduce spam. This proves you're a real Nostr user.</p>
            </div>
          </div>
        </div>
      </div>

      <Dialog.Footer class="flex gap-3 sm:space-x-0">
        <Button variant="outline" onclick={handleReject} class="flex-1">
          Reject
        </Button>
        <Button onclick={handleConfirm} class="flex-1">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          Authenticate
        </Button>
      </Dialog.Footer>
    {/if}
  </Dialog.Content>
</Dialog.Root>
