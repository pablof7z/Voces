<script lang="ts">
  import { goto } from '$app/navigation';
  import { settings } from '$lib/stores/settings.svelte';
  import { useRelayInfoCached } from '$lib/utils/relayInfo.svelte';
  import { clickOutside } from '$lib/utils/clickOutside';
  import { isAgoraRelay, isAgorasSelection, AGORAS_SELECTION } from '$lib/utils/relayUtils';
  import { portal } from '$lib/utils/portal.svelte';

  interface Props {
    active?: boolean;
    collapsed?: boolean;
  }

  const { active = false, collapsed = false }: Props = $props();

  let isOpen = $state(false);
  let enabledRelays = $derived(settings.relays.filter(r => r.enabled && r.read));
  let buttonElement: HTMLElement | null = $state(null);
  let dropdownPosition = $state({ top: 0, left: 0, width: 0 });

  const selectedRelayInfo = $derived.by(() => {
    if (!settings.selectedRelay || isAgorasSelection(settings.selectedRelay)) return null;
    return useRelayInfoCached(settings.selectedRelay);
  });

  const displayName = $derived.by(() => {
    if (isAgorasSelection(settings.selectedRelay)) {
      return 'Agoras';
    }
    if (settings.selectedRelay && selectedRelayInfo?.info?.name) {
      return selectedRelayInfo.info.name;
    }
    if (settings.selectedRelay) {
      return settings.selectedRelay.replace('wss://', '').replace('ws://', '');
    }
    return 'Following';
  });

  function handleClick() {
    if (active) {
      // On home page: toggle dropdown
      if (!isOpen && buttonElement) {
        const rect = buttonElement.getBoundingClientRect();
        dropdownPosition = {
          top: rect.bottom + 4,
          left: rect.left,
          width: rect.width
        };
      }
      isOpen = !isOpen;
    } else {
      // Not on home page: navigate to home
      goto('/');
    }
  }

  function selectRelay(url: string) {
    settings.setSelectedRelay(url);
    isOpen = false;
  }

  function selectAgoras() {
    settings.setSelectedRelay(AGORAS_SELECTION);
    isOpen = false;
  }

  function selectFollowing() {
    settings.setSelectedRelay(null);
    isOpen = false;
  }

  function handleClickOutside() {
    isOpen = false;
  }
</script>

<div class="relative">
  <!-- Navigation Button -->
  <button
    bind:this={buttonElement}
    onclick={handleClick}
    class="flex items-center {collapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3'} rounded-lg transition-colors w-full {active ? 'text-orange-500 bg-orange-500/10' : 'text-neutral-300 hover:bg-neutral-800/50'}"
    title={collapsed ? displayName : undefined}
  >
    <!-- Icon - changes based on selection -->
    {#if isAgorasSelection(settings.selectedRelay)}
      <!-- Agora icon -->
      <img src="/logo-icon.svg" alt="Agoras" class="w-6 h-6 flex-shrink-0" />
    {:else if settings.selectedRelay && selectedRelayInfo?.info?.icon}
      <img src={selectedRelayInfo.info.icon} alt="" class="w-6 h-6 rounded flex-shrink-0" />
    {:else if settings.selectedRelay}
      <div class="w-6 h-6 rounded bg-orange-500 flex items-center justify-center flex-shrink-0">
        <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
        </svg>
      </div>
    {:else}
      <!-- Users icon for "Following" -->
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    {/if}

    {#if !collapsed}
      <span class="font-medium flex-1 text-left whitespace-nowrap overflow-hidden text-ellipsis">{displayName}</span>

      <!-- Chevron -->
      <svg
        class="w-4 h-4 transition-transform {isOpen ? 'rotate-180' : ''}"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    {/if}
  </button>

  <!-- Dropdown Menu - only show when on home page -->
  {#if isOpen && active}
    <div
      use:portal
      use:clickOutside={handleClickOutside}
      style="position: fixed; top: {dropdownPosition.top}px; left: {dropdownPosition.left}px; min-width: {dropdownPosition.width}px;"
      class="w-80 bg-neutral-900 border border-neutral-800 rounded-lg shadow-xl z-50 overflow-hidden"
    >
      <!-- Agoras option -->
      <button
        onclick={selectAgoras}
        class="w-full px-4 py-3 hover:bg-neutral-800 transition-colors text-left flex items-center gap-3 {isAgorasSelection(settings.selectedRelay) ? 'bg-neutral-800/50' : ''}"
      >
        <img src="/logo-icon.svg" alt="Agoras" class="w-5 h-5" />
        <div class="flex-1">
          <div class="font-medium text-white">Agoras</div>
          <div class="text-xs text-neutral-500">Posts from both Agora communities</div>
        </div>
        {#if isAgorasSelection(settings.selectedRelay)}
          <svg class="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        {/if}
      </button>

      <!-- Following option -->
      <button
        onclick={selectFollowing}
        class="w-full px-4 py-3 hover:bg-neutral-800 transition-colors text-left flex items-center gap-3 {!settings.selectedRelay ? 'bg-neutral-800/50' : ''}"
      >
        <svg class="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <div class="flex-1">
          <div class="font-medium text-white">Following</div>
          <div class="text-xs text-neutral-500">All posts from people you follow</div>
        </div>
        {#if !settings.selectedRelay}
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
            class="w-full px-3 py-2.5 rounded-lg hover:bg-neutral-800 transition-colors text-left flex items-center gap-3 {settings.selectedRelay === relay.url ? 'bg-neutral-800/50' : ''}"
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
              <div class="flex items-center gap-1.5">
                <div class="text-sm font-medium text-white truncate">
                  {relayInfo.info?.name || relay.url.replace('wss://', '').replace('ws://', '')}
                </div>
                {#if isAgoraRelay(relay.url)}
                  <span class="flex-shrink-0 px-1.5 py-0.5 text-[10px] font-semibold bg-orange-500/20 text-orange-500 rounded uppercase tracking-wide">
                    Agora
                  </span>
                {/if}
              </div>
              {#if relayInfo.info?.description}
                <div class="text-xs text-neutral-500 truncate">
                  {relayInfo.info.description}
                </div>
              {/if}
            </div>
            {#if settings.selectedRelay === relay.url}
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
