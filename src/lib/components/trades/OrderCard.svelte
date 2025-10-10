<script lang="ts">
  import { formatDistanceToNow } from 'date-fns';
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import { ndk } from '$lib/ndk.svelte';
  import TakeOrderModal from './TakeOrderModal.svelte';

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
      geohash?: string;
      createdAt: number;
      event: NDKEvent;
    };
  }

  let { order }: Props = $props();

  const profile = ndk.$fetchProfile(() => order.pubkey);
  let showTakeModal = $state(false);

  const currencyData: { [key: string]: { symbol: string; flag: string } } = {
    USD: { symbol: '$', flag: '🇺🇸' },
    EUR: { symbol: '€', flag: '🇪🇺' },
    GBP: { symbol: '£', flag: '🇬🇧' },
    BRL: { symbol: 'R$', flag: '🇧🇷' },
    ARS: { symbol: '$', flag: '🇦🇷' },
    PLN: { symbol: 'zł', flag: '🇵🇱' },
    JPY: { symbol: '¥', flag: '🇯🇵' },
    CHF: { symbol: 'Fr', flag: '🇨🇭' },
    PEN: { symbol: 'S/', flag: '🇵🇪' },
    UYU: { symbol: '$', flag: '🇺🇾' },
    VES: { symbol: 'Bs', flag: '🇻🇪' },
    RUB: { symbol: '₽', flag: '🇷🇺' },
    SEK: { symbol: 'kr', flag: '🇸🇪' },
    NOK: { symbol: 'kr', flag: '🇳🇴' },
    AUD: { symbol: '$', flag: '🇦🇺' },
    CUP: { symbol: '$', flag: '🇨🇺' },
  };

  const paymentMethodData: { [key: string]: { icon: string; region: string } } = {
    'Cash': { icon: '💵', region: 'Universal' },
    'Cash (F2F)': { icon: '💵', region: 'Local' },
    'PIX': { icon: '🔄', region: 'Brazil' },
    'BLIK': { icon: '📱', region: 'Poland' },
    'Revolut': { icon: '💳', region: 'Europe' },
    'Zelle': { icon: '🏦', region: 'USA' },
    'CashApp': { icon: '📲', region: 'USA' },
    'CVU': { icon: '🏧', region: 'Argentina' },
    'MP': { icon: '📲', region: 'Argentina' },
    'f2f': { icon: '🤝', region: 'Local' },
    'СБП': { icon: '🏦', region: 'Russia' },
  };

  const currencyInfo = $derived(currencyData[order.currency] || { symbol: order.currency, flag: '🌍' });
  const paymentInfo = $derived(paymentMethodData[order.paymentMethod] || { icon: '💰', region: '' });

  // Calculate price per BTC
  const pricePerBtc = $derived(order.fiatAmount > 0 && order.satsAmount > 0
    ? (order.fiatAmount / order.satsAmount) * 100000000
    : 0);
</script>

<div class="bg-white dark:bg-black rounded-lg md:rounded-xl border border-neutral-200 dark:border-neutral-800 p-3 md:p-4 hover:shadow-lg transition-shadow">
  <div class="flex items-start justify-between mb-2 md:mb-3">
    <div class="flex items-center gap-3">
      {#if profile?.picture}
        <img
          src={profile.picture}
          alt={profile.name || 'User'}
          class="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover"
        />
      {:else}
        <div class="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-orange-500 to-red-400 rounded-full" />
      {/if}
      <div>
        <div class="flex items-center gap-2">
          <h3 class="font-semibold text-sm md:text-base text-neutral-900 dark:text-white">
            {profile?.name || `@${order.pubkey.slice(0, 6)}...`}
          </h3>
          {#if order.rating && order.rating > 0}
            <div class="flex items-center gap-1 text-yellow-500">
              <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              <span class="text-sm">{order.rating.toFixed(1)}</span>
            </div>
          {/if}
        </div>
        <p class="text-xs text-neutral-500 dark:text-neutral-400">
          {formatDistanceToNow(order.createdAt * 1000, { addSuffix: true })}
          {#if order.platform}
            • {order.platform}
          {/if}
          {#if order.geohash && order.paymentMethod.includes('F2F')}
            <span class="inline-flex items-center gap-1 ml-2">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              <span>Near {order.geohash.substring(0, 4)}</span>
            </span>
          {/if}
        </p>
      </div>
    </div>

    <div class="flex items-center gap-1 md:gap-2">
      <span class="text-lg md:text-2xl">{currencyInfo.flag}</span>
      <div class={`px-2 md:px-3 py-0.5 md:py-1 rounded-full text-xs md:text-sm font-medium ${
        order.type === 'buy'
          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      }`}>
        {order.type === 'buy' ? 'Buying' : 'Selling'}
      </div>
    </div>
  </div>

  <div class="grid grid-cols-3 gap-2 md:gap-4 mb-3 md:mb-4">
    <div>
      <p class="text-xs text-neutral-500 dark:text-neutral-400 mb-0.5 md:mb-1">Amount</p>
      <div class="flex items-center gap-1 md:gap-2">
        <svg class="w-3 h-3 md:w-4 md:h-4 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z"/>
        </svg>
        <span class="font-mono font-semibold text-xs md:text-base text-neutral-900 dark:text-white">
          {(order.satsAmount / 100000000).toFixed(4)}
        </span>
      </div>
      <p class="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 md:mt-1 hidden md:block">
        {order.satsAmount.toLocaleString()} sats
      </p>
    </div>

    <div>
      <p class="text-xs text-neutral-500 dark:text-neutral-400 mb-0.5 md:mb-1">Price</p>
      <div class="flex items-center gap-1">
        <span class="text-sm md:text-base hidden md:inline">{currencyInfo.flag}</span>
        <p class="text-sm md:text-lg font-semibold text-neutral-900 dark:text-white">
          {currencyInfo.symbol}{order.fiatAmount.toFixed(0)}
        </p>
      </div>
      {#if pricePerBtc > 0}
        <p class="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
          {currencyInfo.symbol}{pricePerBtc.toFixed(2)}/BTC
          {#if order.premium && order.premium !== 0}
            <span class={order.premium > 0 ? 'text-red-500' : 'text-green-500'}>
              ({order.premium > 0 ? '+' : ''}{order.premium}%)
            </span>
          {/if}
        </p>
      {/if}
    </div>

    <div class="min-w-0">
      <p class="text-xs text-neutral-500 dark:text-neutral-400 mb-0.5 md:mb-1">Payment</p>
      <div class="flex items-center gap-1 md:gap-2">
        <span class="text-sm md:text-lg flex-shrink-0">{paymentInfo.icon}</span>
        <div class="flex flex-col min-w-0">
          <span class="font-medium text-xs md:text-base text-neutral-900 dark:text-white truncate max-w-[80px] md:max-w-none">
            {order.paymentMethod}
          </span>
          {#if paymentInfo.region}
            <span class="text-xs text-neutral-500 dark:text-neutral-400 hidden md:inline">
              {paymentInfo.region}
            </span>
          {/if}
        </div>
      </div>
    </div>
  </div>

  <div class="flex items-center gap-2">
    <button
      onclick={() => showTakeModal = true}
      class="flex-1 flex items-center justify-center gap-1 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm md:text-base"
    >
      <svg class="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
      </svg>
      <span class="hidden md:inline">{order.type === 'buy' ? 'Sell to User' : 'Buy from User'}</span>
      <span class="md:hidden">{order.type === 'buy' ? 'Sell' : 'Buy'}</span>
    </button>
    <button class="p-1.5 md:p-2 border border-neutral-300 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors">
      <svg class="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
      </svg>
    </button>
    <button class="p-1.5 md:p-2 border border-neutral-300 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors hidden md:block">
      <svg class="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
      </svg>
    </button>
  </div>
</div>

{#if showTakeModal}
  <TakeOrderModal {order} onClose={() => showTakeModal = false} />
{/if}
