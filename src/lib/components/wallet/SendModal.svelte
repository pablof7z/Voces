<script lang="ts">
  import { ndk } from '$lib/ndk.svelte';
  import * as Dialog from '$lib/components/ui/dialog';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';

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

<Dialog.Root open={isOpen} onOpenChange={(newOpen) => {
    isOpen = newOpen;
    if (!newOpen) close();
  }}>
  <Dialog.Content class="max-w-md">
    <Dialog.Header>
      <Dialog.Title>Send Payment</Dialog.Title>
    </Dialog.Header>

    {#if success}
      <div class="p-4 bg-green-900/20 border border-green-800 rounded-lg text-green-400 text-center">
        ✓ Payment sent successfully!
      </div>
    {/if}

    <div class="space-y-4">
      <div>
        <Label for="amount">Amount (sats)</Label>
        <Input
          id="amount"
          type="number"
          bind:value={amount}
          min="1"
          step="100"
          class="mt-2"
        />
      </div>

      <div>
        <Label for="recipient">Recipient (optional)</Label>
        <Input
          id="recipient"
          type="text"
          bind:value={recipient}
          placeholder="npub... or lightning address"
          class="mt-2"
        />
      </div>

      <div>
        <Label for="comment">Comment (optional)</Label>
        <Input
          id="comment"
          type="text"
          bind:value={comment}
          placeholder="What's this payment for?"
          class="mt-2"
        />
      </div>

      <Button
        onclick={handleSend}
        disabled={isSending || amount < 1 || success}
        class="w-full"
      >
        {isSending ? 'Sending...' : success ? 'Sent!' : `Send ${amount} sats`}
      </Button>

      {#if error}
        <div class="p-3 bg-red-900/20 border border-red-800 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      {/if}
    </div>

    <Dialog.Footer>
      <Button variant="ghost" onclick={close} class="w-full">
        Close
      </Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
