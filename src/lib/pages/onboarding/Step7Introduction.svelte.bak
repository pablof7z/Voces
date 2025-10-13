<script lang="ts">
  import { ndk } from '$lib/ndk.svelte';
  import { NDKEvent } from '@nostr-dev-kit/ndk';
  import { fetchIntroductionPosts, type IntroductionPost } from '$lib/utils/introductionPosts.svelte';
  import NoteCard from '$lib/components/NoteCard.svelte';

  interface Props {
    publicKey: string | null;
    profileData: {
      name: string;
      bio: string;
      location: string;
    };
    inviterPubkey?: string;
    onNext: () => void;
    onSkip: () => void;
  }

  let { publicKey, profileData, inviterPubkey, onNext, onSkip }: Props = $props();

  let introText = $state('');
  let publishing = $state(false);
  let introductionPosts = $state<IntroductionPost[]>([]);
  let mentionInviter = $state(!!inviterPubkey);

  const hasValidIntro = $derived(introText.length > 10);
  const charCount = $derived(introText.length);

  const inviterProfile = $derived.by(() => {
    if (!inviterPubkey) return null;
    return ndk.$fetchProfile(() => inviterPubkey);
  });

  const inviterName = $derived(inviterProfile?.displayName || inviterProfile?.name || 'your inviter');

  $effect(() => {
    fetchIntroductionPosts(ndk).then(posts => {
      introductionPosts = posts;
    });
  });

  async function publishIntroduction() {
    if (!hasValidIntro || !publicKey) return;

    publishing = true;
    try {
      // Auto-append #introductions if not present
      let content = introText;
      if (!content.includes('#introductions')) {
        content = content.trim() + ' #introductions';
      }

      const event = new NDKEvent(ndk);
      event.kind = 1;
      event.content = content;
      event.tags = [['t', 'introductions']];

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
      <h1 class="text-2xl lg:text-3xl font-bold mb-2">Introduce Yourself to the Community</h1>
      <p class="text-neutral-600 dark:text-neutral-400">
        Write a brief introduction. Good introductions often earn zaps!
      </p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:h-[calc(100vh-200px)]">
      <!-- Right column: Composition area (first on mobile) -->
      <div class="flex flex-col order-1 lg:order-2">
        <div class="lg:p-6">
          <label class="block font-semibold mb-3">Write Your Introduction</label>
          <textarea
            bind:value={introText}
            placeholder="Tell the community who you are, what you do, and what brings you here."
            class="w-full min-h-[200px] p-4 bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
            rows={8}
          />
          <div class="flex items-center justify-between mt-3">
            <div class="text-xs text-neutral-500">
              {#if profileData.location}
                Tip: Mention that you're from {profileData.location}
              {/if}
            </div>
            <div class="text-xs">
              <span class={charCount > 500 ? 'text-red-500' : 'text-neutral-500'}>
                {charCount} characters
              </span>
            </div>
          </div>

          <!-- Inviter Mention -->
          {#if inviterPubkey}
            <div class="mt-4 p-3 bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800 rounded-lg">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2 text-sm">
                  {#if mentionInviter}
                    <svg class="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                    <span class="text-neutral-700 dark:text-neutral-300">
                      Will notify <span class="font-semibold">{inviterName}</span> who invited you
                    </span>
                  {:else}
                    <svg class="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                    <span class="text-neutral-500">
                      Won't notify <span class="font-semibold">{inviterName}</span>
                    </span>
                  {/if}
                </div>
                <button
                  onclick={() => mentionInviter = !mentionInviter}
                  class="text-xs px-2 py-1 rounded hover:bg-orange-100 dark:hover:bg-orange-900/20 transition-colors text-orange-600 dark:text-orange-400 font-medium"
                >
                  {mentionInviter ? 'Remove' : 'Add back'}
                </button>
              </div>
            </div>
          {/if}

          <!-- Action buttons - hidden on mobile, shown inline on desktop -->
          <div class="hidden lg:flex gap-3 mt-6">
            <button
              onclick={onSkip}
              class="flex-1 py-3 px-6 border border-neutral-300 dark:border-neutral-700 rounded-lg font-medium hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
            >
              Skip for now
            </button>
            <button
              onclick={publishIntroduction}
              disabled={!hasValidIntro || publishing}
              class={`
                flex-1 py-3 px-6 rounded-lg font-medium transition-all
                ${hasValidIntro && !publishing
                  ? 'bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200'
                  : 'bg-neutral-100 dark:bg-black text-neutral-400 cursor-not-allowed'
                }
              `}
            >
              {publishing ? 'Publishing...' : 'Post Introduction'}
            </button>
          </div>
        </div>
      </div>

      <!-- Left column: Recent introductions (second on mobile) -->
      <div class="flex flex-col order-2 lg:order-1">
        <h3 class="font-semibold text-sm text-neutral-500 uppercase tracking-wide mb-4">
          💎 Recent Introductions
        </h3>
        <div class="space-y-3 overflow-y-auto flex-1 pr-2 max-h-[400px] lg:max-h-none">
          {#if introductionPosts.length > 0}
            {#each introductionPosts as intro (intro.event.id)}
              <NoteCard event={intro.event} />
            {/each}
          {:else}
            <div class="text-center py-8 text-neutral-500">
              <p>Loading recent introductions...</p>
            </div>
          {/if}
        </div>
      </div>
    </div>
  </div>

  <!-- Fixed action buttons for mobile -->
  <div class="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-black border-t border-neutral-200 dark:border-neutral-800 p-4 z-50">
    <div class="flex gap-3 max-w-[1400px] mx-auto">
      <button
        onclick={onSkip}
        class="flex-1 py-3 px-6 border border-neutral-300 dark:border-neutral-700 rounded-lg font-medium hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
      >
        Skip for now
      </button>
      <button
        onclick={publishIntroduction}
        disabled={!hasValidIntro || publishing}
        class={`
          flex-1 py-3 px-6 rounded-lg font-medium transition-all
          ${hasValidIntro && !publishing
            ? 'bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200'
            : 'bg-neutral-100 dark:bg-black text-neutral-400 cursor-not-allowed'
          }
        `}
      >
        {publishing ? 'Publishing...' : 'Post Introduction'}
      </button>
    </div>
  </div>
</div>
