<script lang="ts">
  import { settings } from '$lib/stores/settings.svelte';
</script>

<div class="max-w-full mx-auto">
  <div class="sticky top-0 z-10 bg-black/90 backdrop-blur-xl border-b border-neutral-800/50 px-4 py-4">
    <h1 class="text-xl font-bold text-white">Settings</h1>
  </div>

  <div class="p-4 space-y-6">
    <!-- Theme Settings -->
    <section>
      <h2 class="text-lg font-semibold text-white mb-3">Theme</h2>
      <div class="flex gap-2">
        <button
          onclick={() => settings.setTheme('light')}
          class={`px-4 py-2 rounded-lg transition-colors ${
            settings.theme === 'light'
              ? 'bg-purple-600 text-white'
              : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
          }`}
        >
          Light
        </button>
        <button
          onclick={() => settings.setTheme('dark')}
          class={`px-4 py-2 rounded-lg transition-colors ${
            settings.theme === 'dark'
              ? 'bg-purple-600 text-white'
              : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
          }`}
        >
          Dark
        </button>
        <button
          onclick={() => settings.setTheme('system')}
          class={`px-4 py-2 rounded-lg transition-colors ${
            settings.theme === 'system'
              ? 'bg-purple-600 text-white'
              : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
          }`}
        >
          System
        </button>
      </div>
    </section>

    <!-- Language Settings -->
    <section>
      <h2 class="text-lg font-semibold text-white mb-3">Language</h2>
      <div class="flex gap-2">
        <button
          onclick={() => settings.setLanguage('en')}
          class={`px-4 py-2 rounded-lg transition-colors ${
            settings.language === 'en'
              ? 'bg-purple-600 text-white'
              : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
          }`}
        >
          English
        </button>
        <button
          onclick={() => settings.setLanguage('es')}
          class={`px-4 py-2 rounded-lg transition-colors ${
            settings.language === 'es'
              ? 'bg-purple-600 text-white'
              : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
          }`}
        >
          Español
        </button>
      </div>
    </section>

    <!-- Relays -->
    <section>
      <h2 class="text-lg font-semibold text-white mb-3">Relays</h2>
      <div class="space-y-2">
        {#each settings.relays as relay}
          <div class="flex items-center justify-between p-3 bg-neutral-900 rounded-lg">
            <span class="text-neutral-300">{relay.url}</span>
            <button
              onclick={() => settings.toggleRelay(relay.url)}
              class={`px-3 py-1 rounded transition-colors ${
                relay.enabled
                  ? 'bg-green-600 text-white'
                  : 'bg-neutral-700 text-neutral-400'
              }`}
            >
              {relay.enabled ? 'Enabled' : 'Disabled'}
            </button>
          </div>
        {/each}
      </div>
    </section>
  </div>
</div>
