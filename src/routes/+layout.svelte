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
  import Mention from '$lib/components/Mention.svelte';
  import { applyThemeColor } from '$lib/theme/colors';
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
      mention: Mention,
      hashtag: Hashtag,
      embeddedEvent: EmbeddedNote
    });
  }

  // Initialize theme immediately to prevent flash
  if (browser) {
    const theme = settings.theme;
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.add('light');
    }

    // Initialize theme color - apply directly to ensure it happens
    applyThemeColor(settings.themeColor);

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

{#if ready}
  {@render children()}
  <PWAInstallPrompt />
  <LoginModal />
  <RelayAuthModal />
{:else}
  <div class="flex items-center justify-center min-h-screen bg-background">
    <div class="text-center">
      <div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
      <p class="mt-4 text-muted-foreground">Initializing...</p>
    </div>
  </div>
{/if}
