<script lang="ts">
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import { ndk } from '$lib/ndk.svelte';
  import { profiles } from '@nostr-dev-kit/ndk-svelte5/stores';
  import Avatar from '@nostr-dev-kit/ndk-svelte5/components/Avatar.svelte';
  import ContentRenderer from '@nostr-dev-kit/ndk-svelte5/components/ContentRenderer.svelte';
  import { formatDistanceToNow } from 'date-fns';

  interface Props {
    event: NDKEvent;
    showActions?: boolean;
  }

  const { event, showActions = true }: Props = $props();

  const profile = $derived(profiles.get(event.pubkey));

  function formatTime(timestamp: number | undefined) {
    if (!timestamp) return '';
    return formatDistanceToNow(new Date(timestamp * 1000), { addSuffix: true });
  }

  async function handleReact(emoji: string) {
    if (!ndk.signer) {
      alert('Please login to react');
      return;
    }

    const reaction = await ndk.publish({
      kind: 7,
      content: emoji,
      tags: [
        ['e', event.id!],
        ['p', event.pubkey],
      ],
    });
  }

  async function handleRepost() {
    if (!ndk.signer) {
      alert('Please login to repost');
      return;
    }

    const repost = await ndk.publish({
      kind: 6,
      content: '',
      tags: [
        ['e', event.id!],
        ['p', event.pubkey],
      ],
    });
  }
</script>

<article class="p-4 hover:bg-neutral-900/30 transition-colors cursor-pointer">
  <div class="flex gap-3">
    <!-- Avatar -->
    <div class="flex-shrink-0">
      <Avatar {ndk} pubkey={event.pubkey} class="w-12 h-12" />
    </div>

    <!-- Content -->
    <div class="flex-1 min-w-0">
      <div class="flex items-center gap-2 mb-1">
        <span class="font-semibold text-white truncate">
          {profile?.displayName || profile?.name || `${event.pubkey.slice(0, 8)}...`}
        </span>
        <span class="text-neutral-500 text-sm truncate">
          @{profile?.name || event.pubkey.slice(0, 8)}
        </span>
        <span class="text-neutral-500 text-sm">·</span>
        <span class="text-neutral-500 text-sm">
          {formatTime(event.created_at)}
        </span>
      </div>

      <div class="text-neutral-200 whitespace-pre-wrap break-words">
        {event.content}
      </div>

      <!-- Actions -->
      {#if showActions}
        <div class="flex items-center gap-6 mt-3 text-neutral-500">
          <button class="flex items-center gap-2 hover:text-purple-400 transition-colors group">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span class="text-sm group-hover:underline">Reply</span>
          </button>

          <button
            onclick={handleRepost}
            class="flex items-center gap-2 hover:text-green-400 transition-colors group"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span class="text-sm group-hover:underline">Repost</span>
          </button>

          <button
            onclick={() => handleReact('❤️')}
            class="flex items-center gap-2 hover:text-red-400 transition-colors group"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span class="text-sm group-hover:underline">Like</span>
          </button>

          <button class="flex items-center gap-2 hover:text-yellow-400 transition-colors group">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span class="text-sm group-hover:underline">Zap</span>
          </button>
        </div>
      {/if}
    </div>
  </div>
</article>
