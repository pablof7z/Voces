<script lang="ts">
  import { ndk } from '$lib/ndk.svelte';
  import { messagesStore } from '$lib/stores/messages.svelte';
  import { toast } from '$lib/stores/toast.svelte';
  import { onMount } from 'svelte';
  import { NDKKind, type NDKFilter } from '@nostr-dev-kit/ndk';

  let relays = $state<string[]>([]);
  let loading = $state(true);
  let saving = $state(false);
  let newRelay = $state('');

  async function loadRelays() {
    if (!ndk.activeUser) return;

    try {
      loading = true;

      // Fetch DM relay list (kind 10050)
      const filter: NDKFilter = {
        kinds: [NDKKind.DirectMessageReceiveRelayList],
        authors: [ndk.activeUser.pubkey],
        limit: 1
      };

      const events = await ndk.fetchEvents(filter);
      const event = Array.from(events)[0];

      if (event) {
        // Extract relay URLs from 'relay' tags
        relays = event.tags
          .filter(tag => tag[0] === 'relay')
          .map(tag => tag[1])
          .filter(url => url);
      }
    } catch (error) {
      console.error('Failed to load DM relays:', error);
      toast.error('Failed to load DM relays');
    } finally {
      loading = false;
    }
  }

  async function saveRelays() {
    if (!ndk.activeUser) return;

    try {
      saving = true;

      const messenger = messagesStore.getMessenger();
      if (messenger) {
        await messenger.publishDMRelays(relays);
      } else {
        throw new Error('Messenger not initialized');
      }

      toast.success('DM relays updated successfully');
    } catch (error) {
      console.error('Failed to update DM relays:', error);
      toast.error('Failed to update DM relays');
    } finally {
      saving = false;
    }
  }

  function addRelay() {
    const url = newRelay.trim();

    if (!url) return;

    // Basic URL validation
    if (!url.startsWith('wss://') && !url.startsWith('ws://')) {
      toast.error('Relay URL must start with wss:// or ws://');
      return;
    }

    // Check if already added
    if (relays.includes(url)) {
      toast.error('Relay already added');
      return;
    }

    // NIP-17 recommends 1-3 relays
    if (relays.length >= 3) {
      toast.error('Maximum 3 relays recommended per NIP-17');
      return;
    }

    relays = [...relays, url];
    newRelay = '';
  }

  function removeRelay(url: string) {
    relays = relays.filter(r => r !== url);
  }

  onMount(() => {
    loadRelays();
  });
</script>

<div class="space-y-6">
  <!-- Header -->
  <div>
    <h3 class="text-lg font-semibold text-white mb-2">DM Relay Settings</h3>
    <p class="text-sm text-neutral-400">
      Configure which relays to use for direct messages. Per NIP-17, it's recommended to keep this list small (1-3 relays).
    </p>
  </div>

  {#if loading}
    <!-- Loading state -->
    <div class="flex items-center justify-center py-8">
      <svg class="w-6 h-6 text-orange-500 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
    </div>
  {:else}
    <!-- Add relay input -->
    <div class="space-y-2">
      <label class="block text-sm font-medium text-neutral-300">
        Add DM Relay
      </label>
      <div class="flex gap-2">
        <input
          type="text"
          bind:value={newRelay}
          onkeydown={(e) => e.key === 'Enter' && addRelay()}
          placeholder="wss://relay.example.com"
          class="flex-1 px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        />
        <button
          onclick={addRelay}
          disabled={!newRelay.trim() || relays.length >= 3}
          class="px-4 py-2 bg-orange-500 hover:bg-orange-500/90 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Add
        </button>
      </div>
      {#if relays.length >= 3}
        <p class="text-xs text-orange-500">
          Maximum of 3 relays recommended (you have {relays.length})
        </p>
      {:else}
        <p class="text-xs text-neutral-500">
          {3 - relays.length} more relay{relays.length === 2 ? '' : 's'} can be added
        </p>
      {/if}
    </div>

    <!-- Current relays -->
    <div class="space-y-2">
      <label class="block text-sm font-medium text-neutral-300">
        Current DM Relays ({relays.length})
      </label>

      {#if relays.length === 0}
        <div class="p-4 bg-neutral-900 border border-neutral-800 rounded-lg text-center">
          <p class="text-neutral-500 text-sm">
            No DM relays configured. Add at least one relay to receive direct messages.
          </p>
        </div>
      {:else}
        <div class="space-y-2">
          {#each relays as relay}
            <div class="flex items-center justify-between p-3 bg-neutral-900 border border-neutral-800 rounded-lg">
              <div class="flex-1 min-w-0">
                <p class="text-sm text-white truncate">{relay}</p>
              </div>
              <button
                onclick={() => removeRelay(relay)}
                class="ml-3 p-1.5 hover:bg-neutral-800 rounded transition-colors text-neutral-400 hover:text-red-500"
                title="Remove relay"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          {/each}
        </div>
      {/if}
    </div>

    <!-- Save button -->
    <div class="flex items-center justify-between pt-4 border-t border-neutral-800">
      <p class="text-xs text-neutral-500">
        Changes will be published to your relays
      </p>
      <button
        onclick={saveRelays}
        disabled={saving || relays.length === 0}
        class="px-6 py-2 bg-orange-500 hover:bg-orange-500/90 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {#if saving}
          Saving...
        {:else}
          Save Changes
        {/if}
      </button>
    </div>
  {/if}
</div>
