<script lang="ts">
  import { ndk } from '$lib/ndk.svelte';
  import { NDKKind } from '@nostr-dev-kit/ndk';

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

  let isLoading = $state(false);

  async function handleToggleFollow() {
    if (!ndk.signer || !currentUser) return;

    isLoading = true;
    try {
      const newFollows = new Set(follows);

      if (isFollowing) {
        newFollows.delete(pubkey);
      } else {
        newFollows.add(pubkey);
      }

      const tags = Array.from(newFollows).map(pk => ['p', pk]);

      await ndk.publish({
        kind: NDKKind.Contacts,
        content: '',
        tags,
      });
    } catch (error) {
      console.error('Error toggling follow:', error);
    } finally {
      isLoading = false;
    }
  }
</script>

{#if !isOwnProfile && currentUser}
  <button
    onclick={handleToggleFollow}
    disabled={isLoading}
    class={`px-4 py-2 rounded-full font-medium transition-colors ${
      variant === 'outline' || isFollowing
        ? 'bg-transparent border border-neutral-600 text-neutral-300 hover:bg-red-500/10 hover:border-red-500 hover:text-red-500'
        : 'bg-orange-600 text-white hover:bg-orange-700'
    } ${className}`}
  >
    {#if isLoading}
      {#if showIcon}
        <svg class="w-4 h-4 mr-2 animate-spin inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      {/if}
      {isFollowing ? 'Unfollowing...' : 'Following...'}
    {:else}
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
      {isFollowing ? 'Unfollow' : 'Follow'}
    {/if}
  </button>
{/if}
