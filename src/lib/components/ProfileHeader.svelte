<script lang="ts">
  import { ndk } from '$lib/ndk.svelte';
  import { Avatar } from '@nostr-dev-kit/svelte';
  import { EventContent } from '@nostr-dev-kit/svelte';
  import FollowButton from '$lib/components/FollowButton.svelte';
  import UserDropdown from '$lib/components/UserDropdown.svelte';
  import { generateBannerGradient } from '$lib/utils/bannerGradient';
  import { t } from 'svelte-i18n';
  import type { NDKUserProfile } from '@nostr-dev-kit/ndk';

  interface Props {
    pubkey: string;
    profile?: NDKUserProfile;
    isOwnProfile: boolean;
    notesCount: number;
    followingCount: number;
    onEditProfile?: () => void;
    onShareProfile?: () => void;
    onOpenCreatePack?: () => void;
  }

  let {
    pubkey,
    profile,
    isOwnProfile,
    notesCount,
    followingCount,
    onEditProfile,
    onShareProfile,
    onOpenCreatePack
  }: Props = $props();

  const currentUser = ndk.$currentUser;
  let isUserDropdownOpen = $state(false);

  function handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('[data-user-dropdown]')) {
      isUserDropdownOpen = false;
    }
  }
</script>

<svelte:window onclick={handleClickOutside} />

<div class="bg-background border-b border-border">
  <!-- Cover image -->
  <div class="h-48 sm:h-64 relative" style={profile?.banner ? '' : `background: ${generateBannerGradient(pubkey)}`}>
    {#if profile?.banner}
      <img
        src={profile.banner}
        alt="Banner"
        class="w-full h-full object-cover"
      />
    {/if}
  </div>

  <!-- Profile info -->
  <div class="px-4 sm:px-6 pb-4 pt-4">
    <!-- Avatar -->
    <div class="relative -mt-24 sm:-mt-28 mb-4">
      <Avatar {ndk} {pubkey} size="sm" class="w-48 h-48 sm:w-48 sm:h-48 rounded-full border-4 border-black" />
    </div>

    <!-- Name and bio -->
    <div class="mb-4">
      <div class="flex items-start justify-between gap-4">
        <div class="flex-1">
          <h1 class="text-xl sm:text-2xl font-bold text-foreground">
            {profile?.name || 'Anonymous'}
          </h1>
          <div class="flex items-center gap-2">
            <p class="text-muted-foreground">
              {profile?.nip05 ? `@${profile.nip05.split('@')[0]}` : `${pubkey.slice(0, 12)}...`}
            </p>
            {#if onShareProfile}
              <button
                onclick={onShareProfile}
                class="p-1 text-muted-foreground hover:text-muted-foreground transition-colors"
                aria-label="Share profile"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </button>
            {/if}
          </div>
        </div>
        <div class="flex items-center gap-2">
          {#if isOwnProfile && onEditProfile}
            <button
              onclick={onEditProfile}
              class="px-4 py-2 rounded-full font-medium transition-colors bg-primary text-foreground hover:bg-primary-700"
            >
              <svg class="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              {$t('profile.editProfile')}
            </button>
          {:else}
            <FollowButton {pubkey} />
          {/if}
          {#if !isOwnProfile && currentUser && onOpenCreatePack}
            <div class="relative" data-user-dropdown>
              <button
                onclick={(e) => {
                  e.stopPropagation();
                  isUserDropdownOpen = !isUserDropdownOpen;
                }}
                class="p-2 rounded-full border border text-muted-foreground hover:bg-muted transition-colors"
                aria-label="More options"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <UserDropdown
                {pubkey}
                isOpen={isUserDropdownOpen}
                onClose={() => isUserDropdownOpen = false}
                onOpenCreatePack={onOpenCreatePack}
              />
            </div>
          {/if}
        </div>
      </div>
      {#if profile?.about}
        <div class="mt-3">
          <EventContent
            content={profile.about}
            class="text-muted-foreground"
          />
        </div>
      {/if}
    </div>

    <!-- Meta info -->
    <div class="flex flex-wrap gap-4 text-sm text-muted-foreground">
      {#if profile?.website}
        <a
          href={profile.website}
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center gap-1 hover:text-primary"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          <span>{profile.website.replace(/^https?:\/\//, '')}</span>
        </a>
      {/if}
    </div>

    <!-- Stats -->
    <div class="flex gap-6 mt-4">
      <div>
        <span class="font-semibold text-foreground">{notesCount}</span>
        <span class="text-muted-foreground ml-1">{$t('profile.tabs.notes')}</span>
      </div>
      <div>
        <span class="font-semibold text-foreground">{followingCount}</span>
        <span class="text-muted-foreground ml-1">{$t('profile.following')}</span>
      </div>
    </div>
  </div>
</div>
