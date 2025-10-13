<script lang="ts">
  import { pwaStore } from '$lib/stores/pwa.svelte';
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
    <div class="bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-2xl shadow-2xl p-4 max-w-md mx-auto">
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
        <div class="flex-shrink-0 w-14 h-14 bg-white rounded-2xl p-2 shadow-lg">
          <img src="/icons/manifest-icon-192.png" alt="Agora icon" class="w-full h-full" />
        </div>
        <div class="flex-1 pr-6">
          <h3 class="text-lg font-bold mb-1">Install Agora</h3>
          <p class="text-sm text-white/90">
            Get the full app experience with offline access and quick launch from your home screen.
          </p>
        </div>
      </div>

      <!-- Action buttons -->
      <div class="flex gap-2">
        <button
          onclick={handleInstall}
          class="flex-1 bg-white text-orange-600 font-semibold py-3 px-4 rounded-xl hover:bg-orange-50 transition-colors"
        >
          {#if pwaStore.isIOSDevice}
            View Instructions
          {:else}
            Install Now
          {/if}
        </button>
        <button
          onclick={handleNeverAsk}
          class="px-4 py-3 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
        >
          Not Now
        </button>
      </div>
    </div>
  </div>
{/if}

{#if showIOSInstructions}
  <div
    class="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4"
    transition:fade={{ duration: 200 }}
    onclick={closeIOSInstructions}
  >
    <div
      class="bg-neutral-900 rounded-t-3xl md:rounded-3xl max-w-md w-full overflow-hidden"
      onclick={(e) => e.stopPropagation()}
      transition:fly={{ y: 100, duration: 300 }}
    >
      <!-- Header -->
      <div class="p-6 border-b border-neutral-800">
        <div class="flex items-center justify-between mb-2">
          <h2 class="text-xl font-bold text-white">Install Agora on iOS</h2>
          <button
            onclick={closeIOSInstructions}
            class="p-2 hover:bg-neutral-800 rounded-full transition-colors"
            aria-label="Close"
          >
            <svg class="w-6 h-6 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p class="text-sm text-neutral-400">
          Follow these steps to add Agora to your home screen
        </p>
      </div>

      <!-- Instructions -->
      <div class="p-6 space-y-6">
        <!-- Step 1 -->
        <div class="flex gap-4">
          <div class="flex-shrink-0 w-10 h-10 bg-orange-500/20 text-orange-500 rounded-full flex items-center justify-center font-bold">
            1
          </div>
          <div class="flex-1">
            <h3 class="text-white font-semibold mb-2">Tap the Share button</h3>
            <p class="text-sm text-neutral-400 mb-2">
              Look for the share icon in Safari's bottom menu bar
            </p>
            <div class="inline-flex items-center gap-2 bg-neutral-800 px-3 py-2 rounded-lg">
              <svg class="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16.5 6.5v-1.75a.75.75 0 00-1.5 0V6.5h-6V4.75a.75.75 0 00-1.5 0V6.5h-1.75A2.75 2.75 0 003 9.25v9A2.75 2.75 0 005.75 21h12.5A2.75 2.75 0 0021 18.25v-9A2.75 2.75 0 0018.25 6.5H16.5zm-.75 4.25a.75.75 0 011.5 0v4.5a.75.75 0 01-1.5 0v-4.5zm-4.5 0a.75.75 0 011.5 0v4.5a.75.75 0 01-1.5 0v-4.5zm-4.5 0a.75.75 0 011.5 0v4.5a.75.75 0 01-1.5 0v-4.5z"/>
              </svg>
              <span class="text-neutral-300 text-sm">Share</span>
            </div>
          </div>
        </div>

        <!-- Step 2 -->
        <div class="flex gap-4">
          <div class="flex-shrink-0 w-10 h-10 bg-orange-500/20 text-orange-500 rounded-full flex items-center justify-center font-bold">
            2
          </div>
          <div class="flex-1">
            <h3 class="text-white font-semibold mb-2">Select "Add to Home Screen"</h3>
            <p class="text-sm text-neutral-400">
              Scroll down in the share menu and tap "Add to Home Screen"
            </p>
          </div>
        </div>

        <!-- Step 3 -->
        <div class="flex gap-4">
          <div class="flex-shrink-0 w-10 h-10 bg-orange-500/20 text-orange-500 rounded-full flex items-center justify-center font-bold">
            3
          </div>
          <div class="flex-1">
            <h3 class="text-white font-semibold mb-2">Confirm installation</h3>
            <p class="text-sm text-neutral-400">
              Tap "Add" in the top right corner to complete the installation
            </p>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="p-6 border-t border-neutral-800">
        <button
          onclick={closeIOSInstructions}
          class="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-4 rounded-xl transition-colors"
        >
          Got it!
        </button>
      </div>
    </div>
  </div>
{/if}
