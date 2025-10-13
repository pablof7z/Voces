<script lang="ts">
  import { ndk } from '$lib/ndk.svelte';
  import { NDKKind, NDKEvent } from '@nostr-dev-kit/ndk';
  import { t } from 'svelte-i18n';

  interface Props {
    pubkey: string;
    variant?: 'default' | 'outline';
    showIcon?: boolean;
    class?: string;
  }

  const { pubkey, variant = 'default', showIcon = true, class: className = '' }: Props = $props();

  const currentUser = ndk.$currentUser;
  const follows = $derived(ndk.$sessions?.follows ?? new Set());
  const isFollowing = $derived.by(() => follows.has(pubkey));
  const isOwnProfile = $derived(currentUser?.pubkey === pubkey);

  async function handleToggleFollow() {
    if (!currentUser) return;

    try {
      const userToToggle = await ndk.fetchUser(pubkey);

      if (isFollowing) {
        await currentUser.unfollow(userToToggle);
      } else {
        await currentUser.follow(userToToggle);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  }
</script>

{#if !isOwnProfile && currentUser}
  <button
    onclick={handleToggleFollow}
    class={`px-4 py-2 rounded-full font-medium transition-colors ${
      variant === 'outline' || isFollowing
        ? 'bg-transparent border border text-muted-foreground hover:bg-red-500/10 hover:border-red-500 hover:text-red-500'
        : 'bg-primary text-foreground hover:bg-primary-700'
    } ${className}`}
  >
    {#if showIcon}
      {#if isFollowing}
        <svg class="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6" />
        </svg>
      {:else}
        <svg class="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
      {/if}
    {/if}
    {isFollowing ? $t('profile.unfollow') : $t('profile.follow')}
  </button>
{/if}
