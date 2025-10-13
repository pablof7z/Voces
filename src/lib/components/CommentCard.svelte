<script lang="ts">
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import { Avatar, EventContent } from '@nostr-dev-kit/svelte';
  import { ndk } from '$lib/ndk.svelte';
  import { nip19 } from 'nostr-tools';
  import TimeAgo from './TimeAgo.svelte';

  interface Props {
    event: NDKEvent;
  }

  let { event }: Props = $props();

  const profile = ndk.$fetchProfile(() => event.pubkey);
  const displayName = $derived(profile?.name || profile?.displayName || 'Anonymous');
  const npub = $derived(nip19.npubEncode(event.pubkey));

  function navigateToProfile() {
    window.location.href = `/p/${npub}`;
  }
</script>

<div class="group">
  <div class="flex gap-3">
    <button type="button" onclick={navigateToProfile} class="flex-shrink-0">
      <Avatar {ndk} pubkey={event.pubkey} class="w-10 h-10 cursor-pointer hover:opacity-80 transition-opacity" />
    </button>
    <div class="flex-1 min-w-0">
      <div class="flex items-baseline gap-2 mb-1">
        <span class="font-semibold text-foreground">
          {displayName}
        </span>
        {#if event.created_at}
          <TimeAgo timestamp={event.created_at} class="text-sm text-muted-foreground" />
        {/if}
      </div>
      <div class="text-neutral-800 dark:text-foreground leading-relaxed whitespace-pre-wrap break-words">
        <EventContent {ndk} content={event.content} emojiTags={event.tags} />
      </div>
    </div>
  </div>
</div>
