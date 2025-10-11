<script lang="ts">
  import { NDKEvent } from '@nostr-dev-kit/ndk';
  import { ndk } from '$lib/ndk.svelte';

  interface Props {
    order: {
      id: string;
      pubkey: string;
      type: 'buy' | 'sell';
      currency: string;
      status: string;
      paymentMethod: string;
      satsAmount: number;
      fiatAmount: number;
      premium?: number;
      rating?: number;
      platform?: string;
      createdAt: number;
      event: NDKEvent;
    };
    onClose: () => void;
  }

  let { order, onClose }: Props = $props();

  const profile = ndk.$fetchProfile(() => order.pubkey);
  let step = $state<'confirm' | 'processing' | 'complete'>('confirm');
  let accepted = $state(false);

  async function handleTakeOrder() {
    step = 'processing';

    try {
      // Create a take order event
      const event = new NDKEvent(ndk.ndk);
      event.kind = 38383;

      // Create response event with reference to original order
      event.tags = [
        ['d', `take-${order.id}-${Date.now()}`],
        ['e', order.event.id],
        ['p', order.pubkey],
        ['k', order.type === 'buy' ? 'sell' : 'buy'],
        ['f', order.currency],
        ['s', 'in-progress'],
        ['amt', order.satsAmount.toString()],
        ['fa', order.fiatAmount.toString()],
        ['pm', order.paymentMethod],
        ['y', 'Agora'],
        ['z', 'take-order']
      ];

      event.content = `Taking order ${order.id}`;

      await event.publish();

      // Update original order status (in real implementation, this would be handled by the maker)
      const statusUpdate = new NDKEvent(ndk.ndk);
      statusUpdate.kind = 38383;
      statusUpdate.tags = [
        ...order.event.tags.filter(t => t[0] !== 's'),
        ['s', 'in-progress']
      ];
      statusUpdate.content = '';

      await statusUpdate.publish();

      step = 'complete';

      // Close modal after a delay
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Failed to take order:', error);
      step = 'confirm';
    }
  }

  const currencySymbol = $derived({ USD: '$', EUR: '€', GBP: '£', BRL: 'R$' }[order.currency as 'USD' | 'EUR' | 'GBP' | 'BRL'] || order.currency);
</script>

<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
  <div class="bg-white dark:bg-black rounded-2xl max-w-md w-full">
    {#if step === 'confirm'}
      <div class="p-6 border-b border-neutral-200 dark:border-neutral-800">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-bold text-neutral-900 dark:text-white">
            Confirm Trade
          </h2>
          <button
            onclick={onClose}
            class="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-lg transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <div class="p-6 space-y-4">
        <!-- Trade Summary -->
        <div class="bg-neutral-50 dark:bg-black rounded-lg p-4 space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-sm text-neutral-500 dark:text-neutral-400">You will {order.type === 'buy' ? 'sell' : 'buy'}</span>
            <div class="flex items-center gap-1">
              <svg class="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z"/>
              </svg>
              <span class="font-mono font-semibold">{(order.satsAmount / 100000000).toFixed(8)} BTC</span>
            </div>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-neutral-500 dark:text-neutral-400">For</span>
            <span class="font-semibold">{currencySymbol}{order.fiatAmount.toFixed(2)}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-neutral-500 dark:text-neutral-400">Via</span>
            <span class="font-medium">{order.paymentMethod}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-neutral-500 dark:text-neutral-400">Trading with</span>
            <div class="flex items-center gap-2">
              <span class="font-medium">{profile?.name || 'Anonymous'}</span>
              {#if order.rating}
                <span class="text-yellow-500 text-sm">★ {order.rating.toFixed(1)}</span>
              {/if}
            </div>
          </div>
        </div>

        <!-- Warning -->
        <div class="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <svg class="w-5 h-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
          <div class="text-sm text-yellow-800 dark:text-yellow-300">
            <p class="font-medium mb-1">Trade Safely</p>
            <ul class="space-y-1 text-xs">
              <li>• Never release funds before confirming payment</li>
              <li>• Use escrow when available</li>
              <li>• Communicate only through secure channels</li>
              <li>• Report suspicious behavior immediately</li>
            </ul>
          </div>
        </div>

        <!-- Terms Acceptance -->
        <label class="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            bind:checked={accepted}
            class="mt-1 w-4 h-4 text-orange-600 border-neutral-300 rounded focus:ring-orange-500"
          />
          <span class="text-sm text-neutral-700 dark:text-neutral-300">
            I understand the risks and agree to proceed with this P2P trade
          </span>
        </label>

        <!-- Actions -->
        <div class="flex gap-3">
          <button
            onclick={onClose}
            class="flex-1 px-4 py-3 border border-neutral-300 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
          >
            Cancel
          </button>
          <button
            onclick={handleTakeOrder}
            disabled={!accepted}
            class="flex-1 px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Take Order
          </button>
        </div>
      </div>
    {/if}

    {#if step === 'processing'}
      <div class="p-12 text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
        <p class="text-neutral-900 dark:text-white font-medium">Processing Trade...</p>
        <p class="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
          Connecting with trader
        </p>
      </div>
    {/if}

    {#if step === 'complete'}
      <div class="p-12 text-center">
        <div class="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
          </svg>
        </div>
        <p class="text-neutral-900 dark:text-white font-medium">Trade Initiated!</p>
        <p class="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
          Check your messages for next steps
        </p>
      </div>
    {/if}
  </div>
</div>
