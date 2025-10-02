<script lang="ts">
  import { ndk } from '$lib/ndk.svelte';
  import { router } from '$lib/router.svelte';
  import { NDKEvent } from '@nostr-dev-kit/ndk';

  let content = $state('');
  let isPublishing = $state(false);

  async function publishNote() {
    if (!content.trim() || isPublishing) return;

    try {
      isPublishing = true;
      const event = new NDKEvent(ndk);
      event.kind = 1;
      event.content = content;
      await event.publish();

      content = '';
      router.push('/');
    } catch (error) {
      console.error('Failed to publish note:', error);
      alert('Failed to publish note');
    } finally {
      isPublishing = false;
    }
  }
</script>

<div class="max-w-full mx-auto">
  <div class="sticky top-0 z-10 bg-black/90 backdrop-blur-xl border-b border-neutral-800/50 px-4 py-4">
    <div class="flex items-center justify-between">
      <button onclick={() => router.back()} class="text-neutral-400 hover:text-white">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <h1 class="text-xl font-bold text-white">Compose</h1>
      <button
        onclick={publishNote}
        disabled={!content.trim() || isPublishing}
        class="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-neutral-700 disabled:cursor-not-allowed text-white rounded-full transition-colors font-semibold"
      >
        {isPublishing ? 'Publishing...' : 'Post'}
      </button>
    </div>
  </div>

  <div class="p-4">
    <textarea
      bind:value={content}
      placeholder="What's on your mind?"
      class="w-full min-h-[200px] bg-transparent text-white placeholder-neutral-500 resize-none focus:outline-none text-lg"
      autofocus
    ></textarea>
  </div>
</div>
