<script lang="ts">
  import { relayFilter } from '$lib/stores/relayFilter.svelte';
  import { settings } from '$lib/stores/settings.svelte';
  import { useRelayInfoCached } from '$lib/utils/relayInfo.svelte';
  import { clickOutside } from '$lib/utils/clickOutside';

  let isOpen = $state(false);
  let enabledRelays = $derived(settings.relays.filter(r => r.enabled && r.read));

  const selectedRelayInfo = $derived.by(() => {
    if (!relayFilter.selectedRelay) return null;
    return useRelayInfoCached(relayFilter.selectedRelay);
  });

  function handleIconClick() {
    isOpen = !isOpen;
  }

  function selectRelay(url: string) {
    relayFilter.selectedRelay = url;
    isOpen = false;
  }

  function selectFollowing() {
    relayFilter.selectedRelay = null;
    isOpen = false;
  }

  function handleClickOutside() {
    isOpen = false;
  }
</script>

<div class="relative" use:clickOutside={handleClickOutside}>
  <!-- Icon Button -->
  <button
    onclick={handleIconClick}
    class="flex items-center justify-center w-8 h-8 rounded-full hover:bg-neutral-800/50 transition-colors"
    aria-label={relayFilter.selectedRelay ? 'Change relay filter' : 'Change following filter'}
  >
    {#if relayFilter.selectedRelay}
      <!-- Relay icon -->
      {#if selectedRelayInfo?.info?.icon}
        <img src={selectedRelayInfo.info.icon} alt="" class="w-5 h-5 rounded" />
      {:else}
        <svg class="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
        </svg>
      {/if}
    {:else}
      <!-- Following icon -->
      <svg class="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    {/if}
  </button>

  <!-- Dropdown Menu -->
  {#if isOpen}
    <div class="absolute left-0 mt-1 w-64 bg-neutral-900 border border-neutral-800 rounded-lg shadow-xl z-50 overflow-hidden">
      <!-- Following option -->
      <button
        onclick={selectFollowing}
        class="w-full px-4 py-3 hover:bg-neutral-800 transition-colors text-left flex items-center gap-3 {!relayFilter.selectedRelay ? 'bg-neutral-800/50' : ''}"
      >
        <svg class="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <div class="flex-1">
          <div class="font-medium text-white">Following</div>
          <div class="text-xs text-neutral-500">All posts from people you follow</div>
        </div>
        {#if !relayFilter.selectedRelay}
          <svg class="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        {/if}
      </button>

      <!-- Divider -->
      <div class="border-t border-neutral-800 my-1"></div>

      <!-- Relay options -->
      <div class="px-2 py-1">
        <div class="text-xs text-neutral-500 px-2 py-1 font-medium">Filter by Relay</div>
        {#each enabledRelays as relay (relay.url)}
          {@const relayInfo = useRelayInfoCached(relay.url)}
          <button
            onclick={() => selectRelay(relay.url)}
            class="w-full px-3 py-2.5 rounded-lg hover:bg-neutral-800 transition-colors text-left flex items-center gap-3 {relayFilter.selectedRelay === relay.url ? 'bg-neutral-800/50' : ''}"
          >
            {#if relayInfo.info?.icon}
              <img src={relayInfo.info.icon} alt="" class="w-5 h-5 rounded flex-shrink-0" />
            {:else}
              <div class="w-5 h-5 rounded bg-neutral-700 flex items-center justify-center flex-shrink-0">
                <svg class="w-3 h-3 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                </svg>
              </div>
            {/if}
            <div class="flex-1 min-w-0">
              <div class="text-sm font-medium text-white truncate">
                {relayInfo.info?.name || relay.url.replace('wss://', '').replace('ws://', '')}
              </div>
              {#if relayInfo.info?.description}
                <div class="text-xs text-neutral-500 truncate">
                  {relayInfo.info.description}
                </div>
              {/if}
            </div>
            {#if relayFilter.selectedRelay === relay.url}
              <svg class="w-5 h-5 text-orange-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            {/if}
          </button>
        {/each}
      </div>

      <!-- Manage relays link -->
      <div class="border-t border-neutral-800 mt-1">
        <a
          href="/settings"
          class="block w-full px-4 py-2.5 text-sm text-center text-orange-500 hover:bg-neutral-800 transition-colors"
          onclick={() => isOpen = false}
        >
          Manage Relays →
        </a>
      </div>
    </div>
  {/if}
</div>
