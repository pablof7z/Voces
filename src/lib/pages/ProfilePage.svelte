<script lang="ts">
  import { router } from '$lib/router.svelte';
  import { ndk } from '$lib/ndk.svelte';
  import { profiles } from '@nostr-dev-kit/ndk-svelte5/stores';
  import { NDKKind } from '@nostr-dev-kit/ndk';
  import Avatar from '@nostr-dev-kit/ndk-svelte5/components/Avatar.svelte';
  import NoteCard from '$lib/components/NoteCard.svelte';

  const identifier = $derived(router.params.identifier || '');

  const profile = $derived(profiles.get(identifier));

  const userNotes = ndk.subscribeReactive(
    [{ kinds: [NDKKind.Text], authors: [identifier], limit: 20 }],
    { bufferMs: 100 }
  );
</script>

<div class="max-w-full mx-auto">
  <div class="sticky top-0 z-10 bg-black/90 backdrop-blur-xl border-b border-neutral-800/50 px-4 py-4">
    <button onclick={() => router.back()} class="text-neutral-400 hover:text-white mb-2">
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
    </button>
    <h1 class="text-xl font-bold text-white">Profile</h1>
  </div>

  <div class="p-4">
    {#if profile}
      <div class="flex items-start gap-4 mb-6">
        <Avatar {ndk} pubkey={identifier} class="w-20 h-20" />
        <div class="flex-1">
          <h2 class="text-xl font-bold text-white">{profile.displayName || profile.name || 'Anonymous'}</h2>
          <p class="text-neutral-400">@{profile.name || identifier.slice(0, 8)}</p>
          {#if profile.about}
            <p class="mt-2 text-neutral-300">{profile.about}</p>
          {/if}
        </div>
      </div>
    {:else}
      <div class="p-4 text-neutral-400">Loading profile...</div>
    {/if}

    <div class="border-t border-neutral-800 pt-4">
      <h3 class="text-lg font-bold text-white mb-4">Notes</h3>
      {#if userNotes.events.length === 0}
        <p class="text-neutral-400 px-4">No notes yet</p>
      {:else}
        <div class="divide-y divide-neutral-800/50">
          {#each userNotes.events as note}
            <NoteCard event={note} />
          {/each}
        </div>
      {/if}
    </div>
  </div>
</div>
