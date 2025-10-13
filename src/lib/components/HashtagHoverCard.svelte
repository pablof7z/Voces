<script lang="ts">
  import { ndk, hashtagInterests } from '$lib/ndk.svelte';
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

  // Check if hashtag is followed
  const isFollowing = $derived(hashtagInterests.interests.includes(hashtag.toLowerCase()));

  let isTogglingFollow = $state(false);

  async function toggleFollow(e: MouseEvent) {
    e.stopPropagation();
    if (isTogglingFollow) return;

    isTogglingFollow = true;
    try {
      await hashtagInterests.toggleHashtag(hashtag);
    } catch (err) {
      console.error('Failed to toggle hashtag:', err);
    } finally {
      isTogglingFollow = false;
    }
  }

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
      <div class="relative w-80 bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
        <!-- Gradient header -->
        <div class="relative h-20 bg-gradient-to-br from-orange-900 via-neutral-800 to-neutral-900">
          <div class="absolute inset-0 bg-gradient-to-b from-transparent to-neutral-900 opacity-60"></div>
          <!-- Hashtag overlay -->
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="text-3xl font-bold text-foreground/20 select-none">
              #{hashtag}
            </div>
          </div>
        </div>

        <!-- Content -->
        <div class="relative px-5 pb-5 -mt-8">
          <!-- Hashtag title and Follow button -->
          <div class="flex items-center justify-between mb-4 gap-3">
            <h3 class="text-2xl font-bold text-foreground">
              <span class="text-primary">#</span>{hashtag}
            </h3>

            {#if currentUser}
              <button
                onclick={toggleFollow}
                disabled={isTogglingFollow}
                class="px-4 py-2 rounded-full text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 {
                  isFollowing
                    ? 'bg-muted text-foreground hover:bg-muted border border'
                    : 'bg-primary text-foreground hover:bg-primary'
                }"
              >
                {#if isTogglingFollow}
                  <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                {:else if isFollowing}
                  Following
                {:else}
                  Follow
                {/if}
              </button>
            {/if}
          </div>

          <!-- Stats -->
          <div class="flex items-center gap-4 mb-4 text-sm border-b border-border pb-4">
            <div class="flex items-center gap-1.5">
              <span class="font-medium text-foreground">{noteCount}</span>
              <span class="text-muted-foreground">{noteCount === 1 ? 'note' : 'notes'}</span>
            </div>
            <div class="flex items-center gap-1.5">
              <span class="font-medium text-foreground">{authorCount}</span>
              <span class="text-muted-foreground">{authorCount === 1 ? 'person' : 'people'}</span>
            </div>
            <div class="flex items-center gap-1.5 text-muted-foreground">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>24h</span>
            </div>
          </div>

          <!-- Recent note from following -->
          {#if recentNoteFromFollowing}
            <div class="space-y-2">
              <div class="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Recent note
              </div>

              <div class="bg-muted/50 rounded-lg p-3 border border-border">
                <!-- Author info -->
                <div class="flex items-center gap-2 mb-2">
                  <Avatar
                    {ndk}
                    pubkey={recentNoteFromFollowing.pubkey}
                    class="w-6 h-6 rounded-full"
                  />
                  <div class="flex-1 min-w-0">
                    <div class="text-xs font-medium text-foreground truncate">
                      {recentNoteAuthorProfile?.displayName || recentNoteAuthorProfile?.name || 'Anonymous'}
                    </div>
                  </div>
                  <div class="text-xs text-muted-foreground">
                    {formatTimestamp(recentNoteFromFollowing.created_at ?? 0)}
                  </div>
                </div>

                <!-- Note content -->
                <div class="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                  <EventContent
                    {ndk}
                    content={recentNoteFromFollowing.content}
                    class="text-muted-foreground"
                  />
                </div>
              </div>
            </div>
          {:else if hashtagSubscription.events.length === 0}
            <div class="text-center py-6 text-muted-foreground">
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
