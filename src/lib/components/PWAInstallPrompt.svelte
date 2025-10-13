<script lang="ts">
  import { pwaStore } from '$lib/stores/pwa.svelte';
  import { portal } from '$lib/utils/portal.svelte';
  import { fade, fly } from 'svelte/transition';

  // Only show on mobile devices when not installed
  const shouldShow = $derived(
    pwaStore.showPrompt &&
    pwaStore.isMobileDevice &&
    !pwaStore.isInstalled
  );

  let showIOSInstructions = $state(false);

  function handleInstall() {
    if (pwaStore.isAndroidDevice && pwaStore.deferredPrompt) {
      // Android - trigger native install prompt
      pwaStore.promptInstall();
    } else if (pwaStore.isIOSDevice) {
      // iOS - show manual instructions
      showIOSInstructions = true;
    }
  }

  function handleDismiss() {
    pwaStore.dismiss();
  }

  function handleNeverAsk() {
    pwaStore.dismissForever();
  }

  function closeIOSInstructions() {
    showIOSInstructions = false;
    pwaStore.dismiss();
  }
</script>

{#if shouldShow && !showIOSInstructions}
  <div
    class="fixed bottom-20 md:bottom-4 left-4 right-4 z-50"
    transition:fly={{ y: 100, duration: 300 }}
  >
    <div class="bg-gradient-to-r bg-primary opacity-90 text-foreground rounded-2xl shadow-2xl p-4 max-w-md mx-auto">
      <!-- Close button -->
      <button
        onclick={handleDismiss}
        class="absolute top-3 right-3 p-1 hover:bg-white/20 rounded-full transition-colors"
        aria-label="Dismiss"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <!-- Content -->
      <div class="flex items-start gap-4 mb-4">
        <div class="flex-shrink-0 w-14 h-14 bg-card rounded-2xl p-2 shadow-lg">
          <img src="/icons/manifest-icon-192.png" alt="Agora icon" class="w-full h-full" />
        </div>
        <div class="flex-1 pr-6">
          <h3 class="text-lg font-bold mb-1">Install Agora</h3>
          <p class="text-sm text-foreground/90">
            Get the full app experience with offline access and quick launch from your home screen.
          </p>
        </div>
      </div>

      <!-- Action buttons -->
      <div class="flex gap-2">
        <button
          onclick={handleInstall}
          class="flex-1 bg-card text-primary font-semibold py-3 px-4 rounded-xl hover:bg-primary-50 transition-colors"
        >
          {#if pwaStore.isIOSDevice}
            View Instructions
          {:else}
            Install Now
          {/if}
        </button>
        <button
          onclick={handleNeverAsk}
          class="px-4 py-3 text-sm text-foreground/80 hover:text-foreground hover:bg-white/10 rounded-xl transition-colors"
        >
          Not Now
        </button>
      </div>
    </div>
  </div>
{/if}

{#if showIOSInstructions}
  <div
    use:portal
    class="fixed inset-0 bg-background/70 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4"
    transition:fade={{ duration: 200 }}
    onclick={closeIOSInstructions}
  >
    <div
      class="bg-card rounded-t-3xl md:rounded-3xl max-w-md w-full overflow-hidden"
      onclick={(e) => e.stopPropagation()}
      transition:fly={{ y: 100, duration: 300 }}
    >
      <!-- Header -->
      <div class="p-6 border-b border-border">
        <div class="flex items-center justify-between mb-2">
          <h2 class="text-xl font-bold text-foreground">Install Agora on iOS</h2>
          <button
            onclick={closeIOSInstructions}
            class="p-2 hover:bg-muted rounded-full transition-colors"
            aria-label="Close"
          >
            <svg class="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p class="text-sm text-muted-foreground">
          Follow these steps to add Agora to your home screen
        </p>
      </div>

      <!-- Instructions -->
      <div class="p-6 space-y-6">
        <!-- Step 1 -->
        <div class="flex gap-4">
          <div class="flex-shrink-0 w-10 h-10 bg-primary/20 text-primary rounded-full flex items-center justify-center font-bold">
            1
          </div>
          <div class="flex-1">
            <h3 class="text-foreground font-semibold mb-2">Tap the Share button</h3>
            <p class="text-sm text-muted-foreground mb-2">
              Look for the share icon in Safari's bottom menu bar
            </p>
            <div class="inline-flex items-center gap-2 bg-muted px-3 py-2 rounded-lg">
              <svg class="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16.5 6.5v-1.75a.75.75 0 00-1.5 0V6.5h-6V4.75a.75.75 0 00-1.5 0V6.5h-1.75A2.75 2.75 0 003 9.25v9A2.75 2.75 0 005.75 21h12.5A2.75 2.75 0 0021 18.25v-9A2.75 2.75 0 0018.25 6.5H16.5zm-.75 4.25a.75.75 0 011.5 0v4.5a.75.75 0 01-1.5 0v-4.5zm-4.5 0a.75.75 0 011.5 0v4.5a.75.75 0 01-1.5 0v-4.5zm-4.5 0a.75.75 0 011.5 0v4.5a.75.75 0 01-1.5 0v-4.5z"/>
              </svg>
              <span class="text-muted-foreground text-sm">Share</span>
            </div>
          </div>
        </div>

        <!-- Step 2 -->
        <div class="flex gap-4">
          <div class="flex-shrink-0 w-10 h-10 bg-primary/20 text-primary rounded-full flex items-center justify-center font-bold">
            2
          </div>
          <div class="flex-1">
            <h3 class="text-foreground font-semibold mb-2">Select "Add to Home Screen"</h3>
            <p class="text-sm text-muted-foreground">
              Scroll down in the share menu and tap "Add to Home Screen"
            </p>
          </div>
        </div>

        <!-- Step 3 -->
        <div class="flex gap-4">
          <div class="flex-shrink-0 w-10 h-10 bg-primary/20 text-primary rounded-full flex items-center justify-center font-bold">
            3
          </div>
          <div class="flex-1">
            <h3 class="text-foreground font-semibold mb-2">Confirm installation</h3>
            <p class="text-sm text-muted-foreground">
              Tap "Add" in the top right corner to complete the installation
            </p>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="p-6 border-t border-border">
        <button
          onclick={closeIOSInstructions}
          class="w-full bg-primary hover:bg-accent-dark text-foreground font-semibold py-3 px-4 rounded-xl transition-colors"
        >
          Got it!
        </button>
      </div>
    </div>
  </div>
{/if}
