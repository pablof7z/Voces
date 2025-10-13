<script lang="ts">
  import { ndk } from '$lib/ndk.svelte';
  import * as Dialog from '$lib/components/ui/dialog';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { Textarea } from '$lib/components/ui/textarea';

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

<Dialog.Root open={isOpen} onOpenChange={(newOpen) => {
    isOpen = newOpen;
    if (!newOpen) close();
  }}>
  <Dialog.Content class="max-w-md">
    <Dialog.Header>
      <Dialog.Title>Receive Cashu Token</Dialog.Title>
    </Dialog.Header>

    {#if success}
      <div class="p-4 bg-green-900/20 border border-green-800 rounded-lg text-green-400 text-center">
        ✓ Token received successfully!
      </div>
    {/if}

    <div class="space-y-4">
      <div>
        <Label for="token">Cashu Token</Label>
        <Textarea
          id="token"
          bind:value={token}
          placeholder="Paste Cashu token here (cashuA...)"
          rows={4}
          class="mt-2 resize-none"
        />
      </div>

      <div>
        <Label for="description">Description (optional)</Label>
        <Input
          id="description"
          type="text"
          bind:value={description}
          placeholder="e.g., Coffee payment"
          class="mt-2"
        />
      </div>

      <Button
        onclick={handleReceive}
        disabled={isReceiving || !token.trim() || success}
        class="w-full"
      >
        {isReceiving ? 'Receiving...' : success ? 'Received!' : 'Receive Token'}
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
