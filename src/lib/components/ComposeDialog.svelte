<script lang="ts">
  import { ndk } from '$lib/ndk.svelte';
  import { NDKEvent, NDKRelaySet } from '@nostr-dev-kit/ndk';
  import { toast } from '$lib/stores/toast.svelte';
  import { settings } from '$lib/stores/settings.svelte';
  import { useRelayInfoCached } from '$lib/utils/relayInfo.svelte';
  import { clickOutside } from '$lib/utils/clickOutside';
  import { portal } from '$lib/utils/portal.svelte';
  import { browser } from '$app/environment';
  import * as Dialog from '$lib/components/ui/dialog';
  import { Button } from '$lib/components/ui/button';
  import { Label } from '$lib/components/ui/label';
  import ContentComposer from '$lib/components/ContentComposer.svelte';
  import RelayPublishDropdownContent from '$lib/components/RelayPublishDropdownContent.svelte';

  interface Props {
    open?: boolean;
    onClose?: () => void;
    replyTo?: NDKEvent;
    quotedEvent?: NDKEvent;
    onPublished?: () => void;
  }

  let { open = $bindable(false), onClose, replyTo, quotedEvent, onPublished }: Props = $props();

  let content = $state('');
  let isPublishing = $state(false);
  let isRelayDropdownOpen = $state(false);
  let selectedRelayUrls = $state<string[]>([]);
  let isProtected = $state(false);
  let showProtectedInfo = $state(false);
  let selectedMentions = $state<string[]>([]);

  const replyToProfile = $derived(replyTo ? ndk.$fetchProfile(() => replyTo.pubkey) : null);
  const quotedProfile = $derived(quotedEvent ? ndk.$fetchProfile(() => quotedEvent.pubkey) : null);
  const allRelays = $derived(settings.relays.filter(r => r.enabled));
  const isMobile = $derived(browser && window.innerWidth < 768);

  // Initialize selected relays from current relay filter or use all write relays
  $effect(() => {
    if (open) {
      if (settings.selectedRelay) {
        selectedRelayUrls = [settings.selectedRelay];
      } else if (selectedRelayUrls.length === 0) {
        selectedRelayUrls = allRelays.filter(r => r.write).map(r => r.url);
      }
    }
  });

  async function publishNote() {
    if (!content.trim() || isPublishing || selectedRelayUrls.length === 0) return;

    try {
      isPublishing = true;

      let event: NDKEvent;

      if (replyTo) {
        event = replyTo.reply();
      } else if (quotedEvent) {
        event = new NDKEvent(ndk);
        event.kind = 1;
        event.tags.push(['q', quotedEvent.id]);
        event.tags.push(['p', quotedEvent.pubkey]);
      } else {
        event = new NDKEvent(ndk);
        event.kind = 1;
      }
      
      event.content = content;

      if (!replyTo) {
        event.isProtected = isProtected;
      }

      // Add mention tags
      selectedMentions.forEach(pubkey => {
        event.tags.push(['p', pubkey]);
      });

      await event.sign();

      // Create a relay set from the selected relay URLs
      const relaySet = NDKRelaySet.fromRelayUrls(selectedRelayUrls, ndk);
      await event.publish(relaySet);

      if (event.publishStatus === 'error') {
        const error = event.publishError;
        console.error('Publish error object:', error);
        console.error('Relay errors:', error?.relayErrors);

        const relayErrors = error?.relayErrors || {};
        const relayErrorEntries = Object.entries(relayErrors);

        if (relayErrorEntries.length > 0) {
          const errorMessages = relayErrorEntries
            .map(([relay, err]) => `• ${relay.replace('wss://', '')}: ${err}`)
            .join('\n');
          toast.error(`Failed to publish to relays:\n\n${errorMessages}`);
        } else {
          toast.error(`Failed to publish: ${error?.message || 'Not enough relays received the event'}`);
        }
        return;
      }

      content = '';
      selectedMentions = [];
      open = false;
      toast.success(replyTo ? 'Reply published' : quotedEvent ? 'Quote published' : 'Note published');
      onPublished?.();
      onClose?.();
    } catch (error) {
      console.error('Failed to publish note:', error);
      toast.error(`Failed to publish: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      isPublishing = false;
    }
  }

  function toggleRelay(url: string) {
    if (selectedRelayUrls.includes(url)) {
      selectedRelayUrls = selectedRelayUrls.filter(u => u !== url);
    } else {
      selectedRelayUrls = [...selectedRelayUrls, url];
    }
  }

  function selectOnlyRelay(url: string) {
    selectedRelayUrls = [url];
    isRelayDropdownOpen = false;
  }

  function handleRelayDropdownClickOutside() {
    isRelayDropdownOpen = false;
  }

  function handleClose() {
    if (!isPublishing) {
      open = false;
      content = '';
      selectedMentions = [];
      onClose?.();
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      publishNote();
    }
  }
</script>

<style>
  /* Mobile-specific slide-up animation */
  @media (max-width: 767px) {
    :global([data-slot="dialog-content"]) {
      animation: slideUp 0.3s ease-out !important;
    }
  }

  @keyframes slideUp {
    from {
      transform: translateY(100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
</style>

<svelte:window onkeydown={handleKeydown} />

<Dialog.Root {open} onOpenChange={(isOpen) => {
    if (!isOpen) {
      handleClose();
    } else {
      open = true;
    }
  }}>
  <Dialog.Content class="max-md:!max-w-none max-md:!w-full max-md:!h-[95vh] md:max-w-2xl max-md:!m-0 max-md:!rounded-b-none max-md:!fixed max-md:!bottom-0 max-md:!left-0 max-md:!right-0 max-md:!top-auto max-md:!translate-x-0 max-md:!translate-y-0 max-md:flex max-md:flex-col !overflow-visible">
    <!-- Header -->
    <div class="flex items-center justify-between -mx-6 -mt-6 px-4 py-3 mb-4 border-b border-border">
      <Button
        variant="ghost"
        size="icon"
        onclick={handleClose}
        disabled={isPublishing}
        class="h-10 w-10"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </Button>
      <Dialog.Title class="text-lg">
        {replyTo ? 'Reply' : quotedEvent ? 'Quote' : 'Compose'}
      </Dialog.Title>
      <Button
        onclick={publishNote}
        disabled={!content.trim() || isPublishing || selectedRelayUrls.length === 0}
        class="rounded-full"
        size="sm"
      >
        {isPublishing ? 'Publishing...' : 'Post'}
      </Button>
    </div>

    <!-- Reply context (if replying) -->
    {#if replyTo && replyToProfile}
      <div class="-mx-6 px-4 py-3 mb-4 border-b border-border bg-card/50">
        <div class="flex gap-3">
          <Avatar {ndk} pubkey={replyTo.pubkey} class="w-10 h-10" />
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <span class="font-semibold text-foreground text-sm">
                {replyToProfile.displayName || replyToProfile.name || `${replyTo.pubkey.slice(0, 8)}...`}
              </span>
              <span class="text-muted-foreground text-xs">
                @{replyToProfile.name || replyTo.pubkey.slice(0, 8)}
              </span>
            </div>
            <p class="text-muted-foreground text-sm line-clamp-3">
              {replyTo.content}
            </p>
          </div>
        </div>
      </div>
    {/if}

    <!-- Compose area -->
    <div class="relative mb-4 max-md:flex-1 max-md:flex max-md:flex-col max-md:overflow-hidden">
      <div class="max-md:flex-1 max-md:overflow-hidden">
        <ContentComposer
          bind:value={content}
          bind:selectedMentions
          placeholder={replyTo ? 'Write your reply...' : quotedEvent ? 'Add your thoughts...' : "What's on your mind?"}
          autofocus={true}
          disabled={isPublishing}
          class="max-md:flex-1 max-md:overflow-hidden"
        >
          {#snippet relayButton()}
            <div class="relative">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onclick={() => isRelayDropdownOpen = !isRelayDropdownOpen}
                disabled={isPublishing}
                class="h-8 w-8"
                title="Select relays"
              >
                {#if selectedRelayUrls.length <= 2 && selectedRelayUrls.length > 0}
                  <div class="flex items-center -space-x-1">
                    {#each selectedRelayUrls as relayUrl}
                      {@const relay = allRelays.find(r => r.url === relayUrl)}
                      {@const relayInfo = relay ? useRelayInfoCached(relay.url) : null}
                      {#if relayInfo?.info?.icon}
                        <img src={relayInfo.info.icon} alt="" class="w-5 h-5 rounded border border-background" />
                      {:else}
                        <div class="w-5 h-5 rounded bg-muted flex items-center justify-center border border-background">
                          <svg class="w-3 h-3 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                          </svg>
                        </div>
                      {/if}
                    {/each}
                  </div>
                {:else}
                  <div class="relative">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                    </svg>
                    {#if selectedRelayUrls.length > 2}
                      <span class="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-medium rounded-full min-w-[14px] h-[14px] flex items-center justify-center px-0.5">
                        {selectedRelayUrls.length}
                      </span>
                    {/if}
                  </div>
                {/if}
              </Button>

              <!-- Relay Dropdown -->
              {#if isRelayDropdownOpen}
                {#if isMobile}
                  <!-- Mobile: Portal with backdrop -->
                  <div
                    use:portal
                    role="presentation"
                    onclick={handleRelayDropdownClickOutside}
                    onkeydown={(e) => e.key === 'Escape' && handleRelayDropdownClickOutside()}
                    class="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center transition-opacity"
                  >
                    <div
                      role="dialog"
                      tabindex="-1"
                      onclick={(e) => e.stopPropagation()}
                      onkeydown={(e) => e.stopPropagation()}
                      class="bg-popover border border-border rounded-lg shadow-xl w-80 max-h-[400px] overflow-y-auto"
                    >
                      <RelayPublishDropdownContent
                        {selectedRelayUrls}
                        bind:isProtected
                        onToggleRelay={toggleRelay}
                        onSelectOnly={selectOnlyRelay}
                      />
                    </div>
                  </div>
                {:else}
                  <!-- Desktop: Absolute positioned -->
                  <div
                    use:clickOutside={handleRelayDropdownClickOutside}
                    class="absolute top-full left-0 mt-2 bg-popover border border-border rounded-lg shadow-xl z-[100] w-80 max-h-[400px] overflow-y-auto transition-all duration-200"
                  >
                    <RelayPublishDropdownContent
                      {selectedRelayUrls}
                      bind:isProtected
                      onToggleRelay={toggleRelay}
                      onSelectOnly={selectOnlyRelay}
                    />
                  </div>
                {/if}
              {/if}
            </div>
          {/snippet}
        </ContentComposer>
      </div>
    </div>

    <!-- Quoted event (if quoting) -->
    {#if quotedEvent && quotedProfile}
      <div class="-mx-6 px-4 py-3 mb-4 border-y border-border bg-muted/30">
        <div class="text-xs text-muted-foreground mb-2">Quoting</div>
        <div class="flex gap-3 border-l-2 border-primary/50 pl-3">
          <Avatar {ndk} pubkey={quotedEvent.pubkey} class="w-8 h-8" />
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <span class="font-semibold text-foreground text-sm">
                {quotedProfile.displayName || quotedProfile.name || `${quotedEvent.pubkey.slice(0, 8)}...`}
              </span>
              <span class="text-muted-foreground text-xs">
                @{quotedProfile.name || quotedEvent.pubkey.slice(0, 8)}
              </span>
            </div>
            <p class="text-muted-foreground text-sm line-clamp-3">
              {quotedEvent.content}
            </p>
          </div>
        </div>
      </div>
    {/if}

    <!-- Footer hint -->
    <div class="-mx-6 px-4 py-3 border-t border-border">
      <p class="text-xs text-muted-foreground">
        Press <kbd class="px-1.5 py-0.5 bg-muted rounded text-muted-foreground">Esc</kbd> to cancel,
        <kbd class="px-1.5 py-0.5 bg-muted rounded text-muted-foreground">⌘</kbd> +
        <kbd class="px-1.5 py-0.5 bg-muted rounded text-muted-foreground">Enter</kbd> to post
      </p>
    </div>
  </Dialog.Content>
</Dialog.Root>
