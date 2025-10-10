<script lang="ts">
  import { ndk } from '$lib/ndk.svelte';
  import { NDKFollowPack, NDKKind } from '@nostr-dev-kit/ndk';
  import { Avatar } from '@nostr-dev-kit/svelte';
  import { toast } from '$lib/stores/toast.svelte';

  interface Props {
    open?: boolean;
    onClose?: () => void;
    onPublished?: (packId: string) => void;
    initialPubkey?: string;
    editingPack?: NDKEvent | null;
  }

  let { open = $bindable(false), onClose, onPublished, initialPubkey, editingPack }: Props = $props();

  let activeTab = $state<'details' | 'members'>('details');
  let isPublishing = $state(false);

  // Form fields
  let title = $state('');
  let description = $state('');
  let imageUrl = $state('');
  let selectedPubkeys = $state<Set<string>>(new Set(initialPubkey ? [initialPubkey] : []));
  let memberSearchQuery = $state('');

  const currentUser = ndk.$currentUser;

  // Fetch current user's follows
  const contactListSubscription = ndk.$subscribe(
    () => currentUser?.pubkey ? ({
      filters: [{ kinds: [3], authors: [currentUser.pubkey], limit: 1 }],
      bufferMs: 100,
    }) : undefined
  );

  const userFollows = $derived.by(() => {
    const contactList = contactListSubscription.events[0];
    if (!contactList) return new Set<string>();
    return new Set(contactList.tags.filter(tag => tag[0] === 'p').map(tag => tag[1]));
  });

  const filteredFollows = $derived.by(() => {
    if (!memberSearchQuery) return Array.from(userFollows);
    const search = memberSearchQuery.toLowerCase();
    return Array.from(userFollows).filter(pubkey => {
      const profile = ndk.$fetchProfile(() => pubkey);
      return (
        pubkey.toLowerCase().includes(search) ||
        profile?.name?.toLowerCase().includes(search) ||
        profile?.displayName?.toLowerCase().includes(search) ||
        profile?.nip05?.toLowerCase().includes(search)
      );
    });
  });

  function toggleMember(pubkey: string) {
    if (selectedPubkeys.has(pubkey)) {
      selectedPubkeys.delete(pubkey);
    } else {
      selectedPubkeys.add(pubkey);
    }
    selectedPubkeys = new Set(selectedPubkeys);
  }

  async function addByNpubOrNip05() {
    if (!memberSearchQuery.trim()) return;

    try {
      const input = memberSearchQuery.trim();

      // Try to fetch user - handles npub, nprofile, or hex pubkey
      let user = await ndk.fetchUser(input);

      // If that fails and input looks like NIP-05, try resolving it
      if (!user && input.includes('@')) {
        const profile = await ndk.fetchUser(input);
        user = profile;
      }

      if (user?.pubkey) {
        selectedPubkeys.add(user.pubkey);
        selectedPubkeys = new Set(selectedPubkeys);
        memberSearchQuery = '';
        toast.success('User added');
      } else {
        toast.error('User not found');
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
      toast.error('Failed to fetch user');
    }
  }

  async function publishFollowPack() {
    if (!title.trim() || isPublishing) {
      toast.error('Please provide a title');
      return;
    }

    if (selectedPubkeys.size === 0) {
      toast.error('Please add at least one member');
      return;
    }

    try {
      isPublishing = true;

      const pack = editingPack ? NDKFollowPack.from(editingPack) : new NDKFollowPack(ndk);
      pack.title = title.trim();
      pack.description = description.trim() || undefined;
      pack.image = imageUrl.trim() || undefined;
      pack.pubkeys = Array.from(selectedPubkeys);

      await pack.sign();
      await pack.publishReplaceable();

      if (pack.publishStatus === 'error') {
        const error = pack.publishError;
        const relayErrors = error?.relayErrors || {};
        const errorMessages = Object.entries(relayErrors)
          .map(([relay, err]) => `${relay}: ${err}`)
          .join('\n');
        toast.error(`Failed to publish:\n${errorMessages || 'Unknown error'}`);
        return;
      }

      toast.success(editingPack ? 'Follow pack updated' : 'Follow pack created');
      resetForm();
      open = false;
      onPublished?.(pack.id);
      onClose?.();
    } catch (error) {
      console.error('Failed to publish follow pack:', error);
      toast.error(`${editingPack ? 'Failed to update' : 'Failed to create'} follow pack: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      isPublishing = false;
    }
  }

  function resetForm() {
    title = '';
    description = '';
    imageUrl = '';
    selectedPubkeys = new Set(initialPubkey ? [initialPubkey] : []);
    memberSearchQuery = '';
    activeTab = 'details';
  }

  function handleClose() {
    if (!isPublishing) {
      resetForm();
      open = false;
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
  }

  // Load editing pack data when modal opens in edit mode
  $effect(() => {
    if (open && editingPack) {
      title = editingPack.tagValue('title') || '';
      description = editingPack.tagValue('description') || '';
      imageUrl = editingPack.tagValue('image') || '';
      const pubkeys = editingPack.tags.filter(t => t[0] === 'p').map(t => t[1]);
      selectedPubkeys = new Set(pubkeys);
      activeTab = 'details';
    } else if (open && initialPubkey) {
      selectedPubkeys = new Set([initialPubkey]);
    }
  });
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
  <div
    class="fixed inset-0 z-50 flex items-start justify-center bg-black/80 backdrop-blur-sm overflow-y-auto py-8"
    onclick={handleBackdropClick}
    role="presentation"
  >
    <div
      class="w-full max-w-3xl mx-4 bg-neutral-900 rounded-2xl border border-neutral-800 shadow-2xl my-auto"
      onclick={(e) => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
    >
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
        <div class="flex items-center gap-3">
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
          <h2 class="text-xl font-bold text-white flex items-center gap-2">
            <svg class="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            {editingPack ? 'Edit Follow Pack' : 'Create Follow Pack'}
          </h2>
        </div>
        <button
          onclick={publishFollowPack}
          disabled={!title.trim() || selectedPubkeys.size === 0 || isPublishing}
          class="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 disabled:bg-neutral-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-semibold text-sm"
        >
          {isPublishing ? (editingPack ? 'Updating...' : 'Creating...') : (editingPack ? 'Update Pack' : 'Create Pack')}
        </button>
      </div>

      <!-- Tabs -->
      <div class="flex border-b border-neutral-800">
        <button
          onclick={() => activeTab = 'details'}
          class={`flex-1 px-6 py-3 font-medium transition-colors ${
            activeTab === 'details'
              ? 'text-orange-500 border-b-2 border-orange-500'
              : 'text-neutral-400 hover:text-neutral-300'
          }`}
        >
          Details
        </button>
        <button
          onclick={() => activeTab = 'members'}
          class={`flex-1 px-6 py-3 font-medium transition-colors ${
            activeTab === 'members'
              ? 'text-orange-500 border-b-2 border-orange-500'
              : 'text-neutral-400 hover:text-neutral-300'
          }`}
        >
          Members ({selectedPubkeys.size})
        </button>
      </div>

      <!-- Tab Content -->
      <div class="p-6">
        {#if activeTab === 'details'}
          <div class="space-y-5">
            <!-- Image URL -->
            <div>
              <label class="block text-sm font-medium text-neutral-300 mb-2">
                Cover Image URL (optional)
              </label>
              <input
                type="url"
                bind:value={imageUrl}
                placeholder="https://example.com/image.jpg"
                class="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:border-orange-500 transition-colors"
              />
              {#if imageUrl.trim()}
                <div class="mt-3 rounded-lg overflow-hidden border border-neutral-800">
                  <img
                    src={imageUrl}
                    alt="Preview"
                    class="w-full h-48 object-cover"
                    onerror={(e) => e.currentTarget.style.display = 'none'}
                  />
                </div>
              {/if}
            </div>

            <!-- Title -->
            <div>
              <label class="block text-sm font-medium text-neutral-300 mb-2">
                Title <span class="text-red-500">*</span>
              </label>
              <input
                type="text"
                bind:value={title}
                placeholder="e.g., Bitcoin Developers"
                class="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:border-orange-500 transition-colors"
                maxlength="100"
              />
            </div>

            <!-- Description -->
            <div>
              <label class="block text-sm font-medium text-neutral-300 mb-2">
                Description (optional)
              </label>
              <textarea
                bind:value={description}
                placeholder="Describe what this follow pack is about..."
                class="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:border-orange-500 transition-colors resize-none"
                rows="4"
                maxlength="500"
              ></textarea>
              <p class="text-xs text-neutral-500 mt-1">
                {description.length}/500 characters
              </p>
            </div>
          </div>
        {:else}
          <div class="space-y-4">
            <!-- Combined Search/Add Input -->
            <div>
              <label class="block text-sm font-medium text-neutral-300 mb-2">
                Add members
              </label>
              <div class="relative">
                <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  bind:value={memberSearchQuery}
                  placeholder="Search follows or enter npub/NIP-05..."
                  class="w-full pl-10 pr-20 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:border-orange-500 transition-colors"
                  onkeydown={(e) => {
                    if (e.key === 'Enter' && memberSearchQuery.trim()) {
                      addByNpubOrNip05();
                    }
                  }}
                />
                {#if memberSearchQuery.trim() && (memberSearchQuery.includes('npub1') || memberSearchQuery.includes('@'))}
                  <button
                    onclick={addByNpubOrNip05}
                    class="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded text-sm font-medium transition-colors"
                  >
                    Add
                  </button>
                {/if}
              </div>
              <p class="text-xs text-neutral-500 mt-1.5">
                Search your follows by name, or paste an npub/NIP-05 to add anyone
              </p>
            </div>

            <!-- Members list -->
            <div>

              <!-- Members list -->
              <div class="max-h-96 overflow-y-auto space-y-2 bg-neutral-800/30 rounded-lg p-2 border border-neutral-800">
                {#if filteredFollows.length === 0}
                  <div class="text-center py-8 text-neutral-400 text-sm">
                    {memberSearchQuery ? 'No matches found' : 'You don\'t follow anyone yet'}
                  </div>
                {:else}
                  {#each filteredFollows as pubkey (pubkey)}
                    {@const profile = ndk.$fetchProfile(() => pubkey)}
                    {@const isSelected = selectedPubkeys.has(pubkey)}
                    <button
                      onclick={() => toggleMember(pubkey)}
                      class={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                        isSelected
                          ? 'bg-orange-600/20 border border-orange-500/50'
                          : 'bg-neutral-900 border border-neutral-800 hover:border-neutral-700'
                      }`}
                    >
                      <Avatar {ndk} {pubkey} class="w-10 h-10 flex-shrink-0" />
                      <div class="flex-1 min-w-0 text-left">
                        <div class="font-medium text-white truncate">
                          {profile?.displayName || profile?.name || `${pubkey.slice(0, 8)}...`}
                        </div>
                        <div class="text-xs text-neutral-400 truncate">
                          {profile?.nip05 || `${pubkey.slice(0, 16)}...`}
                        </div>
                      </div>
                      <div class={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        isSelected
                          ? 'bg-orange-500 border-orange-500'
                          : 'border-neutral-600'
                      }`}>
                        {#if isSelected}
                          <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                          </svg>
                        {/if}
                      </div>
                    </button>
                  {/each}
                {/if}
              </div>
            </div>

            <!-- Selected Members Display -->
            {#if selectedPubkeys.size > 0}
              <div class="bg-neutral-800/50 rounded-lg p-4 border border-neutral-700">
                <div class="text-sm font-medium text-neutral-300 mb-3">
                  Selected Members ({selectedPubkeys.size})
                </div>
                <div class="space-y-2 max-h-48 overflow-y-auto">
                  {#each Array.from(selectedPubkeys) as pubkey (pubkey)}
                    {@const profile = ndk.$fetchProfile(() => pubkey)}
                    <div class="flex items-center gap-3 p-2 rounded-lg bg-neutral-900/50">
                      <Avatar {ndk} {pubkey} class="w-8 h-8 flex-shrink-0" />
                      <div class="flex-1 min-w-0">
                        <div class="text-sm font-medium text-white truncate">
                          {profile?.displayName || profile?.name || `${pubkey.slice(0, 8)}...`}
                        </div>
                        <div class="text-xs text-neutral-400 truncate">
                          {profile?.nip05 || `${pubkey.slice(0, 16)}...`}
                        </div>
                      </div>
                      <button
                        onclick={() => toggleMember(pubkey)}
                        class="p-1 text-neutral-400 hover:text-red-500 transition-colors"
                        aria-label="Remove member"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  {/each}
                </div>
              </div>
            {/if}
          </div>
        {/if}
      </div>

      <!-- Footer hint -->
      <div class="px-6 py-4 border-t border-neutral-800/50 bg-neutral-900/50">
        <p class="text-xs text-neutral-500">
          Press <kbd class="px-1.5 py-0.5 bg-neutral-800 rounded text-neutral-400">Esc</kbd> to cancel
        </p>
      </div>
    </div>
  </div>
{/if}
