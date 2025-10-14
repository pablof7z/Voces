<script lang="ts">
  import { t } from 'svelte-i18n';
  import RelaySettings from '$lib/components/settings/RelaySettings.svelte';
  import ThemeSettings from '$lib/components/settings/ThemeSettings.svelte';
  import BlossomSettings from '$lib/components/settings/BlossomSettings.svelte';
  import KeyManagementSettings from '$lib/components/settings/KeyManagementSettings.svelte';
  import DebugSettings from '$lib/components/settings/DebugSettings.svelte';
  import ZapSettings from '$lib/components/settings/ZapSettings.svelte';
  import WalletSettings from '$lib/components/settings/WalletSettings.svelte';
  import HashtagSettings from '$lib/components/settings/HashtagSettings.svelte';

  type SettingsSection = 'relays' | 'theme' | 'blossom' | 'keys' | 'zap' | 'wallet' | 'hashtags' | 'debug' | null;

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

  interface SectionGroup {
    title: string;
    items: SectionConfig[];
  }

  let activeSection = $state<SettingsSection>(null);

  // Organize settings into groups
  const sectionGroups: SectionGroup[] = [
    {
      title: 'Content & Personalization',
      items: [
        {
          id: 'hashtags',
          label: 'Hashtag Interests',
          description: 'Follow hashtags and filter your feed',
          iconPath: 'M7 20l4-16m2 16l4-16M6 9h14M4 15h14',
          iconColor: 'text-primary',
          iconBg: 'bg-primary/10',
          component: HashtagSettings,
          available: true,
        },
        {
          id: 'theme',
          label: 'Appearance',
          description: 'Customize theme and language',
          iconPath: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01',
          iconColor: 'text-primary',
          iconBg: 'bg-primary-400/10',
          component: ThemeSettings,
          available: true,
        },
      ]
    },
    {
      title: 'Servers',
      items: [
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
          iconColor: 'text-primary',
          iconBg: 'bg-primary/10',
          component: BlossomSettings,
          available: true,
        },
      ]
    },
    {
      title: 'Payments',
      items: [
        {
          id: 'wallet',
          label: 'Wallet',
          description: 'Manage Cashu mints and wallet relays',
          iconPath: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
          iconColor: 'text-primary',
          iconBg: 'bg-primary/10',
          component: WalletSettings,
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
      ]
    },
    {
      title: 'Security & Advanced',
      items: [
        {
          id: 'keys',
          label: 'Private Key',
          description: 'View and backup your private key',
          iconPath: 'M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z',
          iconColor: 'text-red-500',
          iconBg: 'bg-red-500/10',
          component: KeyManagementSettings,
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
      ]
    }
  ];

  // Flatten all sections for easy lookup
  const allSections = $derived(sectionGroups.flatMap(group => group.items));

  $effect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab && allSections.some(s => s.id === tab && s.available)) {
      activeSection = tab as SettingsSection;
    }
  });

  let currentSection = $derived(allSections.find(s => s.id === activeSection));
</script>

<div class="w-full min-h-screen bg-background pb-20 md:pb-0">
  <div class="max-w-lg mx-auto">
    {#if activeSection && currentSection}
      <!-- Detail View -->
      <div class="pt-6 pb-4 border-b">
        <div class="flex items-center gap-3">
          <button
            onclick={() => activeSection = null}
            class="p-2 hover:bg-neutral-200/50 dark:hover:bg-muted/30 rounded-lg transition-all"
          >
            <svg class="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 class="text-xl font-semibold text-foreground">
            {currentSection.label}
          </h1>
        </div>
      </div>

      <div class="py-6">
        <svelte:component this={currentSection.component} />
      </div>
    {:else}
      <!-- List View -->
      <div class="pt-6 pb-4">
        <h1 class="text-xl font-semibold text-foreground">
          {$t('settings.title')}
        </h1>
      </div>

      <div class="py-6 space-y-8">
        {#each sectionGroups as group}
          <div>
            <!-- Section Title -->
            <h2 class="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              {group.title}
            </h2>

            <!-- Section Items -->
            <div class="space-y-2">
              {#each group.items as section}
                <button
                  onclick={() => section.available && (activeSection = section.id)}
                  disabled={!section.available}
                  class="w-full bg-neutral-100 dark:bg-card border rounded-xl p-4 flex items-center justify-between transition-all {section.available
                    ? 'hover:bg-neutral-200 dark:hover:bg-muted cursor-pointer'
                    : 'opacity-50 cursor-not-allowed'}"
                >
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-lg flex items-center justify-center {section.iconBg}">
                      <svg class="w-5 h-5 {section.iconColor}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={section.iconPath} />
                      </svg>
                    </div>
                    <div class="text-left">
                      <div class="text-sm font-medium text-foreground flex items-center gap-2">
                        {section.label}
                        {#if !section.available}
                          <span class="text-xs bg-neutral-200 dark:bg-muted px-1.5 py-0.5 rounded">
                            {$t('common.soon')}
                          </span>
                        {/if}
                      </div>
                      <div class="text-xs text-muted-foreground">
                        {section.description}
                      </div>
                    </div>
                  </div>
                  {#if section.available}
                    <svg class="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                  {/if}
                </button>
              {/each}
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>
