<script lang="ts">
  import { ndk } from '$lib/ndk.svelte';

  let { isOpen = $bindable(false) } = $props();

  let amount = $state(100);
  let recipient = $state('');
  let comment = $state('');
  let isSending = $state(false);
  let success = $state(false);
  let error = $state<string | null>(null);

  async function handleSend() {
    if (amount < 1) {
      error = 'Amount must be at least 1 sat';
      return;
    }

    isSending = true;
    error = null;
    success = false;

    try {
      await ndk.$wallet.pay({
        amount,
        recipient: recipient.trim() || undefined,
        comment: comment.trim() || undefined,
        unit: 'sat',
      });
      success = true;
      setTimeout(() => {
        close();
      }, 2000);
    } catch (e) {
      error = e instanceof Error ? e.message : String(e);
    } finally {
      isSending = false;
    }
  }

  function close() {
    isOpen = false;
    amount = 100;
    recipient = '';
    comment = '';
    success = false;
    error = null;
  }
</script>

{#if isOpen}
  <div class="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onclick={close}>
    <div class="bg-background border border-border rounded-xl max-w-md w-full p-6" onclick={(e) => e.stopPropagation()}>
      <h2 class="text-2xl font-bold text-foreground mb-4">Send Payment</h2>

      {#if success}
        <div class="mb-4 p-4 bg-green-900/20 border border-green-800 rounded-lg text-green-400 text-center">
          ✓ Payment sent successfully!
        </div>
      {/if}

      <div class="mb-4">
        <label class="block text-sm font-medium text-muted-foreground mb-2">
          Amount (sats)
        </label>
        <input
          type="number"
          bind:value={amount}
          min="1"
          step="100"
          class="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      <div class="mb-4">
        <label class="block text-sm font-medium text-muted-foreground mb-2">
          Recipient (optional)
        </label>
        <input
          type="text"
          bind:value={recipient}
          placeholder="npub... or lightning address"
          class="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      <div class="mb-4">
        <label class="block text-sm font-medium text-muted-foreground mb-2">
          Comment (optional)
        </label>
        <input
          type="text"
          bind:value={comment}
          placeholder="What's this payment for?"
          class="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      <button
        onclick={handleSend}
        disabled={isSending || amount < 1 || success}
        class="w-full py-3 bg-primary hover:bg-accent-dark disabled:bg-muted disabled:cursor-not-allowed text-foreground font-medium rounded-lg transition-colors"
      >
        {isSending ? 'Sending...' : success ? 'Sent!' : `Send ${amount} sats`}
      </button>

      {#if error}
        <div class="mt-4 p-3 bg-red-900/20 border border-red-800 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      {/if}

      <button
        onclick={close}
        class="mt-4 w-full py-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        Close
      </button>
    </div>
  </div>
{/if}
