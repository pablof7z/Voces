<script lang="ts">
  import { ndk } from '$lib/ndk.svelte';

  let { isOpen = $bindable(false) } = $props();

  let token = $state('');
  let description = $state('');
  let isReceiving = $state(false);
  let success = $state(false);
  let error = $state<string | null>(null);

  async function handleReceive() {
    if (!token.trim()) {
      error = 'Please enter a Cashu token';
      return;
    }

    isReceiving = true;
    error = null;
    success = false;

    try {
      await ndk.$wallet.receiveToken(token.trim(), description.trim() || undefined);
      success = true;
      setTimeout(() => {
        close();
      }, 2000);
    } catch (e) {
      error = e instanceof Error ? e.message : String(e);
    } finally {
      isReceiving = false;
    }
  }

  function close() {
    isOpen = false;
    token = '';
    description = '';
    success = false;
    error = null;
  }
</script>

{#if isOpen}
  <div class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onclick={close}>
    <div class="bg-black border border-neutral-800 rounded-xl max-w-md w-full p-6" onclick={(e) => e.stopPropagation()}>
      <h2 class="text-2xl font-bold text-white mb-4">Receive Cashu Token</h2>

      {#if success}
        <div class="mb-4 p-4 bg-green-900/20 border border-green-800 rounded-lg text-green-400 text-center">
          ✓ Token received successfully!
        </div>
      {/if}

      <div class="mb-4">
        <label class="block text-sm font-medium text-neutral-300 mb-2">
          Cashu Token
        </label>
        <textarea
          bind:value={token}
          placeholder="Paste Cashu token here (cashuA...)"
          rows="4"
          class="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
        ></textarea>
      </div>

      <div class="mb-4">
        <label class="block text-sm font-medium text-neutral-300 mb-2">
          Description (optional)
        </label>
        <input
          type="text"
          bind:value={description}
          placeholder="e.g., Coffee payment"
          class="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      <button
        onclick={handleReceive}
        disabled={isReceiving || !token.trim() || success}
        class="w-full py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-neutral-700 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
      >
        {isReceiving ? 'Receiving...' : success ? 'Received!' : 'Receive Token'}
      </button>

      {#if error}
        <div class="mt-4 p-3 bg-red-900/20 border border-red-800 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      {/if}

      <button
        onclick={close}
        class="mt-4 w-full py-2 text-neutral-400 hover:text-white transition-colors"
      >
        Close
      </button>
    </div>
  </div>
{/if}
