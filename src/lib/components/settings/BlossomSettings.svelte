<script lang="ts">
  import { onMount } from 'svelte';
  import { toast } from '$lib/stores/toast.svelte';

  const DEFAULT_SERVERS = [
    'https://blossom.primal.net',
    'https://blossom.nostr.hu',
    'https://blossom.oxtr.dev'
  ];

  let servers = $state<string[]>([]);
  let newServer = $state('');
  let isAddingServer = $state(false);

  onMount(() => {
    const stored = localStorage.getItem('blossomServers');
    if (stored) {
      try {
        servers = JSON.parse(stored);
      } catch {
        servers = [DEFAULT_SERVERS[0]];
      }
    } else {
      servers = [DEFAULT_SERVERS[0]];
    }
  });

  function saveServers(newServers: string[]) {
    servers = newServers;
    localStorage.setItem('blossomServers', JSON.stringify(newServers));
  }

  function addServer() {
    if (!newServer.trim()) return;

    try {
      const url = new URL(newServer.trim());
      if (!url.protocol.startsWith('http')) {
        toast.error('Please enter a valid HTTP or HTTPS URL');
        return;
      }

      const cleanUrl = url.origin + url.pathname.replace(/\/$/, '');

      if (servers.includes(cleanUrl)) {
        toast.error('This server is already in your list');
        return;
      }

      saveServers([...servers, cleanUrl]);
      newServer = '';
      isAddingServer = false;
      toast.success('Server added successfully');
    } catch {
      toast.error('Please enter a valid URL');
    }
  }

  function removeServer(serverToRemove: string) {
    if (servers.length === 1) {
      toast.error('You must have at least one Blossom server');
      return;
    }
    saveServers(servers.filter(s => s !== serverToRemove));
    toast.success('Server removed');
  }

  function moveServerUp(index: number) {
    if (index === 0) return;
    const newServers = [...servers];
    [newServers[index - 1], newServers[index]] = [newServers[index], newServers[index - 1]];
    saveServers(newServers);
  }

  function moveServerDown(index: number) {
    if (index === servers.length - 1) return;
    const newServers = [...servers];
    [newServers[index], newServers[index + 1]] = [newServers[index + 1], newServers[index]];
    saveServers(newServers);
  }
</script>

<div class="space-y-6">
  <div>
    <h3 class="text-lg font-semibold mb-2">Blossom Media Servers</h3>
    <p class="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
      Configure your Blossom servers for uploading images and media. The first server is your primary upload destination, and additional servers are used as mirrors for redundancy.
    </p>
  </div>

  <!-- Current servers -->
  <div class="space-y-3">
    <label class="text-sm font-medium">Your Blossom Servers</label>
    <div class="space-y-2">
      {#each servers as server, index (server)}
        <div class="flex items-center justify-between p-3 bg-neutral-50 dark:bg-black rounded-lg">
          <div class="flex items-center space-x-3">
            <div class="flex flex-col space-y-1">
              <button
                onclick={() => moveServerUp(index)}
                disabled={index === 0}
                class="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 disabled:opacity-30 disabled:cursor-not-allowed p-0.5"
                aria-label="Move up"
              >
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                </svg>
              </button>
              <button
                onclick={() => moveServerDown(index)}
                disabled={index === servers.length - 1}
                class="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 disabled:opacity-30 disabled:cursor-not-allowed p-0.5"
                aria-label="Move down"
              >
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
            <div>
              <div class="flex items-center space-x-2">
                <span class="font-medium">{server}</span>
                {#if index === 0}
                  <span class="text-xs bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300 px-2 py-0.5 rounded">
                    Primary
                  </span>
                {/if}
              </div>
              <a
                href={server}
                target="_blank"
                rel="noopener noreferrer"
                class="text-sm text-neutral-500 dark:text-neutral-400 hover:text-orange-600 dark:hover:text-orange-500 flex items-center space-x-1"
              >
                <span>Visit server</span>
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
          {#if servers.length > 1}
            <button
              onclick={() => removeServer(server)}
              class="text-red-500 hover:text-red-600 p-2"
              aria-label="Remove server"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          {/if}
        </div>
      {/each}
    </div>
  </div>

  <!-- Add server -->
  {#if isAddingServer}
    <div class="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4">
      <label for="new-server" class="block text-sm font-medium mb-2">Add Blossom Server</label>
      <div class="flex space-x-2">
        <input
          id="new-server"
          type="text"
          bind:value={newServer}
          placeholder="https://blossom.example.com"
          onkeypress={(e) => e.key === 'Enter' && addServer()}
          class="flex-1 px-3 py-2 bg-white dark:bg-black border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
        <button
          onclick={addServer}
          class="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
        >
          Add
        </button>
        <button
          onclick={() => {
            isAddingServer = false;
            newServer = '';
          }}
          class="p-2 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  {:else}
    <button
      onclick={() => isAddingServer = true}
      class="flex items-center space-x-2 px-4 py-2 text-orange-600 dark:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
      <span>Add Server</span>
    </button>
  {/if}

  <!-- Suggested servers -->
  <div class="border-t border-neutral-200 dark:border-neutral-700 pt-4">
    <label class="text-sm font-medium block mb-3">Suggested Servers</label>
    <p class="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
      Popular public Blossom servers you can add to your list
    </p>
    <div class="space-y-2">
      {#each DEFAULT_SERVERS.filter(s => !servers.includes(s)) as server}
        <div class="flex items-center justify-between p-3 bg-neutral-50 dark:bg-black rounded-lg">
          <span class="text-sm">{server}</span>
          <button
            onclick={() => saveServers([...servers, server])}
            class="text-sm text-orange-600 dark:text-orange-500 hover:text-orange-700 dark:hover:text-orange-300"
          >
            Add
          </button>
        </div>
      {/each}
      {#if DEFAULT_SERVERS.every(s => servers.includes(s))}
        <p class="text-sm text-neutral-500 dark:text-neutral-400">
          All suggested servers have been added
        </p>
      {/if}
    </div>
  </div>
</div>
