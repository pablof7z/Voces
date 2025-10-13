<script lang="ts">
  import { settings } from '$lib/stores/settings.svelte';
  import RelayDetailsComponent from './RelayDetailsComponent.svelte';

  let isAdding = $state(false);
  let newRelay = $state({ url: '', read: true, write: true });
  let testingRelay = $state<string | null>(null);
  let connectionStatus = $state<Record<string, 'connected' | 'disconnected' | 'testing'>>({});

  function handleAddRelay() {
    if (newRelay.url && !settings.relays.some(r => r.url === newRelay.url)) {
      const url = newRelay.url.startsWith('wss://') || newRelay.url.startsWith('ws://')
        ? newRelay.url
        : `wss://${newRelay.url}`;
      settings.addRelay({
        ...newRelay,
        enabled: true,
        url,
      });
      newRelay = { url: '', read: true, write: true };
      isAdding = false;
    }
  }

  async function testRelayConnection(url: string) {
    testingRelay = url;
    connectionStatus = { ...connectionStatus, [url]: 'testing' };

    // Mock connection test
    setTimeout(() => {
      const isConnected = Math.random() > 0.3; // 70% success rate for demo
      connectionStatus = {
        ...connectionStatus,
        [url]: isConnected ? 'connected' : 'disconnected'
      };
      testingRelay = null;
    }, 1500);
  }

  function getRelayStatus(url: string) {
    if (testingRelay === url) return 'testing';
    return connectionStatus[url] || 'disconnected';
  }

  let relays = $derived(settings.relays);
</script>

<div class="space-y-6">
  <div>
    <h2 class="text-xl font-semibold text-foreground mb-2">
      Relay Configuration
    </h2>
    <p class="text-sm text-muted-foreground">
      Configure which Nostr relays your app connects to for reading and publishing events.
    </p>
  </div>

  <!-- Stats -->
  <div class="grid grid-cols-3 gap-2 md:gap-4">
    <div class="bg-neutral-50 dark:bg-background rounded-lg p-3 md:p-4">
      <div class="flex items-center gap-1 md:gap-2 text-green-600 dark:text-green-400 mb-1">
        <svg class="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
        </svg>
        <span class="text-xs md:text-sm font-medium">Active</span>
      </div>
      <div class="text-xl md:text-2xl font-bold text-foreground">
        {relays.filter(r => r.enabled).length}
      </div>
    </div>
    <div class="bg-neutral-50 dark:bg-background rounded-lg p-3 md:p-4">
      <div class="flex items-center gap-1 md:gap-2 text-blue-600 dark:text-blue-400 mb-1">
        <svg class="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
        <span class="text-xs md:text-sm font-medium">Read</span>
      </div>
      <div class="text-xl md:text-2xl font-bold text-foreground">
        {relays.filter(r => r.enabled && r.read).length}
      </div>
    </div>
    <div class="bg-neutral-50 dark:bg-background rounded-lg p-3 md:p-4">
      <div class="flex items-center gap-1 md:gap-2 text-primary dark:text-primary mb-1">
        <svg class="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
        <span class="text-xs md:text-sm font-medium">Write</span>
      </div>
      <div class="text-xl md:text-2xl font-bold text-foreground">
        {relays.filter(r => r.enabled && r.write).length}
      </div>
    </div>
  </div>

  <!-- Relay List -->
  <div class="space-y-2">
    {#each relays as relay (relay.url)}
      {@const status = getRelayStatus(relay.url)}
      <div class="border rounded-lg p-4 transition-all {relay.enabled
        ? 'bg-card border'
        : 'bg-neutral-50 dark:bg-background border opacity-60'}">
        <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
          <div class="flex-1">
            <div class="flex items-start md:items-center gap-3">
              <button
                onclick={() => settings.toggleRelay(relay.url)}
                class="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 mt-0.5 md:mt-0 {relay.enabled
                  ? 'bg-primary border-primary'
                  : 'bg-card border dark:border'}"
              >
                {#if relay.enabled}
                  <svg class="w-3 h-3 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                {/if}
              </button>
              <RelayDetailsComponent {relay} {status} {connectionStatus} />
            </div>
          </div>
          <div class="flex items-center gap-2 ml-8 md:ml-0">
            <button
              onclick={() => testRelayConnection(relay.url)}
              disabled={testingRelay === relay.url}
              class="p-1.5 md:p-2 hover:bg-neutral-100 dark:hover:bg-card rounded-lg transition-colors disabled:opacity-50"
              title="Test connection"
            >
              <svg class="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </button>
            <button
              onclick={() => settings.removeRelay(relay.url)}
              class="p-1.5 md:p-2 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors group"
              title="Remove relay"
            >
              <svg class="w-4 h-4 text-muted-foreground group-hover:text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    {/each}

    <!-- Add New Relay -->
    {#if isAdding}
      <div class="border-2 border-dashed border-primary-300 dark:border-primary-700 rounded-lg p-4">
        <div class="space-y-3">
          <input
            type="text"
            bind:value={newRelay.url}
            placeholder="wss://relay.example.com"
            class="w-full px-3 py-2 bg-card border border dark:border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            autofocus
          />
          <div class="flex items-center gap-4">
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                bind:checked={newRelay.read}
                class="w-4 h-4 text-primary rounded focus:ring-orange-500"
              />
              <span class="text-sm text-muted-foreground">Read</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                bind:checked={newRelay.write}
                class="w-4 h-4 text-primary rounded focus:ring-orange-500"
              />
              <span class="text-sm text-muted-foreground">Write</span>
            </label>
          </div>
          <div class="flex gap-2">
            <button
              onclick={handleAddRelay}
              disabled={!newRelay.url}
              class="px-4 py-2 bg-primary text-foreground rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Add Relay
            </button>
            <button
              onclick={() => {
                isAdding = false;
                newRelay = { url: '', read: true, write: true };
              }}
              class="px-4 py-2 bg-neutral-200 dark:bg-background text-muted-foreground rounded-lg hover:bg-neutral-300 dark:hover:bg-card transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    {:else}
      <button
        onclick={() => isAdding = true}
        class="w-full border-2 border-dashed border rounded-lg p-4 hover:border-primary dark:hover:border-primary transition-colors group"
      >
        <div class="flex items-center justify-center gap-2 text-muted-foreground group-hover:text-primary dark:group-hover:text-primary">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span class="font-medium">Add Relay</span>
        </div>
      </button>
    {/if}
  </div>

  <!-- Warning -->
  <div class="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
    <div class="flex gap-3">
      <svg class="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      <div class="text-sm text-yellow-800 dark:text-yellow-300">
        <p class="font-medium mb-1">Important</p>
        <p>Changes to relay configuration will take effect after refreshing the app.</p>
      </div>
    </div>
  </div>
</div>

