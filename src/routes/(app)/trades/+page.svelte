<script lang="ts">
  import { page } from '$app/stores';
  import { ndk } from '$lib/ndk.svelte';
  import OrderBook from '$lib/components/trades/OrderBook.svelte';
  import CreateOrderModal from '$lib/components/trades/CreateOrderModal.svelte';

  let showCreateModal = $state(false);

  const filters = $derived({
    currency: $page.url.searchParams.get('currency') || 'all',
    paymentMethod: $page.url.searchParams.get('paymentMethod') || 'all',
    orderType: ($page.url.searchParams.get('orderType') || 'all') as 'all' | 'buy' | 'sell',
    minAmount: parseInt($page.url.searchParams.get('minAmount') || '0'),
    maxAmount: parseInt($page.url.searchParams.get('maxAmount') || '1000000')
  });
</script>

<div class="min-h-screen">
  <!-- Header -->
  <div class="border-b border-border sticky top-0 z-20 bg-background">
    <div class="px-4 sm:px-6 lg:px-8 py-4">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-foreground">P2P Trading</h1>
          <p class="text-sm text-neutral-400 mt-1">
            Buy and sell Bitcoin directly
          </p>
        </div>

        {#if ndk.$currentUser}
          <button
            onclick={() => showCreateModal = true}
            class="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>Create Order</span>
          </button>
        {/if}
      </div>
    </div>
  </div>

  <!-- Main Content -->
  <div class="px-4 sm:px-6 lg:px-8 py-6">
    <OrderBook {filters} />
  </div>

  <!-- Create Order Modal -->
  {#if showCreateModal}
    <CreateOrderModal onClose={() => showCreateModal = false} />
  {/if}
</div>
