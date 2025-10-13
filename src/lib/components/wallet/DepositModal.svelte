<script lang="ts">
  import { ndk } from '$lib/ndk.svelte';
  import type { NDKCashuDeposit } from '@nostr-dev-kit/ndk-wallet';
  import QRCode from './QRCode.svelte';

  let { isOpen = $bindable(false) } = $props();

  let amount = $state(1000);
  let invoice = $state<string | null>(null);
  let deposit = $state<NDKCashuDeposit | undefined>();
  let isLoading = $state(false);
  let error = $state<string | null>(null);

  async function handleDeposit() {
    isLoading = true;
    error = null;

    try {
      deposit = ndk.$wallet.deposit(amount);

      if (!deposit) {
        throw new Error('Failed to create deposit - no Cashu wallet available');
      }

      deposit.on('success', () => {
        console.log('Deposit successful!');
        invoice = null;
        deposit = undefined;
        close();
      });

      deposit.on('error', (err) => {
        error = typeof err === 'string' ? err : err?.message || 'Deposit failed';
        isLoading = false;
      });

      const invoiceStr = await deposit.start();
      invoice = invoiceStr;
    } catch (e) {
      error = e instanceof Error ? e.message : String(e);
    } finally {
      isLoading = false;
    }
  }

  function close() {
    isOpen = false;
    invoice = null;
    deposit = undefined;
    error = null;
    amount = 1000;
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      console.log('Copied to clipboard');
    });
  }
</script>

{#if isOpen}
  <div class="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onclick={close}>
    <div class="bg-background border border-border rounded-xl max-w-md w-full p-6" onclick={(e) => e.stopPropagation()}>
      {#if !invoice}
        <h2 class="text-2xl font-bold text-foreground mb-4">Deposit Funds</h2>

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

        <button
          onclick={handleDeposit}
          disabled={isLoading || amount < 1}
          class="w-full py-3 bg-primary hover:bg-accent-dark disabled:bg-muted disabled:cursor-not-allowed text-foreground font-medium rounded-lg transition-colors"
        >
          {isLoading ? 'Creating Invoice...' : 'Create Invoice'}
        </button>
      {:else}
        <h2 class="text-2xl font-bold text-foreground mb-4">Pay Invoice</h2>

        {#if invoice}
          <div class="mb-4 flex justify-center">
            <QRCode value={invoice} size={256} />
          </div>
        {/if}

        <div class="mb-4">
          <div class="bg-card border border-border rounded-lg p-3 break-all text-sm text-muted-foreground">
            {invoice}
          </div>
        </div>

        <button
          onclick={() => copyToClipboard(invoice || '')}
          class="w-full py-3 bg-muted hover:bg-muted text-foreground font-medium rounded-lg transition-colors mb-3"
        >
          Copy Invoice
        </button>

        <p class="text-center text-muted-foreground text-sm">Waiting for payment...</p>
      {/if}

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
