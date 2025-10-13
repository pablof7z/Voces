<script lang="ts">
  import { settings } from '$lib/stores/settings.svelte';
  import { t } from 'svelte-i18n';
  import type { ThemeColor } from '$lib/theme/colors';

  function handleThemeChange(newTheme: 'light' | 'dark' | 'system') {
    settings.setTheme(newTheme);
  }

  function handleThemeColorChange(newColor: ThemeColor) {
    settings.setThemeColor(newColor);
  }

  function handleLanguageChange(newLanguage: 'en' | 'es' | 'fa' | 'km' | 'sn') {
    settings.setLanguage(newLanguage);
  }

  const colorOptions = [
    { id: 'orange' as const, name: 'Orange', hex: '#FF6B35', description: 'Warm orange' },
    { id: 'red' as const, name: 'Red', hex: '#E4104D', description: 'Magenta / Raspberry red' },
    { id: 'cyan' as const, name: 'Cyan', hex: '#00B7D3', description: 'Bright cyan / Turquoise' },
    { id: 'yellow' as const, name: 'Yellow', hex: '#FFD900', description: 'Vivid yellow' },
    { id: 'lime' as const, name: 'Lime', hex: '#97BF0D', description: 'Lime green' }
  ];
</script>

<div class="space-y-6">
  <div>
    <h2 class="text-lg font-semibold text-foreground mb-4">
      {$t('settings.sections.appearance.title')}
    </h2>
    <p class="text-sm text-muted-foreground mb-6">
      {$t('settings.sections.appearance.description')}
    </p>
  </div>

  <!-- Language Selection -->
  <div class="border-b border pb-6">
    <div class="flex items-center gap-3 mb-4">
      <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <h3 class="text-base font-medium text-foreground">
        {$t('settings.sections.appearance.language')}
      </h3>
    </div>
    <p class="text-sm text-muted-foreground mb-4">
      {$t('settings.sections.appearance.languageDescription')}
    </p>
    <div class="grid grid-cols-2 gap-3">
      <button
        onclick={() => handleLanguageChange('en')}
        class="px-4 py-3 rounded-lg border transition-all {settings.language === 'en'
          ? 'bg-primary-50 dark:bg-primary-950/30 border-primary text-primary dark:text-primary'
          : 'bg-card border text-muted-foreground hover:bg-accent'}"
      >
        <div class="flex items-center justify-center gap-2">
          <span class="text-lg">🇺🇸</span>
          <span class="font-medium">English</span>
        </div>
      </button>
      <button
        onclick={() => handleLanguageChange('es')}
        class="px-4 py-3 rounded-lg border transition-all {settings.language === 'es'
          ? 'bg-primary-50 dark:bg-primary-950/30 border-primary text-primary dark:text-primary'
          : 'bg-card border text-muted-foreground hover:bg-accent'}"
      >
        <div class="flex items-center justify-center gap-2">
          <span class="text-lg">🇪🇸</span>
          <span class="font-medium">Español</span>
        </div>
      </button>
      <button
        onclick={() => handleLanguageChange('fa')}
        class="px-4 py-3 rounded-lg border transition-all {settings.language === 'fa'
          ? 'bg-primary-50 dark:bg-primary-950/30 border-primary text-primary dark:text-primary'
          : 'bg-card border text-muted-foreground hover:bg-accent'}"
      >
        <div class="flex items-center justify-center gap-2">
          <span class="text-lg">🇮🇷</span>
          <span class="font-medium">فارسی</span>
        </div>
      </button>
      <button
        onclick={() => handleLanguageChange('km')}
        class="px-4 py-3 rounded-lg border transition-all {settings.language === 'km'
          ? 'bg-primary-50 dark:bg-primary-950/30 border-primary text-primary dark:text-primary'
          : 'bg-card border text-muted-foreground hover:bg-accent'}"
      >
        <div class="flex items-center justify-center gap-2">
          <span class="text-lg">🇰🇭</span>
          <span class="font-medium">ខ្មែរ</span>
        </div>
      </button>
      <button
        onclick={() => handleLanguageChange('sn')}
        class="px-4 py-3 rounded-lg border transition-all {settings.language === 'sn'
          ? 'bg-primary-50 dark:bg-primary-950/30 border-primary text-primary dark:text-primary'
          : 'bg-card border text-muted-foreground hover:bg-accent'}"
      >
        <div class="flex items-center justify-center gap-2">
          <span class="text-lg">🇿🇼</span>
          <span class="font-medium">Shona</span>
        </div>
      </button>
    </div>
  </div>

  <!-- Theme Selection -->
  <div class="border-b border pb-6">
    <div class="flex items-center gap-3 mb-4">
      <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
      </svg>
      <h3 class="text-base font-medium text-foreground">
        {$t('settings.sections.appearance.theme')}
      </h3>
    </div>
    <p class="text-sm text-muted-foreground mb-4">
      {$t('settings.sections.appearance.themeDescription')}
    </p>
    <div class="grid grid-cols-3 gap-3">
      <button
        onclick={() => handleThemeChange('light')}
        class="px-4 py-3 rounded-lg border transition-all {settings.theme === 'light'
          ? 'bg-primary-50 dark:bg-primary-950/30 border-primary text-primary dark:text-primary'
          : 'bg-card border text-muted-foreground hover:bg-accent'}"
      >
        <div class="flex flex-col items-center gap-2">
          <span class="text-2xl">☀️</span>
          <span class="text-sm font-medium">{$t('settings.sections.appearance.themes.light')}</span>
        </div>
      </button>
      <button
        onclick={() => handleThemeChange('dark')}
        class="px-4 py-3 rounded-lg border transition-all {settings.theme === 'dark'
          ? 'bg-primary-50 dark:bg-primary-950/30 border-primary text-primary dark:text-primary'
          : 'bg-card border text-muted-foreground hover:bg-accent'}"
      >
        <div class="flex flex-col items-center gap-2">
          <span class="text-2xl">🌙</span>
          <span class="text-sm font-medium">{$t('settings.sections.appearance.themes.dark')}</span>
        </div>
      </button>
      <button
        onclick={() => handleThemeChange('system')}
        class="px-4 py-3 rounded-lg border transition-all {settings.theme === 'system'
          ? 'bg-primary-50 dark:bg-primary-950/30 border-primary text-primary dark:text-primary'
          : 'bg-card border text-muted-foreground hover:bg-accent'}"
      >
        <div class="flex flex-col items-center gap-2">
          <span class="text-2xl">💻</span>
          <span class="text-sm font-medium">{$t('settings.sections.appearance.themes.system')}</span>
        </div>
      </button>
    </div>
  </div>

  <!-- Theme Color Selection -->
  <div>
    <div class="flex items-center gap-3 mb-4">
      <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
      </svg>
      <h3 class="text-base font-medium text-foreground">
        Accent Color
      </h3>
    </div>
    <p class="text-sm text-muted-foreground mb-4">
      Choose your preferred accent color
    </p>
    <div class="grid grid-cols-2 gap-3">
      {#each colorOptions as option}
        <button
          onclick={() => handleThemeColorChange(option.id)}
          class="px-4 py-3 rounded-lg border transition-all {settings.themeColor === option.id
            ? 'border-2'
            : 'bg-card border hover:bg-accent'}"
          style="border-color: {settings.themeColor === option.id ? option.hex : ''}"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-8 h-8 rounded-full flex-shrink-0"
              style="background-color: {option.hex}"
            ></div>
            <div class="flex flex-col items-start">
              <span class="font-medium text-foreground">{option.name}</span>
              <span class="text-xs text-muted-foreground">{option.description}</span>
            </div>
          </div>
        </button>
      {/each}
    </div>
  </div>
</div>
