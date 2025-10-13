<script lang="ts">
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import { ndk } from '$lib/ndk.svelte';
  import { Avatar, EventContent } from '@nostr-dev-kit/svelte';
  import { toast } from '$lib/stores/toast.svelte';
  import ReplyIndicator from './ReplyIndicator.svelte';
  import RelayBadge from './RelayBadge.svelte';
  import UserHoverCard from './UserHoverCard.svelte';
  import TimeAgo from './TimeAgo.svelte';
  import EventActions from './EventActions.svelte';

  interface Props {
    event: NDKEvent;
    showActions?: boolean;
    variant?: 'default' | 'thread-parent' | 'thread-main' | 'thread-reply';
    showThreadLine?: boolean;
    onNavigate?: () => void;
  }

  const {
    event,
    showActions = true,
    variant = 'default',
    showThreadLine = false,
    onNavigate
  }: Props = $props();

  const profile = ndk.$fetchProfile(() => event.pubkey);
  const npub = $derived(event.author.npub);

  let showOptionsMenu = $state(false);
  let showUserHoverCard = $state(false);
  let hoverCardPosition = $state({ x: 0, y: 0 });
  let hoverTimer: ReturnType<typeof setTimeout> | null = null;
  let avatarElement = $state<HTMLButtonElement | null>(null);

  function navigateToProfile() {
    window.location.href = `/p/${npub}`;
  }

  function navigateToEvent() {
    if (onNavigate) {
      onNavigate();
      return;
    }
    // Encode the event as a nevent
    const neventId = event.encode();
    window.location.href = `/e/${neventId}`;
  }

  const avatarSize = $derived(
    variant === 'thread-main' ? 'w-14 h-14' :
    variant === 'thread-reply' ? 'w-10 h-10' :
    'w-9 h-9 sm:w-12 sm:h-12'
  );

  const textSize = $derived(
    variant === 'thread-main' ? 'text-lg leading-relaxed' : 'text-base'
  );

  const nameSize = $derived(
    variant === 'thread-main' ? 'text-lg font-bold' : 'text-base font-semibold'
  );

  const bgClass = $derived(
    variant === 'thread-main' ? 'bg-card/50' :
    variant === 'default' ? 'hover:bg-card/30' :
    'hover:bg-card/30'
  );

  const clickable = $derived(variant === 'default' || (onNavigate !== undefined));

  async function copyToClipboard(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`Copied ${label}`);
    } catch (err) {
      console.error('Failed to copy:', err);
      toast.error(`Failed to copy ${label}`);
    }
    showOptionsMenu = false;
  }

  function copyAuthorNprofile() {
    const nprofile = event.author.nprofile();
    copyToClipboard(nprofile, 'author nprofile');
  }

  function copyEventId() {
    const nevent = event.encode();
    copyToClipboard(nevent, 'event ID');
  }

  function copyRawEvent() {
    const raw = event.inspect;
    copyToClipboard(raw, 'raw event');
  }

  function handleAvatarMouseEnter(e: MouseEvent) {
    if (hoverTimer) clearTimeout(hoverTimer);

    hoverTimer = setTimeout(() => {
      if (avatarElement) {
        const rect = avatarElement.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const cardWidth = 320; // w-80 = 320px
        const spacing = 16;

        // Calculate horizontal position
        let x = rect.right + spacing;

        // If card would overflow right edge, position to the left
        if (x + cardWidth > viewportWidth - spacing) {
          x = rect.left - cardWidth - spacing;
        }

        // Vertical position - align with top of avatar
        const y = rect.top;

        hoverCardPosition = { x, y };
        showUserHoverCard = true;
      }
    }, 500);
  }

  function handleAvatarMouseLeave(e: MouseEvent) {
    if (hoverTimer) {
      clearTimeout(hoverTimer);
      hoverTimer = null;
    }

    // Don't hide if moving to the hover card
    hoverTimer = setTimeout(() => {
      showUserHoverCard = false;
    }, 100);
  }

  function handleHoverCardMouseEnter() {
    // Cancel the hide timer when entering the card
    if (hoverTimer) {
      clearTimeout(hoverTimer);
      hoverTimer = null;
    }
  }

  function handleHoverCardMouseLeave() {
    showUserHoverCard = false;
  }

  $effect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showOptionsMenu) {
        showOptionsMenu = false;
      }
    };

    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  });
</script>

<article
  class="p-3 sm:p-4 {bgClass} transition-colors {clickable ? 'cursor-pointer' : ''} border-b border-border relative min-w-0"
  onclick={clickable ? navigateToEvent : undefined}
  role={clickable ? 'button' : undefined}
  tabindex={clickable ? 0 : undefined}
>
  {#if showThreadLine}
    <div class="absolute left-[29px] -top-px h-[73px] w-0.5 bg-muted"></div>
    <div class="absolute left-[29px] top-[73px] bottom-0 w-0.5 bg-muted"></div>
  {/if}

  <!-- Header Row: Avatar + Name/Handle/Time -->
  <div class="flex items-center gap-2 sm:gap-3 {variant === 'thread-main' ? 'mb-2' : 'mb-1.5'}">
    <button
      bind:this={avatarElement}
      type="button"
      onclick={(e) => { e.stopPropagation(); navigateToProfile(); }}
      onmouseenter={handleAvatarMouseEnter}
      onmouseleave={handleAvatarMouseLeave}
      class="flex-shrink-0"
    >
      <Avatar {ndk} pubkey={event.pubkey} class="{avatarSize} cursor-pointer hover:opacity-80 transition-opacity" />
    </button>

    <div class="flex items-center gap-2 flex-1 min-w-0">
      <div class="flex items-center gap-2 min-w-0 flex-shrink">
        <span class="{nameSize} text-foreground truncate min-w-0">
          {profile?.displayName || profile?.name || `${event.pubkey.slice(0, 8)}...`}
        </span>
        {#if variant === 'default' || variant === 'thread-reply'}
          <span class="text-muted-foreground text-sm truncate min-w-0">
            @{profile?.name || event.pubkey.slice(0, 8)}
          </span>
        {/if}
      </div>
      <span class="text-muted-foreground text-sm flex-shrink-0">·</span>
      {#if event.created_at}
        <TimeAgo timestamp={event.created_at} class="text-muted-foreground text-sm flex-shrink-0" />
      {/if}
    </div>

    <div class="relative flex-shrink-0">
      <button
        onclick={(e) => { e.stopPropagation(); showOptionsMenu = !showOptionsMenu; }}
        class="p-1 hover:bg-muted rounded-full transition-colors"
        type="button"
        aria-label="More options"
      >
        <svg class="w-5 h-5 text-muted-foreground" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
        </svg>
      </button>

      {#if showOptionsMenu}
        <div
          class="absolute right-0 mt-1 w-72 bg-popover border border-border rounded-lg shadow-lg z-10 max-h-96 overflow-y-auto"
          onclick={(e) => e.stopPropagation()}
        >
          <button
            onclick={copyAuthorNprofile}
            class="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-muted transition-colors first:rounded-t-lg"
            type="button"
          >
            Copy author (nprofile)
          </button>
          <button
            onclick={copyEventId}
            class="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-muted transition-colors"
            type="button"
          >
            Copy ID (nevent)
          </button>
          <button
            onclick={copyRawEvent}
            class="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-muted transition-colors"
            type="button"
          >
            Copy raw event
          </button>

          {#if event.onRelays && event.onRelays.size > 0}
            <div class="border-t border-border mt-1 pt-1">
              <div class="px-4 py-2 text-xs text-muted-foreground font-medium">
                Seen on {event.onRelays.size} relay{event.onRelays.size === 1 ? '' : 's'}
              </div>
              <div class="px-2 pb-2 space-y-1">
                {#each Array.from(event.onRelays) as relay (relay.url)}
                  <RelayBadge {relay} variant="compact" />
                {/each}
              </div>
            </div>
          {/if}
        </div>
      {/if}
    </div>
  </div>

  <!-- Reply indicator -->
  {#if variant === 'default'}
    <ReplyIndicator {event} />
  {/if}

  <!-- Content -->
  <div class="text-foreground whitespace-pre-wrap break-words {textSize} mb-2 overflow-hidden">
    <EventContent {ndk} event={event} />
  </div>

  <!-- Actions -->
  {#if showActions}
    <EventActions {event} variant={variant} />
  {/if}
</article>

<!-- User Hover Card -->
<div
  onmouseenter={handleHoverCardMouseEnter}
  onmouseleave={handleHoverCardMouseLeave}
>
  <UserHoverCard
    pubkey={event.pubkey}
    isVisible={showUserHoverCard}
    position={hoverCardPosition}
  />
</div>
