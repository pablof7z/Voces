<script lang="ts">
  import { ndk } from '$lib/ndk.svelte';
  import { NDKNip07Signer, NDKPrivateKeySigner } from '@nostr-dev-kit/ndk';

  interface Props {
    class?: string;
  }

  const { class: className = "px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-semibold" }: Props = $props();

  let isLoggingIn = $state(false);
  let showLoginModal = $state(false);
  let loginMethod = $state<'nip07' | 'nsec' | null>(null);
  let nsecInput = $state('');
  let error = $state('');

  const currentUser = ndk.$currentUser;
  const profile = ndk.$fetchProfile(() => currentUser?.pubkey);
  const displayName = $derived(profile?.name || profile?.displayName || 'Anon');

  async function loginWithNip07() {
    if (!window.nostr) {
      error = 'No Nostr extension found. Please install Alby or nos2x.';
      return;
    }

    try {
      isLoggingIn = true;
      error = '';
      const signer = new NDKNip07Signer();
      await ndk.$sessions.login(signer);
      showLoginModal = false;
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to login';
    } finally {
      isLoggingIn = false;
    }
  }

  async function loginWithNsec() {
    if (!nsecInput.trim()) {
      error = 'Please enter your nsec';
      return;
    }

    try {
      isLoggingIn = true;
      error = '';
      const signer = new NDKPrivateKeySigner(nsecInput.trim());
      await ndk.$sessions.login(signer);
      localStorage.setItem('nostr_private_key', nsecInput.trim());
      showLoginModal = false;
      nsecInput = '';
    } catch (err) {
      error = err instanceof Error ? err.message : 'Invalid nsec';
    } finally {
      isLoggingIn = false;
    }
  }

  function openLoginModal() {
    showLoginModal = true;
    loginMethod = null;
    error = '';
  }

  function closeLoginModal() {
    showLoginModal = false;
    loginMethod = null;
    nsecInput = '';
    error = '';
  }

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
    onclick={openLoginModal}
    class={className}
  >
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
    </svg>
    <span>Login</span>
  </button>
{/if}

{#if showLoginModal}
  <div class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onclick={closeLoginModal}>
    <div class="bg-neutral-900 rounded-xl border border-neutral-800 max-w-md w-full p-6" onclick={(e) => e.stopPropagation()}>
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-bold text-white">Login to Agora</h2>
        <button onclick={closeLoginModal} class="text-neutral-400 hover:text-white">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {#if !loginMethod}
        <div class="space-y-3">
          <button
            onclick={() => loginMethod = 'nip07'}
            class="w-full p-4 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors text-left"
          >
            <div class="font-semibold text-white mb-1">Browser Extension</div>
            <div class="text-sm text-neutral-400">Use Alby, nos2x, or similar</div>
          </button>

          <button
            onclick={() => loginMethod = 'nsec'}
            class="w-full p-4 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors text-left"
          >
            <div class="font-semibold text-white mb-1">Private Key (nsec)</div>
            <div class="text-sm text-neutral-400">Login with your private key</div>
          </button>
        </div>
      {:else if loginMethod === 'nip07'}
        <div class="space-y-4">
          <p class="text-neutral-300">
            Click the button below to connect with your Nostr extension.
          </p>

          {#if error}
            <div class="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          {/if}

          <div class="flex gap-2">
            <button
              onclick={() => loginMethod = null}
              class="flex-1 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg transition-colors"
            >
              Back
            </button>
            <button
              onclick={loginWithNip07}
              disabled={isLoggingIn}
              class="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-neutral-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-semibold"
            >
              {isLoggingIn ? 'Connecting...' : 'Connect'}
            </button>
          </div>
        </div>
      {:else if loginMethod === 'nsec'}
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-neutral-300 mb-2">
              Private Key (nsec)
            </label>
            <input
              type="password"
              bind:value={nsecInput}
              placeholder="nsec1..."
              class="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          {#if error}
            <div class="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          {/if}

          <div class="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-400 text-sm">
            ⚠️ Your private key will be stored in browser localStorage. Use at your own risk.
          </div>

          <div class="flex gap-2">
            <button
              onclick={() => loginMethod = null}
              class="flex-1 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg transition-colors"
            >
              Back
            </button>
            <button
              onclick={loginWithNsec}
              disabled={isLoggingIn || !nsecInput.trim()}
              class="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-neutral-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-semibold"
            >
              {isLoggingIn ? 'Logging in...' : 'Login'}
            </button>
          </div>
        </div>
      {/if}
    </div>
  </div>
{/if}
