<script lang="ts">
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import { ndk } from '$lib/ndk.svelte';
  import { nip19 } from 'nostr-tools';
  import { onMount } from 'svelte';

  interface Props {
    event: NDKEvent;
  }

  const { event }: Props = $props();

  let replyToEvent = $state<NDKEvent | null>(null);
  let replyToProfile = $state<any>(null);

  // Determine what this note is replying to
  const replyToEventId = $derived.by(() => {
    // First, check for explicit 'reply' marker
    const replyTag = event.tags.find(tag =>
      tag[0] === 'e' && tag[3] === 'reply'
    );

    if (replyTag) {
      return replyTag[1];
    }

    // Check for 'root' marker as fallback
    const rootTag = event.tags.find(tag =>
      tag[0] === 'e' && tag[3] === 'root'
    );

    if (rootTag) {
      return rootTag[1];
    }

    // If there's only a single 'e' tag with no marker, it's likely a reply to that event
    const eTags = event.tags.filter(tag => tag[0] === 'e');
    if (eTags.length === 1) {
      return eTags[0][1];
    }

    return undefined;
  });

  // Fetch the event being replied to
  $effect(() => {
    if (replyToEventId) {
      ndk.fetchEvent(replyToEventId).then((event) => {
        if (event) {
          replyToEvent = event;
          // Fetch the profile of the replied-to event's author
          event.author.fetchProfile().then((profile) => {
            replyToProfile = profile;
          });
        }
      });
    }
  });

  // Derive the display name for the replied-to user
  const replyToDisplayName = $derived.by(() => {
    if (!replyToEvent) return '';
    if (replyToProfile?.name) return replyToProfile.name;
    if (replyToProfile?.displayName) return replyToProfile.displayName;
    return `${replyToEvent.pubkey.slice(0, 8)}...`;
  });

  // Derive the npub for the profile link
  const replyToNpub = $derived.by(() => {
    return replyToEvent ? nip19.npubEncode(replyToEvent.pubkey) : '';
  });
</script>

{#if replyToEvent && replyToProfile}
  <div class="flex items-center gap-1 mb-2 text-sm text-neutral-500">
    <span>Replying to</span>
    <a
      href="/p/{replyToNpub}"
      class="font-medium hover:underline text-neutral-400"
    >
      @{replyToDisplayName}
    </a>
  </div>
{/if}