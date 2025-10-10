<script lang="ts">
  import { onMount } from 'svelte';
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
    onNext: () => void;
    onSkip: () => void;
  }

  let { publicKey, profileData, onNext, onSkip }: Props = $props();

  let introText = $state('');
  let publishing = $state(false);
  let introductionPosts = $state<IntroductionPost[]>([]);

  const hasValidIntro = $derived(introText.length > 10);
  const charCount = $derived(introText.length);

  onMount(async () => {
    introductionPosts = await fetchIntroductionPosts(ndk);
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

      await event.publish();
      onNext();
    } catch (error) {
      console.error('Error publishing introduction:', error);
      publishing = false;
    }
  }
</script>

<div class="min-h-screen flex flex-col">
  <div class="flex-1 px-8 py-6 max-w-[1400px] mx-auto w-full">
    <div class="text-center mb-6">
      <h1 class="text-3xl font-bold mb-2">Introduce Yourself to the Community</h1>
      <p class="text-neutral-600 dark:text-neutral-400">
        Write a brief introduction. Good introductions often earn zaps!
      </p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-200px)]">
      <!-- Left column: Recent introductions -->
      <div class="flex flex-col">
        <h3 class="font-semibold text-sm text-neutral-500 uppercase tracking-wide mb-4">
          💎 Recent Introductions
        </h3>
        <div class="space-y-3 overflow-y-auto flex-1 pr-2">
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

      <!-- Right column: Composition area -->
      <div class="flex flex-col">
        <div class="p-6">
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

          <!-- Action buttons -->
          <div class="flex gap-3 mt-6">
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
    </div>
  </div>
</div>
