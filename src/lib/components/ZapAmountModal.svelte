<script lang="ts">
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import { settings } from '$lib/stores/settings.svelte';
  import * as Dialog from '$lib/components/ui/dialog';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';

  interface Props {
    open?: boolean;
    event: NDKEvent;
    onZap: (amount: number) => void;
    onCancel: () => void;
  }

  let { open = $bindable(false), event, onZap, onCancel }: Props = $props();

  const amounts = [
    { value: 10, label: '10', emoji: '☕' },
    { value: 21, label: '21', emoji: '⚡' },
    { value: 50, label: '50', emoji: '🤙' },
    { value: 100, label: '100', emoji: '💯' },
    { value: 500, label: '500', emoji: '🔥' },
    { value: 1000, label: '1K', emoji: '💎' },
    { value: 2100, label: '2.1K', emoji: '🚀' },
    { value: 5000, label: '5K', emoji: '👑' }
  ];

  let selectedAmount = $state(settings.zap.defaultAmount);
  let customAmount = $state('');
  let isCustom = $state(false);

  function handleAmountSelect(amount: number) {
    selectedAmount = amount;
    isCustom = false;
    customAmount = '';
  }

  function handleCustomInput() {
    isCustom = true;
    const parsed = Number.parseInt(customAmount);
    if (!Number.isNaN(parsed) && parsed > 0) {
      selectedAmount = parsed;
    }
  }

  function handleZap() {
    if (selectedAmount > 0) {
      onZap(selectedAmount);
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && selectedAmount > 0) {
      handleZap();
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<Dialog.Root open={open} onOpenChange={(isOpen) => {
    if (!isOpen) {
      onCancel();
    } else {
      open = true;
    }
  }}>
    <Dialog.Content class="max-w-md bg-background border-2 border-primary/30 shadow-2xl shadow-primary/50">
      <!-- Header with glow effect -->
      <div class="relative -mx-6 -mt-6 px-6 py-6 mb-6 border-b border-border bg-primary/10">
        <div class="absolute inset-0 bg-primary/5 blur-xl"></div>
        <div class="relative flex items-center gap-3">
          <div class="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/50">
            <span class="text-2xl">⚡</span>
          </div>
          <div>
            <Dialog.Title class="text-xl text-foreground">Zap Amount</Dialog.Title>
            <Dialog.Description class="text-sm text-muted-foreground">Choose your zap amount</Dialog.Description>
          </div>
        </div>
      </div>

      <!-- Amount Grid -->
      <div class="space-y-6">
        <div class="grid grid-cols-4 gap-3">
          {#each amounts as amount}
            <Button
              variant="ghost"
              onclick={() => handleAmountSelect(amount.value)}
              class="group relative overflow-hidden rounded-2xl p-4 h-auto transition-all duration-200 {selectedAmount === amount.value && !isCustom
                ? 'bg-primary shadow-lg shadow-primary/50 scale-105'
                : 'bg-muted hover:bg-muted/80 hover:scale-105'}"
            >
              <div class="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div class="relative flex flex-col items-center gap-2">
                <span class="text-2xl">{amount.emoji}</span>
                <span class="text-xs font-bold {selectedAmount === amount.value && !isCustom ? 'text-primary-foreground' : 'text-foreground'}">{amount.label}</span>
              </div>
            </Button>
          {/each}
        </div>

        <!-- Custom Amount Input -->
        <div class="space-y-2">
          <Label for="custom-amount" class="text-sm font-semibold text-muted-foreground">
            Custom Amount
          </Label>
          <div class="relative">
            <Input
              id="custom-amount"
              type="number"
              bind:value={customAmount}
              oninput={handleCustomInput}
              placeholder="Enter custom amount..."
              class="w-full px-4 py-4 bg-muted border-2 {isCustom ? 'border-primary' : 'border-border'} rounded-2xl text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-primary transition-colors text-lg font-semibold pr-16"
            />
            <div class="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">
              sats
            </div>
          </div>
        </div>

        <!-- Selected Amount Display -->
        {#if selectedAmount > 0}
          <div class="p-4 rounded-2xl bg-primary/20 border-2 border-primary/30">
            <div class="flex items-center justify-between">
              <span class="text-sm text-foreground/70">Selected Amount:</span>
              <span class="text-2xl font-bold text-foreground">
                {selectedAmount.toLocaleString()} sats
              </span>
            </div>
          </div>
        {/if}

        <!-- Action Buttons -->
        <Dialog.Footer class="flex gap-3 sm:space-x-0">
          <Button
            variant="outline"
            onclick={onCancel}
            class="flex-1 px-6 py-4 rounded-2xl"
          >
            Cancel
          </Button>
          <Button
            onclick={handleZap}
            disabled={selectedAmount <= 0}
            class="flex-1 px-6 py-4 rounded-2xl bg-primary hover:opacity-90 shadow-lg shadow-primary/50 hover:shadow-primary/70 disabled:opacity-50 disabled:shadow-none"
          >
            <span class="text-xl mr-2">⚡</span>
            Zap {selectedAmount > 0 ? selectedAmount.toLocaleString() : ''}
          </Button>
        </Dialog.Footer>
      </div>
    </Dialog.Content>
</Dialog.Root>
