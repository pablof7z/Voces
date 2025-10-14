<script lang="ts">
  import { ndk } from '$lib/ndk.svelte';
  import { NDKKind } from '@nostr-dev-kit/ndk';
  import { toast } from '$lib/stores/toast.svelte';
  import { t } from 'svelte-i18n';
  import { createLazyFeed } from '$lib/utils/lazyFeed.svelte';

  interface Props {
    pubkey: string;
    isOpen: boolean;
    onClose: () => void;
    onOpenCreatePack: () => void;
  }

  let { pubkey, isOpen, onClose, onOpenCreatePack }: Props = $props();

  const currentUser = ndk.$currentUser;

  // Fetch current user's created follow packs
  const userPacksFeed = createLazyFeed(
    ndk,
    () => currentUser?.pubkey ? {
      filters: [{ kinds: [39089, 39092], authors: [currentUser.pubkey], limit: 100 }]
    } : undefined,
    { initialLimit: 100, pageSize: 100 }
  );

  // Fetch current user's mute list
  const muteListSubscription = ndk.$subscribe(
    () => currentUser?.pubkey ? ({
      filters: [{ kinds: [10000], authors: [currentUser.pubkey], limit: 1 }],
      bufferMs: 100,
    }) : undefined
  );

  interface UserPack {
    id: string;
    title: string;
    pubkeys: string[];
  }

  const userPacks = $derived.by((): UserPack[] => {
    return userPacksFeed.events.map(event => ({
      id: event.id || '',
      title: event.tagValue('title') || 'Untitled Pack',
      pubkeys: event.tags.filter(t => t[0] === 'p').map(t => t[1]),
    }));
  });

  const isMuted = $derived.by(() => {
    const muteList = muteListSubscription.events[0];
    if (!muteList) return false;
    return muteList.tags.some(tag => tag[0] === 'p' && tag[1] === pubkey);
  });

  async function addToExistingPack(packId: string) {
    if (!pubkey) return;

    const packEvent = userPacksFeed.events.find(e => e.id === packId);
    if (!packEvent) return;

    try {
      const existingPubkeys = packEvent.tags.filter(t => t[0] === 'p').map(t => t[1]);
      if (existingPubkeys.includes(pubkey)) {
        return;
      }

      packEvent.tags.push(['p', pubkey]);
      await packEvent.sign();
      await packEvent.publishReplaceable();

      if (packEvent.publishStatus === 'error') {
        const error = packEvent.publishError;
        const relayErrors = error?.relayErrors || {};
        const errorMessages = Object.entries(relayErrors)
          .map(([relay, err]) => `${relay}: ${err}`)
          .join('\n');
        toast.error(`Failed to publish:\n${errorMessages || 'Unknown error'}`);
        return;
      }

      toast.success('Added to pack');
      onClose();
    } catch (error) {
      console.error('Failed to add to pack:', error);
      toast.error(`Failed to add to pack: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async function toggleMute() {
    if (!currentUser?.pubkey) return;

    try {
      let muteList = muteListSubscription.events[0];

      if (!muteList) {
        // Create new mute list
        muteList = ndk.createEvent({ kind: 10000, content: '', tags: [] });
      }

      if (isMuted) {
        // Remove from mute list
        muteList.tags = muteList.tags.filter(tag => !(tag[0] === 'p' && tag[1] === pubkey));
        toast.success('User unmuted');
      } else {
        // Add to mute list
        muteList.tags.push(['p', pubkey]);
        toast.success('User muted');
      }

      await muteList.sign();
      await muteList.publishReplaceable();

      if (muteList.publishStatus === 'error') {
        const error = muteList.publishError;
        const relayErrors = error?.relayErrors || {};
        const errorMessages = Object.entries(relayErrors)
          .map(([relay, err]) => `${relay}: ${err}`)
          .join('\n');
        toast.error(`Failed to publish:\n${errorMessages || 'Unknown error'}`);
        return;
      }

      onClose();
    } catch (error) {
      console.error('Failed to toggle mute:', error);
      toast.error(`Failed to ${isMuted ? 'unmute' : 'mute'} user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  function handleCreatePack() {
    onClose();
    onOpenCreatePack();
  }
</script>

{#if isOpen}
  <div class="absolute right-0 mt-2 w-64 bg-popover border border-border rounded-lg shadow-xl overflow-hidden z-50">
    <div class="py-1">
      <!-- Mute/Unmute button -->
      <button
        onclick={toggleMute}
        class="w-full px-4 py-3 text-left text-sm text-muted-foreground hover:bg-muted transition-colors flex items-center gap-3"
      >
        <svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {#if isMuted}
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          {:else}
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
          {/if}
        </svg>
        {isMuted ? $t('userDropdown.unmute') : $t('userDropdown.mute')}
      </button>

      <div class="border-t border-border my-1"></div>

      <!-- Create new pack button -->
      <button
        onclick={handleCreatePack}
        class="w-full px-4 py-3 text-left text-sm text-muted-foreground hover:bg-muted transition-colors flex items-center gap-3"
      >
        <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        {$t('followPacks.createNew')}
      </button>

      {#if userPacks.length > 0}
        <div class="border-t border-border mt-1 pt-1">
          <div class="px-4 py-2 text-xs text-muted-foreground font-medium">
            {$t('followPacks.addToExisting')}
          </div>
          {#each userPacks as pack (pack.id)}
            {@const alreadyInPack = pack.pubkeys.includes(pubkey)}
            <button
              onclick={() => addToExistingPack(pack.id)}
              disabled={alreadyInPack}
              class="w-full px-4 py-2.5 text-left text-sm text-muted-foreground hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between gap-2"
            >
              <span class="truncate">{pack.title}</span>
              {#if alreadyInPack}
                <svg class="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              {/if}
            </button>
          {/each}
        </div>
      {/if}
    </div>
  </div>
{/if}
