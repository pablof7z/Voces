<script lang="ts">
  import { page } from '$app/stores';
  import { ndk } from '$lib/ndk.svelte';
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import { Avatar } from '@nostr-dev-kit/svelte';
  import { toast } from '$lib/stores/toast.svelte';
  import NoteCard from '$lib/components/NoteCard.svelte';
  import HighlightCard from '$lib/components/HighlightCard.svelte';
  import ContentComposer from '$lib/components/ContentComposer.svelte';
  import MissingEventCard from '$lib/components/MissingEventCard.svelte';

  type ThreadItem =
    | { type: 'event'; event: NDKEvent }
    | { type: 'missing'; eventId: string; relayHint?: string };

  // Decode the nevent parameter
  const neventId = $derived($page.params.nevent);

  // Fetch the main event
  let mainEvent = $state<NDKEvent | null>(null);
  const currentUser = ndk.$currentUser;
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
    if (!rootEventId) return undefined;

    return {
      filters: [
        { ids: [rootEventId] },
        { kinds: [1, 9802], '#e': [rootEventId] }
      ],
      subId: 'thread-events'
    };
  });

  // Fetch replies to the main event
  const replies = ndk.$subscribe(() => {
    if (!mainEvent) return undefined;
    return {
      filters: [
        { kinds: [1, 9802], '#e': [mainEvent.id] },
        { kinds: [1, 9802], '#e': [mainEvent.id] },
      ],
      subId: 'main-event-replies'
    };
  });

  // Build the parent chain (with missing event tracking)
  const parentChain = $derived.by((): ThreadItem[] => {
    if (!mainEvent || !threadEvents || threadEvents.events.length === 0) return [];

    const parents: ThreadItem[] = [];
    const eventMap = new Map(threadEvents.events.map(e => [e.id, e]));

    let currentEvent = mainEvent;
    let iteration = 0;

    while (currentEvent && iteration < 20) { // Safety limit
      iteration++;

      // Find the parent of the current event
      const replyTag = currentEvent.tags.find(tag => tag[0] === 'e' && tag[3] === 'reply');
      const rootTag = currentEvent.tags.find(tag => tag[0] === 'e' && tag[3] === 'root');

      let parentId: string | null = null;
      let parentTag: string[] | null = null;

      if (replyTag) {
        parentId = replyTag[1];
        parentTag = replyTag;
      } else if (rootTag && rootTag[1] !== currentEvent.id) {
        parentId = rootTag[1];
        parentTag = rootTag;
      } else {
        // Fallback: check for any 'e' tags (older format)
        const eTags = currentEvent.tags.filter(tag => tag[0] === 'e');
        if (eTags.length > 0) {
          parentId = eTags[eTags.length - 1][1];
          parentTag = eTags[eTags.length - 1];
        }
      }

      if (parentId) {
        if (eventMap.has(parentId)) {
          const parentEvent = eventMap.get(parentId)!;
          parents.unshift({ type: 'event', event: parentEvent });
          currentEvent = parentEvent;
        } else {
          // Parent event not found - add a missing placeholder
          const relayHint = parentTag && parentTag[2] ? parentTag[2] : undefined;
          parents.unshift({ type: 'missing', eventId: parentId, relayHint });
          break; // Stop here since we can't continue the chain
        }
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
        return replyTag[1] === mainEvent?.id;
      }
      // Otherwise check if our event is the last 'e' tag (older format)
      const eTags = reply.tags.filter(tag => tag[0] === 'e');
      return eTags.length > 0 && eTags[eTags.length - 1][1] === mainEvent?.id;
    });

    // Sort by creation time (oldest first)
    return directReplies.sort((a, b) => (a.created_at || 0) - (b.created_at || 0));
  });

  let replyContent = $state('');
  let isSubmitting = $state(false);

  function handleEventNavigation(event: NDKEvent) {
    mainEvent = event;
    const nevent = event.encode();
    history.replaceState({}, '', `/e/${nevent}`);
  }

  async function handleReply() {
    if (!ndk.signer || !replyContent || !mainEvent) return;

    isSubmitting = true;

    try {
      const replyEvent = await mainEvent.reply();
      replyEvent.content = replyContent;
      await replyEvent.publish();

      if (replyEvent.publishStatus === 'error') {
        const error = replyEvent.publishError;
        const relayErrors = error?.relayErrors || {};
        const errorMessages = Object.entries(relayErrors)
          .map(([relay, err]) => `${relay}: ${err}`)
          .join('\n');
        toast.error(`Failed to publish:\n${errorMessages || 'Unknown error'}`);
        return;
      }

      replyContent = '';
      toast.success('Reply published');
    } catch (error) {
      console.error('Failed to publish reply:', error);
      toast.error(`Failed to send reply: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      isSubmitting = false;
    }
  }
</script>

<div class="min-h-screen bg-background">
  <!-- Header -->
  <header class="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
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
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      <p class="mt-4 text-neutral-400">Loading note...</p>
    </div>
  {:else}
    <main class="max-w-2xl mx-auto">
      <!-- Parent Notes (Thread Context) -->
      {#each parentChain as item, index}
        {#if item.type === 'missing'}
          <MissingEventCard
            eventId={item.eventId}
            relayHint={item.relayHint}
            showThreadLine={index < parentChain.length - 1}
            onEventFound={(event) => {
              // Refresh the thread when the missing event is found
              if (mainEvent) {
                const nevent = mainEvent.encode();
                window.location.href = `/e/${nevent}`;
              }
            }}
          />
        {:else if item.event.kind === 9802}
          <HighlightCard event={item.event} variant="default" />
        {:else}
          <NoteCard
            event={item.event}
            variant="thread-parent"
            showThreadLine={index < parentChain.length - 1}
            onNavigate={() => handleEventNavigation(item.event)}
          />
        {/if}
      {/each}

      <!-- Main Note - Highlighted with larger text -->
      {#if mainEvent}
        {#if mainEvent.kind === 9802}
          <HighlightCard event={mainEvent} variant="default" />
        {:else}
          <NoteCard
            event={mainEvent}
            variant="thread-main"
            showThreadLine={false}
          />
        {/if}
      {/if}

      <!-- Reply Box -->
      {#if ndk.signer && currentUser}
        <div class="border-b border-neutral-800 p-4">
          <div class="flex gap-3">
            <Avatar {ndk} pubkey={currentUser.pubkey} class="w-10 h-10 flex-shrink-0" />
            <div class="flex-1 flex flex-col gap-2">
              <div class="p-3 bg-background border border-border rounded-lg">
                <ContentComposer
                  bind:value={replyContent}
                  placeholder={`Reply to ${mainProfile?.name || 'this note'}...`}
                  disabled={isSubmitting}
                />
              </div>
              <div class="flex justify-end">
                <button
                  onclick={handleReply}
                  disabled={!replyContent.trim() || isSubmitting}
                  class="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
          <div class="px-4 py-3 border-b border-border">
            <h2 class="font-semibold text-foreground">
              {directReplies.length} {directReplies.length === 1 ? 'Reply' : 'Replies'}
            </h2>
          </div>
          {#each directReplies as reply}
            {#if reply.kind === 9802}
              <HighlightCard event={reply} variant="default" />
            {:else}
              <NoteCard
                event={reply}
                variant="thread-reply"
                onNavigate={() => handleEventNavigation(reply)}
              />
            {/if}
          {/each}
        {/if}
      </div>
    </main>
  {/if}
</div>