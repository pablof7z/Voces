<script lang="ts">
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import { ndk } from '$lib/ndk.svelte';
  import { Avatar, EventContent, zap } from '@nostr-dev-kit/svelte';
  import { formatDistanceToNow } from 'date-fns';
  import { toast } from '$lib/stores/toast.svelte';
  import { settings } from '$lib/stores/settings.svelte';
  import ComposeDialog from './ComposeDialog.svelte';
  import ReplyIndicator from './ReplyIndicator.svelte';
  import ZapAmountModal from './ZapAmountModal.svelte';
  import RelayBadge from './RelayBadge.svelte';

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

  let showReplyDialog = $state(false);
  let showOptionsMenu = $state(false);
  let showZapModal = $state(false);
  let isZapping = $state(false);
  let zapSuccess = $state(false);
  let longPressTimer: ReturnType<typeof setTimeout> | null = null;
  let zapButtonElement = $state<HTMLButtonElement | null>(null);

  const interactions = ndk.$subscribe(() => ({
    filters: [{
      kinds: [1, 1111, 6, 16, 7],
      ...event.filter()
    }],
    subId: 'interactions'
  }));

  const replyCount = $derived.by(() =>
    Array.from(interactions.events ?? []).filter(e => e.kind === 1 || e.kind === 1111).length
  );

  const repostCount = $derived.by(() =>
    Array.from(interactions.events ?? []).filter(e => e.kind === 6 || e.kind === 16).length
  );

  const reactionCount = $derived.by(() =>
    Array.from(interactions.events ?? []).filter(e => e.kind === 7).length
  );

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
    'w-12 h-12'
  );

  const textSize = $derived(
    variant === 'thread-main' ? 'text-lg leading-relaxed' : 'text-base'
  );

  const nameSize = $derived(
    variant === 'thread-main' ? 'text-lg font-bold' : 'text-base font-semibold'
  );

  const bgClass = $derived(
    variant === 'thread-main' ? 'bg-neutral-900/50 border-y-2 border-purple-600/50' :
    variant === 'default' ? 'hover:bg-neutral-900/30' :
    'hover:bg-neutral-900/30'
  );

  const clickable = $derived(variant === 'default');

  function formatTime(timestamp: number | undefined) {
    if (!timestamp) return '';
    return formatDistanceToNow(new Date(timestamp * 1000), { addSuffix: true });
  }

  async function handleReact(emoji: string) {
    if (!ndk.signer) {
      toast.error('Please login to react');
      return;
    }

    try {
      await event.react(emoji);
      toast.success('Reaction added');
    } catch (err) {
      console.error('Failed to react:', err);
      toast.error('Failed to add reaction');
    }
  }

  async function handleRepost() {
    if (!ndk.signer) {
      toast.error('Please login to repost');
      return;
    }

    try {
      await event.repost();
      toast.success('Note reposted');
    } catch (err) {
      console.error('Failed to repost:', err);
      toast.error('Failed to repost');
    }
  }

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
    const nprofile = event.author.encode();
    copyToClipboard(nprofile, 'author nprofile');
  }

  function copyEventId() {
    const nevent = event.encode();
    copyToClipboard(nevent, 'event ID');
  }

  function copyRawEvent() {
    const raw = event.inspect();
    copyToClipboard(raw, 'raw event');
  }

  async function handleQuickZap(e: MouseEvent) {
    e.stopPropagation();
    if (isZapping || !ndk.signer) return;

    await performZap(settings.zap.defaultAmount);
  }

  async function performZap(amount: number) {
    if (!ndk.signer) {
      toast.error('Please login to zap');
      return;
    }

    isZapping = true;

    try {
      await zap(ndk, event, amount * 1000);
      zapSuccess = true;
      setTimeout(() => zapSuccess = false, 2000);
      toast.success(`Zapped ${amount} sats!`);
    } catch (err) {
      console.error('Failed to zap:', err);
      toast.error('Failed to send zap');
    } finally {
      isZapping = false;
    }
  }

  function handleZapModalZap(amount: number) {
    showZapModal = false;
    performZap(amount);
  }

  function handleZapLongPressStart(e: MouseEvent | TouchEvent) {
    e.preventDefault();
    e.stopPropagation();

    longPressTimer = setTimeout(() => {
      showZapModal = true;
      longPressTimer = null;
    }, 500);
  }

  function handleZapLongPressEnd(e: MouseEvent | TouchEvent) {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      longPressTimer = null;

      if (e.type === 'mouseup' || e.type === 'touchend') {
        handleQuickZap(e as MouseEvent);
      }
    }
  }

  function handleZapLongPressCancel() {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      longPressTimer = null;
    }
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
  class="p-4 {bgClass} transition-colors {clickable ? 'cursor-pointer' : ''} border-b border-neutral-800 relative"
  onclick={clickable ? navigateToEvent : undefined}
  role={clickable ? 'button' : undefined}
  tabindex={clickable ? 0 : undefined}
>
  {#if showThreadLine}
    <div class="absolute left-[29px] -top-px h-[73px] w-0.5 bg-neutral-700"></div>
    <div class="absolute left-[29px] top-[73px] bottom-0 w-0.5 bg-neutral-700"></div>
  {/if}

  <div class="flex gap-3">
    <!-- Avatar -->
    <button
      type="button"
      onclick={(e) => { e.stopPropagation(); navigateToProfile(); }}
      class="flex-shrink-0 self-start"
    >
      <Avatar {ndk} pubkey={event.pubkey} class="{avatarSize} cursor-pointer hover:opacity-80 transition-opacity" />
    </button>

    <!-- Content -->
    <div class="flex-1 min-w-0">
      <div class="flex items-center gap-2 {variant === 'thread-main' ? 'mb-2' : 'mb-1'}">
        <span class="{nameSize} text-white truncate">
          {profile?.displayName || profile?.name || `${event.pubkey.slice(0, 8)}...`}
        </span>
        {#if variant === 'default' || variant === 'thread-reply'}
          <span class="text-neutral-500 text-sm truncate">
            @{profile?.name || event.pubkey.slice(0, 8)}
          </span>
        {/if}
        <span class="text-neutral-500 text-sm">·</span>
        <span class="text-neutral-500 text-sm">
          {formatTime(event.created_at)}
        </span>
        <div class="ml-auto relative">
          <button
            onclick={(e) => { e.stopPropagation(); showOptionsMenu = !showOptionsMenu; }}
            class="p-1 hover:bg-neutral-800 rounded-full transition-colors"
            type="button"
            aria-label="More options"
          >
            <svg class="w-5 h-5 text-neutral-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
            </svg>
          </button>

          {#if showOptionsMenu}
            <div
              class="absolute right-0 mt-1 w-72 bg-neutral-800 border border-neutral-700 rounded-lg shadow-lg z-10 max-h-96 overflow-y-auto"
              onclick={(e) => e.stopPropagation()}
            >
              <button
                onclick={copyAuthorNprofile}
                class="w-full px-4 py-2 text-left text-sm text-neutral-200 hover:bg-neutral-700 transition-colors first:rounded-t-lg"
                type="button"
              >
                Copy author (nprofile)
              </button>
              <button
                onclick={copyEventId}
                class="w-full px-4 py-2 text-left text-sm text-neutral-200 hover:bg-neutral-700 transition-colors"
                type="button"
              >
                Copy ID (nevent)
              </button>
              <button
                onclick={copyRawEvent}
                class="w-full px-4 py-2 text-left text-sm text-neutral-200 hover:bg-neutral-700 transition-colors"
                type="button"
              >
                Copy raw event
              </button>

              {#if event.onRelays && event.onRelays.size > 0}
                <div class="border-t border-neutral-700 mt-1 pt-1">
                  <div class="px-4 py-2 text-xs text-neutral-500 font-medium">
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

      <div class="text-neutral-200 whitespace-pre-wrap break-words {textSize}">
        <EventContent {ndk} event={event} />
      </div>

      <!-- Actions -->
      {#if showActions}
        <div class="flex items-center gap-6 {variant === 'thread-main' ? 'mt-4 border-t border-neutral-700 pt-3' : 'mt-3'} text-neutral-500">
          <button
            onclick={(e) => { e.stopPropagation(); showReplyDialog = true; }}
            class="flex items-center gap-2 hover:text-purple-400 transition-colors group"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span class="text-sm group-hover:underline">{replyCount}</span>
          </button>

          <button
            onclick={(e) => { e.stopPropagation(); handleRepost(); }}
            class="flex items-center gap-2 hover:text-green-400 transition-colors group"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span class="text-sm group-hover:underline">{repostCount}</span>
          </button>

          <button
            onclick={(e) => { e.stopPropagation(); handleReact('❤️'); }}
            class="flex items-center gap-2 hover:text-red-400 transition-colors group"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span class="text-sm group-hover:underline">{reactionCount}</span>
          </button>

          <button
            bind:this={zapButtonElement}
            onmousedown={handleZapLongPressStart}
            onmouseup={handleZapLongPressEnd}
            onmouseleave={handleZapLongPressCancel}
            ontouchstart={handleZapLongPressStart}
            ontouchend={handleZapLongPressEnd}
            ontouchcancel={handleZapLongPressCancel}
            disabled={isZapping}
            class="relative flex items-center gap-2 transition-colors group {zapSuccess ? 'text-yellow-400' : 'hover:text-yellow-400'} {isZapping ? 'opacity-50 cursor-wait' : ''}"
            type="button"
          >
            {#if isZapping}
              <svg class="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            {:else if zapSuccess}
              <svg class="w-5 h-5 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            {:else}
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            {/if}
            <span class="text-sm group-hover:underline">
              {#if zapSuccess}
                Zapped!
              {:else if isZapping}
                Zapping...
              {:else}
                Zap
              {/if}
            </span>
          </button>
        </div>
      {/if}
    </div>
  </div>
</article>

<ComposeDialog bind:open={showReplyDialog} replyTo={event} />
<ZapAmountModal
  bind:open={showZapModal}
  {event}
  onZap={handleZapModalZap}
  onCancel={() => showZapModal = false}
/>
