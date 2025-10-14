<script lang="ts">
  import { ndk } from '$lib/ndk.svelte';
  import { NDKEvent } from '@nostr-dev-kit/ndk';
  import { fetchIntroductionPosts, type IntroductionPost } from '$lib/utils/introductionPosts.svelte';
  import NoteCard from '$lib/components/NoteCard.svelte';
  import { locale, t } from 'svelte-i18n';
  import { getIntroductionHashtags } from '$lib/constants/introductions';
  import ContentComposer from '$lib/components/ContentComposer.svelte';

  interface Props {
    profileData: {
      name: string;
      bio: string;
      location: string;
    };
    inviterPubkey?: string;
    inviteRelay?: string;
    onNext: () => void;
    onSkip: () => void;
  }

  let { profileData, inviterPubkey, inviteRelay, onNext, onSkip }: Props = $props();

  let introText = $state('');
  let publishing = $state(false);
  let introductionPosts = $state<IntroductionPost[]>([]);
  let mentionInviter = $state(!!inviterPubkey);

  const hasValidIntro = $derived(introText.length > 10);
  const charCount = $derived(introText.length);

  const inviterProfile = ndk.$fetchProfile(() => inviterPubkey);

  const inviterName = $derived(inviterProfile?.displayName || inviterProfile?.name || 'your inviter');

  $effect(() => {
    fetchIntroductionPosts(ndk, inviteRelay).then(posts => {
      introductionPosts = posts;
    });
  });

  async function publishIntroduction() {
    if (!hasValidIntro) return;

    publishing = true;
    try {
      const hashtags = getIntroductionHashtags($locale);
      let content = introText.trim();

      // Auto-append hashtags if not present
      for (const tag of hashtags) {
        const hashtagWithSymbol = `#${tag}`;
        if (!content.includes(hashtagWithSymbol)) {
          content = `${content} ${hashtagWithSymbol}`;
        }
      }

      const event = new NDKEvent(ndk);
      event.kind = 1;
      event.content = content;
      event.tags = hashtags.map(tag => ['t', tag]);

      // Add p-tag for inviter if enabled
      if (mentionInviter && inviterPubkey) {
        event.tags.push(['p', inviterPubkey]);
      }

      await event.publish();
      onNext();
    } catch (error) {
      console.error('Error publishing introduction:', error);
      publishing = false;
    }
  }
</script>

<div class="min-h-screen flex flex-col">
  <div class="flex-1 px-4 lg:px-8 py-6 max-w-[1400px] mx-auto w-full pb-32 lg:pb-6">
    <div class="text-center mb-6">
      <h1 class="text-2xl lg:text-3xl font-bold mb-2">{$t('onboarding.step5Introduction.title')}</h1>
      <p class="text-muted-foreground">
        {$t('onboarding.step5Introduction.subtitle')}
      </p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:h-[calc(100vh-200px)]">
      <!-- Right column: Composition area (first on mobile) -->
      <div class="flex flex-col order-1 lg:order-2">
        <div class="lg:p-6">
          <label class="block font-semibold mb-3">{$t('onboarding.step5Introduction.writeLabel')}</label>
          <div class="p-4 bg-card border border rounded-lg">
            <ContentComposer
              bind:value={introText}
              placeholder={$t('onboarding.step5Introduction.placeholder')}
              disabled={publishing}
            />
          </div>
          <div class="flex items-center justify-between mt-3">
            <div class="text-xs text-muted-foreground">
              {#if profileData.location}
                {$t('onboarding.step5Introduction.tipLocation', { values: { location: profileData.location } })}
              {/if}
            </div>
            <div class="text-xs">
              <span class={charCount > 500 ? 'text-red-500' : 'text-muted-foreground'}>
                {charCount} {$t('onboarding.step5Introduction.characters')}
              </span>
            </div>
          </div>

          <!-- Inviter Mention -->
          {#if inviterPubkey}
            <div class="mt-4 p-3 bg-primary-50 dark:bg-primary-900/10 border border-primary-200 dark:border-primary-800 rounded-lg">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2 text-sm">
                  {#if mentionInviter}
                    <svg class="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                    <span class="text-muted-foreground">
                      {$t('onboarding.step5Introduction.inviterNotify', { values: { name: inviterName } })}
                    </span>
                  {:else}
                    <svg class="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                    <span class="text-muted-foreground">
                      {$t('onboarding.step5Introduction.inviterNoNotify', { values: { name: inviterName } })}
                    </span>
                  {/if}
                </div>
                <button
                  onclick={() => mentionInviter = !mentionInviter}
                  class="text-xs px-2 py-1 rounded hover:bg-primary-100 dark:hover:bg-primary-900/20 transition-colors text-primary dark:text-primary font-medium"
                >
                  {mentionInviter ? $t('onboarding.step5Introduction.inviterRemove') : $t('onboarding.step5Introduction.inviterAddBack')}
                </button>
              </div>
            </div>
          {/if}

          <!-- Action buttons - hidden on mobile, shown inline on desktop -->
          <div class="hidden lg:flex gap-3 mt-6">
            <button
              onclick={onSkip}
              class="flex-1 py-3 px-6 border border rounded-lg font-medium hover:bg-accent transition-colors"
            >
              {$t('onboarding.step5Introduction.skipForNow')}
            </button>
            <button
              onclick={publishIntroduction}
              disabled={!hasValidIntro || publishing}
              class={`
                flex-1 py-3 px-6 rounded-lg font-medium transition-all
                ${hasValidIntro && !publishing
                  ? 'bg-background dark:bg-white text-foreground dark:text-black hover:bg-muted dark:hover:bg-neutral-200'
                  : 'bg-neutral-100 dark:bg-background text-muted-foreground cursor-not-allowed'
                }
              `}
            >
              {publishing ? $t('onboarding.step5Introduction.publishing') : $t('onboarding.step5Introduction.postIntroduction')}
            </button>
          </div>
        </div>
      </div>

      <!-- Left column: Recent introductions (second on mobile) -->
      <div class="flex flex-col order-2 lg:order-1">
        <h3 class="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-4">
          {$t('onboarding.step5Introduction.recentIntroductions')}
        </h3>
        <div class="space-y-3 overflow-y-auto flex-1 pr-2 max-h-[400px] lg:max-h-none">
          {#if introductionPosts.length > 0}
            {#each introductionPosts as intro (intro.event.id)}
              <NoteCard event={intro.event} />
            {/each}
          {:else}
            <div class="text-center py-8 text-muted-foreground">
              <p>{$t('onboarding.step5Introduction.loadingIntroductions')}</p>
            </div>
          {/if}
        </div>
      </div>
    </div>
  </div>

  <!-- Fixed action buttons for mobile -->
  <div class="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border p-4 z-50">
    <div class="flex gap-3 max-w-[1400px] mx-auto">
      <button
        onclick={onSkip}
        class="flex-1 py-3 px-6 border border rounded-lg font-medium hover:bg-accent transition-colors"
      >
        {$t('onboarding.step5Introduction.skipForNow')}
      </button>
      <button
        onclick={publishIntroduction}
        disabled={!hasValidIntro || publishing}
        class={`
          flex-1 py-3 px-6 rounded-lg font-medium transition-all
          ${hasValidIntro && !publishing
            ? 'bg-background dark:bg-white text-foreground dark:text-black hover:bg-muted dark:hover:bg-neutral-200'
            : 'bg-neutral-100 dark:bg-background text-muted-foreground cursor-not-allowed'
          }
        `}
      >
        {publishing ? $t('onboarding.step5Introduction.publishing') : $t('onboarding.step5Introduction.postIntroduction')}
      </button>
    </div>
  </div>
</div>
