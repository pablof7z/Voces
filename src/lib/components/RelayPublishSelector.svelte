<script lang="ts">
  import { settings } from '$lib/stores/settings.svelte';
  import { useRelayInfoCached } from '$lib/utils/relayInfo.svelte';
  import { clickOutside } from '$lib/utils/clickOutside';
  import { Button } from '$lib/components/ui/button';
  import { Switch } from '$lib/components/ui/switch';
  import { Label } from '$lib/components/ui/label';

  interface Props {
    selectedRelayUrls?: string[];
    isProtected?: boolean;
    disabled?: boolean;
  }

  let { selectedRelayUrls = $bindable([]), isProtected = $bindable(false), disabled = false }: Props = $props();

  let isRelayDropdownOpen = $state(false);
  let showProtectedInfo = $state(false);

  const allRelays = $derived(settings.relays.filter(r => r.enabled));

  // Initialize selected relays from current relay filter or use all write relays
  $effect(() => {
    if (selectedRelayUrls.length === 0) {
      if (settings.selectedRelay) {
        selectedRelayUrls = [settings.selectedRelay];
      } else {
        selectedRelayUrls = allRelays.filter(r => r.write).map(r => r.url);
      }
    }
  });

  function toggleRelay(url: string) {
    if (selectedRelayUrls.includes(url)) {
      selectedRelayUrls = selectedRelayUrls.filter(u => u !== url);
    } else {
      selectedRelayUrls = [...selectedRelayUrls, url];
    }
  }

  function selectOnlyRelay(url: string) {
    selectedRelayUrls = [url];
    isRelayDropdownOpen = false;
  }

  function handleRelayDropdownClickOutside() {
    isRelayDropdownOpen = false;
  }
</script>

<div class="relative" use:clickOutside={handleRelayDropdownClickOutside}>
  <Button
    variant="outline"
    onclick={() => isRelayDropdownOpen = !isRelayDropdownOpen}
    {disabled}
    class="w-full justify-start"
  >
    {#if selectedRelayUrls.length === 0}
      <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
      </svg>
      <span class="flex-1 text-left">Select relays</span>
    {:else if selectedRelayUrls.length < 3}
      <div class="flex items-center gap-1.5 flex-1">
        {#each selectedRelayUrls as relayUrl}
          {@const relay = allRelays.find(r => r.url === relayUrl)}
          {@const relayInfo = relay ? useRelayInfoCached(relay.url) : null}
          {#if relayInfo?.info?.icon}
            <img src={relayInfo.info.icon} alt="" class="w-5 h-5 rounded flex-shrink-0" />
          {:else}
            <div class="w-5 h-5 rounded bg-muted flex items-center justify-center flex-shrink-0">
              <svg class="w-3 h-3 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
              </svg>
            </div>
          {/if}
        {/each}
      </div>
    {:else}
      <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
      </svg>
      <span class="flex-1 text-left">
        {selectedRelayUrls.length} relays selected
      </span>
    {/if}
    <svg
      class="w-4 h-4 ml-2 transition-transform {isRelayDropdownOpen ? 'rotate-180' : ''}"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
    </svg>
  </Button>

  {#if isRelayDropdownOpen}
    <div class="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-lg shadow-xl z-50 max-h-[400px] max-md:max-h-[50vh] overflow-y-auto">
      <div class="p-2">
        <!-- Protected mode toggle -->
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
            <Switch id="protected-switch" bind:checked={isProtected} />
          </div>
        </div>

        <div class="text-xs text-muted-foreground px-2 py-1.5 font-medium">Select Relays to Publish</div>
        {#each allRelays as relay (relay.url)}
          {@const relayInfo = useRelayInfoCached(relay.url)}
          {@const isSelected = selectedRelayUrls.includes(relay.url)}
          {@const isReadOnly = !relay.write}
          <div class="group relative flex items-center">
            <Button
              variant="ghost"
              onclick={() => toggleRelay(relay.url)}
              class="flex-1 justify-start h-auto py-2 {isSelected ? 'bg-muted/50' : ''} {isReadOnly ? 'opacity-60' : ''}"
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
              <div class="flex-1 min-w-0 text-left">
                <div class="flex items-center gap-2">
                  <div class="text-sm font-medium text-foreground truncate">
                    {relayInfo.info?.name || relay.url.replace('wss://', '').replace('ws://', '')}
                  </div>
                  {#if isReadOnly}
                    <span class="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">read-only</span>
                  {/if}
                </div>
                {#if relayInfo.info?.description}
                  <div class="text-xs text-muted-foreground truncate">
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
            <!-- "Only" button - appears on hover -->
            <Button
              size="sm"
              onclick={(e) => { e.stopPropagation(); selectOnlyRelay(relay.url); }}
              class="absolute right-2 px-2 py-1 h-auto text-xs opacity-0 group-hover:opacity-100 transition-opacity"
              title="Publish only to this relay"
            >
              Only
            </Button>
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>
