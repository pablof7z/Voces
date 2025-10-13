<script lang="ts">
  import { ndkReady } from '$lib/ndk.svelte';
  import { settings } from '$lib/stores/settings.svelte';
  import { browser } from '$app/environment';
  import { EventContentHandlersProxy, setEventContentComponents } from '@nostr-dev-kit/svelte';
  import { goto } from '$app/navigation';
  import { locale } from 'svelte-i18n';
  import { initializeI18n } from '$i18n/config';
  import Toaster from '$lib/components/Toaster.svelte';
  import LoginModal from '$lib/components/LoginModal.svelte';
  import RelayAuthModal from '$lib/components/RelayAuthModal.svelte';
  import PWAInstallPrompt from '$lib/components/PWAInstallPrompt.svelte';
  import Hashtag from '$lib/components/Hashtag.svelte';
  import EmbeddedNote from '$lib/components/EmbeddedNote.svelte';
  import '../app.css';
  import type { Snippet } from 'svelte';

  interface Props {
    children: Snippet;
  }

  const { children }: Props = $props();

  let ready = $state(false);

  // Initialize i18n (only in browser)
  if (browser) {
    initializeI18n(settings.language);

    // Sync locale changes with settings
    $effect(() => {
      locale.set(settings.language);
    });
  }

  // Set up global EventContent handlers (only in browser)
  if (browser) {
    EventContentHandlersProxy.onMentionClick = (bech32) => {
      goto(`/p/${bech32}`);
    };

    EventContentHandlersProxy.onEventClick = (bech32, event) => {
      goto(`/e/${bech32}`);
    };

    EventContentHandlersProxy.onHashtagClick = (tag) => {
      goto(`/t/${tag}`);
    };

    EventContentHandlersProxy.onLinkClick = (url) => {
      window.open(url, '_blank');
    };

    // Set up custom components
    setEventContentComponents({
      hashtag: Hashtag,
      embeddedEvent: EmbeddedNote
    });
  }

  // Initialize theme immediately to prevent flash
  if (browser) {
    const theme = settings.theme;
    if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    }

    // Initialize theme color
    settings.setThemeColor(settings.themeColor);

    // Wait for NDK cache to be initialized before mounting the app
    ndkReady.then(() => {
      ready = true;
    });
  } else {
    // On server, always render
    ready = true;
  }
</script>

<Toaster />
<LoginModal />
<RelayAuthModal />
<PWAInstallPrompt />

{#if ready}
  <svelte:boundary onerror={(e) => {
    console.error('Application error:', e);
  }}>
    {@render children()}
    {#snippet failed(error)}
      <div class="flex items-center justify-center min-h-screen bg-white dark:bg-gray-950">
        <div class="text-center max-w-md px-4">
          <div class="mb-4">
            <svg class="w-16 h-16 mx-auto text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Something went wrong</h1>
          <p class="text-gray-600 dark:text-gray-400 mb-4">
            An unexpected error occurred. Please try refreshing the page.
          </p>
          <button
            onclick={() => window.location.reload()}
            class="px-4 py-2 bg-primary hover:bg-accent-dark text-foreground rounded-lg transition-colors"
          >
            Reload Page
          </button>
        </div>
      </div>
    {/snippet}
  </svelte:boundary>
{:else}
  <div class="flex items-center justify-center min-h-screen bg-white dark:bg-neutral-950">
    <div class="text-center">
      <div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
      <p class="mt-4 text-gray-600 dark:text-gray-400">Initializing...</p>
    </div>
  </div>
{/if}
