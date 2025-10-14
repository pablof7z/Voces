<script lang="ts">
  import { ndk } from '$lib/ndk.svelte';
  import { Avatar } from '@nostr-dev-kit/svelte';
  import { goto } from '$app/navigation';
  import { t } from 'svelte-i18n';
  import { settings } from '$lib/stores/settings.svelte';

  interface Props {
    collapsed?: boolean;
  }

  const { collapsed = false }: Props = $props();

  let showDropdown = $state(false);
  let dropdownRef: HTMLDivElement | undefined = $state();
  let buttonRef: HTMLButtonElement | undefined = $state();

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

  function toggleTheme() {
    const currentTheme = settings.theme;
    if (currentTheme === 'light') {
      settings.setTheme('dark');
    } else if (currentTheme === 'dark') {
      settings.setTheme('system');
    } else {
      settings.setTheme('light');
    }
  }

  $effect(() => {
    if (!showDropdown) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef && !dropdownRef.contains(event.target as Node) &&
          buttonRef && !buttonRef.contains(event.target as Node)) {
        showDropdown = false;
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  });

</script>

{#if currentUser}
  <!-- Trigger Button -->
  <button
    bind:this={buttonRef}
    onclick={toggleDropdown}
    class="w-full flex items-center {collapsed ? 'justify-center p-3' : 'gap-3 px-2 py-2'} rounded-lg hover:bg-muted transition-colors cursor-pointer"
    title={collapsed ? displayName : undefined}
  >
    <Avatar {ndk} pubkey={currentUser.pubkey} class="w-10 h-10" />
    {#if !collapsed}
      <div class="flex-1 min-w-0 text-left">
        <p class="font-medium text-sm truncate text-foreground">
          {displayName}
        </p>
        <p class="text-xs text-muted-foreground truncate">
          {profile?.nip05 || (npub ? `${npub.slice(0, 16)}...` : '')}
        </p>
      </div>
    {/if}
  </button>
{/if}

{#if showDropdown && buttonRef}
  {#key showDropdown}
    <svelte:element this={'div'} style="display: contents">
      <div
        bind:this={dropdownRef}
        class="w-56 bg-popover border border-border rounded-lg shadow-xl overflow-hidden"
        style="position: fixed; bottom: {window.innerHeight - buttonRef.getBoundingClientRect().top + 8}px; left: {buttonRef.getBoundingClientRect().left}px; z-index: 9999;"
      >
        <!-- Profile Link -->
        <button
          onclick={navigateToProfile}
          class="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors text-left"
        >
          <Avatar {ndk} pubkey={currentUser.pubkey} class="w-12 h-12" />
          <div class="flex-1 min-w-0">
            <p class="font-medium text-sm truncate text-popover-foreground">
              {displayName}
            </p>
            <p class="text-xs text-muted-foreground">{$t('profile.editProfile')}</p>
          </div>
        </button>

        <div class="h-px bg-border"></div>

        <!-- Theme Toggle -->
        <button
          onclick={toggleTheme}
          class="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors text-left text-popover-foreground"
        >
          {#if settings.theme === 'light'}
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span>{$t('settings.sections.appearance.themes.light')}</span>
          {:else if settings.theme === 'dark'}
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
            <span>{$t('settings.sections.appearance.themes.dark')}</span>
          {:else}
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span>{$t('settings.sections.appearance.themes.system')}</span>
          {/if}
        </button>

        <!-- Settings Link -->
        <button
          onclick={navigateToSettings}
          class="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors text-left text-popover-foreground"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>{$t('navigation.settings')}</span>
        </button>

        <div class="h-px bg-border"></div>

        <!-- Logout Button -->
        <button
          onclick={handleLogout}
          class="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors text-left text-destructive hover:text-destructive/90"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>{$t('navigation.logout')}</span>
        </button>
      </div>
    </svelte:element>
  {/key}
{/if}
