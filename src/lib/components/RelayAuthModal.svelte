<script lang="ts">
  import { relayAuthModal } from '$lib/stores/relayAuthModal.svelte';

  function handleConfirm() {
    relayAuthModal.confirm();
  }

  function handleReject() {
    relayAuthModal.reject();
  }

  function handleClose() {
    relayAuthModal.reject();
  }
</script>

{#if relayAuthModal.show && relayAuthModal.request}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
    onclick={handleClose}
    role="presentation"
  >
    <div
      class="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 w-full max-w-md p-6"
      onclick={(e) => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
      tabindex="-1"
    >
      <!-- Header -->
      <div class="flex items-start justify-between mb-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0">
            <svg class="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <h2 class="text-xl font-bold text-neutral-900 dark:text-white">Relay Authentication</h2>
          </div>
        </div>
        <button
          onclick={handleClose}
          class="text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
          aria-label="Close dialog"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Content -->
      <div class="mb-6">
        <p class="text-neutral-700 dark:text-neutral-300 mb-2">
          The relay <strong class="font-semibold text-neutral-900 dark:text-white">{relayAuthModal.request.relayUrl}</strong> is requesting authentication.
        </p>
        <p class="text-sm text-neutral-600 dark:text-neutral-400">
          This will create a signed authentication event using your Nostr identity. Your decision will be remembered for this relay.
        </p>
      </div>

      <!-- Info box -->
      <div class="mb-6 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
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

      <!-- Actions -->
      <div class="flex gap-3">
        <button
          onclick={handleReject}
          class="flex-1 px-4 py-3 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white rounded-lg transition-colors font-medium"
        >
          Reject
        </button>
        <button
          onclick={handleConfirm}
          class="flex-1 px-4 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors font-semibold flex items-center justify-center gap-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          Authenticate
        </button>
      </div>
    </div>
  </div>
{/if}
