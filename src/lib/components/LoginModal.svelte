<script lang="ts">
  import { ndk } from '$lib/ndk.svelte';
  import { NDKNip07Signer, NDKPrivateKeySigner } from '@nostr-dev-kit/ndk';
  import { goto } from '$app/navigation';
  import { loginModal } from '$lib/stores/loginModal.svelte';
  import * as Dialog from '$lib/components/ui/dialog';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';

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

<Dialog.Root bind:open={loginModal.show}>
  <Dialog.Content
    class="{loginModal.state === 'signup' ? 'max-w-lg' : 'max-w-md'}"
    onClose={() => loginModal.close()}
  >
      {#if loginModal.state === 'signup'}
        <!-- Signup State - Enticing Welcome Screen -->
        <div class="relative">
          <!-- Hero Banner -->
          <div class="absolute inset-x-0 -top-6 h-32 bg-primary rounded-t-lg opacity-90"></div>

          <!-- Content -->
          <div class="relative pt-20">
            <Dialog.Header>
              <Dialog.Title class="text-3xl text-center">Your Voice Matters</Dialog.Title>
              <Dialog.Description class="text-center text-lg">
                Join a global community where every story counts
              </Dialog.Description>
            </Dialog.Header>

            <!-- Value Props -->
            <div class="space-y-4 mb-8 mt-6">
              <div class="flex items-start gap-4">
                <div class="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                  <svg class="w-5 h-5 text-primary dark:text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 class="font-semibold mb-1 text-foreground">Own Your Voice</h3>
                  <p class="text-sm text-muted-foreground">
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
                  <h3 class="font-semibold mb-1 text-foreground">Earn From Your Stories</h3>
                  <p class="text-sm text-muted-foreground">
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
                  <h3 class="font-semibold mb-1 text-foreground">Connect With Your Community</h3>
                  <p class="text-sm text-muted-foreground">
                    Trade, share, and build with people who understand your journey.
                  </p>
                </div>
              </div>
            </div>

            <!-- CTA Buttons -->
            <div class="space-y-3">
              <Button
                onclick={handleStartOnboarding}
                class="w-full py-6 text-lg bg-primary hover:opacity-90"
              >
                Start Your Journey
                <svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Button>

              <Button
                variant="ghost"
                onclick={() => loginModal.setState('login')}
                class="w-full"
              >
                Already have a Nostr account? <span class="font-semibold underline ml-1">Sign in here</span>
              </Button>
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
        <Dialog.Header>
          <Dialog.Title>Welcome Back</Dialog.Title>
          <Dialog.Description>Sign in with your existing Nostr account</Dialog.Description>
        </Dialog.Header>

        <div class="space-y-3 pt-4">
          {#if error}
            <div class="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          {/if}

          {#if !loginMethod}
            <Button
              variant="outline"
              onclick={() => {
                loginMethod = 'nip07';
                loginWithNip07();
              }}
              disabled={isLoggingIn}
              class="w-full p-4 h-auto justify-start"
            >
              <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              <div class="flex-1 text-left">
                <div class="font-semibold">Browser Extension (NIP-07)</div>
                <div class="text-sm text-muted-foreground">Use Alby, nos2x, or similar</div>
              </div>
              {#if isLoggingIn && loginMethod === 'nip07'}
                <svg class="w-5 h-5 animate-spin ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              {/if}
            </Button>

            <Button
              variant="outline"
              onclick={() => loginMethod = 'nsec'}
              disabled={isLoggingIn}
              class="w-full p-4 h-auto justify-start"
            >
              <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              <div class="flex-1 text-left">
                <div class="font-semibold">Private Key</div>
                <div class="text-sm text-muted-foreground">Login with your nsec or hex key</div>
              </div>
            </Button>

            <div class="relative my-6">
              <div class="absolute inset-0 flex items-center">
                <span class="w-full border-t border-border"></span>
              </div>
              <div class="relative flex justify-center text-xs uppercase">
                <span class="bg-background px-2 text-muted-foreground">
                  Don't have an account?
                </span>
              </div>
            </div>

            <Button
              variant="ghost"
              onclick={() => loginModal.setState('signup')}
              class="w-full"
            >
              <span class="font-semibold underline">Create a new account</span>
            </Button>
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

              <Input
                type="password"
                bind:value={nsecInput}
                placeholder="nsec1... or hex key"
                disabled={isLoggingIn}
                onkeydown={(e) => {
                  if (e.key === 'Enter' && nsecInput) {
                    loginWithNsec();
                  }
                }}
              />

              <div class="flex gap-2">
                <Button
                  variant="outline"
                  onclick={() => loginMethod = null}
                  disabled={isLoggingIn}
                  class="flex-1"
                >
                  Back
                </Button>
                <Button
                  onclick={loginWithNsec}
                  disabled={isLoggingIn || !nsecInput.trim()}
                  class="flex-1"
                >
                  {#if isLoggingIn}
                    <svg class="w-4 h-4 animate-spin mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Logging in...
                  {:else}
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                    Login
                  {/if}
                </Button>
              </div>
            </div>
          {/if}
        </div>
      {/if}
    </Dialog.Content>
</Dialog.Root>
