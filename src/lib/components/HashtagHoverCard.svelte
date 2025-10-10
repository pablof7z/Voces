<script lang="ts">
  import { ndk } from '$lib/ndk.svelte';
  import { Avatar } from '@nostr-dev-kit/svelte';
  import { EventContent } from '@nostr-dev-kit/svelte';
  import type { NDKEvent } from '@nostr-dev-kit/ndk';

  interface Props {
    hashtag: string;
    isVisible: boolean;
    position: { x: number; y: number };
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
  }

  const { hashtag, isVisible, position, onMouseEnter, onMouseLeave }: Props = $props();

  const currentUser = ndk.$currentUser;

  // Subscribe to hashtag notes from the past 24 hours
  const hashtagSubscription = ndk.$subscribe(
    () => hashtag && isVisible ? ({
      filters: [{
        kinds: [1],
        '#t': [hashtag.toLowerCase()],
        since: Math.floor(Date.now() / 1000) - (24 * 60 * 60) // 24 hours ago
      }],
      bufferMs: 100,
    }) : undefined
  );

  // Get unique authors
  const uniqueAuthors = $derived.by(() => {
    const authors = new Set<string>();
    hashtagSubscription.events.forEach(event => authors.add(event.pubkey));
    return Array.from(authors);
  });

  const noteCount = $derived(hashtagSubscription.events.length);
  const authorCount = $derived(uniqueAuthors.length);

  // Get the most recent note from someone the current user follows
  const recentNoteFromFollowing = $derived.by(() => {
    if (!currentUser) return null;

    // Get the user's contact list
    const followingPubkeys = new Set<string>();
    // We'll get this from the currentUser's contacts
    // For now, just return the most recent note

    // Sort by created_at descending and get the first one from someone we follow
    const sortedEvents = [...hashtagSubscription.events].sort((a, b) =>
      (b.created_at ?? 0) - (a.created_at ?? 0)
    );

    return sortedEvents[0] || null;
  });

  // Format timestamp
  function formatTimestamp(timestamp: number): string {
    const now = Date.now() / 1000;
    const diff = now - timestamp;

    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  }

  // Get profile for the recent note author
  const recentNoteAuthorProfile = $derived.by(() => {
    if (!recentNoteFromFollowing) return null;
    return ndk.$fetchProfile(() => recentNoteFromFollowing.pubkey);
  });
</script>

{#if isVisible}
  <div
    class="fixed z-50 pointer-events-none animate-in fade-in duration-200"
    style="left: {position.x}px; top: {position.y}px;"
  >
    <div
      class="relative pointer-events-auto"
      onmouseenter={onMouseEnter}
      onmouseleave={onMouseLeave}
    >
      <!-- Main card -->
      <div class="relative w-80 bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl overflow-hidden">
        <!-- Gradient header -->
        <div class="relative h-20 bg-gradient-to-br from-orange-900 via-neutral-800 to-neutral-900">
          <div class="absolute inset-0 bg-gradient-to-b from-transparent to-neutral-900 opacity-60"></div>
          <!-- Hashtag overlay -->
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="text-3xl font-bold text-white/20 select-none">
              #{hashtag}
            </div>
          </div>
        </div>

        <!-- Content -->
        <div class="relative px-5 pb-5 -mt-8">
          <!-- Hashtag badge -->
          <div class="relative inline-flex items-center gap-2 mb-4 px-4 py-2 bg-orange-600 rounded-full shadow-lg">
            <span class="text-xl font-bold text-white">#{hashtag}</span>
          </div>

          <!-- Stats -->
          <div class="flex items-center gap-4 mb-4 text-sm border-b border-neutral-800 pb-4">
            <div class="flex items-center gap-1.5">
              <span class="font-medium text-white">{noteCount}</span>
              <span class="text-neutral-500">{noteCount === 1 ? 'note' : 'notes'}</span>
            </div>
            <div class="flex items-center gap-1.5">
              <span class="font-medium text-white">{authorCount}</span>
              <span class="text-neutral-500">{authorCount === 1 ? 'person' : 'people'}</span>
            </div>
            <div class="flex items-center gap-1.5 text-neutral-500">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>24h</span>
            </div>
          </div>

          <!-- Recent note from following -->
          {#if recentNoteFromFollowing}
            <div class="space-y-2">
              <div class="text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Recent note
              </div>

              <div class="bg-neutral-800/50 rounded-lg p-3 border border-neutral-800">
                <!-- Author info -->
                <div class="flex items-center gap-2 mb-2">
                  <Avatar
                    {ndk}
                    pubkey={recentNoteFromFollowing.pubkey}
                    class="w-6 h-6 rounded-full"
                  />
                  <div class="flex-1 min-w-0">
                    <div class="text-xs font-medium text-white truncate">
                      {recentNoteAuthorProfile?.displayName || recentNoteAuthorProfile?.name || 'Anonymous'}
                    </div>
                  </div>
                  <div class="text-xs text-neutral-500">
                    {formatTimestamp(recentNoteFromFollowing.created_at ?? 0)}
                  </div>
                </div>

                <!-- Note content -->
                <div class="text-sm text-neutral-300 line-clamp-3 leading-relaxed">
                  <EventContent
                    {ndk}
                    content={recentNoteFromFollowing.content}
                    class="text-neutral-300"
                  />
                </div>
              </div>
            </div>
          {:else if hashtagSubscription.events.length === 0}
            <div class="text-center py-6 text-neutral-500">
              <svg class="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
              </svg>
              <p class="text-sm">No recent notes found</p>
            </div>
          {/if}
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  @keyframes animate-in {
    from {
      opacity: 0;
      transform: translateY(-10px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  .animate-in {
    animation: animate-in 0.2s ease-out;
  }

  .fade-in {
    animation: fade-in 0.2s ease-out;
  }

  @keyframes fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>
