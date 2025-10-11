<script lang="ts">
  import { settings } from '$lib/stores/settings.svelte';

  function handleThemeChange(newTheme: 'light' | 'dark' | 'system') {
    settings.setTheme(newTheme);
  }

  function handleLanguageChange(newLanguage: 'en' | 'es') {
    settings.setLanguage(newLanguage);
  }
</script>

<div class="space-y-6">
  <div>
    <h2 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
      Appearance
    </h2>
    <p class="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
      Customize the look and feel of your application
    </p>
  </div>

  <!-- Language Selection -->
  <div class="border-b border-neutral-200 dark:border-neutral-700 pb-6">
    <div class="flex items-center gap-3 mb-4">
      <svg class="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <h3 class="text-base font-medium text-neutral-900 dark:text-neutral-100">
        Language
      </h3>
    </div>
    <p class="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
      Choose your preferred language for the interface
    </p>
    <div class="grid grid-cols-2 gap-3">
      <button
        onclick={() => handleLanguageChange('en')}
        class="px-4 py-3 rounded-lg border transition-all {settings.language === 'en'
          ? 'bg-orange-50 dark:bg-orange-950/30 border-orange-500 text-orange-700 dark:text-orange-500'
          : 'bg-white dark:bg-black border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900'}"
      >
        <div class="flex items-center justify-center gap-2">
          <span class="text-lg">🇺🇸</span>
          <span class="font-medium">English</span>
        </div>
      </button>
      <button
        onclick={() => handleLanguageChange('es')}
        class="px-4 py-3 rounded-lg border transition-all {settings.language === 'es'
          ? 'bg-orange-50 dark:bg-orange-950/30 border-orange-500 text-orange-700 dark:text-orange-500'
          : 'bg-white dark:bg-black border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900'}"
      >
        <div class="flex items-center justify-center gap-2">
          <span class="text-lg">🇪🇸</span>
          <span class="font-medium">Español</span>
        </div>
      </button>
    </div>
  </div>

  <!-- Theme Selection -->
  <div>
    <div class="flex items-center gap-3 mb-4">
      <svg class="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
      </svg>
      <h3 class="text-base font-medium text-neutral-900 dark:text-neutral-100">
        Theme
      </h3>
    </div>
    <p class="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
      Choose how the app should look
    </p>
    <div class="grid grid-cols-3 gap-3">
      <button
        onclick={() => handleThemeChange('light')}
        class="px-4 py-3 rounded-lg border transition-all {settings.theme === 'light'
          ? 'bg-orange-50 dark:bg-orange-950/30 border-orange-500 text-orange-700 dark:text-orange-500'
          : 'bg-white dark:bg-black border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900'}"
      >
        <div class="flex flex-col items-center gap-2">
          <span class="text-2xl">☀️</span>
          <span class="text-sm font-medium">Light</span>
        </div>
      </button>
      <button
        onclick={() => handleThemeChange('dark')}
        class="px-4 py-3 rounded-lg border transition-all {settings.theme === 'dark'
          ? 'bg-orange-50 dark:bg-orange-950/30 border-orange-500 text-orange-700 dark:text-orange-500'
          : 'bg-white dark:bg-black border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900'}"
      >
        <div class="flex flex-col items-center gap-2">
          <span class="text-2xl">🌙</span>
          <span class="text-sm font-medium">Dark</span>
        </div>
      </button>
      <button
        onclick={() => handleThemeChange('system')}
        class="px-4 py-3 rounded-lg border transition-all {settings.theme === 'system'
          ? 'bg-orange-50 dark:bg-orange-950/30 border-orange-500 text-orange-700 dark:text-orange-500'
          : 'bg-white dark:bg-black border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900'}"
      >
        <div class="flex flex-col items-center gap-2">
          <span class="text-2xl">💻</span>
          <span class="text-sm font-medium">System</span>
        </div>
      </button>
    </div>
  </div>
</div>
