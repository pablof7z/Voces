<script lang="ts">
  import { ndk } from '$lib/ndk.svelte';
  import { NDKNip07Signer, NDKPrivateKeySigner } from '@nostr-dev-kit/ndk';
  import { goto } from '$app/navigation';
  import { loginModal } from '$lib/stores/loginModal.svelte';

  let isLoggingIn = $state(false);
  let loginMethod = $state<'nip07' | 'nsec' | null>(null);
  let nsecInput = $state('');
  let error = $state('');

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
      loginModal.close();
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
      loginModal.close();
      nsecInput = '';
    } catch (err) {
      error = err instanceof Error ? err.message : 'Invalid nsec';
    } finally {
      isLoggingIn = false;
    }
  }

  function closeModal() {
    loginModal.close();
    loginMethod = null;
    nsecInput = '';
    error = '';
  }

  function handleStartOnboarding() {
    closeModal();
    goto('/onboarding');
  }
</script>

{#if loginModal.show}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
    onclick={closeModal}
    role="presentation"
  >
    <div
      class="bg-white dark:bg-card rounded-xl border border w-full p-6 overflow-hidden {loginModal.state === 'signup' ? 'max-w-lg' : 'max-w-md'}"
      onclick={(e) => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
    >
      {#if loginModal.state === 'signup'}
        <!-- Signup State - Enticing Welcome Screen -->
        <div class="relative">
          <!-- Hero Banner -->
          <div class="absolute inset-x-0 -top-6 h-32 bg-gradient-to-br from-orange-700 via-orange-600 to-red-700 rounded-t-lg"></div>

          <!-- Content -->
          <div class="relative pt-20">
            <div class="text-center mb-6">
              <h2 class="text-3xl font-bold mb-3 text-neutral-900 dark:text-foreground">Your Voice Matters</h2>
              <p class="text-muted-foreground dark:text-muted-foreground text-lg">
                Join a global community where every story counts
              </p>
            </div>

            <!-- Value Props -->
            <div class="space-y-4 mb-8">
              <div class="flex items-start gap-4">
                <div class="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0">
                  <svg class="w-5 h-5 text-primary dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 class="font-semibold mb-1 text-neutral-900 dark:text-foreground">Own Your Voice</h3>
                  <p class="text-sm text-muted-foreground dark:text-muted-foreground">
                    No censorship. No gatekeepers. Your content, your control, forever.
                  </p>
                </div>
              </div>

              <div class="flex items-start gap-4">
                <div class="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                  <svg class="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 class="font-semibold mb-1 text-neutral-900 dark:text-foreground">Earn From Your Stories</h3>
                  <p class="text-sm text-muted-foreground dark:text-muted-foreground">
                    Get paid instantly in Bitcoin for valuable content. No banks, no fees.
                  </p>
                </div>
              </div>

              <div class="flex items-start gap-4">
                <div class="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                  <svg class="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h3 class="font-semibold mb-1 text-neutral-900 dark:text-foreground">Connect With Your Community</h3>
                  <p class="text-sm text-muted-foreground dark:text-muted-foreground">
                    Trade, share, and build with people who understand your journey.
                  </p>
                </div>
              </div>
            </div>

            <!-- CTA Buttons -->
            <div class="space-y-3">
              <button
                onclick={handleStartOnboarding}
                class="w-full py-6 text-lg font-semibold bg-gradient-to-r from-orange-600 to-red-700 hover:from-orange-700 hover:to-red-800 text-foreground rounded-lg transition-all flex items-center justify-center gap-2"
              >
                Start Your Journey
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>

              <button
                onclick={() => loginModal.setState('login')}
                class="w-full text-sm text-muted-foreground dark:text-muted-foreground hover:text-neutral-900 dark:hover:text-foreground transition-colors py-2"
              >
                Already have a Nostr account? <span class="font-semibold underline">Sign in here</span>
              </button>
            </div>

            <!-- Trust Signals -->
            <div class="mt-6 pt-6 border-t border">
              <p class="text-xs text-center text-muted-foreground">
                Built on Nostr protocol • No personal data required • Leave anytime with your content
              </p>
            </div>
          </div>
        </div>
      {:else}
        <!-- Login State - Existing login methods -->
        <div>
          <div class="flex items-center justify-between mb-6">
            <div>
              <h2 class="text-2xl font-bold text-neutral-900 dark:text-foreground">Welcome Back</h2>
              <p class="text-sm text-muted-foreground dark:text-muted-foreground mt-1">Sign in with your existing Nostr account</p>
            </div>
            <button onclick={closeModal} class="text-muted-foreground hover:text-neutral-900 dark:hover:text-foreground transition-colors">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="space-y-3 pt-4">
            {#if error}
              <div class="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            {/if}

            {#if !loginMethod}
              <button
                onclick={() => {
                  loginMethod = 'nip07';
                  loginWithNip07();
                }}
                disabled={isLoggingIn}
                class="w-full p-4 bg-muted hover:bg-muted text-foreground border border rounded-lg transition-colors text-left flex items-center gap-3 disabled:opacity-50"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                <div class="flex-1">
                  <div class="font-semibold">Browser Extension (NIP-07)</div>
                  <div class="text-sm text-muted-foreground">Use Alby, nos2x, or similar</div>
                </div>
                {#if isLoggingIn && loginMethod === 'nip07'}
                  <svg class="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                {/if}
              </button>

              <button
                onclick={() => loginMethod = 'nsec'}
                disabled={isLoggingIn}
                class="w-full p-4 bg-muted hover:bg-muted text-foreground border border rounded-lg transition-colors text-left flex items-center gap-3 disabled:opacity-50"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                <div class="flex-1">
                  <div class="font-semibold">Private Key</div>
                  <div class="text-sm text-muted-foreground">Login with your nsec or hex key</div>
                </div>
              </button>

              <div class="relative my-6">
                <div class="absolute inset-0 flex items-center">
                  <span class="w-full border-t border-border"></span>
                </div>
                <div class="relative flex justify-center text-xs uppercase">
                  <span class="bg-white dark:bg-card px-2 text-muted-foreground">
                    Don't have an account?
                  </span>
                </div>
              </div>

              <button
                onclick={() => loginModal.setState('signup')}
                class="w-full text-center text-sm text-muted-foreground dark:text-muted-foreground hover:text-neutral-900 dark:hover:text-foreground transition-colors py-2"
              >
                <span class="font-semibold underline">Create a new account</span>
              </button>
            {:else if loginMethod === 'nsec'}
              <div class="space-y-4">
                <div class="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400 text-sm flex gap-2">
                  <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    Enter your private key (nsec or hex format). This will be stored locally in your browser.
                  </div>
                </div>

                <input
                  type="password"
                  bind:value={nsecInput}
                  placeholder="nsec1... or hex key"
                  disabled={isLoggingIn}
                  onkeydown={(e) => {
                    if (e.key === 'Enter' && nsecInput) {
                      loginWithNsec();
                    }
                  }}
                  class="w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground placeholder-neutral-500 focus:outline-none focus:border-purple-500 disabled:opacity-50"
                />

                <div class="flex gap-2">
                  <button
                    onclick={() => loginMethod = null}
                    disabled={isLoggingIn}
                    class="flex-1 px-4 py-2 bg-muted hover:bg-muted text-foreground rounded-lg transition-colors disabled:opacity-50"
                  >
                    Back
                  </button>
                  <button
                    onclick={loginWithNsec}
                    disabled={isLoggingIn || !nsecInput.trim()}
                    class="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-muted disabled:cursor-not-allowed text-foreground rounded-lg transition-colors font-semibold flex items-center justify-center gap-2"
                  >
                    {#if isLoggingIn}
                      <svg class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Logging in...
                    {:else}
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                      </svg>
                      Login
                    {/if}
                  </button>
                </div>
              </div>
            {/if}
          </div>
        </div>
      {/if}
    </div>
  </div>
{/if}
