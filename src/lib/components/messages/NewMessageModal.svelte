<script lang="ts">
  import { goto } from '$app/navigation';
  import { ndk } from '$lib/ndk.svelte';
  import type { NDKUser } from '@nostr-dev-kit/ndk';
  import { onMount } from 'svelte';

  interface Props {
    isOpen: boolean;
    onClose: () => void;
  }

  const { isOpen, onClose }: Props = $props();

  let searchQuery = $state('');
  let searching = $state(false);
  let searchResults = $state<NDKUser[]>([]);
  let selectedUser = $state<NDKUser | null>(null);

  async function handleSearch() {
    if (!searchQuery.trim()) {
      searchResults = [];
      return;
    }

    searching = true;

    try {
      // Try to parse as npub/nprofile first
      if (searchQuery.startsWith('npub') || searchQuery.startsWith('nprofile')) {
        try {
          const user = await ndk.$fetchUser(searchQuery.trim());
          if (user) {
            searchResults = [user];
          } else {
            searchResults = [];
          }
        } catch (error) {
          console.error('Invalid npub:', error);
          searchResults = [];
        }
      }
      // Search by name using NDK's fetchUser
      else {
        try {
          const user = await ndk.$fetchUser(searchQuery.trim());
          if (user) {
            searchResults = [user];
          } else {
            searchResults = [];
          }
        } catch (error) {
          console.error('Search error:', error);
          searchResults = [];
        }
      }
    } catch (error) {
      console.error('Search error:', error);
      searchResults = [];
    } finally {
      searching = false;
    }
  }

  function handleUserSelect(user: NDKUser) {
    selectedUser = user;
    goto(`/messages/${user.npub}`);
    onClose();
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Enter' && !searching) {
      handleSearch();
    }
  }

  // Auto-search as user types (debounced)
  let searchTimeout: ReturnType<typeof setTimeout> | null = null;
  $effect(() => {
    if (searchQuery.trim()) {
      if (searchTimeout) clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        handleSearch();
      }, 500);
    } else {
      searchResults = [];
    }

    return () => {
      if (searchTimeout) clearTimeout(searchTimeout);
    };
  });

  // Focus search input when modal opens
  let searchInput: HTMLInputElement | null = $state(null);
  $effect(() => {
    if (isOpen && searchInput) {
      setTimeout(() => searchInput?.focus(), 100);
    }
  });
</script>

{#if isOpen}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
    onclick={onClose}
    onkeydown={handleKeyDown}
    role="button"
    tabindex="-1"
  >
    <div
      class="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-lg shadow-xl"
      onclick={(e) => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
    >
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
        <h2 class="text-xl font-bold text-white">New Message</h2>
        <button
          onclick={onClose}
          class="p-2 hover:bg-neutral-800 rounded-lg transition-colors text-neutral-400 hover:text-white"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Search -->
      <div class="p-6 border-b border-neutral-800">
        <div class="relative">
          <input
            bind:this={searchInput}
            bind:value={searchQuery}
            type="text"
            placeholder="Search by name or paste npub..."
            class="w-full px-4 py-3 pl-12 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
          <svg
            class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <!-- Results -->
      <div class="max-h-96 overflow-y-auto">
        {#if searching}
          <div class="flex items-center justify-center py-12">
            <svg class="w-8 h-8 text-orange-500 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        {:else if searchQuery.trim() && searchResults.length === 0}
          <div class="flex flex-col items-center justify-center py-12 px-6 text-center">
            <svg class="w-16 h-16 text-neutral-700 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p class="text-neutral-400">No users found</p>
            <p class="text-sm text-neutral-600 mt-1">Try a different search term</p>
          </div>
        {:else if searchResults.length > 0}
          <div class="divide-y divide-neutral-800">
            {#each searchResults as user (user.pubkey)}
              {@const profile = user.profile}

              <button
                onclick={() => handleUserSelect(user)}
                class="w-full flex items-center gap-3 px-6 py-4 hover:bg-neutral-800 transition-colors text-left"
              >
                <!-- Avatar -->
                {#if profile?.image}
                  <img
                    src={profile.image}
                    alt={profile.name || 'User'}
                    class="w-12 h-12 rounded-full object-cover flex-shrink-0"
                  />
                {:else}
                  <div class="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500/20 to-orange-600/20 flex items-center justify-center flex-shrink-0">
                    <span class="text-orange-500 font-semibold text-lg">
                      {profile?.name?.[0]?.toUpperCase() || '?'}
                    </span>
                  </div>
                {/if}

                <!-- Info -->
                <div class="flex-1 min-w-0">
                  <div class="font-semibold text-white truncate">
                    {profile?.name || profile?.displayName || 'Anonymous'}
                  </div>
                  {#if profile?.nip05}
                    <div class="text-sm text-neutral-500 truncate">
                      {profile.nip05}
                    </div>
                  {:else if profile?.about}
                    <div class="text-sm text-neutral-500 truncate">
                      {profile.about}
                    </div>
                  {/if}
                </div>

                <!-- Arrow -->
                <svg class="w-5 h-5 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            {/each}
          </div>
        {:else}
          <div class="flex flex-col items-center justify-center py-12 px-6 text-center">
            <svg class="w-16 h-16 text-neutral-700 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p class="text-neutral-400">Search for someone to message</p>
            <p class="text-sm text-neutral-600 mt-1">Enter a name or paste an npub</p>
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}
