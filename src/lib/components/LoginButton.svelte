<script lang="ts">
  import { ndk } from '$lib/ndk.svelte';
  import { loginModal } from '$lib/stores/loginModal.svelte';

  interface Props {
    class?: string;
  }

  const { class: className = "px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-semibold" }: Props = $props();

  const currentUser = ndk.$currentUser;
  const profile = ndk.$fetchProfile(() => currentUser?.pubkey);
  const displayName = $derived(profile?.name || profile?.displayName || 'Anon');

  function logout() {
    ndk.$sessions.logout();
    localStorage.removeItem('nostr_private_key');
  }
</script>

{#if currentUser}
  <button
    onclick={logout}
    class="flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg transition-colors"
  >
    {#if profile?.image}
      <img src={profile.image} alt={displayName} class="w-6 h-6 rounded-full object-cover" />
    {:else}
      <div class="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center">
        <span class="text-xs font-bold">{displayName.charAt(0).toUpperCase()}</span>
      </div>
    {/if}
    <span>{displayName}</span>
    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  </button>
{:else}
  <button
    onclick={() => loginModal.open('signup')}
    class={className}
  >
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
    </svg>
    <span>Login</span>
  </button>
{/if}
