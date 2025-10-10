<script lang="ts">
  import RelaySettings from '$lib/components/settings/RelaySettings.svelte';
  import ThemeSettings from '$lib/components/settings/ThemeSettings.svelte';
  import BlossomSettings from '$lib/components/settings/BlossomSettings.svelte';
  import BackupKeySettings from '$lib/components/settings/BackupKeySettings.svelte';
  import DebugSettings from '$lib/components/settings/DebugSettings.svelte';
  import ZapSettings from '$lib/components/settings/ZapSettings.svelte';

  type SettingsSection = 'relays' | 'theme' | 'blossom' | 'backup' | 'zap' | 'debug' | null;

  interface SectionConfig {
    id: SettingsSection;
    label: string;
    description: string;
    iconPath: string;
    iconColor: string;
    iconBg: string;
    component: any;
    available: boolean;
  }

  let activeSection = $state<SettingsSection>(null);

  const sections: SectionConfig[] = [
    {
      id: 'relays',
      label: 'Relays',
      description: 'Manage your Nostr relay connections',
      iconPath: 'M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01',
      iconColor: 'text-blue-400',
      iconBg: 'bg-blue-400/10',
      component: RelaySettings,
      available: true,
    },
    {
      id: 'blossom',
      label: 'Media Servers',
      description: 'Configure Blossom media upload servers',
      iconPath: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
      iconColor: 'text-orange-500',
      iconBg: 'bg-orange-500/10',
      component: BlossomSettings,
      available: true,
    },
    {
      id: 'backup',
      label: 'Key Backup',
      description: 'Backup your private key with trusted contacts',
      iconPath: 'M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z',
      iconColor: 'text-red-400',
      iconBg: 'bg-red-400/10',
      component: BackupKeySettings,
      available: true,
    },
    {
      id: 'zap',
      label: 'Zaps',
      description: 'Configure default zap amount and preferences',
      iconPath: 'M13 10V3L4 14h7v7l9-11h-7z',
      iconColor: 'text-yellow-400',
      iconBg: 'bg-yellow-400/10',
      component: ZapSettings,
      available: true,
    },
    {
      id: 'theme',
      label: 'Appearance',
      description: 'Customize theme and language',
      iconPath: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01',
      iconColor: 'text-purple-400',
      iconBg: 'bg-purple-400/10',
      component: ThemeSettings,
      available: true,
    },
    {
      id: 'debug',
      label: 'Debug',
      description: 'View cache statistics and debug information',
      iconPath: 'M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z',
      iconColor: 'text-green-400',
      iconBg: 'bg-green-400/10',
      component: DebugSettings,
      available: true,
    },
  ];

  $effect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab && sections.some(s => s.id === tab && s.available)) {
      activeSection = tab as SettingsSection;
    }
  });

  let currentSection = $derived(sections.find(s => s.id === activeSection));
</script>

<div class="w-full min-h-screen bg-gradient-to-b from-neutral-50 to-white dark:from-neutral-950 dark:to-black pb-20 md:pb-0">
  <div class="max-w-lg mx-auto">
    {#if activeSection && currentSection}
      <!-- Detail View -->
      <div class="px-6 pt-6 pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div class="flex items-center gap-3">
          <button
            onclick={() => activeSection = null}
            class="p-2 hover:bg-neutral-200/50 dark:hover:bg-neutral-800/30 rounded-lg transition-all"
          >
            <svg class="w-5 h-5 text-neutral-700 dark:text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 class="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
            {currentSection.label}
          </h1>
        </div>
      </div>

      <div class="px-6 py-6">
        <svelte:component this={currentSection.component} />
      </div>
    {:else}
      <!-- List View -->
      <div class="px-6 pt-6 pb-4">
        <h1 class="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
          Settings
        </h1>
      </div>

      <div class="px-6 py-6 space-y-6">
        {#each sections as section}
          <div>
            <button
              onclick={() => section.available && (activeSection = section.id)}
              disabled={!section.available}
              class="w-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 flex items-center justify-between transition-all {section.available
                ? 'hover:bg-neutral-200 dark:hover:bg-neutral-800 cursor-pointer'
                : 'opacity-50 cursor-not-allowed'}"
            >
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-lg flex items-center justify-center {section.iconBg}">
                  <svg class="w-5 h-5 {section.iconColor}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={section.iconPath} />
                  </svg>
                </div>
                <div class="text-left">
                  <div class="text-sm font-medium text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                    {section.label}
                    {#if !section.available}
                      <span class="text-xs bg-neutral-200 dark:bg-neutral-800 px-1.5 py-0.5 rounded">
                        Soon
                      </span>
                    {/if}
                  </div>
                  <div class="text-xs text-neutral-500 dark:text-neutral-600">
                    {section.description}
                  </div>
                </div>
              </div>
              {#if section.available}
                <svg class="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              {/if}
            </button>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>
