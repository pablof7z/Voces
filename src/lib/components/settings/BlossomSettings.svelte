<script lang="ts">
  import { toast } from '$lib/stores/toast.svelte';
  import { ndk } from '$lib/ndk.svelte';
  import { NDKBlossomList, NDKKind } from '@nostr-dev-kit/ndk';

  const DEFAULT_SERVERS = [
    'https://blossom.primal.net',
    'https://blossom.nostr.hu',
    'https://blossom.oxtr.dev'
  ];

  let blossomListEvent = $state<NDKBlossomList | null>(null);
  let servers = $state<string[]>([]);
  let pendingServers = $state<string[]>([]);
  let newServer = $state('');
  let isAddingServer = $state(false);
  let isLoading = $state(true);
  let isSaving = $state(false);

  // Computed state to check if there are unsaved changes
  let hasChanges = $derived.by(() => {
    if (!blossomListEvent) return servers.length > 0 && pendingServers.length > 0;
    const savedServers = blossomListEvent.servers;
    if (savedServers.length !== pendingServers.length) return true;
    return !savedServers.every((server, index) => server === pendingServers[index]);
  });

  // Load the user's blossom list on mount
  $effect(() => {
    loadBlossomList();
  });

  async function loadBlossomList() {
    isLoading = true;
    try {
      const user = ndk.activeUser;
      if (!user) {
        // No user logged in, use localStorage fallback
        const stored = localStorage.getItem('blossomServers');
        if (stored) {
          try {
            servers = JSON.parse(stored);
            pendingServers = [...servers];
          } catch {
            servers = [DEFAULT_SERVERS[0]];
            pendingServers = [...servers];
          }
        } else {
          servers = [DEFAULT_SERVERS[0]];
          pendingServers = [...servers];
        }
        isLoading = false;
        return;
      }

      // Fetch the user's blossom list event
      const filter = {
        kinds: [NDKKind.BlossomList],
        authors: [user.pubkey]
      };
      const event = await ndk.fetchEvent(filter);

      if (event) {
        blossomListEvent = NDKBlossomList.from(event);
        servers = blossomListEvent.servers;
        pendingServers = [...servers];

        // Save to localStorage as backup
        localStorage.setItem('blossomServers', JSON.stringify(servers));
      } else {
        // Create a new blossom list event
        blossomListEvent = new NDKBlossomList(ndk);

        // Check localStorage for existing servers
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

        pendingServers = [...servers];
        blossomListEvent.servers = servers;
      }
    } catch (error) {
      console.error('Failed to load blossom list:', error);
      toast.error('Failed to load your Blossom servers');

      // Fallback to localStorage
      const stored = localStorage.getItem('blossomServers');
      if (stored) {
        try {
          servers = JSON.parse(stored);
          pendingServers = [...servers];
        } catch {
          servers = [DEFAULT_SERVERS[0]];
          pendingServers = [...servers];
        }
      } else {
        servers = [DEFAULT_SERVERS[0]];
        pendingServers = [...servers];
      }
    } finally {
      isLoading = false;
    }
  }

  async function saveChanges() {
    if (!hasChanges || isSaving) return;

    isSaving = true;
    try {
      if (!ndk.activeUser) {
        // No user logged in, save to localStorage only
        servers = [...pendingServers];
        localStorage.setItem('blossomServers', JSON.stringify(servers));
        toast.success('Servers saved locally');
        return;
      }

      if (!blossomListEvent) {
        blossomListEvent = new NDKBlossomList(ndk);
      }

      blossomListEvent.servers = pendingServers;
      await blossomListEvent.sign();
      await blossomListEvent.publishReplaceable();

      servers = [...pendingServers];
      localStorage.setItem('blossomServers', JSON.stringify(servers));

      toast.success('Blossom servers saved to Nostr');
    } catch (error) {
      console.error('Failed to save blossom list:', error);
      toast.error('Failed to save Blossom servers to Nostr');
    } finally {
      isSaving = false;
    }
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

      if (pendingServers.includes(cleanUrl)) {
        toast.error('This server is already in your list');
        return;
      }

      pendingServers = [...pendingServers, cleanUrl];
      newServer = '';
      isAddingServer = false;
    } catch {
      toast.error('Please enter a valid URL');
    }
  }

  function removeServer(serverToRemove: string) {
    if (pendingServers.length === 1) {
      toast.error('You must have at least one Blossom server');
      return;
    }
    pendingServers = pendingServers.filter(s => s !== serverToRemove);
  }

  function moveServerUp(index: number) {
    if (index === 0) return;
    const newServers = [...pendingServers];
    [newServers[index - 1], newServers[index]] = [newServers[index], newServers[index - 1]];
    pendingServers = newServers;
  }

  function moveServerDown(index: number) {
    if (index === pendingServers.length - 1) return;
    const newServers = [...pendingServers];
    [newServers[index], newServers[index + 1]] = [newServers[index + 1], newServers[index]];
    pendingServers = newServers;
  }

  function discardChanges() {
    pendingServers = [...servers];
  }
</script>

<div class="space-y-6">
  <div>
    <h3 class="text-lg font-semibold mb-2">Blossom Media Servers</h3>
    <p class="text-sm text-muted-foreground mb-4">
      Configure your Blossom servers for uploading images and media. The first server is your primary upload destination, and additional servers are used as mirrors for redundancy.
    </p>
  </div>

  <!-- Save/Discard buttons when there are changes -->
  {#if hasChanges}
    <div class="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
      <div class="flex items-center space-x-2 text-sm text-orange-800 dark:text-orange-200">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <span>You have unsaved changes</span>
      </div>
      <div class="flex space-x-2">
        <button
          onclick={discardChanges}
          disabled={isSaving}
          class="px-3 py-1.5 text-sm border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Discard
        </button>
        <button
          onclick={saveChanges}
          disabled={isSaving}
          class="px-3 py-1.5 text-sm bg-primary hover:bg-accent-dark text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {#if isSaving}
            <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Saving...</span>
          {:else}
            <span>Save Changes</span>
          {/if}
        </button>
      </div>
    </div>
  {/if}

  <!-- Current servers -->
  <div class="space-y-3">
    <label class="text-sm font-medium">Your Blossom Servers</label>
    {#if isLoading}
      <div class="flex items-center justify-center p-8">
        <svg class="animate-spin h-6 w-6 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    {:else}
      <div class="space-y-2">
        {#each pendingServers as server, index (server)}
          <div class="flex items-center justify-between p-3 bg-neutral-50 dark:bg-background rounded-lg">
            <div class="flex items-center space-x-3">
              <div class="flex flex-col space-y-1">
                <button
                  onclick={() => moveServerUp(index)}
                  disabled={index === 0}
                  class="text-muted-foreground hover:text-muted-foreground dark:hover:text-muted-foreground disabled:opacity-30 disabled:cursor-not-allowed p-0.5"
                  aria-label="Move up"
                >
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                  </svg>
                </button>
                <button
                  onclick={() => moveServerDown(index)}
                  disabled={index === pendingServers.length - 1}
                  class="text-muted-foreground hover:text-muted-foreground dark:hover:text-muted-foreground disabled:opacity-30 disabled:cursor-not-allowed p-0.5"
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
                    <span class="text-xs bg-primary-100 dark:bg-primary-900/50 text-primary dark:text-primary-300 px-2 py-0.5 rounded">
                      Primary
                    </span>
                  {/if}
                </div>
                <a
                  href={server}
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-sm text-muted-foreground hover:text-primary dark:hover:text-primary flex items-center space-x-1"
                >
                  <span>Visit server</span>
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
            {#if pendingServers.length > 1}
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
    {/if}
  </div>

  <!-- Add server -->
  {#if isAddingServer}
    <div class="border border rounded-lg p-4">
      <label for="new-server" class="block text-sm font-medium mb-2">Add Blossom Server</label>
      <div class="flex space-x-2">
        <input
          id="new-server"
          type="text"
          bind:value={newServer}
          placeholder="https://blossom.example.com"
          onkeypress={(e) => e.key === 'Enter' && addServer()}
          class="flex-1 px-3 py-2 bg-card border border dark:border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
        <button
          onclick={addServer}
          class="px-4 py-2 bg-primary hover:bg-accent-dark text-foreground rounded-lg transition-colors"
        >
          Add
        </button>
        <button
          onclick={() => {
            isAddingServer = false;
            newServer = '';
          }}
          class="p-2 text-muted-foreground hover:text-neutral-700 dark:hover:text-muted-foreground"
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
      class="flex items-center space-x-2 px-4 py-2 text-primary dark:text-primary hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
      <span>Add Server</span>
    </button>
  {/if}

  <!-- Suggested servers -->
  <div class="border-t border pt-4">
    <label class="text-sm font-medium block mb-3">Suggested Servers</label>
    <p class="text-sm text-muted-foreground mb-3">
      Popular public Blossom servers you can add to your list
    </p>
    <div class="space-y-2">
      {#each DEFAULT_SERVERS.filter(s => !pendingServers.includes(s)) as server}
        <div class="flex items-center justify-between p-3 bg-neutral-50 dark:bg-background rounded-lg">
          <span class="text-sm">{server}</span>
          <button
            onclick={() => pendingServers = [...pendingServers, server]}
            class="text-sm text-primary dark:text-primary hover:text-accent-dark dark:hover:text-primary-300"
          >
            Add
          </button>
        </div>
      {/each}
      {#if DEFAULT_SERVERS.every(s => pendingServers.includes(s))}
        <p class="text-sm text-muted-foreground">
          All suggested servers have been added
        </p>
      {/if}
    </div>
  </div>
</div>
