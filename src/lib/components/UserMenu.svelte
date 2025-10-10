<script lang="ts">
  import { ndk } from '$lib/ndk.svelte';
  import { Avatar } from '@nostr-dev-kit/svelte';
  import { goto } from '$app/navigation';

  interface Props {
    collapsed?: boolean;
  }

  const { collapsed = false }: Props = $props();

  let showDropdown = $state(false);
  let dropdownRef: HTMLDivElement | undefined = $state();

  const currentUser = ndk.$currentUser;
  const profile = ndk.$fetchProfile(() => currentUser?.pubkey);
  const displayName = $derived(profile?.displayName || profile?.name || 'Anonymous');
  const npub = $derived(currentUser?.npub);

  function toggleDropdown() {
    showDropdown = !showDropdown;
  }

  function closeDropdown() {
    showDropdown = false;
  }

  function handleLogout() {
    ndk.$sessions.logout();
    localStorage.removeItem('nostr_private_key');
    closeDropdown();
  }

  function navigateToProfile() {
    if (npub) {
      goto(`/p/${npub}`);
      closeDropdown();
    }
  }

  function navigateToSettings() {
    goto('/settings');
    closeDropdown();
  }

  // Close dropdown when clicking outside
  function handleClickOutside(event: MouseEvent) {
    if (dropdownRef && !dropdownRef.contains(event.target as Node)) {
      closeDropdown();
    }
  }

  $effect(() => {
    if (showDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  });

</script>

{#if currentUser}
  <div class="relative" bind:this={dropdownRef}>
    <!-- Trigger Button -->
    <button
      onclick={toggleDropdown}
      class="w-full flex items-center {collapsed ? 'justify-center p-3' : 'gap-3 px-2 py-2'} rounded-lg hover:bg-neutral-900/50 transition-colors cursor-pointer"
      title={collapsed ? displayName : undefined}
    >
      <Avatar {ndk} pubkey={currentUser.pubkey} class="w-10 h-10" />
      {#if !collapsed}
        <div class="flex-1 min-w-0 text-left">
          <p class="font-medium text-sm truncate text-white">
            {displayName}
          </p>
          <p class="text-xs text-neutral-500 truncate">
            {profile?.nip05 || (npub ? `${npub.slice(0, 16)}...` : '')}
          </p>
        </div>
      {/if}
    </button>

    <!-- Dropdown Menu -->
    {#if showDropdown}
      <div
        class="absolute bottom-full left-4 mb-2 w-56 bg-neutral-900 border border-neutral-800 rounded-lg shadow-xl overflow-hidden z-50"
      >
        <!-- Profile Link -->
        <button
          onclick={navigateToProfile}
          class="w-full flex items-center gap-3 px-4 py-3 hover:bg-neutral-800/50 transition-colors text-left"
        >
          <Avatar {ndk} pubkey={currentUser.pubkey} class="w-12 h-12" />
          <div class="flex-1 min-w-0">
            <p class="font-medium text-sm truncate text-white">
              {displayName}
            </p>
            <p class="text-xs text-neutral-500">View profile</p>
          </div>
        </button>

        <div class="h-px bg-neutral-800"></div>

        <!-- Settings Link -->
        <button
          onclick={navigateToSettings}
          class="w-full flex items-center gap-3 px-4 py-3 hover:bg-neutral-800/50 transition-colors text-left"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>Settings</span>
        </button>

        <div class="h-px bg-neutral-800"></div>

        <!-- Logout Button -->
        <button
          onclick={handleLogout}
          class="w-full flex items-center gap-3 px-4 py-3 hover:bg-neutral-800/50 transition-colors text-left text-red-500 hover:text-red-400"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Logout</span>
        </button>
      </div>
    {/if}
  </div>
{/if}
