<script lang="ts">
  import { hashtagInterests } from '$lib/ndk.svelte';

  let newHashtag = $state('');
  let isAdding = $state(false);
  let error = $state<string | null>(null);

  async function addHashtag() {
    if (!newHashtag.trim()) return;

    isAdding = true;
    error = null;

    try {
      const hashtag = newHashtag.trim().replace(/^#/, ''); // Remove leading # if present
      await hashtagInterests.addHashtag(hashtag);
      newHashtag = '';
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to add hashtag';
    } finally {
      isAdding = false;
    }
  }

  async function removeHashtag(hashtag: string) {
    try {
      await hashtagInterests.removeHashtag(hashtag);
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to remove hashtag';
    }
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      addHashtag();
    }
  }
</script>

<div class="space-y-6">
  <!-- Description -->
  <div class="text-sm text-muted-foreground">
    <p>Follow hashtags to see related content in your home feed. Your followed hashtags will appear as filters at the top of your home page.</p>
  </div>

  <!-- Add New Hashtag -->
  <div class="space-y-3">
    <label class="block">
      <span class="text-sm font-medium text-muted-foreground mb-2 block">Add Hashtag</span>
      <div class="flex gap-2">
        <div class="relative flex-1">
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-lg">#</span>
          <input
            type="text"
            bind:value={newHashtag}
            onkeydown={handleKeyDown}
            placeholder="bitcoin"
            class="w-full pl-8 pr-3 py-2 bg-neutral-100 dark:bg-card border border rounded-lg text-foreground placeholder-neutral-500 dark:placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
            disabled={isAdding}
          />
        </div>
        <button
          onclick={addHashtag}
          disabled={isAdding || !newHashtag.trim()}
          class="px-4 py-2 bg-primary text-foreground rounded-lg hover:bg-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {isAdding ? 'Adding...' : 'Add'}
        </button>
      </div>
    </label>

    {#if error}
      <div class="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-600 dark:text-red-400 text-sm">
        {error}
      </div>
    {/if}
  </div>

  <!-- Followed Hashtags List -->
  <div class="space-y-3">
    <h3 class="text-sm font-medium text-muted-foreground">Followed Hashtags</h3>

    {#if hashtagInterests.isLoading}
      <div class="flex items-center justify-center py-8 text-muted-foreground">
        <svg class="w-5 h-5 animate-spin mr-2" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Loading...
      </div>
    {:else if hashtagInterests.interests.length === 0}
      <div class="text-center py-8 text-muted-foreground">
        <svg class="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
        </svg>
        <p class="text-sm">No hashtags followed yet</p>
        <p class="text-xs mt-1">Add hashtags above to start following topics</p>
      </div>
    {:else}
      <div class="space-y-2">
        {#each hashtagInterests.interests as hashtag}
          <div class="flex items-center justify-between p-3 bg-neutral-100 dark:bg-card border border rounded-lg">
            <div class="flex items-center gap-2">
              <span class="text-primary font-medium">#</span>
              <span class="text-foreground font-medium">{hashtag}</span>
            </div>
            <button
              onclick={() => removeHashtag(hashtag)}
              class="p-1.5 hover:bg-red-500/10 rounded-lg transition-colors group"
              title="Remove hashtag"
            >
              <svg class="w-4 h-4 text-muted-foreground group-hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        {/each}
      </div>
    {/if}
  </div>

  <!-- Info Box -->
  <div class="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
    <div class="flex gap-3">
      <svg class="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <div class="text-sm text-blue-700 dark:text-blue-300">
        <p class="font-medium mb-1">How it works</p>
        <ul class="space-y-1 text-xs">
          <li>• Click hashtag pills on your home feed to filter by specific hashtags</li>
          <li>• When viewing a specific relay, hashtag filters will search within that relay</li>
          <li>• When in "Following" mode, hashtag filters will search within your follows</li>
          <li>• Your hashtag interests are stored on Nostr (kind 10015)</li>
        </ul>
      </div>
    </div>
  </div>
</div>
