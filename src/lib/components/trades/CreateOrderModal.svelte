<script lang="ts">
  import { NDKEvent } from '@nostr-dev-kit/ndk';
  import { ndk } from '$lib/ndk.svelte';
  import { toast } from '$lib/stores/toast.svelte';
  import * as Dialog from '$lib/components/ui/dialog';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';

  interface Props {
    open: boolean;
    onClose: () => void;
  }

  let { open = $bindable(false), onClose }: Props = $props();

  const currencies = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
    { code: 'ARS', symbol: '$', name: 'Argentine Peso' },
    { code: 'PLN', symbol: 'zł', name: 'Polish Złoty' },
  ];

  const paymentMethods = [
    { id: 'Cash (F2F)', name: 'Cash (F2F)', icon: '💵', requiresLocation: true },
    { id: 'Revolut', name: 'Revolut', icon: '💳' },
    { id: 'PIX', name: 'PIX (Brazil)', icon: '🔄' },
    { id: 'BLIK', name: 'BLIK (Poland)', icon: '📱' },
    { id: 'Zelle', name: 'Zelle', icon: '🏦' },
    { id: 'CashApp', name: 'Cash App', icon: '📲' },
    { id: 'custom', name: 'Other...', icon: '✏️' },
  ];

  function encodeGeohash(lat: number, lon: number, precision = 5): string {
    const base32 = '0123456789bcdefghjkmnpqrstuvwxyz';
    let idx = 0;
    let bit = 0;
    let evenBit = true;
    let geohash = '';

    let latRange = [-90.0, 90.0];
    let lonRange = [-180.0, 180.0];

    while (geohash.length < precision) {
      if (evenBit) {
        const mid = (lonRange[0] + lonRange[1]) / 2;
        if (lon >= mid) {
          idx |= (1 << (4 - bit));
          lonRange[0] = mid;
        } else {
          lonRange[1] = mid;
        }
      } else {
        const mid = (latRange[0] + latRange[1]) / 2;
        if (lat >= mid) {
          idx |= (1 << (4 - bit));
          latRange[0] = mid;
        } else {
          latRange[1] = mid;
        }
      }

      evenBit = !evenBit;
      bit++;

      if (bit === 5) {
        geohash += base32[idx];
        bit = 0;
        idx = 0;
      }
    }

    return geohash;
  }

  let orderType = $state<'buy' | 'sell'>('buy');
  let currency = $state('USD');
  let satsAmount = $state('100000');
  let fiatAmount = $state('50');
  let paymentMethod = $state('Cash (F2F)');
  let customPaymentMethod = $state('');
  let location = $state('');
  let geohash = $state('');
  let premium = $state('0');
  let expirationHours = $state('24');
  let creating = $state(false);

  const showLocationPicker = $derived(
    paymentMethods.find(m => m.id === paymentMethod)?.requiresLocation || false
  );

  $effect(() => {
    if (!showLocationPicker) {
      location = '';
      geohash = '';
    }
  });

  function handleLocationRequest() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          const gh = encodeGeohash(lat, lon, 5);
          geohash = gh;
          location = `Near ${gh} (auto-detected)`;
          toast.success('Location detected');
        },
        (error) => {
          console.error('Error getting location:', error);
          toast.error('Could not get your location. Please enter city/area manually.');
        }
      );
    } else {
      toast.error('Geolocation is not supported by your browser');
    }
  }

  async function handleCreate() {
    const actualPaymentMethod = paymentMethod === 'custom' ? customPaymentMethod : paymentMethod;

    if (!actualPaymentMethod) {
      toast.error('Please specify a payment method');
      return;
    }

    if (paymentMethod === 'Cash (F2F)' && !location && !geohash) {
      toast.error('Please provide a location for face-to-face trades');
      return;
    }

    creating = true;

    try {
      const event = new NDKEvent(ndk.ndk);
      event.kind = 38383;

      const orderId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const tags: string[][] = [
        ['d', orderId],
        ['k', orderType],
        ['f', currency],
        ['s', 'pending'],
        ['amt', satsAmount],
        ['fa', fiatAmount],
        ['pm', actualPaymentMethod],
        ['premium', premium],
        ['y', 'Agora'],
        ['z', 'order'],
        ['network', 'mainnet'],
        ['layer', 'lightning'],
        ['expiration', (Math.floor(Date.now() / 1000) + parseInt(expirationHours) * 3600).toString()]
      ];

      if (geohash) {
        tags.push(['g', geohash]);
      }

      event.tags = tags;
      event.content = '';

      await event.publish();

      toast.success('Order created successfully');
      open = false;
      onClose();
    } catch (error) {
      console.error('Failed to create order:', error);
      toast.error('Failed to create order');
    } finally {
      creating = false;
    }
  }

  const btcAmount = $derived(parseInt(satsAmount) / 100000000);
  const pricePerBtc = $derived(parseFloat(fiatAmount) / btcAmount);
</script>

<Dialog.Root {open} onOpenChange={(newOpen) => {
    open = newOpen;
    if (!newOpen) onClose();
  }}>
  <Dialog.Content class="max-w-lg max-h-[90vh] overflow-y-auto">
    <Dialog.Header>
      <Dialog.Title>Create P2P Order</Dialog.Title>
    </Dialog.Header>

    <div class="space-y-6">
      <!-- Order Type -->
      <div>
        <Label class="block mb-2">Order Type</Label>
        <div class="grid grid-cols-2 gap-3">
          <Button
            variant={orderType === 'buy' ? 'default' : 'outline'}
            onclick={() => orderType = 'buy'}
            class={orderType === 'buy' ? 'border-green-500 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40' : ''}
          >
            I want to buy Bitcoin
          </Button>
          <Button
            variant={orderType === 'sell' ? 'default' : 'outline'}
            onclick={() => orderType = 'sell'}
            class={orderType === 'sell' ? 'border-red-500 bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40' : ''}
          >
            I want to sell Bitcoin
          </Button>
        </div>
      </div>

      <!-- Bitcoin Amount -->
      <div>
        <Label for="sats-amount">Bitcoin Amount (sats)</Label>
        <div class="relative mt-2">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z"/>
          </svg>
          <Input
            id="sats-amount"
            type="number"
            bind:value={satsAmount}
            class="pl-10"
            placeholder="100000"
          />
        </div>
        <p class="mt-1 text-xs text-muted-foreground">
          = {btcAmount.toFixed(8)} BTC
        </p>
      </div>

      <!-- Fiat Amount & Currency -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <Label for="fiat-amount">Fiat Amount</Label>
          <Input
            id="fiat-amount"
            type="number"
            bind:value={fiatAmount}
            placeholder="50"
            class="mt-2"
          />
          <p class="mt-1 text-xs text-muted-foreground">
            ≈ ${pricePerBtc.toFixed(2)}/BTC
          </p>
        </div>
        <div>
          <Label for="currency">Currency</Label>
          <select
            id="currency"
            bind:value={currency}
            class="mt-2 w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
          >
            {#each currencies as curr}
              <option value={curr.code}>
                {curr.symbol} {curr.code}
              </option>
            {/each}
          </select>
        </div>
      </div>

      <!-- Payment Method -->
      <div>
        <Label class="block mb-2">Payment Method</Label>
        <div class="grid grid-cols-2 gap-3">
          {#each paymentMethods as method}
            <Button
              variant={paymentMethod === method.id ? 'default' : 'outline'}
              onclick={() => paymentMethod = method.id}
              class="justify-start h-auto py-2 {paymentMethod === method.id ? 'border-primary' : ''}"
            >
              <span class="text-lg mr-2">{method.icon}</span>
              <span class="text-sm">{method.name}</span>
            </Button>
          {/each}
        </div>

        {#if paymentMethod === 'custom'}
          <div class="mt-3">
            <Input
              bind:value={customPaymentMethod}
              placeholder="Enter payment method (e.g., Bank Transfer, PayPal, etc.)"
              autofocus
            />
          </div>
        {/if}
      </div>

      <!-- Location for F2F -->
      {#if showLocationPicker}
        <div>
          <Label for="location" class="flex items-center gap-1">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            Location (Required for F2F)
          </Label>
          <div class="space-y-2 mt-2">
            <div class="flex gap-2">
              <Input
                id="location"
                bind:value={location}
                placeholder="City, neighborhood, or area"
                class="flex-1"
              />
              <Button
                variant="outline"
                size="icon"
                onclick={handleLocationRequest}
                title="Use current location"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
              </Button>
            </div>
            {#if geohash}
              <p class="text-xs text-muted-foreground">
                Geohash: {geohash} (approximate location)
              </p>
            {/if}
          </div>
        </div>
      {/if}

      <!-- Premium -->
      <div>
        <Label for="premium">Premium (%)</Label>
        <Input
          id="premium"
          type="number"
          bind:value={premium}
          placeholder="0"
          class="mt-2"
        />
        <p class="mt-1 text-xs text-muted-foreground">
          Positive for above market, negative for below
        </p>
      </div>

      <!-- Expiration -->
      <div>
        <Label for="expiration">Expiration (hours)</Label>
        <select
          id="expiration"
          bind:value={expirationHours}
          class="mt-2 w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
        >
          <option value="1">1 hour</option>
          <option value="6">6 hours</option>
          <option value="12">12 hours</option>
          <option value="24">24 hours</option>
          <option value="48">48 hours</option>
          <option value="72">72 hours</option>
        </select>
      </div>
    </div>

    <Dialog.Footer class="mt-6">
      <Button variant="outline" onclick={() => { open = false; onClose(); }}>
        Cancel
      </Button>
      <Button
        onclick={handleCreate}
        disabled={creating || !satsAmount || !fiatAmount}
      >
        {creating ? 'Creating...' : 'Create Order'}
      </Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
