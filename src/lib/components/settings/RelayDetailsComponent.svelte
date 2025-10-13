<script lang="ts">
  import { settings } from '$lib/stores/settings.svelte';
  import { useRelayInfoCached } from '$lib/utils/relayInfo.svelte';

  interface Props {
    relay: { url: string; read: boolean; write: boolean };
    status: string;
    connectionStatus: Record<string, string>;
  }

  let { relay, status, connectionStatus }: Props = $props();
  let { info } = useRelayInfoCached(relay.url);
</script>

<div class="flex-1 min-w-0">
  <div class="flex flex-wrap items-center gap-2">
    <!-- Icon -->
    {#if info?.limitation?.payment_required}
      <svg class="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    {:else if info?.limitation?.auth_required}
      <svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    {:else if info?.software}
      <svg class="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
      </svg>
    {:else}
      <svg class="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    {/if}

    <!-- URL -->
    <span class="font-mono text-xs md:text-sm text-foreground break-all">
      {relay.url}
    </span>

    <!-- Status badges -->
    {#if status === 'connected'}
      <span class="text-xs bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full">
        Connected
      </span>
    {/if}
    {#if status === 'disconnected' && connectionStatus[relay.url] !== undefined}
      <span class="text-xs bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400 px-2 py-0.5 rounded-full">
        Offline
      </span>
    {/if}
    {#if status === 'testing'}
      <span class="text-xs bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-400 px-2 py-0.5 rounded-full">
        Testing...
      </span>
    {/if}
  </div>

  {#if info}
    <div class="mt-2 space-y-1">
      {#if info.name}
        <div class="flex items-start gap-2">
          <span class="text-xs font-medium text-muted-foreground min-w-[60px]">Name:</span>
          <span class="text-sm font-semibold text-foreground">{info.name}</span>
        </div>
      {/if}

      {#if info.description}
        <div class="flex items-start gap-2">
          <span class="text-xs font-medium text-muted-foreground min-w-[60px]">About:</span>
          <span class="text-sm text-muted-foreground">{info.description}</span>
        </div>
      {/if}

      {#if info.software || info.version}
        <div class="flex items-start gap-2">
          <span class="text-xs font-medium text-muted-foreground min-w-[60px]">Software:</span>
          <span class="text-sm text-muted-foreground">
            {info.software}{info.version ? ` v${info.version}` : ''}
          </span>
        </div>
      {/if}

      {#if info.relay_countries && info.relay_countries.length > 0}
        <div class="flex items-start gap-2">
          <svg class="w-3 h-3 text-muted-foreground mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span class="text-sm text-muted-foreground">
            {info.relay_countries.join(', ')}
          </span>
        </div>
      {/if}

      {#if info.supported_nips && info.supported_nips.length > 0}
        <div class="flex items-start gap-2">
          <svg class="w-3 h-3 text-muted-foreground mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div class="flex-1">
            <span class="text-xs text-muted-foreground">
              Supports {info.supported_nips.length} NIPs: {info.supported_nips.slice(0, 5).join(', ')}
              {#if info.supported_nips.length > 5}...{/if}
            </span>
          </div>
        </div>
      {/if}

      <!-- Feature badges -->
      <div class="flex flex-wrap gap-2 mt-2">
        {#if info.limitation?.payment_required}
          <span class="text-xs bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-400 px-2 py-0.5 rounded-full">
            💰 Paid
          </span>
        {/if}
        {#if info.limitation?.auth_required}
          <span class="text-xs bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded-full">
            🔐 Auth Required
          </span>
        {/if}
        {#if info.contact}
          <span class="text-xs bg-neutral-100 dark:bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
            📧 {info.contact}
          </span>
        {/if}
      </div>
    </div>
  {/if}

  <!-- Read/Write toggles -->
  <div class="flex items-center gap-4 mt-3">
    <label class="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        checked={relay.read}
        onchange={(e) => settings.updateRelay(relay.url, { read: e.currentTarget.checked })}
        class="w-4 h-4 text-primary rounded focus:ring-orange-500"
      />
      <span class="text-sm text-muted-foreground">
        Read
      </span>
    </label>
    <label class="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        checked={relay.write}
        onchange={(e) => settings.updateRelay(relay.url, { write: e.currentTarget.checked })}
        class="w-4 h-4 text-primary rounded focus:ring-orange-500"
      />
      <span class="text-sm text-muted-foreground">
        Write
      </span>
    </label>
  </div>
</div>
