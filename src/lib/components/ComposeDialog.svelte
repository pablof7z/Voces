<script lang="ts">
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import { ndk } from '$lib/ndk.svelte';
  import { NDKEvent as NDKEventClass, NDKRelaySet } from '@nostr-dev-kit/ndk';
  import { Avatar } from '@nostr-dev-kit/svelte';
  import { toast } from '$lib/stores/toast.svelte';
  import { settings } from '$lib/stores/settings.svelte';
  import { useRelayInfoCached } from '$lib/utils/relayInfo.svelte';
  import { clickOutside } from '$lib/utils/clickOutside';

  interface Props {
    open?: boolean;
    onClose?: () => void;
    replyTo?: NDKEvent;
    onPublished?: () => void;
  }

  let { open = $bindable(false), onClose, replyTo, onPublished }: Props = $props();

  let content = $state('');
  let isPublishing = $state(false);
  let isRelayDropdownOpen = $state(false);
  let selectedRelayUrls = $state<string[]>([]);
  let isProtected = $state(false);
  let showProtectedInfo = $state(false);

  const replyToProfile = $derived(replyTo ? ndk.$fetchProfile(() => replyTo.pubkey) : null);
  const allRelays = $derived(settings.relays.filter(r => r.enabled));

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
      const event = replyTo ? replyTo.reply() : new NDKEventClass(ndk);
      event.kind ??= 1;
      event.content = content;
      event.isProtected = isProtected;

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
      open = false;
      toast.success(replyTo ? 'Reply published' : 'Note published');
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
      onClose?.();
    }
  }

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && !isPublishing) {
      handleClose();
    }
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      publishNote();
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
    onclick={handleBackdropClick}
    role="presentation"
  >
    <div
      class="w-full max-w-2xl mx-4 bg-neutral-900 rounded-2xl border border-neutral-800 shadow-2xl"
      onclick={(e) => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
    >
      <!-- Header -->
      <div class="flex items-center justify-between px-4 py-3 border-b border-neutral-800">
        <button
          onclick={handleClose}
          disabled={isPublishing}
          class="text-neutral-400 hover:text-white transition-colors disabled:opacity-50"
          aria-label="Close"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h2 class="text-lg font-semibold text-white">
          {replyTo ? 'Reply' : 'Compose'}
        </h2>
        <button
          onclick={publishNote}
          disabled={!content.trim() || isPublishing || selectedRelayUrls.length === 0}
          class="px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-neutral-700 disabled:cursor-not-allowed text-white rounded-full transition-colors font-semibold text-sm"
        >
          {isPublishing ? 'Publishing...' : 'Post'}
        </button>
      </div>

      <!-- Reply context (if replying) -->
      {#if replyTo && replyToProfile}
        <div class="px-4 py-3 border-b border-neutral-800/50 bg-neutral-900/50">
          <div class="flex gap-3">
            <Avatar {ndk} pubkey={replyTo.pubkey} class="w-10 h-10" />
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <span class="font-semibold text-white text-sm">
                  {replyToProfile.displayName || replyToProfile.name || `${replyTo.pubkey.slice(0, 8)}...`}
                </span>
                <span class="text-neutral-500 text-xs">
                  @{replyToProfile.name || replyTo.pubkey.slice(0, 8)}
                </span>
              </div>
              <p class="text-neutral-400 text-sm line-clamp-3">
                {replyTo.content}
              </p>
            </div>
          </div>
        </div>
      {/if}

      <!-- Compose area -->
      <div class="p-4">
        <div class="flex gap-3">
          {#if ndk.$currentUser}
            <Avatar {ndk} pubkey={ndk.$currentUser.pubkey} class="w-12 h-12 flex-shrink-0" />
          {:else}
            <div class="w-12 h-12 rounded-full bg-neutral-800 flex-shrink-0"></div>
          {/if}
          <div class="flex-1 min-w-0">
            <textarea
              bind:value={content}
              placeholder={replyTo ? 'Write your reply...' : "What's on your mind?"}
              class="w-full min-h-[120px] bg-transparent text-white placeholder-neutral-500 resize-none focus:outline-none text-lg"
              autofocus
            ></textarea>
          </div>
        </div>
      </div>

      <!-- Relay selector -->
      <div class="px-4 pb-3 border-t border-neutral-800/50">
        <div class="relative" use:clickOutside={handleRelayDropdownClickOutside}>
          <button
            onclick={() => isRelayDropdownOpen = !isRelayDropdownOpen}
            class="flex items-center gap-2 px-3 py-2 rounded-lg bg-neutral-800/50 hover:bg-neutral-800 transition-colors text-sm w-full"
            disabled={isPublishing}
          >
            {#if selectedRelayUrls.length === 0}
              <svg class="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
              </svg>
              <span class="flex-1 text-left text-neutral-300">Select relays</span>
            {:else if selectedRelayUrls.length < 3}
              <div class="flex items-center gap-1.5 flex-1">
                {#each selectedRelayUrls as relayUrl}
                  {@const relay = allRelays.find(r => r.url === relayUrl)}
                  {@const relayInfo = relay ? useRelayInfoCached(relay.url) : null}
                  {#if relayInfo?.info?.icon}
                    <img src={relayInfo.info.icon} alt="" class="w-5 h-5 rounded flex-shrink-0" />
                  {:else}
                    <div class="w-5 h-5 rounded bg-neutral-700 flex items-center justify-center flex-shrink-0">
                      <svg class="w-3 h-3 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                      </svg>
                    </div>
                  {/if}
                {/each}
              </div>
            {:else}
              <svg class="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
              </svg>
              <span class="flex-1 text-left text-neutral-300">
                {selectedRelayUrls.length} relays selected
              </span>
            {/if}
            <svg
              class="w-4 h-4 text-neutral-400 transition-transform {isRelayDropdownOpen ? 'rotate-180' : ''}"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {#if isRelayDropdownOpen}
            <div class="absolute top-full left-0 right-0 mt-2 bg-neutral-900 border border-neutral-800 rounded-lg shadow-xl z-50 max-h-[400px] overflow-y-auto">
              <div class="p-2">
                <!-- Protected mode toggle -->
                <div class="px-2 py-2 mb-2 border-b border-neutral-800/50">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <svg class="w-4 h-4 {isProtected ? 'text-orange-500' : 'text-neutral-400'}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <span class="text-sm {isProtected ? 'text-orange-500 font-medium' : 'text-neutral-300'}">
                        Protected
                      </span>
                      <div class="relative">
                        <button
                          onclick={() => showProtectedInfo = !showProtectedInfo}
                          onmouseover={() => showProtectedInfo = true}
                          onmouseleave={() => showProtectedInfo = false}
                          class="text-neutral-500 hover:text-neutral-300 transition-colors"
                          aria-label="Info about protected mode"
                        >
                          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </button>
                        {#if showProtectedInfo}
                          <div class="absolute left-0 bottom-full mb-2 w-64 bg-neutral-900 border border-neutral-700 rounded-lg shadow-xl z-50 p-2 text-xs">
                            <div class="font-semibold text-white mb-1">Protected Mode (NIP-70)</div>
                            <div class="text-neutral-400 text-xs">
                              Protected events cannot be republished to other relays without your permission.
                            </div>
                          </div>
                        {/if}
                      </div>
                    </div>
                    <!-- Switch toggle -->
                    <button
                      onclick={() => isProtected = !isProtected}
                      class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors {isProtected ? 'bg-orange-600' : 'bg-neutral-700'}"
                      role="switch"
                      aria-checked={isProtected}
                    >
                      <span
                        class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform {isProtected ? 'translate-x-6' : 'translate-x-1'}"
                      ></span>
                    </button>
                  </div>
                </div>

                <div class="text-xs text-neutral-500 px-2 py-1.5 font-medium">Select Relays to Publish</div>
                {#each allRelays as relay (relay.url)}
                  {@const relayInfo = useRelayInfoCached(relay.url)}
                  {@const isSelected = selectedRelayUrls.includes(relay.url)}
                  {@const isReadOnly = !relay.write}
                  <div class="group relative flex items-center">
                    <button
                      onclick={() => toggleRelay(relay.url)}
                      class="flex-1 px-2 py-2 rounded-lg hover:bg-neutral-800 transition-colors text-left flex items-center gap-3 {isSelected ? 'bg-neutral-800/50' : ''} {isReadOnly ? 'opacity-60' : ''}"
                    >
                      {#if relayInfo.info?.icon}
                        <img src={relayInfo.info.icon} alt="" class="w-5 h-5 rounded flex-shrink-0" />
                      {:else}
                        <div class="w-5 h-5 rounded bg-neutral-700 flex items-center justify-center flex-shrink-0">
                          <svg class="w-3 h-3 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                          </svg>
                        </div>
                      {/if}
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2">
                          <div class="text-sm font-medium text-white truncate">
                            {relayInfo.info?.name || relay.url.replace('wss://', '').replace('ws://', '')}
                          </div>
                          {#if isReadOnly}
                            <span class="text-xs text-neutral-500 bg-neutral-800 px-1.5 py-0.5 rounded">read-only</span>
                          {/if}
                        </div>
                        {#if relayInfo.info?.description}
                          <div class="text-xs text-neutral-500 truncate">
                            {relayInfo.info.description}
                          </div>
                        {/if}
                      </div>
                      {#if isSelected}
                        <svg class="w-5 h-5 text-orange-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                        </svg>
                      {/if}
                    </button>
                    <!-- "Only" button - appears on hover -->
                    <button
                      onclick={(e) => { e.stopPropagation(); selectOnlyRelay(relay.url); }}
                      class="absolute right-2 px-2 py-1 text-xs bg-orange-600 hover:bg-orange-700 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Publish only to this relay"
                    >
                      Only
                    </button>
                  </div>
                {/each}
              </div>
            </div>
          {/if}
        </div>
      </div>

      <!-- Footer hint -->
      <div class="px-4 py-3 border-t border-neutral-800/50">
        <p class="text-xs text-neutral-500">
          Press <kbd class="px-1.5 py-0.5 bg-neutral-800 rounded text-neutral-400">Esc</kbd> to cancel,
          <kbd class="px-1.5 py-0.5 bg-neutral-800 rounded text-neutral-400">⌘</kbd> +
          <kbd class="px-1.5 py-0.5 bg-neutral-800 rounded text-neutral-400">Enter</kbd> to post
        </p>
      </div>
    </div>
  </div>
{/if}
