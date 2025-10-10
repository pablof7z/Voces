<script lang="ts">
  import { page } from '$app/stores';
  import { ndk } from '$lib/ndk.svelte';
  import type { NDKEvent, NDKUser } from '@nostr-dev-kit/ndk';
  import { goto } from '$app/navigation';
  import { Avatar } from '@nostr-dev-kit/svelte';
  import { EventContent } from '@nostr-dev-kit/svelte';
  import { formatDistanceToNow } from 'date-fns';
  import { nip19 } from 'nostr-tools';
  import ComposeDialog from '$lib/components/ComposeDialog.svelte';

  // Decode the nevent parameter
  const neventId = $derived($page.params.nevent);

  // Fetch the main event
  let mainEvent = $state<NDKEvent | null>(null);
  const mainProfile = ndk.$fetchProfile(() => mainEvent?.pubkey);

  $effect(() => {
    if (!neventId) return;

    ndk.fetchEvent(neventId).then(event => {
      mainEvent = event;
    });
  });

  // Get the root event ID from the main event's tags
  const rootEventId = $derived.by(() => {
    if (!mainEvent) return null;

    // Find root tag
    const rootTag = mainEvent.tags.find(tag => tag[0] === 'e' && tag[3] === 'root');
    if (rootTag) {
      return rootTag[1];
    }

    // If no root tag, check if there's a reply tag (this might be the root itself)
    const replyTag = mainEvent.tags.find(tag => tag[0] === 'e' && tag[3] === 'reply');
    if (replyTag) {
      return replyTag[1];
    }

    // Fallback for older format - first 'e' tag might be the root
    const eTags = mainEvent.tags.filter(tag => tag[0] === 'e');
    if (eTags.length > 0) {
      return eTags[0][1];
    }

    return null;
  });

  // Fetch thread events
  const threadEvents = ndk.$subscribe(() => {
    if (!rootEventId || !mainEvent) return undefined;

    return {
      filters: [
        { ids: [rootEventId] },
        { kinds: [1], '#e': [rootEventId] }
      ]
    };
  });

  // Fetch replies to the main event
  const replies = ndk.$subscribe(() => {
    if (!mainEvent) return undefined;
    return {
      filters: [{
        kinds: [1],
        '#e': [mainEvent.id]
      }]
    };
  });

  // Build the parent chain
  const parentChain = $derived.by(() => {
    if (!mainEvent || !threadEvents || threadEvents.events.length === 0) return [];

    const parents: NDKEvent[] = [];
    const eventMap = new Map(threadEvents.events.map(e => [e.id, e]));

    let currentEvent = mainEvent;
    let iteration = 0;

    while (currentEvent && iteration < 20) { // Safety limit
      iteration++;

      // Find the parent of the current event
      const replyTag = currentEvent.tags.find(tag => tag[0] === 'e' && tag[3] === 'reply');
      const rootTag = currentEvent.tags.find(tag => tag[0] === 'e' && tag[3] === 'root');

      let parentId: string | null = null;

      if (replyTag) {
        parentId = replyTag[1];
      } else if (rootTag && rootTag[1] !== currentEvent.id) {
        parentId = rootTag[1];
      } else {
        // Fallback: check for any 'e' tags (older format)
        const eTags = currentEvent.tags.filter(tag => tag[0] === 'e');
        if (eTags.length > 0) {
          parentId = eTags[eTags.length - 1][1];
        }
      }

      if (parentId && eventMap.has(parentId)) {
        const parentEvent = eventMap.get(parentId)!;
        parents.unshift(parentEvent);
        currentEvent = parentEvent;
      } else {
        break;
      }
    }

    return parents;
  });

  // Filter direct replies
  const directReplies = $derived.by(() => {
    if (!replies || !mainEvent) return [];

    const repliesArray = replies.events;

    // Filter for direct replies only
    const directReplies = repliesArray.filter(reply => {
      const replyTag = reply.tags.find(tag =>
        tag[0] === 'e' && tag[3] === 'reply'
      );
      // If there's a specific reply tag, check if it's replying to our event
      if (replyTag) {
        return replyTag[1] === mainEvent.id;
      }
      // Otherwise check if our event is the last 'e' tag (older format)
      const eTags = reply.tags.filter(tag => tag[0] === 'e');
      return eTags.length > 0 && eTags[eTags.length - 1][1] === mainEvent.id;
    });

    // Sort by creation time (oldest first)
    return directReplies.sort((a, b) => (a.created_at || 0) - (b.created_at || 0));
  });

  let showReplyDialog = $state(false);
  let replyContent = $state('');
  let isSubmitting = $state(false);

  async function handleReply() {
    if (!ndk.signer || !replyContent || !mainEvent) return;

    isSubmitting = true;

    try {
      const replyEvent = await mainEvent.reply(replyContent);
      await replyEvent.publish();

      // Reset content
      replyContent = '';
    } catch (error) {
      console.error('Failed to publish reply:', error);
      alert('Failed to send reply.');
    } finally {
      isSubmitting = false;
    }
  }

  function formatTime(timestamp: number | undefined) {
    if (!timestamp) return '';
    return formatDistanceToNow(new Date(timestamp * 1000), { addSuffix: true });
  }
</script>

<div class="min-h-screen bg-black">
  <!-- Header -->
  <header class="sticky top-0 z-10 bg-black/80 backdrop-blur-md border-b border-neutral-800">
    <div class="flex items-center gap-4 px-4 py-3">
      <button
        onclick={() => history.back()}
        class="p-2 hover:bg-neutral-900 rounded-lg transition-colors"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
      </button>
      <h1 class="text-xl font-semibold">Thread</h1>
    </div>
  </header>

  {#if !mainEvent}
    <div class="flex flex-col items-center justify-center mt-20">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      <p class="mt-4 text-neutral-400">Loading note...</p>
    </div>
  {:else}
    <main class="max-w-2xl mx-auto">
      <!-- Parent Notes (Thread Context) -->
      {#each parentChain as parentNote, index}
        {@const parentProfile = ndk.$fetchProfile(() => parentNote.pubkey)}
        <div class="relative">
          <!-- Thread connector line before the note -->
          {#if index > 0}
            <div class="absolute left-[29px] -top-px h-[73px] w-0.5 bg-neutral-700"></div>
          {/if}

          <article class="p-4 hover:bg-neutral-900/30 transition-colors cursor-pointer border-b border-neutral-800">
            <div class="flex gap-3">
              <a href="/p/{nip19.npubEncode(parentNote.pubkey)}" class="flex-shrink-0">
                <Avatar {ndk} pubkey={parentNote.pubkey} class="w-12 h-12" />
              </a>

              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <span class="font-semibold text-white truncate">
                    {parentProfile?.displayName || parentProfile?.name || `${parentNote.pubkey.slice(0, 8)}...`}
                  </span>
                  <span class="text-neutral-500 text-sm">·</span>
                  <span class="text-neutral-500 text-sm">
                    {formatTime(parentNote.created_at)}
                  </span>
                </div>

                <div class="text-neutral-200 whitespace-pre-wrap break-words">
                  <EventContent {ndk} content={parentNote.content} emojiTags={parentNote.tags} />
                </div>
              </div>
            </div>
          </article>

          <!-- Thread connector line after the note -->
          <div class="absolute left-[29px] top-[73px] bottom-0 w-0.5 bg-neutral-700"></div>
        </div>
      {/each}

      <!-- Main Note - Highlighted with larger text -->
      {#if mainEvent}
        <div class="relative">
          <!-- Thread connector line before the main note -->
          {#if parentChain.length > 0}
            <div class="absolute left-[29px] -top-px h-[73px] w-0.5 bg-neutral-700"></div>
          {/if}

          <article class="p-4 bg-neutral-900/50 border-y-2 border-purple-600/50">
          <div class="flex gap-3">
            <a href="/p/{nip19.npubEncode(mainEvent.pubkey)}" class="flex-shrink-0">
              <Avatar {ndk} pubkey={mainEvent.pubkey} class="w-14 h-14" />
            </a>

            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-2">
                <span class="font-bold text-white text-lg truncate">
                  {mainProfile?.displayName || mainProfile?.name || `${mainEvent.pubkey.slice(0, 8)}...`}
                </span>
                <span class="text-neutral-500 text-sm">·</span>
                <span class="text-neutral-500 text-sm">
                  {formatTime(mainEvent.created_at)}
                </span>
              </div>

              <!-- Larger text for main note -->
              <div class="text-neutral-100 whitespace-pre-wrap break-words text-lg leading-relaxed">
                <EventContent {ndk} content={mainEvent.content} emojiTags={mainEvent.tags} />
              </div>

              <!-- Actions for main note -->
              <div class="flex items-center gap-6 mt-4 text-neutral-400 border-t border-neutral-700 pt-3">
                <button
                  onclick={() => showReplyDialog = true}
                  class="flex items-center gap-2 hover:text-purple-400 transition-colors"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span class="text-sm">Reply</span>
                </button>

                <button class="flex items-center gap-2 hover:text-green-400 transition-colors">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span class="text-sm">Repost</span>
                </button>

                <button class="flex items-center gap-2 hover:text-red-400 transition-colors">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span class="text-sm">Like</span>
                </button>

                <button class="flex items-center gap-2 hover:text-yellow-400 transition-colors">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span class="text-sm">Zap</span>
                </button>
              </div>
            </div>
          </div>
        </article>
      </div>
      {/if}

      <!-- Reply Box -->
      {#if ndk.signer}
        {@const currentUser = ndk.$currentUser()}
        <div class="border-b border-neutral-800 p-4">
          <div class="flex gap-3">
            {#if currentUser}
              <Avatar {ndk} pubkey={currentUser.pubkey} class="w-10 h-10 flex-shrink-0" />
            {/if}
            <div class="flex-1">
              <textarea
                bind:value={replyContent}
                placeholder={`Reply to ${mainProfile?.name || 'this note'}...`}
                class="w-full min-h-[100px] p-3 bg-black border border-neutral-700 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                disabled={isSubmitting}
              />
              <div class="flex justify-end mt-2">
                <button
                  onclick={handleReply}
                  disabled={!replyContent.trim() || isSubmitting}
                  class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? 'Posting...' : 'Reply'}
                </button>
              </div>
            </div>
          </div>
        </div>
      {/if}

      <!-- Replies -->
      <div>
        {#if directReplies.length > 0}
          <div class="px-4 py-3 border-b border-neutral-800">
            <h2 class="font-semibold text-white">
              {directReplies.length} {directReplies.length === 1 ? 'Reply' : 'Replies'}
            </h2>
          </div>
          {#each directReplies as reply}
            {@const replyProfile = ndk.$fetchProfile(() => reply.pubkey)}
            <article class="p-4 hover:bg-neutral-900/30 transition-colors border-b border-neutral-800">
              <div class="flex gap-3">
                <a href="/p/{nip19.npubEncode(reply.pubkey)}" class="flex-shrink-0">
                  <Avatar {ndk} pubkey={reply.pubkey} class="w-10 h-10" />
                </a>

                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="font-semibold text-white text-sm truncate">
                      {replyProfile?.displayName || replyProfile?.name || `${reply.pubkey.slice(0, 8)}...`}
                    </span>
                    <span class="text-neutral-500 text-xs">·</span>
                    <span class="text-neutral-500 text-xs">
                      {formatTime(reply.created_at)}
                    </span>
                  </div>

                  <div class="text-neutral-200 text-sm whitespace-pre-wrap break-words">
                    <EventContent {ndk} content={reply.content} emojiTags={reply.tags} />
                  </div>
                </div>
              </div>
            </article>
          {/each}
        {:else}
          <div class="p-8 text-center text-neutral-400">
            No replies yet. Be the first to reply!
          </div>
        {/if}
      </div>
    </main>
  {/if}
</div>

<ComposeDialog bind:open={showReplyDialog} replyTo={mainEvent} />