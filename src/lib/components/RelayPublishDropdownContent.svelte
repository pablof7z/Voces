<script lang="ts">
  import { settings } from '$lib/stores/settings.svelte';
  import { useRelayInfoCached } from '$lib/utils/relayInfo.svelte';
  import { Button } from '$lib/components/ui/button';
  import { Label } from '$lib/components/ui/label';

  interface Props {
    selectedRelayUrls: string[];
    isProtected?: boolean;
    onToggleRelay: (url: string) => void;
    onSelectOnly: (url: string) => void;
    onProtectedChange?: (value: boolean) => void;
    showProtected?: boolean;
  }

  let {
    selectedRelayUrls,
    isProtected = $bindable(false),
    onToggleRelay,
    onSelectOnly,
    onProtectedChange,
    showProtected = true
  }: Props = $props();

  let showProtectedInfo = $state(false);

  const allRelays = $derived(settings.relays.filter(r => r.enabled));

  function handleProtectedChange(value: boolean) {
    isProtected = value;
    onProtectedChange?.(value);
  }
</script>

<div class="p-2">
  <!-- Protected mode toggle -->
  {#if showProtected}
    <div class="px-2 py-2 mb-2 border-b border-border">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <svg class="w-4 h-4 {isProtected ? 'text-primary' : 'text-muted-foreground'}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <Label for="protected-switch" class="text-sm {isProtected ? 'text-primary font-medium' : 'text-muted-foreground'}">
            Protected
          </Label>
          <div class="relative">
            <button
              onclick={() => showProtectedInfo = !showProtectedInfo}
              onmouseover={() => showProtectedInfo = true}
              onmouseleave={() => showProtectedInfo = false}
              class="text-muted-foreground hover:text-muted-foreground transition-colors"
              aria-label="Info about protected mode"
              type="button"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            {#if showProtectedInfo}
              <div class="absolute left-0 bottom-full mb-2 w-64 bg-card border border-border rounded-lg shadow-xl z-50 p-2 text-xs">
                <div class="font-semibold text-foreground mb-1">Protected Mode (NIP-70)</div>
                <div class="text-muted-foreground text-xs">
                  Protected events cannot be republished to other relays without your permission.
                </div>
              </div>
            {/if}
          </div>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={isProtected}
          id="protected-switch"
          onclick={() => handleProtectedChange(!isProtected)}
          class="relative inline-flex h-[1.15rem] w-8 shrink-0 items-center rounded-full border border-transparent transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 {isProtected ? 'bg-primary' : 'bg-input'}"
        >
          <span
            class="pointer-events-none block size-4 rounded-full bg-background ring-0 transition-transform {isProtected ? 'translate-x-[calc(100%-2px)]' : 'translate-x-0'}"
          ></span>
        </button>
      </div>
    </div>
  {/if}

  <div class="text-xs text-muted-foreground px-2 py-1.5 font-medium">Select Relays to Publish</div>
  {#each allRelays as relay (relay.url)}
    {@const relayInfo = useRelayInfoCached(relay.url)}
    {@const isSelected = selectedRelayUrls.includes(relay.url)}
    {@const isReadOnly = !relay.write}
    <div class="group relative flex items-center overflow-hidden">
      <Button
        variant="ghost"
        onclick={() => onToggleRelay(relay.url)}
        class="flex-1 justify-start h-auto py-2 min-w-0 pr-16 {isSelected ? 'bg-muted/50' : ''} {isReadOnly ? 'opacity-60' : ''}"
      >
        {#if relayInfo.info?.icon}
          <img src={relayInfo.info.icon} alt="" class="w-5 h-5 rounded flex-shrink-0 mr-3" />
        {:else}
          <div class="w-5 h-5 rounded bg-muted flex items-center justify-center flex-shrink-0 mr-3">
            <svg class="w-3 h-3 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
            </svg>
          </div>
        {/if}
        <div class="flex-1 min-w-0 text-left overflow-hidden">
          <div class="flex items-center gap-2 min-w-0">
            <div class="text-sm font-medium text-foreground truncate flex-1 min-w-0">
              {relayInfo.info?.name || relay.url.replace('wss://', '').replace('ws://', '')}
            </div>
            {#if isReadOnly}
              <span class="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded whitespace-nowrap flex-shrink-0">read-only</span>
            {/if}
          </div>
          {#if relayInfo.info?.description}
            <div class="text-xs text-muted-foreground truncate overflow-hidden">
              {relayInfo.info.description}
            </div>
          {/if}
        </div>
        {#if isSelected}
          <svg class="w-5 h-5 text-primary flex-shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        {/if}
      </Button>
      <!-- "Only" button - appears on hover (desktop) or always visible (mobile) -->
      <Button
        size="sm"
        onclick={(e) => { e.stopPropagation(); onSelectOnly(relay.url); }}
        title="Publish to only this relay (deselects all others)"
        class="absolute right-2 px-2 py-1 h-auto text-xs md:opacity-0 md:group-hover:opacity-100 transition-opacity md:pointer-events-none md:group-hover:pointer-events-auto"
      >
        Only
      </Button>
    </div>
  {/each}
</div>
